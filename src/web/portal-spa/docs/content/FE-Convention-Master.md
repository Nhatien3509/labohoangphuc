# FE-Convention-Master

> Tài liệu **convention tổng hợp** cho `src/web/portal-spa/` (Next.js 14 App Router, TypeScript, Tailwind, Zustand).
> Gom & chuẩn hoá quy ước đặt tên, coding, hooks, state, API, UI/UX, performance, testing, tooling.
> Dùng làm source-of-truth khi onboard, review PR, hoặc tra cứu nhanh.

**Đọc trước:**

- [CLAUDE.md](../../CLAUDE.md) — rule cứng cho AI/dev
- [architecture/overview.md](architecture/overview.md) — Feature Slice
- [architecture/common-layer.md](architecture/common-layer.md) — common có gì

---

## 0. Nguyên tắc chung

1. **Luôn đọc `.md` trước khi code** — `CLAUDE.md`, `guidelines/`, `architecture/`.
2. **Luôn ưu tiên dùng `@common/*`** — không tự viết lại primitive/util.
3. **Luôn theo structure đã định nghĩa** — Feature Slice; copy module `dbaas` làm template, không copy module legacy.
4. **Server Components mặc định**; chỉ thêm `"use client"` khi cần state/event/browser API.
5. **Không cross-module import** — code dùng chung phải tách ra `@common/*`.
6. **Không skip pre-commit** — cấm `--no-verify`.

---

## 1. Cách đặt tên

| # | Quy tắc | ✅ Đúng | ❌ Sai |
|---|---|---|---|
| 1.1 | **Component** PascalCase, danh từ/cụm danh từ mô tả UI hoặc vai trò | `UserProfileCard.tsx`, `function UserProfileCard() {}` | `userProfileCard.tsx`, `function userProfileCard() {}` |
| 1.2 | **Hook** bắt đầu `use`, camelCase | `useAuth.ts`, `useOrderFilters()` | `authHook.ts`, `orderFilters()` |
| 1.3 | **Biến / hàm** camelCase, mô tả ý nghĩa nghiệp vụ | `isSubmitting`, `fetchUserProfile`, `totalAmount` | `flag1`, `data2`, `handle()` |
| 1.4 | **Boolean** prefix `is` / `has` / `can` / `should` | `isLoading`, `hasPermission`, `canEdit` | `loadingFlag`, `permissionOk` |
| 1.5 | **Hằng số** UPPER_SNAKE_CASE; giá trị dùng chung tách ra `constants/` | `MAX_RETRY_COUNT`, `API_TIMEOUT_MS` | `maxRetryCount`, `timeoutMs` (cho hằng số) |
| 1.6 | **Tên file** trùng tên component chính (component file = PascalCase); hook/util/type đặt tên đúng vai trò | `SubmitButton.tsx`, `useDebounce.ts`, `formatCurrency.ts` | `button.tsx`, `helpers.ts` (chứa nhiều thứ) |
| 1.7 | **Folder** kebab-case | `cloud-server`, `block-storage` | `cloudServer`, `Block-Storage` |

---

## 2. Quy ước coding

| # | Quy tắc | ✅ Đúng | ❌ Sai |
|---|---|---|---|
| 2.1 | **Function Component** mặc định. Không class component trừ Error Boundary | `export function LoginForm() {}` | `class LoginForm extends React.Component {}` |
| 2.2 | **TypeScript-first** — Props, API response, state phức tạp có type rõ. Ưu tiên `type` thay vì `interface` | `type Props = { userId: string }` | `props: any` |
| 2.3 | **Một component, một trách nhiệm chính** — không vừa fetch, vừa transform, vừa render mọi thứ | Page → hook → presentational components | 1 file 500+ dòng xử lý tất cả |
| 2.4 | **Business logic phức tạp tách ra** ngoài JSX | `const visible = items.filter(...); return <List items={visible} />` | `<>{items.filter(...).map(...complex...)}</>` |
| 2.5 | **Cấm `console.log` / `debugger` trong production code** — chỉ `console.warn/error` khi logging hợp lệ | `console.error("Failed to submit", err)` | `console.log(data); debugger;` |
| 2.6 | **Không hard-code config** — Base URL, API key, timeout, route phải qua env / constants / config | `process.env.NEXT_PUBLIC_API_URL` | `'https://api-dev.local'` |
| 2.7 | **Tránh duplicated state** — không lưu state có thể derive được | `const completed = items.filter(x => x.done).length` | `const [completed, setCompleted] = useState(...)` |
| 2.8 | **Không mutate state** — luôn immutable update | `setItems(prev => [...prev, item])` | `items.push(item); setItems(items)` |
| 2.9 | **Path alias** bắt buộc: `@common/*`, `@{module}/*`. Không relative `../../../` cho code mới | `import x from "@common/lib/...";` | `import x from "../../../common/lib/..."` |

