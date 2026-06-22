// Package client — HueClient: gọi Hive qua Hue Notebook REST API (port 8889).
//
// Tại sao không dùng HS2 Thrift (HiveClient): cluster THCS-DATA-LAKE hiện
// thiếu cấu hình `tez.lib.uris` → mọi aggregation (COUNT/SUM/GROUP BY)
// chạy thẳng HS2 đều fail. Hue UI có session config riêng nên đi đường này
// hoạt động được. Khi admin fix tham số Tez global, có thể chuyển về HS2.
//
// Flow 4 bước (theo Postman admin cấp):
//
//  1. GET  /accounts/login/                 → lấy cookie `csrftoken`
//  2. POST /accounts/login/                 → set cookie `sessionid`
//  3. POST /notebook/api/execute/hive       → submit query, trả handle
//  4. POST /notebook/api/fetch_result_data  → poll cho đến khi có data
//     (cleanup) POST /notebook/api/close_statement — best-effort
//
// Cookie jar tự giữ csrftoken + sessionid giữa các request. CSRF token
// phải gửi DOUBLE: cookie (auto) + header X-CSRFToken (manual) cho POST.
package client

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"io"
	"log/slog"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"
)

// ErrNoRowStats — DESCRIBE FORMATTED không có numRows: bảng chưa ANALYZE, hoặc
// (với Iceberg) chưa có dòng nào commit nên metastore chưa có stats. Caller
// phân biệt được ca này (vd watchdog coi như committed=0, vẫn xét đình trệ) với
// lỗi cụm/Hue thật (network, table not found) qua errors.Is.
var ErrNoRowStats = errors.New("hue.Count: numRows chưa có (bảng chưa ANALYZE / chưa có commit nào)")

// HueClient — singleton bao quanh 1 phiên login Hue (csrf + session).
// Thread-safe: sessionMu khóa quanh login + cookie state.
// Tự re-login nếu session expire (401/403 từ Hue).
type HueClient struct {
	baseURL string
	user    string
	pass    string
	http    *http.Client

	sessionMu sync.Mutex
	loggedIn  bool
}

// NewHueClient tạo client với cookie jar persistence.
// Không gọi network ở đây — login lazy ở Count() lần đầu.
//
// baseURL được chuẩn hoá về `scheme://host` (bỏ path/query/fragment). Lý do:
// client tự ghép path API (/accounts/login/, /notebook/api/...) lên baseURL.
// Nếu env lỡ set URL kèm path (vd HUE_URL=.../hue/editor/?type=impala — như
// trong .env.example), ghép thẳng sẽ tạo URL rác → mọi API call hỏng. Normalize
// ở đây để bug cấu hình env không làm chết client.
func NewHueClient(baseURL, username, password string) *HueClient {
	jar, _ := cookiejar.New(nil)
	return &HueClient{
		baseURL: normalizeHueBaseURL(baseURL),
		user:    username,
		pass:    password,
		http: &http.Client{
			Jar:     jar,
			Timeout: 90 * time.Second,
		},
	}
}

