'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
import { PostSummary } from '@/lib/api/posts';
import { useIsMobile } from '@/hooks/use-mobile';
import ProjectModal, { ProjectItem } from './ProjectModal';
import SelfIntroModal from './SelfIntroModal';

type Phase = 'door' | 'room';
const INTRO_FLOOR_TOP = '59%';
const INTRO_DOOR_BOTTOM = '41%';

/* ─────────────────────────────────────────────
   Room data — edit these to match your projects
   ──────────────────────────────────────────── */

const PROJECT_ITEMS: (ProjectItem & {
  desc: string;
  pos: React.CSSProperties;
  size: string;
  mobilePos: React.CSSProperties;
  mobileSize: string;
  image?: string;
})[] = [
    {
      id: 'home',
      emoji: '🏠',
      image: '/home.png',
      label: 'My Website',
      desc: 'Next.js + Spring Boot\n풀스택 포트폴리오',
      pos: { position: 'absolute', bottom: '30%', left: '28%' },
      size: '7rem',
      mobilePos: { position: 'absolute', bottom: '30%', left: '22%' },
      mobileSize: '5rem',
      detail: {
        description: 'Next.js와 Spring Boot로 구현한 풀스택 포트폴리오 사이트. GSAP 애니메이션 기반 인트로와 블로그 기능 포함.',
        techStack: ['Next.js', 'TypeScript', 'Spring Boot', 'MySQL', 'Docker', 'AWS EC2'],
        features: [
          'GSAP 기반 인트로 애니메이션',
          '블로그 게시글 CRUD',
          'Docker Compose 배포',
          '반응형 UI',
        ],
        links: {
          site: 'https://mejisue.site',
          github: 'https://github.com/mejisue/mejisue-website',
        },
      },
    },
    {
      id: 'project2',
      emoji: '💬',
      label: 'Sleact',
      image: '/sleact.png',
      desc: '실시간 협업 채팅 서비스',
      pos: { position: 'absolute', bottom: '40%', right: '32%' },
      size: '6rem',
      mobilePos: { position: 'absolute', bottom: '40%', right: '28%' },
      mobileSize: '5rem',
      detail: {
        description: 'Slack을 모티브로 한 실시간 팀 협업 서비스입니다.\n단순 채팅 구현을 넘어 Redis Pub/Sub 기반 분산 메시징 구조, STOMP JWT 이중 검증, 스크롤 복원 및 멘션 UX까지 직접 설계하며 실시간 서비스의 구조와 사용자 경험을 함께 고민했습니다.',
        demoGif: '/chat.webm',
        motivation: '단순 CRUD 중심 프로젝트를 넘어, 실시간으로 여러 사용자가 동시에 상호작용하는 환경을 직접 구현해보고 싶었습니다. 채팅 서비스는 연결 상태 관리, 메시지 동기화, 다중 사용자 이벤트 처리, 실시간 인증 등 프론트엔드와 백엔드의 경계가 강하게 만나는 영역이라 판단했습니다.',
        techStack: ['React 19', 'TypeScript', 'STOMP / SockJS', 'TanStack Query', 'Spring Boot', 'MySQL', 'Redis', 'Docker', 'GitHub Actions', 'AWS EC2', 'Vercel'],
        designPoints: [
          {
            title: 'Redis Pub/Sub 기반 실시간 아키텍처',
            problem: '인메모리 메시지 브로커는 단일 인스턴스에서만 동작 — 서버 수평 확장 시 메시지 유실 위험',
            solution: 'Redis Pub/Sub으로 메시지 브로드캐스트 구조 설계. 현재 단일 서버이지만 확장성을 미리 고려해 도입. PatternTopic으로 채널·DM 동적 구독 처리.',
            result: 'k6 부하 테스트 50 VU — avg 12.52ms / p95 20ms / 메시지 유실 0건',
          },
          {
            title: 'STOMP JWT 이중 검증',
            problem: 'HTTP Upgrade 시점에만 JWT를 검증하면 연결 이후 토큰 만료·위변조 감지 불가',
            solution: 'HTTP 핸드셰이크(CustomHandshakeInterceptor) + STOMP CONNECT 프레임(StompHandler) 2단계 방어선 설계. 세션 속성에 email·workspace를 저장해 매 메시지 DB 조회 제거.',
          },
          {
            title: '프론트 실시간 구조화',
            problem: '컴포넌트가 STOMP 클라이언트를 직접 관리하면 연결 중복·상태 불일치 문제 발생',
            solution: 'StompProvider(Context) + useChannelChat / useDm 커스텀 훅으로 레이어 분리. 컴포넌트는 메시지 데이터만 소비하도록 추상화.',
            result: '컴포넌트 내 STOMP 로직 노출 0',
          },
          {
            title: '채팅 UX 디테일',
            solution: '무한 스크롤 시 scrollHeight 차이 보정으로 스크롤 위치 복원. @멘션 드롭다운은 라이브러리 없이 selectionStart 네이티브 API로 구현. 한글 IME Enter 오발동 방지(isComposing 체크).',
            video: '/mention.webm',
          },
        ],
        features: [
          '실시간 채팅 / DM (STOMP + WebSocket)',
          '워크스페이스·채널 구조, 멤버 초대',
          '온라인 Presence 상태 (Redis Set + 이벤트 브로드캐스트)',
          '@멘션 드롭다운 + 키보드 내비게이션',
          '채팅 무한 스크롤 + 스크롤 위치 복원',
          'JWT 기반 인증 (이중 검증)',
        ],
        troubleshooting: [
          {
            title: '무한 스크롤 시 스크롤 튐 현상',
            problem: '과거 메시지 로드 시 DOM에 콘텐츠가 추가되며 scrollHeight 증가 → 사용자 뷰포트가 위로 튀는 현상',
            solution: '메시지 배치 전후 scrollHeight 차이를 측정해 scrollTop에 더해 위치 보정. useLayoutEffect로 페인트 전 즉시 복원해 깜빡임 없이 처리.',
            video: '/scroll-restore.webm',
          },
          {
            title: 'SessionConnectEvent vs SessionConnectedEvent',
            problem: 'Presence 시스템이 동작하지 않음 — Redis에 온라인 상태가 저장되지 않는 버그',
            solution: 'SessionConnectedEvent의 getSessionAttributes()가 항상 null을 반환함을 발견. SessionConnectEvent로 교체해 해결. 두 이벤트의 발생 시점(인바운드 vs 아웃바운드) 차이가 원인.',
          },
          {
            title: 'STOMP 재연결 시 Presence 오염',
            problem: '재연결 후 이전 stompPresence 델타가 남아 오프라인 멤버가 온라인으로 표시',
            solution: 'isConnected: true → false → true 전환 감지 시 stompPresence Map 초기화 + REST refetch 트리거. REST 초기값 + STOMP 델타 합산 구조로 타이밍 레이스 컨디션도 방지.',
          },
        ],
        links: {
          site: 'https://sleact.mejisue.site',
          github: 'https://github.com/mejisue/sleact',
        },
      },
    },
    {
      id: 'project3',
      emoji: '🧵',
      label: 'Retweet',
      desc: '스레드형 SNS 풀스택 구현',
      image: '/retweet.png',
      pos: { position: 'absolute', top: '15%', left: '40%' },
      size: '6rem',
      mobilePos: { position: 'absolute', top: '23%', left: '42%' },
      mobileSize: '5rem',
      detail: {
        description: '팔로우·좋아요·중첩 댓글이 있는 스레드형 소셜 피드 서비스.\nSNS 특유의 빠른 인터랙션 피드백(낙관적 업데이트)과 E2E 인증(Redis 토큰 스토어 + 인터셉터 큐잉)을 풀스택으로 직접 설계했습니다.',
        motivation: '좋아요·댓글처럼 빠른 피드백이 필요한 인터랙션에서 낙관적 업데이트와 캐시 무효화를 어떻게 조화시킬지, OAuth 이후 JWT 환경에서 토큰 만료를 사용자에게 투명하게 처리할지를 풀고 싶었습니다. FE/BE 경계에서 만나는 구조적 문제를 직접 설계하는 게 목표였습니다.',
        techStack: ['Next.js', 'TypeScript', 'Spring Boot', 'MySQL', 'Redis', 'Spring Security'],
        demoGif: '/retweet-demo.webm',
        designPoints: [
          {
            title: 'E2E 인증 — Redis 토큰 스토어 + FE 인터셉터 큐잉',
            problem: '동시 401 발생 시 Refresh 요청이 중복으로 발사되는 문제',
            solution: 'Axios 인터셉터에서 Promise 큐잉으로 재시도 요청을 대기시키고, 백엔드는 Redis RTR(Refresh Token Rotation)로 단 1회만 발급.',
            result: 'Refresh 단 1회, 세션 끊김 없음',
            video: '/retweet-oauth.webm',
          },
          {
            title: '낙관적 업데이트 + 정규화 캐시',
            problem: '서버 응답 대기 시간 동안 UI가 지연되어 피드백이 늦게 느껴지는 문제',
            solution: 'TanStack Query onMutate에서 선 업데이트, onError에서 자동 rollback. 쿼리키 정규화로 관련 캐시 일괄 무효화.',
            result: '0ms 피드백, 실패 시 자동 롤백',
          },
          {
            title: '2-depth 댓글 도메인 모델링',
            problem: '무한 depth 재귀 구조는 JOIN 복잡도가 높고 N+1 발생 가능성이 큼',
            solution: 'rootComment + parentComment FK 2개로 flat 저장 → 클라이언트에서 트리로 조립. JOIN 1회로 해결.',
            result: 'JOIN 1회, N+1 없음',
            video: '/retweet-comment.webm',
          },
          {
            title: '성능 — 번들·CLS·가상화',
            solution: 'next/image로 CLS 제거, dynamic import 코드스플릿으로 초기 번들 감소, react-virtual로 피드 DOM 고정.',
            image: '/retweet-main.png',
          },
          {
            title: 'Tailwind v4 + shadcn 토큰 기반 스타일 시스템',
            problem: '다크모드 전환 시 컴포넌트마다 dark: 클래스를 개별 관리해야 하는 문제',
            solution: 'CSS 변수 토큰으로 의미 단위 추상화, .dark {}에서 토큰 값만 교체. OKLCH 색공간, tailwind-merge cn() 조합.',
            result: '다크모드 전환 코드 0줄 추가',
            image: '/retweet-dark.png',
          },
          {
            title: '레이어 단위 테스트 전략',
            solution: 'vi.hoisted API mock, beforeEach 스토어 초기화, MemoryRouter 페이지 통합 테스트, 에러/로딩/정상 3-way 커버리지.',
            result: '15 test files · 79 tests · 전체 통과',
            image: '/retweet-vitest.png',
          },
        ],
        features: [
          '게시글 CRUD',
          '(중첩)댓글 기능',
          '댓글 좋아요 기능',
          '무한 스크롤',
          '이미지 업로드',
          '프로필 수정 기능',
          '다크모드 기능',
          'OAuth2 로그인 기능',
        ],
        troubleshooting: [
          {
            title: '댓글 삭제 FK 제약 위반',
            problem: '부모 댓글 삭제 시 자식 댓글의 FK 제약으로 삭제 실패',
            solution: '트랜잭션 내 자식 댓글 먼저 삭제 후 부모 삭제 순서로 처리',
          },
          {
            title: 'OAuth Profile NPE',
            problem: 'picture 필드가 null인 OAuth 계정 로그인 시 NPE 발생',
            solution: 'OAuth2UserInfo 추상화 클래스에 getProfileImage() fallback 추가',
          },
          {
            title: '삭제된 게시글 URL 접근 무한 로딩',
            problem: '삭제된 게시글 URL 직접 접근 시 로딩 스피너가 무한 표시',
            solution: '서버에서 404 응답 시 notFound() 호출, ErrorBoundary로 사용자 안내 처리',
          },
        ],
        links: {
          site: 'https://retweet.mejisue.site',
          github: 'https://github.com/mejisue/retweet',
        },
      },
    },
    {
      id: 'project4',
      emoji: '🖼️',
      label: 'Design System',
      desc: 'UI 컴포넌트 라이브러리',
      pos: { position: 'absolute', top: '15%', right: '10%' },
      size: '4rem',
      mobilePos: { position: 'absolute', top: '23%', right: '8%' },
      mobileSize: '3rem',
      detail: {
        description: 'Tailwind v4 디자인 토큰 + CVA variant 시스템 기반 컴포넌트 라이브러리.\n실제 포트폴리오 프로젝트(retweet, myWebsite)의 반복 패턴을 추출해 구현했습니다.',
        techStack: ['Vite', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'CVA', 'Storybook 10', 'Vercel'],
        designPoints: [
          {
            title: 'Tailwind v4 디자인 토큰',
            problem: '컴포넌트마다 색상·radius 값을 하드코딩하면 디자인 변경 시 전체 수정 필요',
            solution: '@theme {} 블록에서 토큰 정의 → Tailwind가 유틸리티 클래스 자동 생성. 다크모드는 .dark {}에서 토큰 값만 교체 — 컴포넌트 코드 변경 없음.',
            result: '--color-primary 하나만 바꾸면 모든 컴포넌트에 즉시 반영',
          },
          {
            title: 'CVA로 variant 선언',
            problem: 'if문 기반 className 조합은 variant가 늘어날수록 관리 복잡도 증가',
            solution: 'CVA variant 테이블로 선언형 관리. VariantProps<typeof button>으로 TypeScript 타입 자동 추론 — 존재하지 않는 variant 컴파일 에러로 차단.',
          },
          {
            title: '컴포넌트 추출 기준',
            problem: '무분별한 추상화는 오히려 유지보수 부담',
            solution: '실제 프로젝트 코드에서 3회 이상 반복된 패턴만 추출.',
          },
        ],
        features: [
          'Button — 6 variants · loading · asChild(Radix Slot)',
          'Input / InputField — size · error · icon 슬롯 · label 자동 연결(useId)',
          'Textarea / TextareaField — CSS field-sizing auto-resize',
          'Avatar — 이미지 로드 실패 시 이니셜 fallback',
          'Skeleton — block / circle · className으로 크기 지정',
        ],
        links: {
          storybook: 'https://design-system-rouge-five.vercel.app',
          github: 'https://github.com/mejisue/design-system',
        },
      },
    },
  ];

