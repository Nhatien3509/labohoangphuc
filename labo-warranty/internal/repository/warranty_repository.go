package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"labohoangphuc/labo-warranty/internal/domain/entities"
	errs "labohoangphuc/labo-warranty/internal/domain/errors"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jmoiron/sqlx"
)

type WarrantyRepository interface {
	CreateCard(ctx context.Context, card *entities.WarrantyCard) error
	FindByCode(ctx context.Context, code string) (*entities.WarrantyCard, error)
	FindByID(ctx context.Context, id string) (*entities.WarrantyCard, error)
	ListCards(ctx context.Context, limit, offset int) ([]*entities.WarrantyCard, error)
	UpdateCard(ctx context.Context, card *entities.WarrantyCard) error
	DeleteCard(ctx context.Context, id string) error
	LogLookup(ctx context.Context, lookup *entities.WarrantyLookup) error
}

type warrantyRepository struct {
	db *sqlx.DB
}

// NewWarrantyRepository khởi tạo instance cho Repository
func NewWarrantyRepository(db *sqlx.DB) WarrantyRepository {
	return &warrantyRepository{db: db}
}

//	func (wr *warrantyRepository) CreateCard(ctx context.Context, card *entities.WarrantyCard) error {
//		tx, err := wr.db.BeginTxx(ctx, nil)
//		if err != nil {
//			return err
//		}
//
//		defer tx.Rollback()
//
//		var generateCode string
//		queryGetCode := `SELECT next_warranty_code($1)`
//		err = tx.GetContext(ctx, &generateCode, queryGetCode, card.IssueDate.Year())
//		if err != nil {
//			return err
//		}
//
//		card.Code = generateCode
//
//		insertQuery := `
//			INSERT INTO warranty_cards (
//				code, customer_name, customer_phone, clinic_id, product_id,
//				lab_name, tooth_positions, warranty_months, issue_date, expiry_date, status, created_by
//			) VALUES (
//				:code, :customer_name, :customer_phone, :clinic_id, :product_id,
//				:lab_name, :tooth_positions, :warranty_months, :issue_date, :expiry_date, :status, :created_by
//			) RETURNING id, created_at, updated_at
//		`
//		stmt, err := tx.PrepareNamedContext(ctx, insertQuery)
//		if err != nil {
//			return fmt.Errorf("lỗi chuẩn bị câu lệnh insert: %w", err)
//		}
//		defer stmt.Close()
//
//		err = stmt.GetContext(ctx, card, card)
//		if err != nil {
//			return fmt.Errorf("lỗi thực thi câu lệnh SQL hoặc map dữ liệu mảng: %w", err)
//		}
//
//		return tx.Commit()
//	}
func (wr *warrantyRepository) CreateCard(ctx context.Context, card *entities.WarrantyCard) error {
	tx, err := wr.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Sinh mã tự động từ Store Function NẾU admin không nhập mã sẵn
	if card.Code == "" {
		var generateCode string
		queryGetCode := `SELECT next_warranty_code($1)`
		err = tx.GetContext(ctx, &generateCode, queryGetCode, card.IssueDate.Year())
		if err != nil {
			return fmt.Errorf("lỗi sinh mã bảo hành: %w", err)
		}
		card.Code = generateCode
	}

	// 2. Câu lệnh INSERT (Đã bổ sung cột 'note' để khớp với tầng Service)
	insertQuery := `
       INSERT INTO warranty_cards (
          code, customer_name, customer_phone, clinic_id, product_id, 
          lab_name, tooth_positions, warranty_months, issue_date, expiry_date, status, created_by, note
       ) VALUES (
          :code, :customer_name, :customer_phone, :clinic_id, :product_id, 
          :lab_name, :tooth_positions, :warranty_months, :issue_date, :expiry_date, :status, :created_by, :note
       ) RETURNING id, created_at, updated_at
    `

	// 3. Sử dụng PrepareNamedContext chuẩn của sqlx
	stmt, err := tx.PrepareNamedContext(ctx, insertQuery)
	if err != nil {
		return fmt.Errorf("lỗi chuẩn bị câu lệnh insert: %w", err)
	}
	defer stmt.Close()

	// 🌟 SỬA TẠI ĐÂY: Dùng QueryRowContext để bóc tách riêng row trả về từ RETURNING
	// Hàm stmt.QueryRowContext(card) sẽ lấy dữ liệu từ struct card truyền vào các dấu :
	// Sau đó .Scan() sẽ chỉ hứng đúng 3 trường id, created_at, updated_at do RETURNING ném ra
	err = stmt.QueryRowContext(ctx, card).Scan(&card.ID, &card.CreatedAt, &card.UpdatedAt)
	if err != nil {
		// Trùng mã (UNIQUE constraint) -> trả lỗi nghiệp vụ để handler đáp 409.
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return errs.ErrDuplicateCardCode
		}
		return fmt.Errorf("lỗi thực thi SQL hoặc map dữ liệu: %w", err)
	}

	return tx.Commit()
}
func (wr *warrantyRepository) FindByCode(ctx context.Context, code string) (*entities.WarrantyCard, error) {
	// 1. Viết câu lệnh SQL thuần để lấy ra 1 bản ghi duy nhất khớp mã code (Tận dụng Unique Index)
	query := `SELECT * FROM warranty_cards WHERE code = $1 LIMIT 1`

	var card entities.WarrantyCard

	// 2. Sử dụng hàm GetContext của sqlx để tìm kiếm và tự động ánh xạ (Map) vào Struct
	err := wr.db.GetContext(ctx, &card, query, code)
	if err != nil {
		// Nếu lỗi là do không tìm thấy dòng nào khớp (No Rows Found)
		if errors.Is(err, sql.ErrNoRows) {
			// Trả về lỗi Custom tập trung model.ErrCardNotFound đã tách ở file errors.go
			return nil, errs.ErrCardNotFound
		}
		// Nếu là lỗi kết nối hoặc lỗi hệ thống khác, trả về lỗi gốc của DB
		return nil, err
	}

	// 3. Trả về con trỏ chứa đầy đủ dữ liệu thực thể thẻ bảo hành
	return &card, nil
}