// Count trả về numRows của bảng — dùng `DESCRIBE FORMATTED` đọc từ Hive
// metastore TBL_PARAMS thay vì `SELECT COUNT(*)`.
//
// Lý do dùng DESCRIBE thay COUNT:
//   - COUNT(*) chạy Tez task → mỗi container 1GB physical memory → OOM trên
//     bảng nhiều cột (Parquet decompression overhead) → exit code -104.
//   - DESCRIBE FORMATTED chỉ đọc metastore (Postgres/MySQL) → nhanh ~1s,
//     không cần Tez container.
//
// Yêu cầu: bảng đã được ANALYZE COMPUTE STATISTICS hoặc Iceberg auto-update
// stats sau commit. Nếu chưa có stats → trả lỗi rõ ràng để admin biết cần ANALYZE.
//
// fullTableName: "zone2.th_xxx" — caller chịu trách nhiệm SQL-safe
// (validate chỉ chứa [A-Za-z0-9_.]).
func (c *HueClient) Count(ctx context.Context, fullTableName string) (int64, error) {
	if err := c.ensureLogin(ctx); err != nil {
		return 0, fmt.Errorf("hue login: %w", err)
	}

	sql := fmt.Sprintf("DESCRIBE FORMATTED %s", fullTableName)
	start := time.Now()
	slog.Info("hue.Count: execute (DESCRIBE FORMATTED)", "sql", sql)

	handle, err := c.executeQuery(ctx, sql)
	if err != nil {
		return 0, fmt.Errorf("execute: %w", err)
	}
	defer c.closeStatement(ctx, sql, handle)

	// DESCRIBE FORMATTED nhanh — poll ngắn hơn COUNT.
	const (
		maxAttempts  = 15
		pollInterval = 1 * time.Second
	)
	for attempt := 0; attempt < maxAttempts; attempt++ {
		rows, stillRunning, err := c.fetchResultData(ctx, sql, handle)
		if err != nil {
			return 0, fmt.Errorf("fetch attempt %d: %w", attempt, err)
		}
		if stillRunning {
			select {
			case <-ctx.Done():
				return 0, ctx.Err()
			case <-time.After(pollInterval):
			}
			continue
		}

		// Parse: layout DESCRIBE FORMATTED thay đổi theo Hue / Hive version,
		// có khi cells đã trim, có khi giữ tab/space, có khi gộp 1 cột text.
		// → Strategy linh hoạt: concat tất cả cell trong row thành 1 line,
		// split bằng whitespace, tìm token "numRows" → token kế tiếp là value.
		for _, row := range rows {
			var sb strings.Builder
			for _, cell := range row {
				if cell == nil {
					continue
				}
				// fmt.Sprint convert mọi type → tránh miss nếu Hue trả number/bool.
				sb.WriteString(fmt.Sprint(cell))
				sb.WriteByte(' ')
			}
			// Hue HTML-encode whitespace (vd "from&nbsp;deserializer") — unescape
			// để strings.Fields split đúng.
			line := html.UnescapeString(sb.String())
			if !strings.Contains(line, "numRows") {
				continue
			}
			tokens := strings.Fields(line) // split mọi khoảng trắng
			for i, t := range tokens {
				if t != "numRows" || i+1 >= len(tokens) {
					continue
				}
				n, err := strconv.ParseInt(tokens[i+1], 10, 64)
				if err != nil {
					continue // có thể là "numRows" của row khác — thử tiếp
				}
				slog.Info("hue.Count: OK",
					"count", n,
					"attempts", attempt+1,
					"total_ms", time.Since(start).Milliseconds(),
				)
				return n, nil
			}
		}

		// Không tìm thấy — log shape của 3 row đầu để debug nếu Hue trả lạ.
		sample := make([]any, 0, 3)
		for i := 0; i < len(rows) && i < 3; i++ {
			sample = append(sample, rows[i])
		}
		slog.Warn("hue.Count: numRows không có",
			"table", fullTableName,
			"total_rows", len(rows),
			"sample_rows", sample,
		)
		// Hết rows mà không có numRows → bảng chưa ANALYZE / chưa có commit.
		// Wrap sentinel ErrNoRowStats để caller phân biệt với lỗi cụm thật.
		return 0, fmt.Errorf("%w (table=%s)", ErrNoRowStats, fullTableName)
	}

	return 0, fmt.Errorf("hue.Count: timeout DESCRIBE FORMATTED %s", fullTableName)
}