const NAV_ITEMS = [
  {
    id: 'github',
    emoji: '🐙',
    label: 'GitHub',
    desc: '소스코드 보러가기',
    href: 'https://github.com/mejisue',
    external: true,
    pos: { position: 'absolute', top: '26%', left: '14%' } as React.CSSProperties,
    size: '3.5rem',
    mobilePos: { position: 'absolute', top: '30%', left: '10%' } as React.CSSProperties,
    mobileSize: '2.2rem',
  },
  {
    id: 'blog',
    emoji: '📒',
    label: 'Blog',
    desc: '공부 기록 보러가기',
    image: '/blog.png',
    href: '/post',
    external: false,
    pos: { position: 'absolute', bottom: '25%', right: '22%' } as React.CSSProperties,
    size: '6rem',
    mobilePos: { position: 'absolute', bottom: '28%', right: '13%' } as React.CSSProperties,
    mobileSize: '3.5rem',
  },
];

// Decorative items (no interaction)
const DECO_ITEMS = [
  { id: 'plant', emoji: '🪴', size: '3.8rem', pos: { position: 'absolute', bottom: '42%', left: '4%' } as React.CSSProperties, mobileSize: '2.3rem', mobilePos: { position: 'absolute', bottom: '42%', left: '2%' } as React.CSSProperties },
  { id: 'sofa', emoji: '🛋️', size: '7rem', pos: { position: 'absolute', bottom: '41%', right: '3%' } as React.CSSProperties, mobileSize: '4.2rem', mobilePos: { position: 'absolute', bottom: '41%', right: '1%' } as React.CSSProperties },
];

