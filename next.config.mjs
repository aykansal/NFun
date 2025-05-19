// import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'toc.otmnft.com',
      },
      {
        protocol: 'https',
        hostname: 'docs.looksrare.org',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'arweave.net',
      },
      {
        protocol: 'https',
        hostname: 'tenor.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Resolve 'fs' module issue in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        'canvas': false
      };
    }
    return config;
  },
};
export default nextConfig;
// export default withBundleAnalyzer(nextConfig);
