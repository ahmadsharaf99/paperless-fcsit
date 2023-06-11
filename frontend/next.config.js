/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['127.0.0.1'],
  },
  env: {
    API_BASE_URL: 'http://127.0.0.1:8000',
    maxUploadSize: 200,
  },
};

module.exports = nextConfig;