/* ──────────────── SVG Components ──────────────── */

function CatBubble() {
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', transformOrigin: 'bottom center' }}
    >
      {/* Rounded chat bubble */}
      <div
        className="relative px-4 py-2.5 text-center"
        style={{
          background: '#fffef7',
          border: '2.2px solid #2D2D2D',
          borderRadius: '999px',
          boxShadow: '2px 2px 0px #2D2D2D',
          whiteSpace: 'nowrap',
        }}
      >
        <p className="font-bold text-[#2D2D2D] leading-snug" style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', letterSpacing: '0.01em' }}>
          이모티콘에 커서를 올려보세요! <br /> 저를 누르시면 자기소개가 나와요.
        </p>
      </div>
      {/* Tail */}
      <svg width="18" height="12" viewBox="0 0 18 12" fill="none" style={{ marginTop: '-1px' }}>
        <path d="M 2,0 Q 9,12 16,0" fill="#fffef7" stroke="#2D2D2D" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function CatSVG() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/ghost-cat.svg"
      alt="ghost cat character"
      className="w-28 h-28 md:w-40 md:h-40 lg:w-52 lg:h-52"
    />
  );
}

function DoorSVG({ open = false, onOpen }: { open?: boolean; onOpen?: () => void }) {
  return (
    <div
      className="relative w-36 md:w-44 lg:w-52"
      style={{ aspectRatio: '129/178', perspective: '900px' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: '10.8%',
          right: '6%',
          bottom: '-2px',
          height: '7px',
          background: '#050505',
          borderRadius: '999px',
          zIndex: 6,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          right: '8.6%',
          bottom: '-2px',
          width: '5px',
          height: '18px',
          background: '#050505',
          borderRadius: '999px',
          zIndex: 7,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute overflow-hidden"
        style={{
          left: '13%',
          right: '9.5%',
          top: '2%',
          bottom: '1%',
          background: '#2D2723',
          border: '2px solid #050505',
          borderRadius: '2px',
          zIndex: 5,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #443B35 0%, #312B27 56%, #1E1A18 100%)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: '32%',
            background: '#5E524A',
            borderTop: '2px solid #050505',
          }}
        />
        <div
          className="absolute"
          style={{
            left: '18%',
            top: '18%',
            width: '27%',
            height: '14%',
            background: '#FFF2B8',
            border: '2px solid #050505',
            borderRadius: '3px',
            boxShadow: '0 0 18px rgba(255, 221, 127, 0.35)',
          }}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          right: '9.5%',
          top: '2%',
          bottom: '1%',
          width: '3px',
          background: '#050505',
          borderRadius: '999px',
          zIndex: 15,
        }}
      />
      {/* 문틀 — 고정 */}
      <svg
        viewBox="0 10 129 178"
        className="absolute inset-0 z-10 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <style>{`.fr0{fill:#FFFAF0}`}</style>
        <path className="fr0" d="m129.3 34.2v-34.2h-128.4v185l4.4 1h8.7l0.6-173.2 1.7-0.3h98.3l0.6 0.5 0.3 2.2 0.4 171 6.9 1.3 6.5-0.2v-151c-0.6-0.6-0.6-4 0-4.9v2.8z" />
      </svg>

      {/* 문짝 — rotateY로 회전 (경첩 x=14.4 → 11.16%) */}
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 z-20 h-full w-full focus:outline-none"
        style={{
          transformOrigin: '11.16% center',
          transform: open ? 'rotateY(-74deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          transition: 'transform 950ms cubic-bezier(0.2, 0.9, 0.2, 1)',
          cursor: open ? 'default' : 'pointer',
        }}
        aria-label="Enter"
        disabled={open}
      >
        <svg
          viewBox="0 10 129 178"
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            .d1{fill:#A18977}
            .d4{fill:none;stroke:#050505;stroke-width:2.6;stroke-linejoin:round;stroke-miterlimit:10}
            .d5{fill:none;stroke:#877667;stroke-width:2.1;stroke-linejoin:round;stroke-miterlimit:10}
            .d6{fill:#B3B3B3;stroke:#050505;stroke-width:2.6;stroke-linejoin:round;stroke-miterlimit:10}
            .d7{fill:#CBCBCB;stroke:#050505;stroke-width:2.1;stroke-linejoin:round;stroke-miterlimit:10}
            .d8{fill:#B3B3B3;stroke:#050505;stroke-width:2.6;stroke-miterlimit:10}
            .d9{fill:#CBCBCB;stroke:#050505;stroke-width:2.1;stroke-miterlimit:10}
          `}</style>
          <path className="d1" d="m14.4 12.5v173.7h101.1v-173.2l-10.1-0.8-13.5 0.6-13.2-0.3-24.7 0.3-5.1 0.4-14.7-0.2h-8.5l-5.5-0.5z" />
          <path className="d4" d="m14.4 12.5h5.1l6.2 0.5 5-0.1 4.9 0.3 4.8-0.2 8.6 0.2 4.4-0.6 4.6-0.1 5.8-0.1 3.4 0.1h10.6l2.1-0.1 5.8 0.3 6.5 0.3h0.5l4.7-0.7 2.1-0.2h6.4 0.7 1.1l2.2 0.4 1.5-0.1 1-0.1 2.5 0.3 0.3 0.2h0.2l-0.2 0.5v5.8l0.4 2.4v9.4l-0.2 1.8 0.1 1.5-0.1 2.1 0.1 1.4-0.1 6.2-0.1 3.7 0.2 11.3-0.1 23.2v14.8l0.3 2.1-0.2 14.1-0.3 4.3v68.4" />
          <path className="d4" d="m14.4 12.5 0.2 1.1v3.4l-0.2 2.3 0.3 1.4-0.2 3 0.1 6.3 0.4 155.6" />
          <path className="d4" d="m15 185.8h100.2" />
          <path className="d5" d="m25.6 24.2 4-0.1 3.8 0.4h4.3l3.7 0.2 4.6-0.2 7.1 0.3 3.3-0.5 6.3-0.2 7.6 0.2 6.8-0.2 8.7 0.5 5.4-0.5 4.1-0.2 7.2 0.2 0.5 0.1h0.6l0.5 0.1 0.3 0.1 0.4 0.1-0.6 0.1-0.2 0.1h0.5l-0.9-0.2 0.3 0.2 0.3-0.2 0.3-0.1-0.9 0.2 0.3 0.1 0.3-0.2h0.6l-1.2 0.2 1.2-0.1-0.3 0.1 0.3 0.1-0.3-0.1-0.3-0.2h0.3l0.3 0.1-0.3 0.1-0.3-0.2 0.3 0.2 0.3-0.1-0.3 0.1 0.3 0.1-0.3-0.1 0.2 0.1 0.1-0.2" />
          <path className="d5" d="m25.6 24.1-0.4 0.4h0.4l-0.4 0.3 0.4-0.2-0.4 0.2 0.4-0.1-0.4 0.1 0.4 0.1-0.4 0.1 0.4-0.1-0.4 0.1 0.4-0.1-0.4 0.1 0.4 0.1-0.4 0.1 0.4-0.1-0.4 0.1 0.4 0.1-0.4 0.2 0.4-0.2-0.4 0.2 0.4-0.1-0.4 0.1 0.4 0.1-0.4 0.1 0.4-0.1-0.4 3.1 0.2 2.2-0.1 4.4-0.3 9.4v3.3l0.2 3.7-0.2 3.3 0.2 2.5-0.2 6.2-0.3 3.8v15.1l0.4 8.3-0.4 7.9v13.8l0.5 8.9 0.4 14.7-0.4 13.1-0.4 19.8 0.5 6.9 4.3-0.2 5.7 0.8 13.6-0.5 3.1 0.2 2.5-0.4 7.2-0.1 3.6 0.5 12.8-0.5 2.5 0.1 2.9-0.4 8 0.5 5.2 0.1 0.9-0.1-0.5-0.1h1.5l3.3 0.4h1.4l-0.3 0.1 0.9-0.1h-1.1l0.2 0.1 0.9-0.1-0.3 0.1 0.6-0.1-0.6 0.1 0.9-0.1-0.3 0.1 0.6-0.1-0.3 0.1 0.3-0.1-0.3 0.1 0.3-0.1-0.3 0.1 0.3-0.1-0.3 0.1 0.3-0.1-0.3 0.1 0.3-0.1-0.3 0.1 0.3-0.2-0.3 0.2 0.3-0.2-0.3 0.2 0.3-0.2-0.3 0.2 0.3-0.2-0.3-0.1 0.3 0.1-0.3-0.1 0.3-0.1-0.3 0.1 0.3-0.1-0.3 0.1 0.3-0.1-0.3-0.1 0.3 0.1-0.6-0.2 0.6 0.2-0.3-0.1 0.3-0.2-0.3 0.2 0.3-0.2-0.3-0.1 0.3 0.1-0.3-0.1 0.3-0.1-0.3 0.1 0.3-0.1 0.3-2.1v-8.9l0.2-2.8-0.3-20.3v-1.5l0.1-0.5v-12.3l-0.9-13 0.5-5.1-0.2-9.7-0.3-1.2v-30.5l0.2-2-0.2-8.7 0.3-11 0.2-7.3-0.2-11.5" />
          <path className="d6" d="m11 28.4-1.1 0.6-0.6 0.9 1.3-0.1-1.3 0.6v16.1l1 0.9 1.7 0.4 3.1-0.5 1.4-1.3v-15.8l-0.9-1.6-1.9-0.4z" />
          <path className="d6" d="m11 145.6-0.5 1.2v15.7l2 1.5 3.1-0.5 0.9-1.1 0.2-14.8-0.5-2-0.9-0.9h-2.6z" />
          <path className="d7" d="m52.4 40.3-0.6 0.1-0.4 0.7 0.2 0.5-0.1 4.4 0.6 0.7h14.6l7-0.3 0.6-0.5 0.3-2.4-0.3-3.1-0.7-0.4h-9.7z" />
          <path className="d9" d="m61.4 60.3-0.7 2.3 0.7 1.6 1.9 0.5 1.2-0.4 0.8-1 0.1-1.5-0.6-1.3-1.5-0.5z" />
          <path className="d8" d="m83.6 101.5v27.4l0.3 4.3h15.1l0.2-32.4-11.6-0.2z" />
          <path className="d6" d="m88 124.5 1.1 2.5 2 1 2.4 0.1 2.3-1.5 11.4 0.5v-4.5l-11.2-0.4-3.3-0.8-2.6 0.7z" />
          <path className="d9" d="m95.7 122.7-2-1.1-2.3 0.4-1.3 1.2-0.7 1.4 0.5 1.9 1.4 1.4 1.8 0.4 1.8-0.4 1.2-1.3 0.5-2z" />
          <path className="d9" d="m95.9 122.6h11l0.3 4.4-11.6-0.2z" />
        </svg>
      </button>
    </div>
  );
}



function SpeechBubble({ label, desc }: { label: string; desc?: string }) {
  return (
    <div
      className="animate-bubble-in pointer-events-none absolute z-30 flex flex-col items-center"
      style={{ bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' }}
    >
      <div className="rounded-2xl border-2 border-[#2D2D2D] bg-white px-3 py-2 text-center whitespace-nowrap shadow-md">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">{label}</p>
        {desc && (
          <p className="mt-0.5 text-[10px] leading-tight whitespace-pre-line text-neutral-500" style={{ wordBreak: 'keep-all' }}>{desc}</p>
        )}
      </div>
      {/* Tail */}
      <div
        style={{
          width: 0, height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '9px solid #2D2D2D',
        }}
      />
    </div>
  );
}

/* ─────────────────── Main Component ─────────────────── */
export default function HomePage({ posts }: { posts: PostSummary[] }) {
  // null = SSR / hydration 구간 — useEffect에서 sessionStorage 읽어 확정
  const [phase, setPhase] = useState<Phase | null>(null);
  const [doorOpen, setDoorOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<typeof PROJECT_ITEMS[number] | null>(null);
  const [selfIntroOpen, setSelfIntroOpen] = useState(false);

  const isMobile = useIsMobile();
  const doorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // sessionStorage는 클라이언트에서만 읽을 수 있으므로 useEffect에서 초기화
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase(sessionStorage.getItem('hasSeenIntro') ? 'room' : 'door');
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (doorTimer.current) clearTimeout(doorTimer.current);
    };
  }, []);

  // Room entrance + cat float animation
  useEffect(() => {
    if (phase !== 'room' || !roomRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.room-el',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out', delay: 0.1 },
      );
      gsap.to('.cat-char', {
        y: -10, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.2,
      });
    }, roomRef);
    return () => ctx.revert();
  }, [phase]);

  const enterRoom = () => {
    sessionStorage.setItem('hasSeenIntro', '1');
    setPhase('room');
  };

  const handleDoorClick = () => {
    if (phase !== 'door') return;
    setDoorOpen(true);
    doorTimer.current = setTimeout(enterRoom, 1050);
  };

  const navigate = (href: string, external: boolean) => {
    if (external) window.open(href, '_blank', 'noopener noreferrer');
    else router.push(href);
  };

  // sessionStorage 확인 전에는 아무것도 렌더하지 않음 (hydration mismatch 방지)
  if (phase === null) return <div className="min-h-screen" style={{ background: '#fffaf0', minWidth: '480px' }} />;

  /* ══════════════ DOOR SCENE ══════════════ */
  if (phase === 'door') {
    return (
      <div
        className="relative flex min-h-screen select-none flex-col overflow-hidden"
        style={{ background: '#fffaf0', minWidth: '480px' }}
      >
        {/* Floor */}
        <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: INTRO_FLOOR_TOP, background: '#A5A9AF' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro_bottom_pc.svg" alt="" aria-hidden="true" className="h-full w-full" style={{ objectFit: 'cover', objectPosition: 'top center' }} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{
              height: '3px',
              background: '#050505',
              borderRadius: '999px',
              boxShadow: '0 1px 0 #050505',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0"
            style={{
              width: '3px',
              height: '18px',
              background: '#050505',
              borderRadius: '999px',
            }}
          />
        </div>

        {/* Door area */}
        <div className="absolute inset-x-0 flex flex-col items-center justify-end" style={{ top: '8%', bottom: INTRO_DOOR_BOTTOM }}>
          {/* Door */}
          <div className="flex translate-y-px items-end gap-4 md:gap-6">
            <DoorSVG open={doorOpen} onOpen={handleDoorClick} />


            <div className="flex flex-col items-start gap-2">


            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════ ROOM SCENE ══════════════ */
  return (
    <div
      ref={roomRef}
      className="relative min-h-screen overflow-hidden select-none"
      style={{ background: '#fffaf0', minWidth: '480px' }}
    >
      {/* Floor */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: '58%',
          background: '#9AB8C6',
          backgroundImage:
            'repeating-linear-gradient(90deg,rgba(255,255,255,0.12) 0,rgba(255,255,255,0.12) 1px,transparent 1px,transparent 80px),' +
            'repeating-linear-gradient(0deg,rgba(255,255,255,0.12) 0,rgba(255,255,255,0.12) 1px,transparent 1px,transparent 80px)',
        }}
      />
      {/* Ground line */}
      <div className="absolute inset-x-0" style={{ top: '58%', height: '2.5px', background: '#2D2D2D' }} />

      {/* ── Nav ── */}
      <nav
        className="room-el absolute inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-4 md:px-10"
        style={{ opacity: 0 }}
      >
        <span
          className="font-bold tracking-widest uppercase text-[#2D2D2D]"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 2.5vw, 1.3rem)' }}
        >
          Jisue Portfolio
        </span>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/mejisue"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white/70 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-white transition-colors backdrop-blur-sm"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
          <a
            href="/cv.pdf"
            download
            className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white/70 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-white transition-colors backdrop-blur-sm"
          >
            CV ↓
          </a>
        </div>
      </nav>

      {/* ── Cat ── */}
      <div
        className="room-el cat-char absolute cursor-pointer"
        style={{ bottom: '42%', left: '50%', transform: 'translateX(-50%)', opacity: 0 }}
        onClick={() => setSelfIntroOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setSelfIntroOpen(true)}
      >
        <CatBubble />
        <CatSVG />
      </div>

      {/* ── Project items (open modal) ── */}
      {PROJECT_ITEMS.map((item) => (
        <div
          key={item.id}
          className="room-el absolute cursor-pointer"
          style={{ ...(isMobile ? item.mobilePos : item.pos), opacity: 0 }}
          onMouseEnter={() => setHovered(item.id)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => setSelectedProject(item)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setSelectedProject(item)}
        >
          <div className="relative flex flex-col items-center">
            {hovered === item.id && <SpeechBubble label={item.label} desc={item.desc} />}
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.label}
                style={{ width: isMobile ? item.mobileSize : item.size, height: isMobile ? item.mobileSize : item.size }}
                className="block object-contain transition-transform duration-150 hover:scale-110"
              />
            ) : (
              <span
                style={{ fontSize: isMobile ? item.mobileSize : item.size }}
                className="block leading-none transition-transform duration-150 hover:scale-110"
              >
                {item.emoji}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* ── Nav items (navigate) ── */}
      {NAV_ITEMS.map((item) => (
        <div
          key={item.id}
          className="room-el absolute cursor-pointer"
          style={{ ...(isMobile ? item.mobilePos : item.pos), opacity: 0 }}
          onMouseEnter={() => setHovered(item.id)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate(item.href, item.external)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(item.href, item.external)}
        >
          <div className="relative flex flex-col items-center">
            {hovered === item.id && <SpeechBubble label={item.label} desc={item.desc} />}
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.label}
                style={{ width: isMobile ? item.mobileSize : item.size, height: isMobile ? item.mobileSize : item.size }}
                className="block object-contain transition-transform duration-150 hover:scale-110"
              />
            ) : (
              <span
                style={{ fontSize: isMobile ? item.mobileSize : item.size }}
                className="block leading-none transition-transform duration-150 hover:scale-110"
              >
                {item.emoji}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* ── Project Modal ── */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* ── Self Intro Modal ── */}
      <SelfIntroModal
        open={selfIntroOpen}
        onClose={() => setSelfIntroOpen(false)}
      />

      {/* ── Decorative items ── */}
      {DECO_ITEMS.map((item) => (
        <div
          key={item.id}
          className="room-el absolute"
          style={{ ...(isMobile ? item.mobilePos : item.pos), opacity: 0 }}
        >
          <span style={{ fontSize: isMobile ? item.mobileSize : item.size }} className="block leading-none">
            {item.emoji}
          </span>
        </div>
      ))}
    </div>
  );
}
