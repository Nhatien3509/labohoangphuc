# MẪU PROMPT YÊU CẦU AI CODE API / TÍNH NĂNG (MÔ HÌNH S.C.O.R.E)

> **Hướng dẫn sử dụng:** Copy template này, điền các thông tin vào `[...]`, đính kèm file Excel schema, rồi gửi cho AI Agent.

---

## 📋 INPUT CHECKLIST — Điền đầy đủ trước khi gửi Prompt

| # | Mục cần khai báo | Giá trị của bạn | Ví dụ |
|---|------------------|-----------------|-------|
| 1 | **Mã loại dữ liệu (MA_LOAI_DL)** | `[...]` | `G02_001` |
| 2 | **Tên cơ quan (folder provider)** | `[...]` | `bct` |
| 3 | **Route API Forward** | `[...]` | `/nb_khomomock_0001/api/v1/du-lieu-mo/tim-kiem` |
| 4 | **Chiến lược API** | `[1-API / 2-API]` | `1-API` (List trả đủ dữ liệu) |
| 5 | **File Excel Schema** | `[đính kèm .xlsx]` | `BCT_001__csdl-co-khi-che-tao_7cot.xlsx` |
| 6 | **Query Params bắt buộc** | `[...]` | `Page, Size, MaDonVi=G02, MaLoaiDuLieu=G02_001` |
| 7 | **JSON Response mẫu (nếu có)** | `[paste JSON hoặc bỏ trống]` | `{"Succeeded":true,"Data":{...}}` |

> **Quy tắc:** Bỏ trống mục 7 nếu chưa có JSON mẫu. AI sẽ tự suy từ Excel.

---

## 1. [CONTEXT] - Bối cảnh hệ thống

- **Ngôn ngữ / Framework:** Golang 1.22, Gin Web Framework.
- **Kiến trúc:** Clean Architecture (Handler -> Service -> Repository / Provider).
- **Bài toán hiện tại:** Đang phát triển module `integration-service`, cụ thể là tính năng tích hợp API lấy dữ liệu từ các Bộ/Ban/Ngành.
- **Cấu trúc folder `provider/`:**
  ```
  internal/provider/
  ├── base/
  │   ├── registry_data_type_code.go   # Hằng số MA_LOAI_DL (CodeG02_001, ...)
  ├── bct/          # Bộ Công Thương (G02_xxx)
  │   ├── adapter.go
  │   ├── client.go
  │   └── model.go
  ├── bhxh/         # BHXH (G24_xxx)
  ├── bkhcn/        # Bộ KHCN (G06_xxx)
  ├── btp/          # Bộ Tư pháp (G15_xxx)
  ├── cdlqg/        # CDLQG (reference implementation)
  └── ... (bng, bnnmt, bnv, btc, bvhttdl, bxd, byt, nhnn)
  ```

## 2. [INPUT SOURCES & STRATEGY] - Nguồn dữ liệu & Chiến lược API

- **File đính kèm:** Đọc file Excel đính kèm (`[Tên file Excel đính kèm, ví dụ: BCT_001__...xlsx]`). 
  - Hãy biến các cột trong file này thành Struct trong `model.go` với các thẻ (tags) `json:"..."` tương ứng.
  - *Lưu ý:* Chỉ dán các trường (fields) thực sự cần thiết cho bài toán, XÓA BỎ các trường null hoặc không sử dụng để tiết kiệm token.
- **Route API Forward:** `[Điền route path, ví dụ: /nb_khomomock_0001/api/v1/du-lieu-mo/tim-kiem]`.
  - Route này được truyền động từ admin-service thông qua payload.
  - URL đầy đủ = `{env.KONG_API_URL}` + Route + `?Page=X&Size=Y...`
- **Chiến lược API:** `[Chọn 1 trong 2]`:
  - **1-API:** Chỉ cần gọi API List là lấy đủ dữ liệu (response chứa full fields).
  - **2-API:** Gọi API List lấy danh sách ID -> gọi API Detail lấy chi tiết từng bản ghi.

## 3. [REQUIREMENTS] - Ràng buộc & Yêu cầu kỹ thuật

