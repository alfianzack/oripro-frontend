/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/welcome',
        permanent: false, // Changed to false so it can be overridden if needed
      },
    ];
  },
};

module.exports = nextConfig;
