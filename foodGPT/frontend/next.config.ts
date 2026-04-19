import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000';
let backendHostname = '127.0.0.1';
let backendProtocol = 'http';
let backendPort = '5000';

try {
  const url = new URL(backendUrl);
  backendHostname = url.hostname;
  backendProtocol = url.protocol.replace(':', '');
  backendPort = url.port;
} catch (e) {
  console.error("Invalid NEXT_PUBLIC_API_BASE_URL");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: backendProtocol as "http" | "https",
        hostname: backendHostname,
        port: backendPort,
        pathname: '/static/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/static/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
        pathname: '/static/**',
      },
      {
        protocol: 'https',
        hostname: 'beatmeloser-foodgpt-backend.hf.space',
        port: '',
        pathname: '/static/**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