func (wr *warrantyRepository) FindByID(ctx context.Context, id string) (*entities.WarrantyCard, error) {
	query := `SELECT * FROM warranty_cards WHERE id = $1::uuid LIMIT 1`
	var card entities.WarrantyCard
	if err := wr.db.GetContext(ctx, &card, query, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errs.ErrCardNotFound
		}
		return nil, err
	}
	return &card, nil
}

func (wr *warrantyRepository) UpdateCard(ctx context.Context, card *entities.WarrantyCard) error {
	query := `
		UPDATE warranty_cards SET
			code = :code,
			customer_name = :customer_name,
			customer_phone = :customer_phone,
			lab_name = :lab_name,
			tooth_positions = :tooth_positions,
			warranty_months = :warranty_months,
			issue_date = :issue_date,
			expiry_date = :expiry_date,
			status = :status,
			note = :note,
			updated_at = NOW()
		WHERE id = :id
		RETURNING updated_at
	`
	stmt, err := wr.db.PrepareNamedContext(ctx, query)
	if err != nil {
		return fmt.Errorf("lỗi chuẩn bị câu lệnh update: %w", err)
	}
	defer stmt.Close()

	if err := stmt.QueryRowContext(ctx, card).Scan(&card.UpdatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errs.ErrCardNotFound
		}
		// Trùng mã (UNIQUE) khi đổi sang mã đã tồn tại -> lỗi nghiệp vụ để handler đáp 409.
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return errs.ErrDuplicateCardCode
		}
		return fmt.Errorf("lỗi thực thi update: %w", err)
	}
	return nil
}

func (wr *warrantyRepository) DeleteCard(ctx context.Context, id string) error {
	res, err := wr.db.ExecContext(ctx, `DELETE FROM warranty_cards WHERE id = $1::uuid`, id)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return errs.ErrCardNotFound
	}
	return nil
}

func (wr *warrantyRepository) ListCards(ctx context.Context, limit, offset int) ([]*entities.WarrantyCard, error) {
	// Lấy danh sách thẻ mới nhất trước. SELECT * khớp với cách FindByCode map vào
	// entity (các trường struct thừa so với cột sẽ giữ giá trị zero).
	query := `SELECT * FROM warranty_cards ORDER BY created_at DESC LIMIT $1 OFFSET $2`

	cards := []*entities.WarrantyCard{}
	if err := wr.db.SelectContext(ctx, &cards, query, limit, offset); err != nil {
		return nil, err
	}
	return cards, nil
}

func (wr *warrantyRepository) LogLookup(ctx context.Context, lookup *entities.WarrantyLookup) error {
	// 1. Viết câu lệnh SQL INSERT thuần cho PostgreSQL
	// RETURNING id, looked_up_at giúp lấy về UUID và thời gian tự sinh dưới DB
	query := `
		INSERT INTO warranty_lookups (code, found, ip_address, user_agent)
		VALUES ($1, $2, $3, $4)
		RETURNING id, looked_up_at
	`

	// 2. Thực thi câu lệnh và map ngược dữ liệu tự sinh từ DB vào struct pointer
	// Vì ip_address và user_agent trong struct có thể nhận giá trị NULL (Pointer),
	// driver pgx sẽ tự động xử lý mượt mà xuống các kiểu dữ liệu INET và TEXT của Postgres
	err := wr.db.QueryRowContext(
		ctx,
		query,
		lookup.Code,
		lookup.Found,
		lookup.IPAddress,
		lookup.UserAgent,
	).Scan(&lookup.ID, &lookup.LookedUpAt)

	if err != nil {
		return err
	}

	return nil
}
