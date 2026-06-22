"use client";

import toast from "@common/components/ui/toast";

import React, { type ReactNode, useEffect } from "react";
import { type ApiError } from "@/api/types";
import DOMPurify from "isomorphic-dompurify";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export type NestedObject = {
  [key: string]: NestedObject | string;
};

export type FlattenError = {
  location: string;
  message: string;
  code: string;
};

export type HandleErrorMessageProps = {
  statusCode?: number;
  statusText?: string;
  data?: ApiError | FlattenError[];
};

type ErrorToastProps = {
  title?: string;
  data?: ApiError | FlattenError[];
  duration?: number;
  variant?: "destructive" | "default";
  statusCode?: number;
  statusText?: string;
};

const RenderChildLevelError = (
  key: string,
  error: string,
  level: number,
): ReactNode => {
  const marginLeft = `ml-${level * 2}`;
  const cleanMessage = DOMPurify.sanitize(error ? `${key}: ${error}` : "");
  const errorMessage = {
    __html: cleanMessage,
  };
  return (
    <div
      dangerouslySetInnerHTML={errorMessage}
      key={key}
      className={marginLeft}
    ></div>
  );
};

const RenderError = (
  dataError: NestedObject | string | null | undefined,
  level = 0,
): ReactNode => {
  const marginLeft = `ml-${level * 2}`;

  if (dataError == null) {
    return null;
  }

  if (typeof dataError === "string") {
    const cleanMessage = DOMPurify.sanitize(dataError);
    const errorMessage = {
      __html: cleanMessage,
    };
    return <div dangerouslySetInnerHTML={errorMessage}></div>;
  }

  return Object.keys(dataError).map((key) => {
    const keyValue = isNaN(parseInt(key)) ? key : parseInt(key) + 1;
    if (typeof dataError[key] === "string") {
      return RenderChildLevelError(key, dataError[key], level);
    } else {
      return (
        <>
          <div className={marginLeft}>{keyValue}:</div>
          {RenderError(dataError[key] ?? "", level + 1)}
        </>
      );
    }
  });
};

export function HandleErrorMessage({
  statusCode = 0,
  statusText,
  data,
}: Readonly<HandleErrorMessageProps>) {
  const { t } = useLayoutStore((state) => state);

  if (statusCode >= 500) {
    return t("common.toast.error");
  }

  if (statusCode === 404) {
    return `${statusCode} ${statusText}`;
  }

  if (typeof data === "string" || !data) {
    return <div>{data}</div>;
  }

  if (Array.isArray(data)) {
    return data.map((error: FlattenError, index) => {
      const marginTop = `mt-${index ? 3 : 0}`;
      const cleanMessage = DOMPurify.sanitize(error.message);
      const errorMessage = {
        __html: cleanMessage,
      };

      return (
        <div
          key={`${cleanMessage}-${index}`}
          className={marginTop}
          dangerouslySetInnerHTML={errorMessage}
        ></div>
      );
    });
  }

  // Ưu tiên định dạng BE Go: { description, message: { vi, en } }
  if (data.description) {
    return RenderError(data.description);
  }
  if (typeof data.message === "string" && data.message) {
    return RenderError(data.message);
  }
  if (data.message && typeof data.message === "object") {
    const vi = data.message.vi?.trim();
    const en = data.message.en?.trim();
    const fallback = vi ?? en;
    if (fallback) return RenderError(fallback);
  }

  return RenderError(data.detail);
}

export default function ErrorToast({
  statusCode = 0,
  data,
  statusText,
  ...props
}: Readonly<ErrorToastProps>) {
  useEffect(() => {
    toast.error(
      <HandleErrorMessage
        data={data}
        statusCode={statusCode}
        statusText={statusText}
        {...props}
      />,
    );
  }, []);

  return <></>;
}
