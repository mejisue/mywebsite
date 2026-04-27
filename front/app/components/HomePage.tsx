'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
import { PostSummary } from '@/lib/api/posts';
import { useIsMobile } from '@/hooks/use-mobile';

type Phase = 'door' | 'loading' | 'room';

/* ─────────────────────────────────────────────
   Room data — edit these to match your projects
   ──────────────────────────────────────────── */

// Items with hover tooltip + click navigation (portfolio / nav links)
const INTERACTIVE_ITEMS = [
  // ── Portfolio projects ──
  {
    id: 'home',
    emoji: '🏠',
    label: 'My Website',
    desc: 'Next.js + Spring Boot\n풀스택 포트폴리오',
    href: 'https://mejisue.site',
    external: true,
    pos: { position: 'absolute', bottom: '30%', left: '28%' } as React.CSSProperties,
    size: '5rem',
    mobilePos: { position: 'absolute', bottom: '30%', left: '22%' } as React.CSSProperties,
    mobileSize: '3rem',
  },
  {
    id: 'project2',
    emoji: '💬',
    label: 'Sleact',
    desc: '실시간 채팅 사이트',
    href: 'https://sleact.mejisue.site',
    external: true,
    pos: { position: 'absolute', bottom: '40%', right: '35%' } as React.CSSProperties,
    size: '4rem',
    mobilePos: { position: 'absolute', bottom: '40%', right: '28%' } as React.CSSProperties,
    mobileSize: '2.4rem',
  },
  {
    id: 'project3',
    emoji: '🧵',
    label: 'Thread SNS',
    desc: '스레드형 SNS 풀스택 구현',
    href: 'https://retweet.mejisue.site',
    external: false,
    pos: { position: 'absolute', top: '15%', left: '40%' } as React.CSSProperties,
    size: '3.5rem',
    mobilePos: { position: 'absolute', top: '23%', left: '42%' } as React.CSSProperties,
    mobileSize: '2.2rem',
  },

  // ── Navigation ──
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
    href: '/post',
    external: false,
    pos: { position: 'absolute', bottom: '25%', right: '22%' } as React.CSSProperties,
    size: '3.5rem',
    mobilePos: { position: 'absolute', bottom: '35%', right: '18%' } as React.CSSProperties,
    mobileSize: '2.2rem',
  },
];

