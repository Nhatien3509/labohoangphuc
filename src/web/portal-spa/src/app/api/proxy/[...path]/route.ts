// Generic Next.js Route Handler proxy ra BE. Mục đích: cho phép client-side
// fetch (xem trong DevTools Network tab) trong khi vẫn giữ auth token /
// cookie / project-id ở phía server. Mọi method GET/POST/PUT/PATCH/DELETE
// đều được forward 1:1 với BE.

import {
  type AccessTokenData,
  type SessionData,
  getSession,
} from "@common/lib/core/auth";
import { type NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { env } from "@/env";
import { getFeatureFlags } from "@common/lib/feature-flags/server";

const BACKEND_URL = env.BACKEND_URL;

async function forward(
  req: NextRequest,
  ctx: { params: { path: string[] } },
): Promise<NextResponse> {
  const path = ctx.params.path.join("/");
  const url = new URL(req.url);
  const targetUrl = `${BACKEND_URL}/${path}${url.search}`;

  const [{ access_token }, { isLoggedIn }] = await Promise.all([
    getSession<AccessTokenData>("accessToken"),
    getSession<SessionData>("session"),
  ]);
  const useBasicAuth = getFeatureFlags("useBasicAuth.enabled");
  const authorization = useBasicAuth
    ? `Basic ${access_token}`
    : `Bearer ${access_token}`;
  const locale = headers().get("x-next-intl-locale") ?? "vi";
  const projectId = cookies().get("projectId")?.value ?? "";

  const forwardHeaders: Record<string, string> = {
    "accept-language": locale,
    accept: "application/json",
    "project-id": projectId,
    "error-format": req.headers.get("error-format") ?? "flatten",
  };
  if (isLoggedIn) forwardHeaders.authorization = authorization;

  const contentType = req.headers.get("content-type");
  if (contentType) forwardHeaders["content-type"] = contentType;

  // Chỉ đọc body khi method có thể chứa body VÀ có content-length > 0
  // (check byteLength bên dưới). DELETE vẫn cần body cho các API bulk-delete
  // kiểu `DELETE /categories {Ids: [...]}`; body rỗng sẽ không được forward
  // nên không làm gin bind JSON lỗi.
  const methodHasBody = req.method !== "GET" && req.method !== "HEAD";
  let body: BodyInit | undefined;
  if (methodHasBody) {
    const buf = await req.arrayBuffer();
    if (buf.byteLength > 0) body = buf;
  }

  console.log(`[proxy] ${req.method} ${targetUrl} body=${body ? "yes" : "no"}`);

  let beResponse: Response;
  try {
    beResponse = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
    });
  } catch (err) {
    console.error("[proxy] fetch failed", err);
    return NextResponse.json(
      { detail: "Proxy fetch failed", error: String(err) },
      { status: 502 },
    );
  }

  console.log(`[proxy] ${req.method} ${targetUrl} → ${beResponse.status}`);

  // 204/205/304 là "null body status" — Response constructor sẽ throw
  // TypeError nếu truyền body khác null (ArrayBuffer rỗng vẫn tính là body),
  // khiến route handler trả 500 dù BE đã trả thành công.
  const isNullBodyStatus = [101, 204, 205, 304].includes(beResponse.status);
  const responseBody = isNullBodyStatus ? null : await beResponse.arrayBuffer();
  const responseHeaders = new Headers();
  beResponse.headers.forEach((value, key) => {
    // bỏ một số header không nên forward
    if (
      key.toLowerCase() === "transfer-encoding" ||
      key.toLowerCase() === "content-encoding"
    )
      return;
    responseHeaders.set(key, value);
  });

  return new NextResponse(responseBody, {
    status: beResponse.status,
    statusText: beResponse.statusText,
    headers: responseHeaders,
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
