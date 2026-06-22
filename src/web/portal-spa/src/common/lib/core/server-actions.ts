/* Methods in this file are Server Actions */

"use server";

import { cookies } from "next/headers";

// TODO: recheck `httpOnly: true`
export async function setCookies(
  cookiesToSet: Record<string, string>,
  options = { secure: true, httpOnly: true, overwrite: true, path: "/" },
): Promise<void> {
  const cookieStore = cookies();

  for (const [key, value] of Object.entries(cookiesToSet)) {
    const currentValue = cookieStore.get(key)?.value;
    if (!currentValue || options.overwrite) {
      cookieStore.set(key, value, options);
    }
  }

  return Promise.resolve();
}
