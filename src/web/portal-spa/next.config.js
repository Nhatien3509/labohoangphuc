/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import createNextIntlPlugin from "next-intl/plugin";

const {
  env: { STANDALONE, ALLOWED_ORIGINS },
} = await import("./src/env.js");
const { BASE_PATH } = await import("./src/common/lib/core/const.js");
const { REDIRECT_RULES } = await import("./src/common/lib/core/redirects.js");

/** @type {import("next").NextConfig} */
const config = {
  basePath: BASE_PATH,
  assetPrefix: BASE_PATH,
  experimental: {
    serverActions: {
      allowedOrigins: ALLOWED_ORIGINS,
    },
    // jsdom (used by isomorphic-dompurify) reads default-stylesheet.css via __dirname.
    // Mark as external so webpack doesn't bundle it — require() loads from real
    // node_modules at runtime, jsdom's relative file resolution works correctly.
    serverComponentsExternalPackages: ["isomorphic-dompurify"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: STANDALONE ? "standalone" : undefined,
  redirects() {
    return Promise.resolve(REDIRECT_RULES);
  },
};

const withNextIntl = createNextIntlPlugin("./src/common/lib/i18n/request.ts");

export default withNextIntl(config);
