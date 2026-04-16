import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    viewTransition: true,
  },
  turbopack: {
    resolveAlias: {
      // @vercel/og wasm files are not used — stub them out to stay within
      // Cloudflare Workers size limits.
      "@vercel/og": "./src/lib/og-stub.ts",
    },
  },
};

export default nextConfig;