1. **Vị trí code:** Làm việc duy nhất trong thư mục `internal/provider/[tên cơ quan, ví dụ: bct, bhxh, bkhcn, bng, bnnmt, bnv, btc, btp, bvhttdl, bxd, byt, nhnn]/`.
2. **Nhiệm vụ 1 (Models):** Đọc cấu trúc từ file Excel đính kèm (hoặc JSON mẫu bên dưới nếu có).
   - Tạo Struct Response tương ứng. Đặt tên Struct rõ ràng gắn với mã dữ liệu (ví dụ `G02_001_Response`) trong file `model.go` (hoặc tạo file mới như `model_G02_001.go` nếu Struct quá dài). Đảm bảo mapping đúng kiểu dữ liệu.
   - **QUAN TRỌNG:** Các thẻ (tags) `json:"..."` của các struct định nghĩa dữ liệu BẮT BUỘC PHẢI viết dưới dạng **PascalCase** (ví dụ: `json:"NguonDuLieu"`, `json:"TenDoanhNghiep"`) để trùng khớp khi mapping với Avro Schema (Avro schema validator phân biệt chữ hoa/thường).
3. **Nhiệm vụ 2 (Client):** Dựa vào Chiến lược API đã chọn ở Mục 2:
   - Viết các hàm HTTP gọi API (ví dụ `FetchList` và `FetchDetail` nếu là 2-API, hoặc chỉ `FetchList` nếu là 1-API) trong `client.go` sử dụng `c.httpClient`. 
   - URL được build từ: `c.baseURL` + `route` (tham số truyền vào từ Request) + query params.
   - *Yêu cầu phụ:* Có xử lý timeout và log lỗi bằng thư viện Zap.
4. **Nhiệm vụ 3 (Adapter):** Cập nhật hàm `FetchPage` trong `adapter.go`:
   - Xây dựng một khối `switch a.nguonDuLieu` (ví dụ `case base.CodeG02_001:`) để rẽ nhánh xử lý đúng loại Model cho mã dữ liệu đang chạy.
   - Bên trong mỗi `case`:
     - Nếu là 1-API: Gọi hàm Client lấy list -> Lặp kết quả -> Map vào Struct -> Chuyển thành mảng `port.RecordPayload`.
     - Nếu là 2-API: Gọi hàm Client lấy list (lấy IDs) -> Lặp từng ID gọi detail -> Map vào Struct -> Chuyển thành mảng `port.RecordPayload`.
   - *Lưu ý:* `port.RecordPayload.Data` là dạng `[]byte` chứa toàn bộ JSON gốc của 1 bản ghi.

6. **Quy tắc code (Constraints):** 
   - Bắt buộc tuân thủ interface `port.IntegrationProvider`. 
   - Import hằng số mã dữ liệu từ package `base` (ví dụ: `base.CodeG02_001`), **KHÔNG** hardcode string.
   - **KHÔNG** cài đặt thêm bất kỳ thư viện ngoài (third-party package) nào ngoại trừ standard library của Go và Zap logger.
   - **Tối ưu Output:** KHÔNG sinh file Unit Test. KHÔNG viết docstring/comment giải thích dài dòng. Chỉ trả về source code trực tiếp.

## 4. [EXISTING CODE / REFERENCE] - Mã nguồn liên quan

- Vui lòng bắt chước style code gọi HTTP và cơ chế retry từ file `internal/provider/cdlqg/client.go`.
- Interface hiện tại cần tuân thủ (để AI không quên chữ ký hàm):
  ```go
  type IntegrationProvider interface {
      Code() string
      Probe(ctx context.Context, req port.ProbeRequest) (int32, error)
      FetchPage(ctx context.Context, req port.FetchPageRequest) ([]port.RecordPayload, error)
  }
  ```
- Struct Adapter hiện tại (bắt buộc có field `nguonDuLieu`):
  ```go
  type Adapter struct {
      client      *Client
      log         *zap.Logger
      nguonDuLieu string
  }
  func NewAdapter(client *Client, log *zap.Logger, nguonDuLieu string) *Adapter { ... }
  ```


---

**[LỜI KÊU GỌI HÀNH ĐỘNG]**
Hãy phân tích và output source code cho 2 file `model.go` và `client.go` trước. 
Sau đó, hãy dừng lại và hỏi tôi *"Code như vậy đã chuẩn chưa?"*. Khi tôi phản hồi *"OK"* hoặc *"Confirm"* thì bạn mới code tiếp phần `adapter.go`.