// ListRows chạy `SELECT * FROM <fullTableName> LIMIT <limit>` qua Hue và trả về
// list rows keyed bằng column name (đã strip prefix `tablename.` của Hive).
//
// Dùng cho preview endpoint — pull pool source rows từ zone2 để sample.
// Cảnh báo: với LIMIT lớn (>1000) sẽ chậm — preview gọi LIMIT 50-100 là đủ.
//
// Column name từ Hue thường có dạng "tablename.column" — đã strip về "column".
func (c *HueClient) ListRows(
	ctx context.Context,
	fullTableName string,
	limit int,
	offset int64,
) ([]map[string]any, error) {
	if err := c.ensureLogin(ctx); err != nil {
		return nil, fmt.Errorf("hue login: %w", err)
	}
	if limit <= 0 {
		limit = 100
	}

	// LIMIT/OFFSET chạy được dạng fetch-task (không cần Tez) — share API đã
	// chứng minh trên cụm này. Offset sâu = scan bỏ qua offset dòng, chậm dần
	// theo offset nhưng vẫn chạy.
	sql := fmt.Sprintf("SELECT * FROM %s LIMIT %d", fullTableName, limit)
	if offset > 0 {
		sql = fmt.Sprintf("%s OFFSET %d", sql, offset)
	}
	start := time.Now()
	slog.Info("hue.ListRows: execute", "sql", sql)

	handle, err := c.executeQuery(ctx, sql)
	if err != nil {
		return nil, fmt.Errorf("execute: %w", err)
	}
	defer c.closeStatement(ctx, sql, handle)

	const (
		maxAttempts  = 45
		pollInterval = 2 * time.Second
	)
	for attempt := 0; attempt < maxAttempts; attempt++ {
		data, meta, stillRunning, err := c.fetchResultDataWithMeta(ctx, sql, handle)
		if err != nil {
			return nil, fmt.Errorf("fetch attempt %d: %w", attempt, err)
		}
		if stillRunning {
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(pollInterval):
			}
			continue
		}

		// Map data → []map[colName]value, strip prefix "table." khỏi col name.
		rows := make([]map[string]any, 0, len(data))
		for _, raw := range data {
			row := make(map[string]any, len(meta))
			for i, m := range meta {
				if i >= len(raw) {
					break
				}
				row[stripTablePrefix(m.Name)] = raw[i]
			}
			rows = append(rows, row)
		}
		slog.Info("hue.ListRows: OK",
			"rows", len(rows),
			"attempts", attempt+1,
			"total_ms", time.Since(start).Milliseconds(),
		)
		return rows, nil
	}

	return nil, fmt.Errorf("hue.ListRows: timeout sau %ds (sql=%s)",
		int(maxAttempts)*int(pollInterval/time.Second), sql)
}

// fetchResultDataWithMeta — variant của fetchResultData trả thêm meta columns
// (cần cho ListRows để map array → keyed map). Behavior poll giống hệt.
func (c *HueClient) fetchResultDataWithMeta(
	ctx context.Context,
	sql string,
	h hueHandle,
) (data [][]any, meta []hueColumnMeta, stillRunning bool, err error) {
	snip := buildSnippet(sql, &h)
	nb := buildNotebook(snip)
	snipJSON, _ := json.Marshal(snip)
	nbJSON, _ := json.Marshal(nb)

	form := url.Values{
		"notebook":  {string(nbJSON)},
		"snippet":   {string(snipJSON)},
		"rows":      {"100"},
		"startOver": {"false"},
	}

	var out hueFetchResp
	if err := c.postForm(ctx, "/notebook/api/fetch_result_data", form, &out); err != nil {
		return nil, nil, false, err
	}
	if out.Status != 0 {
		if isStillRunningMessage(out.Message) {
			return nil, nil, true, nil
		}
		return nil, nil, false, fmt.Errorf("hue fetch status=%d: %s", out.Status, out.Message)
	}
	if len(out.Result.Data) == 0 {
		return nil, nil, true, nil
	}
	return out.Result.Data, out.Result.Meta, false, nil
}

// ============================================================
// Step 1+2 — login flow
// ============================================================

// ensureLogin chạy GET csrf + POST login nếu chưa có session.
// Idempotent: gọi nhiều lần safe (mutex + flag).
func (c *HueClient) ensureLogin(ctx context.Context) error {
	c.sessionMu.Lock()
	defer c.sessionMu.Unlock()

	if c.loggedIn {
		return nil
	}

	if err := c.getCSRF(ctx); err != nil {
		return fmt.Errorf("get csrf: %w", err)
	}
	if err := c.login(ctx); err != nil {
		return fmt.Errorf("login: %w", err)
	}

	c.loggedIn = true
	slog.Info("hue: logged in", "user", c.user)
	return nil
}

