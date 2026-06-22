"use client";

import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
  forwardRef,
} from "react";
import Link, { type LinkProps } from "next/link";
import { SLASH } from "@common/lib/core/const";
import { locales } from "@/common/lib/i18n/routing";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type AnchorProps = Omit<ComponentPropsWithoutRef<"a">, keyof LinkProps>;

type AppLinkProps = LinkProps &
  AnchorProps & {
    disableNavigatingState?: boolean;
  };

const BASE_PATH = "v2";

const LOCALE_SET: ReadonlySet<string> = new Set(locales);

const trimSlash = (str: string) => {
  let start = 0;
  let end = str.length;

  while (start < end && str[start] === "/") start++;
  while (end > start && str[end - 1] === "/") end--;

  return str.slice(start, end);
};

const normalizeAppPath = (path: string) => {
  const segments = trimSlash(path).split(SLASH);

  // remove basePath
  if (segments[0] === BASE_PATH) {
    segments.shift();
  }

  // remove locale
  if (segments[0] && LOCALE_SET.has(segments[0])) {
    segments.shift();
  }

  return segments.length ? SLASH + segments.join(SLASH) : SLASH;
};

const EXTERNAL_SCHEME_REGEX = /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i;

const isHashOnlyHref = (href: string) => href.trim().startsWith("#");

const isInternalHref = (href: string) => !EXTERNAL_SCHEME_REGEX.test(href);

const isModifiedClick = (event: MouseEvent<HTMLAnchorElement>) =>
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey;

export const isSamePathAndSearch = (href: string) => {
  if (typeof window === "undefined") return false;

  try {
    const targetUrl = new URL(href, window.location.href);

    const currentPath = normalizeAppPath(window.location.pathname);
    const targetPath = normalizeAppPath(targetUrl.pathname);

    return (
      targetPath === currentPath && targetUrl.search === window.location.search
    );
  } catch {
    return false;
  }
};

const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(function AppLink(
  { onClick, target, disableNavigatingState = false, href, ...props },
  ref,
) {
  const setIsNavigating = useLayoutStore((state) => state.setIsNavigating);

  return (
    <Link
      {...props}
      href={href}
      ref={ref}
      target={target}
      onClick={(event) => {
        onClick?.(event);

        if (
          disableNavigatingState ||
          event.defaultPrevented ||
          isModifiedClick(event) ||
          (target && target !== "_self")
        ) {
          return;
        }

        if (typeof href !== "string") {
          setIsNavigating(true);
          return;
        }

        if (
          !isInternalHref(href) ||
          isHashOnlyHref(href) ||
          isSamePathAndSearch(href)
        ) {
          return;
        }

        setIsNavigating(true);
      }}
    />
  );
});

export default AppLink;
