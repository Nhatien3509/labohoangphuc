/** Kiểu dùng chung cho danh sách phân trang (dùng khi BE bổ sung list API). */
export interface Paginated<T> {
  results: T[];
  count: number;
  page: number;
  limit: number;
}

export interface PageQuery {
  page?: number;
  limit?: number;
}
