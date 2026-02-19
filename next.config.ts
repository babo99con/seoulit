import type { NextConfig } from "next";

const backendOrigin = process.env.BACKEND_API_ORIGIN ?? "http://127.0.0.1:8081";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: "/oauth2/:path*",
        destination: `${backendOrigin}/oauth2/:path*`,
      },
      {
        source: "/login/oauth2/:path*",
        destination: `${backendOrigin}/login/oauth2/:path*`,
      },
      {
        source: "/hospital-files/:path*",
        destination: "http://minio:9000/hospital-files/:path*",
      },
      {
        source: "/staff-profile/:path*",
        destination: "http://minio:9000/staff-profile/:path*",
      },
      {
        source: "/patient-files/:path*",
        destination: "http://minio:9000/patient-files/:path*",
      },
    ];
  },
};

export default nextConfig;
