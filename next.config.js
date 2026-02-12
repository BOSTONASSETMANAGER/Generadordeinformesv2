/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-to-png-converter', '@napi-rs/canvas', 'canvas', 'pdfjs-dist'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false

    // Exclude native binary modules from webpack bundling
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@napi-rs/canvas': 'commonjs @napi-rs/canvas',
        'pdf-to-png-converter': 'commonjs pdf-to-png-converter',
        canvas: 'commonjs canvas',
      })
    }

    return config
  },
}

module.exports = nextConfig
