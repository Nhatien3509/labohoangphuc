package client

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"sync"
	"time"

	"github.com/beltran/gohive"
)

// HiveClient — gohive Thrift client cho SELECT phân trang (share API zone2).
type HiveClient struct {
	host     string
	port     int
	username string
	password string
	conn     *gohive.Connection
	mu       sync.Mutex
}

func NewHiveClient(host string, port int, username, password string) *HiveClient {
	c := &HiveClient{host: host, port: port, username: username, password: password}
	c.mu.Lock()
	defer c.mu.Unlock()
	if err := c.dialLocked(); err != nil {
		slog.Warn("hive: connect lúc khởi động fail — lazy-connect khi có lượt gọi", "err", err)
	}
	return c
}

func (c *HiveClient) dialLocked() error {
	cfg := gohive.NewConnectConfiguration()
	cfg.Service = "hive"
	cfg.Username = c.username
	cfg.Password = c.password

	conn, err := gohive.Connect(c.host, c.port, "LDAP", cfg)
	if err != nil {
		return fmt.Errorf("hive connect %s:%d (LDAP, user=%s): %w", c.host, c.port, c.username, err)
	}
	c.conn = conn
	return nil
}

func (c *HiveClient) reconnectLocked() error {
	if c.conn != nil {
		c.conn.Close()
		c.conn = nil
	}
	return c.dialLocked()
}

func isSessionDeadErr(err error) bool {
	if err == nil {
		return false
	}
	s := strings.ToLower(err.Error())
	for _, pat := range []string{
		"eof", "broken pipe", "connection reset", "connection refused",
		"use of closed network connection", "i/o timeout", "ttransport",
		"sessionhandle", "sessionid unset", "session is closed", "out of sequence",
	} {
		if strings.Contains(s, pat) {
			return true
		}
	}
	return false
}

func (c *HiveClient) withRetry(opName string, op func(conn *gohive.Connection) error) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.conn == nil {
		if err := c.dialLocked(); err != nil {
			return fmt.Errorf("%s: %w", opName, err)
		}
	}

	err := op(c.conn)
	if err == nil || !isSessionDeadErr(err) {
		return err
	}

	slog.Warn("hive: session chết — reconnect + retry 1 lần", "op", opName, "err", err)
	if rerr := c.reconnectLocked(); rerr != nil {
		return fmt.Errorf("%s: reconnect fail (%v) sau lỗi gốc: %w", opName, rerr, err)
	}
	return op(c.conn)
}

func (c *HiveClient) Close() {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.conn != nil {
		c.conn.Close()
		c.conn = nil
	}
}

func isHiveProgressMessage(s string) bool {
	return strings.Contains(s, `"taskState":"FINISHED"`) ||
		strings.Contains(s, `"taskState":"RUNNING"`) ||
		strings.Contains(s, `"name":"TEZ"`)
}

func (c *HiveClient) prepareSession(ctx context.Context, cursor *gohive.Cursor) {
	cursor.Execute(ctx, "SET hive.execution.engine=tez", false)
	if cursor.Err != nil && !isHiveProgressMessage(cursor.Err.Error()) {
		slog.Warn("hive.prepareSession: SET failed", "err", cursor.Err)
	}
}

func stripTablePrefix(key string) string {
	if i := strings.LastIndex(key, "."); i >= 0 {
		return key[i+1:]
	}
	return key
}

// ListRows fetch tối đa limit rows, bỏ qua offset rows đầu.
func (c *HiveClient) ListRows(
	ctx context.Context,
	fullTableName string,
	cols []string,
	limit, offset int,
) ([]map[string]any, error) {
	selectList := "*"
	if len(cols) > 0 {
		selectList = strings.Join(cols, ", ")
	}
	sql := fmt.Sprintf("SELECT %s FROM %s LIMIT %d OFFSET %d", selectList, fullTableName, limit, offset)
	start := time.Now()
	slog.Info("hive.ListRows: start", "sql", sql)

	var rows []map[string]any
	err := c.withRetry("ListRows", func(conn *gohive.Connection) error {
		rows = nil
		cursor := conn.Cursor()
		defer cursor.Close()

		c.prepareSession(ctx, cursor)
		cursor.Execute(ctx, sql, false)

		for cursor.HasMore(ctx) {
			raw := cursor.RowMap(ctx)
			clean := make(map[string]any, len(raw))
			for k, v := range raw {
				clean[stripTablePrefix(k)] = v
			}
			rows = append(rows, clean)
		}

		if len(rows) == 0 && cursor.Err != nil && !isHiveProgressMessage(cursor.Err.Error()) {
			return fmt.Errorf("ListRows: %v", cursor.Err)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	slog.Info("hive.ListRows: done", "count", len(rows), "elapsed_ms", time.Since(start).Milliseconds())
	return rows, nil
}
