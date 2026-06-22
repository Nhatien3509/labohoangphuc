import { useEffect, useState } from "react";

function hasScrollbarGutter(): boolean {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.overflow = "scroll";
  div.style.visibility = "hidden";
  div.style.position = "absolute";
  div.style.top = "-9999px";

  document.body.appendChild(div);
  const result = div.offsetWidth > div.clientWidth;
  document.body.removeChild(div);

  return result;
}

export function useScrollbarGutter() {
  const [hasGutter, setHasGutter] = useState(false);

  useEffect(() => {
    setHasGutter(hasScrollbarGutter());
  }, []);

  return hasGutter;
}
