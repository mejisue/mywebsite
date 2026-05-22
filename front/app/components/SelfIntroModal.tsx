'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

const TECH_STACK = [
  'Next.js', 'React', 'TypeScript',
  'Spring Boot', 'MySQL', 'Redis',
  'Docker', 'AWS EC2', 'Spring Security',
  'WebSocket', 'JPA',
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SelfIntroModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm border-2 border-[#2D6A4F] bg-[#F4FCF6] shadow-[4px_4px_0px_#2D6A4F] rounded-2xl p-0 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b-2 border-[#2D6A4F] bg-[#E8F7ED]">
          <div className="flex items-end justify-between">
            <div>
              <DialogTitle
                className="text-[#1B4332] font-bold"
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.02em', lineHeight: 1 }}
              >
                김지수
              </DialogTitle>
              <p className="mt-1 text-sm font-medium text-[#40916C]">FullStack Developer</p>
            </div>
            <span
              className="rounded-full border-2 border-[#40916C] px-3 py-0.5 text-xs font-bold text-[#40916C] bg-white"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}
            >
              INTJ
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Intro */}
          <p
            className="text-sm text-[#2D4A38] leading-[1.85] border-l-[3px] border-[#52B788] pl-3"
            style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
          >
            이제 개발 세상에 눈을 뜬 신입 개발자입니다.
            매일 새로운 기술이 탄생하고 진화하는 개발 생태계의 역동적인 매력에 이끌려 개발을 시작했습니다.
            다양한 사람들과 스스럼없이 섞여 소통하며 이 생태계를 함께 이끌어가는 것이 제 커리어의 목적입니다.
            팀의 페이스에 맞춰 영리하게 몰입하는 동료가 되겠습니다.
          </p>

          {/* Tech Stack */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#40916C] mb-2">Tech Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {TECH_STACK.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-[#74C69D] px-2.5 py-0.5 text-[11px] font-medium text-[#1B4332] bg-[#D8F3DC]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#40916C] mb-2">Contact</p>
            <ul className="flex flex-col gap-2 text-sm text-[#2D4A38]">
              <li className="flex items-center gap-2.5">
                <span className="text-base leading-none">✉</span>
                <a href="mailto:februstar11@gmail.com" className="hover:text-[#40916C] transition-colors">februstar11@gmail.com</a>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-base leading-none">☎</span>
                <span>010-6765-4465</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[#2D4A38]">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <a href="https://github.com/mejisue" target="_blank" rel="noopener noreferrer" className="hover:text-[#40916C] transition-colors">
                  github.com/mejisue
                </a>
              </li>
            </ul>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
