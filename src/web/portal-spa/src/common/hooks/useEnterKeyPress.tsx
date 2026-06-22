import { useCallback, useEffect, useRef } from "react";

function useEnterKeyPress({
  buttonRef,
}: {
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  const isMainScreenFocused = useRef(true);

  const handleFocus = useCallback(
    () => (isMainScreenFocused.current = false),
    [],
  );
  const handleBlur = useCallback(
    () => (isMainScreenFocused.current = true),
    [],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      const role = target.role?.toLowerCase() ?? "";

      if (
        !isMainScreenFocused.current ||
        ["a", "button"].includes(tag) ||
        ["menuitem", "button"].includes(role) ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.code === "Enter" || event.code === "NumpadEnter") {
        event.preventDefault();
        buttonRef.current?.click();
      }
    },
    [buttonRef],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return { handleFocus, handleBlur };
}

export default useEnterKeyPress;