// Decorative items (no interaction)
const DECO_ITEMS = [
  { id: 'plant', emoji: '🪴', size: '3.8rem', pos: { position: 'absolute', bottom: '42%', left: '4%' } as React.CSSProperties, mobileSize: '2.3rem', mobilePos: { position: 'absolute', bottom: '42%', left: '2%' } as React.CSSProperties },
  { id: 'sofa', emoji: '🛋️', size: '7rem', pos: { position: 'absolute', bottom: '41%', right: '3%' } as React.CSSProperties, mobileSize: '4.2rem', mobilePos: { position: 'absolute', bottom: '41%', right: '1%' } as React.CSSProperties },
  { id: 'frame', emoji: '🖼️', size: '3.2rem', pos: { position: 'absolute', top: '27%', right: '15%' } as React.CSSProperties, mobileSize: '2rem', mobilePos: { position: 'absolute', top: '26%', right: '10%' } as React.CSSProperties },
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
          이모티콘에 커서를 올려보세요!
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

function DoorSVG() {
  return (
    <svg
      viewBox="0 0 200 340"
      className="w-36 h-60 md:w-44 md:h-72 lg:w-52 lg:h-[330px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Door body */}
      <rect x="3" y="3" width="194" height="334" rx="5" fill="#A07830" stroke="#2D2D2D" strokeWidth="3.5" />
      {/* Upper panel */}
      <rect x="22" y="22" width="156" height="112" rx="4" fill="#8C6520" stroke="#2D2D2D" strokeWidth="2" />
      {/* Lower panel */}
      <rect x="22" y="148" width="156" height="172" rx="4" fill="#8C6520" stroke="#2D2D2D" strokeWidth="2" />
      {/* Mail slot */}
      <rect x="68" y="88" width="64" height="16" rx="3" fill="#7A5618" stroke="#2D2D2D" strokeWidth="2" />
      {/* Peephole */}
      <circle cx="100" cy="52" r="8" fill="#2D2D2D" />
      <circle cx="100" cy="52" r="4" fill="#555" />
      {/* Handle */}
      <rect x="148" y="192" width="26" height="11" rx="5.5" fill="#BBB" stroke="#888" strokeWidth="1.5" />
      <rect x="158" y="198" width="10" height="26" rx="5" fill="#BBB" stroke="#888" strokeWidth="1.5" />
      {/* Hinges */}
      <rect x="10" y="38" width="13" height="26" rx="3" fill="#AAA" stroke="#888" strokeWidth="1.5" />
      <rect x="10" y="258" width="13" height="26" rx="3" fill="#AAA" stroke="#888" strokeWidth="1.5" />
    </svg>
  );
}

function KeypadSVG() {
  return (
    <svg viewBox="0 0 58 88" className="w-10 h-16 md:w-12 md:h-20" fill="none">
      <rect x="2" y="2" width="54" height="84" rx="8" fill="#D0D8E0" stroke="#2D2D2D" strokeWidth="2.5" />
      <rect x="10" y="12" width="38" height="22" rx="4" fill="#1A2340" stroke="#2D2D2D" strokeWidth="1.5" />
      {[0, 1, 2].flatMap(row =>
        [0, 1, 2].map(col => (
          <rect key={`${row}-${col}`} x={10 + col * 13} y={46 + row * 13} width="9" height="9" rx="2" fill="#AAB8C0" stroke="#2D2D2D" strokeWidth="1" />
        ))
      )}
    </svg>
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
  // null = SSR 구간 (sessionStorage 접근 불가)
  const [phase, setPhase] = useState<Phase | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('hasSeenIntro') ? 'room' : 'door';
  });
  const [progress, setProgress] = useState(0);
  const [doorOpen, setDoorOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const isMobile = useIsMobile();
  const counterObj = useRef({ val: 0 });
  const gsapAnim = useRef<gsap.core.Tween | null>(null);
  const doorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cleanup
  useEffect(() => {
    return () => {
      gsapAnim.current?.kill();
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
    setPhase('loading');
    counterObj.current.val = 0;

    gsapAnim.current = gsap.to(counterObj.current, {
      val: 100,
      duration: 2.8,
      ease: 'power1.inOut',
      onUpdate: () => setProgress(Math.round(counterObj.current.val)),
      onComplete: enterRoom,
    });

    doorTimer.current = setTimeout(() => setDoorOpen(true), 1400);
  };

  const navigate = (href: string, external: boolean) => {
    if (external) window.open(href, '_blank', 'noopener noreferrer');
    else router.push(href);
  };

  // sessionStorage 확인 전에는 아무것도 렌더하지 않음 (hydration mismatch 방지)
  if (phase === null) return <div className="min-h-screen" style={{ background: '#fffaf0', minWidth: '480px' }} />;

  /* ══════════════ DOOR SCENE ══════════════ */
  if (phase === 'door' || phase === 'loading') {
    return (
      <div
        className="relative flex min-h-screen select-none flex-col overflow-hidden"
        style={{ background: '#fffaf0', minWidth: '480px' }}
      >
        {/* Floor */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            top: '62%',
            background: '#C2C8D0',
            backgroundImage:
              'repeating-linear-gradient(90deg,rgba(255,255,255,0.22) 0,rgba(255,255,255,0.22) 1px,transparent 1px,transparent 70px),' +
              'repeating-linear-gradient(0deg,rgba(255,255,255,0.22) 0,rgba(255,255,255,0.22) 1px,transparent 1px,transparent 70px)',
          }}
        />
        {/* Ground line */}
        <div className="absolute inset-x-0" style={{ top: '62%', height: '2.5px', background: '#2D2D2D' }} />

        {/* Door area */}
        <div className="absolute inset-x-0 flex flex-col items-center justify-end" style={{ top: '8%', bottom: '38%' }}>
          {/* Progress counter */}
          <p
            className="mb-6 font-bold tracking-widest text-[#2D2D2D]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)' }}
          >
            {progress} %
          </p>

          {/* Door + keypad row */}
          <div className="flex items-end gap-4 md:gap-6">
            <div style={{ perspective: '700px' }}>
              <div
                style={{
                  transformOrigin: 'left 50%',
                  transform: doorOpen ? 'rotateY(-78deg)' : 'rotateY(0deg)',
                  transition: 'transform 1.2s cubic-bezier(0.4,0,0.2,1)',
                  cursor: phase === 'door' ? 'pointer' : 'default',
                }}
                onClick={handleDoorClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleDoorClick()}
                aria-label="Enter"
              >
                <DoorSVG />
              </div>
            </div>

            {/* Keypad + CLICK! annotation */}
            <div className="flex flex-col items-start gap-2 pb-3">
              {phase === 'door' && (
                <div className="mb-1 flex items-center gap-1.5 text-[#2D2D2D]">
                  <svg width="16" height="20" viewBox="0 0 18 22" fill="none">
                    <path d="M3 2 L15 11 L9 13 L12 20 L8 22 L5 15 L1 18 Z" fill="white" stroke="#2D2D2D" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                  <span className="text-xs font-bold tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                    CLICK!
                  </span>
                </div>
              )}
              <KeypadSVG />
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
        className="room-el cat-char absolute"
        style={{ bottom: '42%', left: '50%', transform: 'translateX(-50%)', opacity: 0 }}
      >
        <CatBubble />
        <CatSVG />
      </div>

      {/* ── Interactive items (portfolio + nav links) ── */}
      {INTERACTIVE_ITEMS.map((item) => (
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
            <span
              style={{ fontSize: isMobile ? item.mobileSize : item.size }}
              className="block leading-none transition-transform duration-150 hover:scale-110"
            >
              {item.emoji}
            </span>
          </div>
        </div>
      ))}

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
