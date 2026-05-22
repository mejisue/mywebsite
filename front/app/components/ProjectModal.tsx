'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export type ProjectDetail = {
  description: string;
  techStack: string[];
  features: string[];
  links: {
    site?: string;
    github?: string;
  };
  image?: string;
};

export type ProjectItem = {
  id: string;
  emoji: string;
  label: string;
  detail: ProjectDetail;
};

type Props = {
  project: ProjectItem | null;
  onClose: () => void;
};

export default function ProjectModal({ project, onClose }: Props) {
  if (!project) return null;

  const { label, emoji, detail } = project;

  return (
    <Dialog open={!!project} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg border-2 border-[#2D2D2D] bg-[#fffef7] shadow-[4px_4px_0px_#2D2D2D] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#2D2D2D]" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.02em' }}>
            <span>{emoji}</span>
            <span>{label}</span>
          </DialogTitle>
          <DialogDescription className="text-[#555] text-sm leading-relaxed">
            {detail.description}
          </DialogDescription>
        </DialogHeader>

        {detail.image && (
          <div className="rounded-xl overflow-hidden border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={detail.image} alt={`${label} 스크린샷`} className="w-full object-cover" />
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Tech Stack */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2D2D2D] mb-2">Tech Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {detail.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-[#2D2D2D] px-2.5 py-0.5 text-[11px] font-medium text-[#2D2D2D] bg-white"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2D2D2D] mb-2">구현 기능</p>
            <ul className="flex flex-col gap-1">
              {detail.features.map((feat) => (
                <li key={feat} className="flex items-start gap-1.5 text-sm text-[#444]">
                  <span className="mt-0.5 text-[#2D2D2D]">—</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Links */}
        {(detail.links.site || detail.links.github) && (
          <div className="flex gap-2 pt-1">
            {detail.links.site && (
              <a
                href={detail.links.site}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-[#2D2D2D] bg-[#2D2D2D] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#444] transition-colors"
              >
                사이트 보기 ↗
              </a>
            )}
            {detail.links.github && (
              <a
                href={detail.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-[#2D2D2D] bg-white px-4 py-1.5 text-xs font-bold text-[#2D2D2D] hover:bg-neutral-100 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