// getCSRF — GET /accounts/login/ để server set cookie csrftoken vào jar.
func (c *HueClient) getCSRF(ctx context.Context) error {
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet,
		c.baseURL+"/accounts/login/", nil)
	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	io.Copy(io.Discard, resp.Body)

	if c.csrfTokenFromJar() == "" {
		return fmt.Errorf("csrftoken cookie không xuất hiện sau GET (status=%d)", resp.StatusCode)
	}
	return nil
}

// login — POST /accounts/login/ form-urlencoded với username/password + csrf.
func (c *HueClient) login(ctx context.Context) error {
	csrf := c.csrfTokenFromJar()
	form := url.Values{
		"username":            {c.user},
		"password":            {c.pass},
		"csrfmiddlewaretoken": {csrf},
		"next":                {"/"},
	}
	req, _ := http.NewRequestWithContext(ctx, http.MethodPost,
		c.baseURL+"/accounts/login/", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Referer", c.baseURL+"/accounts/login/")
	req.Header.Set("X-CSRFToken", csrf)

	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	io.Copy(io.Discard, resp.Body)

	// Sau login Hue redirect 302 → /home. Nếu sai password Hue render lại login form (200).
	// → check cookie sessionid mới là chuẩn xác nhận login OK.
	if c.sessionIDFromJar() == "" {
		return fmt.Errorf("sessionid không có sau POST login (status=%d) — sai user/pass?", resp.StatusCode)
	}
	return nil
}

// ============================================================
// Step 3 — execute query
// ============================================================

type hueHandle struct {
	GUID         string `json:"guid"`
	Secret       string `json:"secret"`
	SessionID    int    `json:"session_id"`
	SessionGUID  string `json:"session_guid"`
	StatementID  int    `json:"statement_id"`
	HasResultSet bool   `json:"has_result_set"`
}

type hueExecResp struct {
	Status  int       `json:"status"`
	Handle  hueHandle `json:"handle"`
	Message string    `json:"message"`
}

// executeQuery — POST /notebook/api/execute/hive với notebook + snippet.
// Trả về handle để dùng cho fetch_result_data.
func (c *HueClient) executeQuery(ctx context.Context, sql string) (hueHandle, error) {
	// Snippet/notebook payload bắt chước y hệt cấu trúc Hue UI gửi (extract từ Postman).
	snip := buildSnippet(sql, nil)
	nb := buildNotebook(snip)
	snipJSON, _ := json.Marshal(snip)
	nbJSON, _ := json.Marshal(nb)

	form := url.Values{
		"notebook": {string(nbJSON)},
		"snippet":  {string(snipJSON)},
	}

	var out hueExecResp
	if err := c.postForm(ctx, "/notebook/api/execute/hive", form, &out); err != nil {
		return hueHandle{}, err
	}
	if out.Status != 0 {
		return hueHandle{}, fmt.Errorf("hue trả status=%d: %s", out.Status, out.Message)
	}
	return out.Handle, nil
}

// ============================================================
// Step 4 — fetch result (with polling)
// ============================================================

type hueFetchResp struct {
	Status  int          `json:"status"`
	Result  hueFetchData `json:"result"`
	Message string       `json:"message"`
}

type hueFetchData struct {
	Data    [][]any         `json:"data"`
	Meta    []hueColumnMeta `json:"meta"`
	HasMore bool            `json:"has_more"`
	Type    string          `json:"type"`
}

// hueColumnMeta — 1 entry trong result.meta. Chỉ cần Name + Type cho ListRows.
type hueColumnMeta struct {
	Name    string `json:"name"`
	Type    string `json:"type"`
	Comment string `json:"comment,omitempty"`
}

// fetchResultData — POST /notebook/api/fetch_result_data. Trả về:
//
//	rows         — data nếu query xong (status=0)
//	stillRunning — true nếu Hue báo query chưa hoàn thành → caller poll lại
//	err          — lỗi network/HTTP hoặc Hue trả status thật sự lỗi
//
// Hue Notebook behavior: khi query đang RUNNING, gọi fetch_result_data trả
//
//	status: 1, message: "Expected states: [FINISHED], but found RUNNING"
//
// → coi đây là tín hiệu "chưa xong", không phải lỗi.
func (c *HueClient) fetchResultData(ctx context.Context, sql string, h hueHandle) ([][]any, bool, error) {
	snip := buildSnippet(sql, &h)
	nb := buildNotebook(snip)
	snipJSON, _ := json.Marshal(snip)
	nbJSON, _ := json.Marshal(nb)

	form := url.Values{
		"notebook":  {string(nbJSON)},
		"snippet":   {string(snipJSON)},
		"rows":      {"100"},
		"startOver": {"false"},
	}

	var out hueFetchResp
	if err := c.postForm(ctx, "/notebook/api/fetch_result_data", form, &out); err != nil {
		return nil, false, err
	}
	if out.Status != 0 {
		if isStillRunningMessage(out.Message) {
			return nil, true, nil
		}
		return nil, false, fmt.Errorf("hue fetch status=%d: %s", out.Status, out.Message)
	}
	// status=0 + data rỗng — hiếm nhưng có thể coi là chưa sẵn sàng
	if len(out.Result.Data) == 0 {
		return nil, true, nil
	}
	return out.Result.Data, false, nil
}

// isStillRunningMessage detect signal "query chưa xong" từ Hue message.
// Bao phủ các phrase Hue có thể trả ở các phiên bản khác nhau.
func isStillRunningMessage(msg string) bool {
	lower := strings.ToLower(msg)
	return strings.Contains(lower, "but found running") ||
		strings.Contains(lower, "but found waiting") ||
		strings.Contains(lower, "but found submitted") ||
		strings.Contains(lower, "query is running") ||
		strings.Contains(lower, "still running") ||
		strings.Contains(lower, "not ready")
}

// closeStatement — best-effort cleanup. Log warning nếu fail nhưng không return error.
func (c *HueClient) closeStatement(ctx context.Context, sql string, h hueHandle) {
	snip := buildSnippet(sql, &h)
	nb := buildNotebook(snip)
	snipJSON, _ := json.Marshal(snip)
	nbJSON, _ := json.Marshal(nb)

	form := url.Values{
		"notebook": {string(nbJSON)},
		"snippet":  {string(snipJSON)},
	}
	var out hueExecResp
	if err := c.postForm(ctx, "/notebook/api/close_statement", form, &out); err != nil {
		slog.Warn("hue.closeStatement: fail (ignored)", "err", err)
	}
}

// ============================================================
// Payload builders + HTTP helpers
// ============================================================

// buildSnippet — nếu handle != nil thì gắn vào result để fetch_result_data biết
// statement nào cần lấy data.
func buildSnippet(sql string, h *hueHandle) map[string]any {
	result := map[string]any{}
	if h != nil {
		result["handle"] = map[string]any{
			"guid":               h.GUID,
			"secret":             h.Secret,
			"session_id":         h.SessionID,
			"session_guid":       h.SessionGUID,
			"statement_id":       h.StatementID,
			"has_result_set":     true,
			"operation_type":     0,
			"modified_row_count": nil,
		}
	}
	return map[string]any{
		"id":            "1",
		"name":          "hue-api-query",
		"type":          "hive",
		"result":        result,
		"statement":     sql,
		"statement_raw": sql,
		"variables":     []any{},
		"properties": map[string]any{
			"settings":  []any{},
			"files":     []any{},
			"functions": []any{},
			"arguments": []any{},
		},
	}
}

func buildNotebook(snip map[string]any) map[string]any {
	return map[string]any{
		"type":      "hive",
		"id":        nil,
		"name":      "hue-api-query",
		"isSaved":   false,
		"sessions":  []any{},
		"isHistory": false,
		"snippets":  []any{snip},
	}
}

// postForm — wrapper POST x-www-form-urlencoded + CSRF + JSON decode response.
//
// Tự re-login 1 lần nếu phát hiện session expired qua 1 trong 3 dấu hiệu:
//  1. HTTP 401/403 (chuẩn REST)
//  2. Content-Type text/html (Hue redirect về /accounts/login/ render HTML)
//  3. Body bắt đầu bằng `<` (HTML fallback nếu CT header thiếu)
//
// Hue đặc biệt vì session hết KHÔNG trả 401 — vẫn 200 + HTML login form. Phải
// inspect body mới biết.
func (c *HueClient) postForm(ctx context.Context, path string, form url.Values, out any) error {
	doRequest := func() (*http.Response, error) {
		csrf := c.csrfTokenFromJar()
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost,
			c.baseURL+path, strings.NewReader(form.Encode()))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		req.Header.Set("Referer", c.baseURL+"/")
		req.Header.Set("X-CSRFToken", csrf)
		// Báo cho Hue biết FE muốn JSON — nếu session OK, Hue dùng path nội bộ;
		// nếu session expired, Hue trả 401/403 thay vì redirect HTML.
		req.Header.Set("X-Requested-With", "XMLHttpRequest")
		req.Header.Set("Accept", "application/json")
		return c.http.Do(req)
	}

	resp, err := doRequest()
	if err != nil {
		return err
	}

	body, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	if isHueSessionExpired(resp, body) {
		slog.Info("hue: session expired, re-login + retry", "path", path)
		c.invalidateSession()
		if err := c.ensureLogin(ctx); err != nil {
			return fmt.Errorf("re-login: %w", err)
		}
		resp, err = doRequest()
		if err != nil {
			return err
		}
		body, _ = io.ReadAll(resp.Body)
		resp.Body.Close()
	}

	if resp.StatusCode >= 400 {
		return fmt.Errorf("HTTP %d on %s: %s", resp.StatusCode, path, truncate(string(body), 300))
	}
	if err := json.Unmarshal(body, out); err != nil {
		return fmt.Errorf("decode %s: %w (body=%s)", path, err, truncate(string(body), 300))
	}
	return nil
}

