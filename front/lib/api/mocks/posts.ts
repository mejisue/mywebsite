import { PostSummary, PostPage } from '../posts';

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

export const MOCK_POSTS: PostSummary[] = [
    { id: 1,  title: 'Next.js 15 App Router 완전 정복', tags: ['Next.js', 'React'], thumbnail: null, createdAt: daysAgo(1) },
    { id: 2,  title: 'TypeScript 유틸리티 타입 총정리', tags: ['TypeScript'], thumbnail: null, createdAt: daysAgo(3) },
    { id: 3,  title: 'Tailwind CSS로 다크모드 구현하기', tags: ['CSS', 'Tailwind'], thumbnail: null, createdAt: daysAgo(5) },
    { id: 4,  title: 'React Query와 서버 상태 관리', tags: ['React', 'React Query'], thumbnail: null, createdAt: daysAgo(7) },
    { id: 5,  title: 'Spring Boot + JPA 페이지네이션', tags: ['Spring', 'JPA'], thumbnail: null, createdAt: daysAgo(10) },
    { id: 6,  title: 'GSAP ScrollTrigger 애니메이션 가이드', tags: ['GSAP', 'Animation'], thumbnail: null, createdAt: daysAgo(12) },
    { id: 7,  title: 'AWS S3와 CloudFront로 이미지 서빙', tags: ['AWS', 'S3'], thumbnail: null, createdAt: daysAgo(14) },
    { id: 8,  title: 'Intersection Observer API 활용법', tags: ['JavaScript', 'Web API'], thumbnail: null, createdAt: daysAgo(16) },
    { id: 9,  title: 'CSS Grid와 Flexbox 언제 쓸까?', tags: ['CSS'], thumbnail: null, createdAt: daysAgo(18) },
    { id: 10, title: 'Git 브랜치 전략 - GitFlow vs Trunk', tags: ['Git'], thumbnail: null, createdAt: daysAgo(20) },
    { id: 11, title: 'React Server Components 이해하기', tags: ['React', 'Next.js'], thumbnail: null, createdAt: daysAgo(22) },
    { id: 12, title: '클린 코드 작성 원칙 5가지', tags: ['CleanCode'], thumbnail: null, createdAt: daysAgo(24) },
    { id: 13, title: 'MySQL 인덱스 설계와 쿼리 최적화', tags: ['MySQL', 'Database'], thumbnail: null, createdAt: daysAgo(26) },
    { id: 14, title: 'Zustand로 전역 상태 관리하기', tags: ['React', 'Zustand'], thumbnail: null, createdAt: daysAgo(28) },
    { id: 15, title: 'Docker로 Spring Boot 배포하기', tags: ['Docker', 'Spring'], thumbnail: null, createdAt: daysAgo(30) },
    { id: 16, title: 'Next.js Image 컴포넌트 최적화', tags: ['Next.js', 'Performance'], thumbnail: null, createdAt: daysAgo(32) },
    { id: 17, title: 'HTTP 캐싱 전략 완벽 이해', tags: ['HTTP', 'Web'], thumbnail: null, createdAt: daysAgo(34) },
    { id: 18, title: 'ESLint + Prettier 팀 세팅 가이드', tags: ['DevTools'], thumbnail: null, createdAt: daysAgo(36) },
    { id: 19, title: 'JWT 인증 구조와 보안 주의사항', tags: ['Security', 'JWT'], thumbnail: null, createdAt: daysAgo(38) },
    { id: 20, title: 'Vitest로 유닛 테스트 시작하기', tags: ['Testing', 'Vitest'], thumbnail: null, createdAt: daysAgo(40) },
    { id: 21, title: 'React 렌더링 최적화 - memo, useMemo, useCallback', tags: ['React', 'Performance'], thumbnail: null, createdAt: daysAgo(42) },
    { id: 22, title: 'REST API 설계 원칙과 Best Practice', tags: ['API', 'REST'], thumbnail: null, createdAt: daysAgo(44) },
    { id: 23, title: 'Nginx로 Next.js 프로덕션 배포', tags: ['Nginx', 'DevOps'], thumbnail: null, createdAt: daysAgo(46) },
    { id: 24, title: 'useReducer로 복잡한 폼 상태 관리', tags: ['React', 'Hooks'], thumbnail: null, createdAt: daysAgo(48) },
    { id: 25, title: '웹 접근성(a11y) 기초와 실천 방법', tags: ['Accessibility', 'Web'], thumbnail: null, createdAt: daysAgo(50) },
];

export function getMockPostsPage(page: number, size: number): PostPage {
    const start = page * size;
    const end = start + size;
    const content = MOCK_POSTS.slice(start, end);
    return {
        content,
        page,
        size,
        hasNext: end < MOCK_POSTS.length,
    };
}
