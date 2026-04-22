/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // Set basePath to your repo name when deploying to GitHub Pages
  // e.g. basePath: "/resumebuilder"
  // Leave empty if deploying to a custom domain or user/org page
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true }

    // typst.react imports './typst.css?inline' (Vite syntax).
    // Intercept any request ending in .css?inline and return an empty string.
    config.module.rules.push({
      resourceQuery: /inline/,
      type: "asset/source",
      use: [],
      enforce: "pre",
      test: /\.css$/,
    })

    return config
  },
}

export default nextConfig
