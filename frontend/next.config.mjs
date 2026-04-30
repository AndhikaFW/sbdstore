const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:3131/auth/:path*',
      },
      {
        source: '/api/user/:path*',
        destination: 'http://localhost:3131/user/:path*',
      },
      {
        source: '/api/items/:path*',
        destination: 'http://localhost:3131/items/:path*',
      },
      {
        source: '/api/transaction/:path*',
        destination: 'http://localhost:3131/transaction/:path*',
      },
      {
        source: '/api/reports/:path*',
        destination: 'http://localhost:3131/reports/:path*',
      },
    ];
  },
};

export default nextConfig;
