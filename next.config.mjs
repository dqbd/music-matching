// @ts-check
import { dirname } from "path"
import { fileURLToPath } from "url"

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"))

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import("next").NextConfig} */
const config = {
  compiler: {
    emotion: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  env: {
    ROOT: __dirname,
  },
}

export default config