---

## 3. Hooks và side effects

| # | Quy tắc | ✅ Đúng | ❌ Sai |
|---|---|---|---|
| 3.1 | **Rules of Hooks** — chỉ gọi hook ở top-level component/custom hook | `const [open, setOpen] = useState(false)` | `if (isOpen) { useEffect(...) }` |
| 3.2 | **`useEffect` chỉ cho side effects** — KHÔNG dùng để tính giá trị derive được | `useEffect(() => { subscribe(); return unsubscribe }, [])` | `useEffect(() => setFullName(first + last), [first, last])` |
| 3.3 | **Dependency array đầy đủ** — không bỏ deps để né re-render; nếu có vòng lặp phải sửa thiết kế | `useEffect(() => { fetchData(userId) }, [userId])` | `useEffect(() => { fetchData(userId) }, [])` |
| 3.4 | **Cleanup khi cần** — event listener, interval, subscription, abort request | `return () => window.removeEventListener(...)` | `useEffect(() => { window.addEventListener(...) }, [])` |
| 3.5 | **Tách custom hook** khi logic lặp ở **≥ 2 nơi** | `useDebouncedSearch()` dùng ở 3 component | Copy/paste cùng đoạn `useEffect` ở 3 component |

---

## 4. State management

| # | Quy tắc | ✅ Đúng | ❌ Sai |
|---|---|---|---|
| 4.1 | **`useState`** cho state cục bộ đơn giản | `const [open, setOpen] = useState(false)` | Dùng global store cho modal chỉ 1 component |
| 4.2 | **`useReducer`** cho state phức tạp/nhiều nhánh | `const [state, dispatch] = useReducer(reducer, init)` | Nhiều `useState` rời rạc khó kiểm soát |
| 4.3 | **Phân biệt rõ 3 loại state** — UI, server, global | `theme`, `authUser`, `permissions` → store; filter list → URL searchParams; data fetch → RSC/server action | Đưa toàn bộ response API vào global store mặc định |
| 4.4 | **Không prop drilling sâu** — cân nhắc context/composition/store khi nhiều tầng trung gian chỉ pass props | `<PermissionProvider>...</PermissionProvider>` | Truyền 8 props qua 5 tầng component |
| 4.5 | **URL searchParams cho filter/pagination** — không `useState` | `?page=2&search=x` qua `useSearchParams` | `const [page, setPage] = useState(1)` cho danh sách |
| 4.6 | **Zustand cho module-scoped state** — đặt store trong `_stores/`; global trong `@common/stores/` | `useDbaasStore` trong `dbaas/_stores/` | Đặt store module trong file ngẫu nhiên |

---

## 5. API và bất đồng bộ

| # | Quy tắc | ✅ Đúng | ❌ Sai |
|---|---|---|---|
| 5.1 | **Không gọi API trùng logic** — tập trung ở `_apis/server.ts` (read) hoặc `_apis/server.actions.ts` (mutation) | `getUserProfile(id)` trong `users/_apis/server.ts` | Mỗi component tự viết fetch cùng endpoint |
| 5.2 | **Mọi luồng async phải có loading / error / empty state** | `<Spinner />` / `<ErrorState />` / `<EmptyState />` | Chỉ render success path |
| 5.3 | **Không hiển thị raw error kỹ thuật cho user** — UI message dễ hiểu, log mới giữ chi tiết | `'Không thể tải dữ liệu. Vui lòng thử lại.'` | `'AxiosError: Request failed with status code 500'` |
| 5.4 | **Hủy request khi unmount** — `AbortController` hoặc cờ "ignore stale response" | `controller.abort()` trong cleanup `useEffect` | `setState` sau khi component đã unmount |
| 5.5 | **Server-first** — RSC fetch khi load page; `server.actions.ts` cho mutation | Read in RSC, mutation via server action với `"use server"` | `useEffect` fetch trong client component cho initial load |

