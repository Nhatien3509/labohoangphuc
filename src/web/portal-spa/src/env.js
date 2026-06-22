/* eslint-disable no-undef */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * @param {string | null | undefined} val
 */
function toBoolean(val) {
  if (!val) {
    return false;
  }

  switch (val.toLowerCase()) {
    case "true":
    case "1":
    case "on":
    case "yes":
    case "enable":
    case "enabled":
      return true;
    default:
      return false;
  }
}

/**
 * @param {string | undefined} val
 */
function splitString(val) {
  if (!val) {
    return [];
  }

  return val.split(",");
}

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    STANDALONE: z.boolean().optional(),
    ALLOWED_ORIGINS: z.preprocess(
      (val) => (typeof val === "string" ? splitString(val) : val),
      z.array(z.string()).default([]),
    ),

    // Endpoints
    ORIGIN_URL: z.string().optional().default("http://localhost:4800"),
    CONSOLE_URL: z.string().optional().default("http://localhost"),
    BACKEND_URL: z.string().optional().default("http://localhost:8000"),
    PROMETHEUS_URL: z.string().optional().default(""),
    GRAPHQL_URL: z.string().optional().default("http://localhost:8183/graphql"),
    REGISTRY_URL: z.string().optional().default("http://localhost:8085"),
    DOCS_URL: z.string().optional().default("http://localhost:8181"),
    CONTAINER_REGISTRY_URL: z
      .string()
      .optional()
      .default("http://localhost:8181"),

    // Auth
    KEYCLOAK_ISSUER: z
      .string()
      .optional()
      .default("http://localhost:8080/realms/dev"),
    KEYCLOAK_CLIENT_ID: z.string().optional().default("cloud-console"),
    KEYCLOAK_SCOPE: z.string().optional().default("openid profile"),
    COOKIES_PASSWORD: z
      .string()
      .optional()
      .default("dev-only-password-min-32-characters!!"),
    BYPASS_AUTH: z.boolean().optional().default(false),
    BYPASS_CAPTCHA: z.boolean().optional().default(false),
    RECAPTCHA_SITE_KEY: z.string().optional().default("placeholder"),
    RECAPTCHA_SECRET_KEY: z.string().optional().default("placeholder"),
    RECAPTCHA_VERIFY_URL: z
      .string()
      .optional()
      .default("http://localhost/verify"),

    // Feature flags
    THEME_SWITCH_ENABLE: z.boolean().optional().default(false),
    DEBUG_LOGS_ENABLE: z.boolean().optional().default(false),
    USE_BASIC_AUTH_ENABLE: z.boolean().optional().default(false),
    MONITORING_ENABLE: z.boolean().optional().default(false),
    CLOUD_OBSERVABILITY_ENABLE: z.boolean().optional().default(false),
    LOGS_ENABLE: z.boolean().optional().default(false),
    PAT_ENABLE: z.boolean().optional().default(false),
    VPN_ENABLE: z.boolean().optional().default(false),
    NETWORK_SHARE_VPC_ENABLE: z.boolean().optional().default(false),
    NETWORK_DIRECT_CONNECT_ENABLE: z.boolean().optional().default(false),
    NETWORK_DNS_ENABLE: z.boolean().optional().default(false),
    NETWORK_LOAD_BALANCING_ENABLE: z.boolean().optional().default(false),
    SERVER_LIVE_RESIZE_ENABLE: z.boolean().optional().default(false),
    OBJECT_STORAGE_DATA_SYNC_JOB_ENABLE: z.boolean().optional().default(false),
    OBJECT_STORAGE_DATA_SYNC_CONFIG_ENABLE: z
      .boolean()
      .optional()
      .default(false),
    OBJECT_STORAGE_ENCRYPT_TYPE_ENABLE: z.boolean().optional().default(false),
    FILE_STORAGE_ENABLE: z.boolean().optional().default(false),
    KMS_ENABLE: z.boolean().optional().default(false),
    DMS_ENABLE: z.boolean().optional().default(false),
    DBAAS_ENABLE: z.boolean().optional().default(false),
    CONTAINER_REGISTRY_ENABLE: z.boolean().optional().default(false),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {},

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    STANDALONE: toBoolean(process.env.STANDALONE),
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,

    ORIGIN_URL: process.env.ORIGIN_URL,
    CONSOLE_URL: process.env.CONSOLE_URL,
    BACKEND_URL: process.env.BACKEND_URL,
    PROMETHEUS_URL: process.env.PROMETHEUS_URL,
    GRAPHQL_URL: process.env.GRAPHQL_URL,
    REGISTRY_URL: process.env.REGISTRY_URL,
    DOCS_URL: process.env.DOCS_URL,
    CONTAINER_REGISTRY_URL: process.env.CONTAINER_REGISTRY_URL,

    KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER,
    KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
    KEYCLOAK_SCOPE: process.env.KEYCLOAK_SCOPE,
    COOKIES_PASSWORD: process.env.COOKIES_PASSWORD,
    BYPASS_AUTH: toBoolean(process.env.BYPASS_AUTH),
    BYPASS_CAPTCHA: toBoolean(process.env.BYPASS_CAPTCHA),
    RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
    RECAPTCHA_VERIFY_URL: process.env.RECAPTCHA_VERIFY_URL,

    THEME_SWITCH_ENABLE: toBoolean(process.env.THEME_SWITCH_ENABLE),
    DEBUG_LOGS_ENABLE: toBoolean(process.env.DEBUG_LOGS_ENABLE),
    USE_BASIC_AUTH_ENABLE: toBoolean(process.env.USE_BASIC_AUTH_ENABLE),
    MONITORING_ENABLE: toBoolean(process.env.MONITORING_ENABLE),
    CLOUD_OBSERVABILITY_ENABLE: toBoolean(
      process.env.CLOUD_OBSERVABILITY_ENABLE,
    ),
    LOGS_ENABLE: toBoolean(process.env.LOGS_ENABLE),
    PAT_ENABLE: toBoolean(process.env.PAT_ENABLE),
    VPN_ENABLE: toBoolean(process.env.VPN_ENABLE),
    NETWORK_SHARE_VPC_ENABLE: toBoolean(process.env.NETWORK_SHARE_VPC_ENABLE),
    NETWORK_DIRECT_CONNECT_ENABLE: toBoolean(
      process.env.NETWORK_DIRECT_CONNECT_ENABLE,
    ),
    NETWORK_DNS_ENABLE: toBoolean(process.env.NETWORK_DNS_ENABLE),
    NETWORK_LOAD_BALANCING_ENABLE: toBoolean(
      process.env.NETWORK_LOAD_BALANCING_ENABLE,
    ),
    SERVER_LIVE_RESIZE_ENABLE: toBoolean(process.env.SERVER_LIVE_RESIZE_ENABLE),
    OBJECT_STORAGE_DATA_SYNC_JOB_ENABLE: toBoolean(
      process.env.OBJECT_STORAGE_DATA_SYNC_JOB_ENABLE,
    ),
    OBJECT_STORAGE_DATA_SYNC_CONFIG_ENABLE: toBoolean(
      process.env.OBJECT_STORAGE_DATA_SYNC_CONFIG_ENABLE,
    ),
    OBJECT_STORAGE_ENCRYPT_TYPE_ENABLE: toBoolean(
      process.env.OBJECT_STORAGE_ENCRYPT_TYPE_ENABLE,
    ),
    FILE_STORAGE_ENABLE: toBoolean(process.env.FILE_STORAGE_ENABLE),
    KMS_ENABLE: toBoolean(process.env.KMS_ENABLE),
    DMS_ENABLE: toBoolean(process.env.DMS_ENABLE),
    DBAAS_ENABLE: toBoolean(process.env.DBAAS_ENABLE),
    CONTAINER_REGISTRY_ENABLE: toBoolean(process.env.CONTAINER_REGISTRY_ENABLE),
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
