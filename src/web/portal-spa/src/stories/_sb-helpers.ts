// src/stories/_sb-helpers.ts

/**
 * Generic context shape mà Storybook truyền vào render().
 * Không phụ thuộc @storybook/types.
 */
type CtxLike<Args> = { updateArgs?: (patch: Partial<Args>) => void };

/**
 * getUpdate
 * ---------
 * Trả về hàm updateArgs(patch) an toàn:
 * - Nếu context có updateArgs: gọi updateArgs(patch)
 * - Nếu không có: no-op (không làm gì)
 *
 * Dùng cho mọi component:
 *   const update = getUpdate<MyArgs>(ctx);
 *   update({ value: "abc" });
 */
export function getUpdate<Args>(ctx: unknown) {
  const u = (ctx as CtxLike<Args>).updateArgs;

  return (patch: Partial<Args>) => {
    if (typeof u === "function") {
      u(patch);
    }
  };
}

/**
 * clickById
 * ---------
 * Hỗ trợ demo a11y: click vào input/checkbox theo id khi nhấn label.
 */
export function clickById(id: string) {
  const el = document.getElementById(id) as
    | HTMLButtonElement
    | HTMLInputElement
    | null;
  el?.click();
}
