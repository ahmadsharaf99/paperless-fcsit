/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['127.0.0.1'],
  },
  env: {
    API_BASE_URL: 'https://paperless-fcsit-production.up.railway.app/',
    maxUploadSize: 200,
  },
};

module.exports = nextConfig;
