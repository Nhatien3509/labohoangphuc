/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  output: process.env.STANDALONE ? "standalone" : undefined,
};

export default config;