---

## 6. UI/UX và Accessibility

| # | Quy tắc | ✅ Đúng | ❌ Sai |
|---|---|---|---|
| 6.1 | **Semantic HTML** — `button`, `form`, `label`, `nav`, `main`... thay vì lạm dụng `div` | `<button type="button">Save</button>` | `<div onClick={save}>Save</div>` |
| 6.2 | **Ảnh có `alt`; form control có `label` hoặc `aria-label`** | `<img alt="User avatar" />` | `<img />` |
| 6.3 | **Disabled / loading state rõ ràng cả UI lẫn hành vi** | `<button disabled={isSubmitting}>Saving...</button>` | Button vẫn click được khi đang submit |
| 6.4 | **Không inline style tràn lan** — ưu tiên Tailwind / design tokens / common UI | `className="btn btn-primary"` | `style={{ marginTop: 7, color: "red" }}` khắp nơi |
| 6.5 | **Dark mode pair** — mọi `bg-*` / `text-*` đều có `dark:*` companion | `text-neutral-700 dark:text-neutral-dark-700` | `text-neutral-700` không có dark variant |
| 6.6 | **Không dùng `<table>` thuần** — dùng `CommonTable` / `DataTable` (TanStack) hoặc `@common/components/ui/table.tsx` primitives | `<DataTable table={table} columns={cols} />` | `<table><tr><td>...</td></tr></table>` |

---

## 7. Performance

| # | Quy tắc | ✅ Đúng | ❌ Sai |
|---|---|---|---|
| 7.1 | **`useMemo` / `useCallback` chỉ khi có lý do** — không tối ưu sớm | Memo cho phép tính nặng / prop ổn định truyền sâu | Bọc gần như mọi biến bằng `useMemo` |
| 7.2 | **`React.memo`** cho component render nhiều với props ổn định | `export default React.memo(UserRow)` | Memo toàn bộ app không có đo đạc |
| 7.3 | **List `key` ổn định** — không dùng `index` khi thứ tự có thể đổi | `key={user.id}` | `key={index}` cho list có thể sắp xếp / xoá |
| 7.4 | **Lazy-load** page/component nặng | `const SettingsPage = lazy(() => import("./SettingsPage"))` | Bundle toàn bộ module lớn ngay entry |

---

## 8. Testing

| # | Quy tắc | ✅ Đúng | ❌ Sai |
|---|---|---|---|
| 8.1 | **Test hành vi user** thay vì chi tiết implementation | `screen.getByRole("button", { name: /save/i })` | Test state nội bộ từng dòng |
| 8.2 | **Luồng quan trọng và bug nghiêm trọng fix xong → regression test** | Test submit form fail/success sau khi fix bug | Fix bug xong nhưng không có test bảo vệ |
| 8.3 | **CI bắt buộc lint + test**; không merge khi pipeline đỏ | PR pass checks → merge | Merge dù lint/test fail |

---

## 9. Tooling / format / review

| # | Quy tắc | ✅ Đúng | ❌ Sai |
|---|---|---|---|
| 9.1 | **ESLint flat config** (`eslint.config.*`) cho project mới; không dùng `.eslintrc` legacy | `eslint.config.mjs` | `.eslintrc.json` cho code mới |
| 9.2 | **Bắt buộc ESLint + Prettier + format on save** | `npm run lint && npm run format:check` | Mỗi người tự format theo ý mình |
| 9.3 | **Không `eslint-disable` toàn file không lý do** — phải note rõ trong PR | `// eslint-disable-next-line no-console — debug during migration` | `/* eslint-disable */` không lý do |
| 9.4 | **Pre-commit hook** bật sẵn (`src/web/portal-spa/.husky/pre-commit`) — setup 1 lần: `git config --local core.hooksPath src/web/portal-spa/.husky` | Hook tự chạy lint-staged khi commit | `git commit --no-verify` để bypass |
| 9.5 | **Review checklist bắt buộc** | readability, edge case, async state, accessibility, performance, security cơ bản, `useEffect` deps đầy đủ, custom hook khi lặp ≥ 2 nơi | Chỉ review xem chạy được hay không |

