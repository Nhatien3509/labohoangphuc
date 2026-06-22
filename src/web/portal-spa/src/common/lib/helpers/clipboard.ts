// Copy text an toàn cả khi KHÔNG ở secure context.
//
// `navigator.clipboard` chỉ tồn tại trên HTTPS hoặc localhost. App đang chạy
// HTTP qua IP (vd http://160.191.32.224:8800) nên `navigator.clipboard` là
// undefined → gọi `.writeText` ném lỗi và nút copy "không hoạt động". Helper
// này thử Clipboard API trước, không có thì fallback sang textarea ẩn +
// document.execCommand("copy") (vẫn chạy trên HTTP). Trả về true nếu copy được.
export async function copyToClipboard(text: string): Promise<boolean> {
  // Đường nhanh: Clipboard API. Đọc qua kiểu optional vì trên HTTP qua IP,
  // navigator.clipboard thực tế là undefined (dù type DOM nói luôn tồn tại).
  const clipboard = (navigator as { clipboard?: Clipboard }).clipboard;
  if (clipboard) {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      // rơi xuống fallback bên dưới
    }
  }

  // Fallback cho HTTP context: textarea ẩn + execCommand("copy").
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // Đặt ngoài màn hình + readonly để tránh cuộn/nháy bàn phím mobile.
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    // execCommand đã deprecated nhưng là cách duy nhất copy được ở non-secure
    // context (HTTP) — giữ làm fallback.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
}
