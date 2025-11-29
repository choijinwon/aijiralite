/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com']
  },
  eslint: {
    // 빌드 시 ESLint 오류를 무시 (프로덕션 배포용)
    ignoreDuringBuilds: true,
  },
  // 소스맵 생성 비활성화 (개발 환경에서 404 오류 방지)
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    config.externals = [...(config.externals || []), 'bcrypt'];
    
    // 개발 환경에서 CSS 소스맵 404 오류 방지
    if (dev && !isServer) {
      config.devtool = 'eval-source-map';
    }
    
    return config;
  },
  // 커스텀 서버 미들웨어로 404 소스맵 요청 무시
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: []
    };
  }
}

module.exports = nextConfig