---

## 10. Unit test

| # | Quy tắc | Yêu cầu |
|---|---|---|
| 10.1 | File schema / util / helper / convert ngày tháng / custom thư viện | Viết unit test, **coverage > 90%** |
| 10.2 | Validator (zod schemas) | Test happy path + edge case (boundary, null, sai format) |
| 10.3 | Helper format (date, number, string) | Test locale, timezone, edge cases (Infinity, NaN, empty) |
| 10.4 | Custom hook không liên quan UI | Test với `renderHook` từ `@testing-library/react` |

---

## 11. Structure & module bootstrap (Feature Slice)

Mọi module mới copy theo `dbaas`:

```
src/app/[locale]/(dashboard)/{module}/
  _apis/
    server.ts          # RSC fetchers (read)
    server.actions.ts  # "use server" mutations
    types.ts
    urns.ts            # permission URNs
  _lib/
    const.ts
    schemas.ts         # zod
    validators.ts
  _hooks/
  _stores/             # Zustand (module-scoped)
  _components/
  page.tsx             # thin shell, delegate to _components
```

**Tuyệt đối không:**
- Import chéo module (`@dbaas/*` từ `@cloud-server/*`).
- Copy module legacy làm template — legacy đang trong migration debt, xem [architecture/migration-status.md](architecture/migration-status.md).
- Đặt logic UI vào `page.tsx` — page chỉ là shell.

---

## 12. Common layer — kiểm tra trước khi viết mới

Trước khi tạo component / hook / util mới, **luôn check** ở `src/common/`:

| Nhu cầu | Nơi tìm |
|---|---|
| Table sort/filter/pagination | `@common/components/containers/tables/CommonTable.tsx` hoặc `DataTable.tsx` |
| Sortable column header | `@common/components/containers/tables/SortableFilterHeader.tsx` |
| Pagination footer | `@common/components/containers/tables/TablePagination.tsx` |
| Search input debounce | `@common/components/containers/inputs/DebounceInput.tsx` |
| Dropdown / select | `@common/components/containers/selects/SelectContainer.tsx` |
| URL query state | `@common/hooks/useQueryParams.tsx` |
| Row selection state | `@common/hooks/useRowSelection.tsx` |
| Button, Input, Badge, Avatar, Dialog… | `@common/components/ui/{component}.tsx` |
| Date/number/string format | `@common/lib/helpers/{datetime,numbers,str}.ts` |
| Table-specific helpers | `@common/lib/helpers/table.ts` |
| Notification thành công/thất bại | `@common/components/feedback/GNotification.tsx` |
| Calendar / DatePicker | `@common/components/calendar/GCelander.tsx` |

Nếu primitive cần thiếu — tạo mới **trong `@common/`**, không tạo trong module.

---

## 13. Commit / PR

1. `npm run lint:fix` — auto-fix ESLint + Prettier
2. `npx tsc --noEmit` — TypeScript zero error
3. Commit (pre-commit hook tự chạy `lint:staged`)
4. Pre-push hook validate branch name
5. PR mô tả: WHY > WHAT > test plan; gắn link issue/ticket nếu có

**Commit message format**: `<type>: <description>` (`feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`, `build`, `ci`, `perf`).

---

## Phụ lục — Anti-patterns hay gặp

| Sai | Đúng |
|---|---|
| Tự viết `<table>` HTML | Dùng `CommonTable` / `DataTable` |
| `useState` cho filter/pagination | URL `searchParams` |
| Import `@cloud-server/...` từ `@dbaas/...` | Tách shared code → `@common/*` |
| Copy module legacy làm template | Copy `dbaas` |
| Hardcode `bg-[#1379F0]` rải rác | Đặt thành token / dùng class cố định |
| Quên `dark:*` companion | Mọi `bg-*`/`text-*` đều phải pair |
| `--no-verify` bypass lint | Sửa root cause |
| Feature mới không có flag | Bọc trong `*_ENABLE` env flag |
| `console.log` rải rác | Dùng logger có cấp độ; debug xong xoá |
| `key={index}` cho list reorderable | `key={item.id}` |
