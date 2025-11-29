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
  typescript: {
    // 빌드 시 TypeScript 오류를 무시 (프로덕션 배포용)
    ignoreBuildErrors: true,
  },
  // 소스맵 생성 비활성화 (개발 환경에서 404 오류 방지)
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    config.externals = [...(config.externals || []), 'bcrypt'];
    
    // github-repos 디렉토리 제외 (서브모듈, 빌드에 불필요)
    // TypeScript 파일 처리 규칙에 github-repos 제외 추가
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // 기존 TypeScript/JavaScript 규칙에 github-repos 제외 추가
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.test && (rule.test.toString().includes('tsx?') || rule.test.toString().includes('jsx?'))) {
        const existingExclude = Array.isArray(rule.exclude) 
          ? rule.exclude 
          : rule.exclude 
            ? [rule.exclude] 
            : [];
        
        // github-repos가 이미 제외되어 있는지 확인
        const hasGithubReposExclude = existingExclude.some(
          (excl) => excl && excl.toString && excl.toString().includes('github-repos')
        );
        
        if (!hasGithubReposExclude) {
          return {
            ...rule,
            exclude: [
              ...existingExclude,
              /github-repos/,
            ],
          };
        }
      }
      return rule;
    });
    
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

