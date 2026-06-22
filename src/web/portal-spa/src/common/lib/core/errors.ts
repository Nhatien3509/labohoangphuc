import { ORIGIN_URL_WITH_BASE_PATH } from "@common/lib/core/auth";

export const OAUTH_ERROR_HANDLERS: Record<string, () => Response> = {
  access_denied: () =>
    Response.redirect(`${ORIGIN_URL_WITH_BASE_PATH}/auth/login`),
};