// isHueSessionExpired phát hiện response trả về là HTML login form / 401-403.
func isHueSessionExpired(resp *http.Response, body []byte) bool {
	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
		return true
	}
	ct := strings.ToLower(resp.Header.Get("Content-Type"))
	if strings.Contains(ct, "text/html") {
		return true
	}
	// CT thiếu/sai — fallback inspect body byte đầu (trim whitespace).
	trimmed := strings.TrimLeft(string(body), " \t\r\n")
	if strings.HasPrefix(trimmed, "<") {
		return true
	}
	// Hue đặc biệt: decorator login_notrequired trả comment kiểu JSONP
	// `/* login required */` (HTTP 200, Content-Type text/javascript) khi
	// session hết hạn thay vì 401/HTML. Bắt cả prefix `/*` lẫn cụm "login required".
	if strings.HasPrefix(trimmed, "/*") || strings.Contains(strings.ToLower(trimmed), "login required") {
		return true
	}
	return false
}

func (c *HueClient) invalidateSession() {
	c.sessionMu.Lock()
	c.loggedIn = false
	c.sessionMu.Unlock()
}

// csrfTokenFromJar quét cookie jar tìm `csrftoken` cho baseURL.
func (c *HueClient) csrfTokenFromJar() string {
	u, _ := url.Parse(c.baseURL)
	for _, ck := range c.http.Jar.Cookies(u) {
		if ck.Name == "csrftoken" {
			return ck.Value
		}
	}
	return ""
}

func (c *HueClient) sessionIDFromJar() string {
	u, _ := url.Parse(c.baseURL)
	for _, ck := range c.http.Jar.Cookies(u) {
		if ck.Name == "sessionid" {
			return ck.Value
		}
	}
	return ""
}

// normalizeHueBaseURL rút URL về dạng `scheme://host` (host gồm cả port nếu có),
// loại bỏ path/query/fragment. Nếu parse thất bại hoặc thiếu scheme/host thì
// fallback về TrimRight cũ để không làm tệ hơn.
func normalizeHueBaseURL(raw string) string {
	u, err := url.Parse(strings.TrimSpace(raw))
	if err != nil || u.Scheme == "" || u.Host == "" {
		return strings.TrimRight(raw, "/")
	}
	return u.Scheme + "://" + u.Host
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "...(truncated)"
}
