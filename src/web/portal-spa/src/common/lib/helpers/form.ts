// Cuộn tới + focus trường bắt buộc đầu tiên đang lỗi khi submit form.
//
// Vì các form admin dùng `useState` thuần (không react-hook-form) nên không có
// cơ chế focus-first-error sẵn. Quy ước: mỗi trường bắt buộc gắn thuộc tính
// `data-field="<key>"` lên wrapper (hoặc chính input). Khi validate fail,
// truyền danh sách key đang lỗi THEO ĐÚNG THỨ TỰ hiển thị trên form; helper tìm
// phần tử đầu tiên khớp trong `container`, cuộn vào giữa khung nhìn và focus
// control bên trong.
//
// `container` nên là vùng chứa toàn bộ các trường (thường là body của Drawer) để
// querySelector không "đụng" sang form/drawer khác đang mở.
export function focusFirstInvalidField(
  container: HTMLElement | null | undefined,
  invalidKeysInOrder: readonly string[],
): void {
  if (!container) return;

  for (const key of invalidKeysInOrder) {
    const anchor = container.querySelector<HTMLElement>(
      `[data-field="${CSS.escape(key)}"]`,
    );
    if (!anchor) continue;

    // scrollIntoView tự cuộn mọi ancestor có overflow → luôn đưa được lỗi vào
    // tầm nhìn dù form có nhiều vùng cuộn lồng nhau.
    anchor.scrollIntoView({ behavior: "smooth", block: "center" });

    // Focus best-effort: nếu anchor tự focus được thì focus, không thì tìm
    // control focus được bên trong (input/select/antd combobox...).
    const focusable = anchor.matches("input, textarea, select, [tabindex]")
      ? anchor
      : anchor.querySelector<HTMLElement>(
          "input, textarea, select, button, [role='combobox'], [tabindex]",
        );
    // preventScroll: để scrollIntoView (smooth) điều khiển việc cuộn, tránh giật.
    focusable?.focus({ preventScroll: true });
    return;
  }
}
