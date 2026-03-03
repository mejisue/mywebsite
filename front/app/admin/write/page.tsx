'use client';

import { ChangeEvent, KeyboardEvent, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Bold, Code2, Image as ImageIcon, Italic, Quote, Strikethrough as StrikethroughIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { createPost, uploadImage } from '@/lib/api/posts';

export default function AdminWritePage() {
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [showTagTooltip, setShowTagTooltip] = useState(false);
    const [content, setContent] = useState('');

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);

    const addTag = (value: string) => {
        const trimmed = value.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags((prev) => [...prev, trimmed]);
        }
        setTagInput('');
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing) return; // 한글 IME 조합 중 무시
        if (e.key !== 'Enter') return;
        e.preventDefault();
        addTag(tagInput);
    };

    const handleTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.endsWith(',')) {
            addTag(value.slice(0, -1));
        } else {
            setTagInput(value);
        }
    };

    const removeTag = (tag: string) => {
        setTags((prev) => prev.filter((t) => t !== tag));
    };

    const handleSelectImages = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        e.target.value = '';

        for (const file of files) {
            // blob URL로 미리보기를 즉시 content에 삽입
            const previewUrl = URL.createObjectURL(file);
            const placeholder = `![업로드 중...](${previewUrl})`;
            setContent((prev) => {
                const prefix = prev.trim() ? `${prev}\n\n` : '';
                return `${prefix}${placeholder}`;
            });

            try {
                const { url } = await uploadImage(file);
                // 업로드 완료 후 blob URL → S3 URL로 교체
                setContent((prev) => prev.replace(placeholder, `![이미지](${url})`));
            } catch {
                // 실패 시 placeholder 제거
                setContent((prev) => prev.replace(`\n\n${placeholder}`, '').replace(placeholder, ''));
                toast.error('이미지 업로드에 실패했습니다.');
            } finally {
                URL.revokeObjectURL(previewUrl);
            }
        }
    };

    const handleEditorKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key !== 'Tab') return;

        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;
        const tab = '    '; // 4 spaces

        const before = content.slice(0, start);
        const after = content.slice(end);
        const nextContent = `${before}${tab}${after}`;

        setContent(nextContent);

        const cursorPos = start + tab.length;
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(cursorPos, cursorPos);
        });
    };

    const { mutate: publishPost, isPending } = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            toast.success('출간되었습니다.');
        },
        onError: () => {
            toast.error('출간에 실패했습니다.');
        },
    });

    const handlePublish = () => {
        publishPost({ title, content, tags });
    };

    const insertMarkdown = (
        type:
            | 'h1'
            | 'h2'
            | 'h3'
            | 'h4'
            | 'bold'
            | 'italic'
            | 'strike'
            | 'quote'
            | 'code',
    ) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;

        const before = content.slice(0, start);
        const selected = content.slice(start, end);
        const after = content.slice(end);

        let replaced = selected;
        let nextSelectionStart: number | null = null;
        let nextSelectionEnd: number | null = null;

        switch (type) {
            case 'h1': {
                const target = selected || '제목';
                replaced = `# ${target}`;
                break;
            }
            case 'h2': {
                const target = selected || '소제목';
                replaced = `## ${target}`;
                break;
            }
            case 'h3': {
                const target = selected || '소제목';
                replaced = `### ${target}`;
                break;
            }
            case 'h4': {
                const target = selected || '소제목';
                replaced = `#### ${target}`;
                break;
            }
            case 'bold': {
                const target = selected || '굵게';
                replaced = `**${target}**`;
                break;
            }
            case 'italic': {
                const target = selected || '기울임';
                replaced = `_${target}_`;
                break;
            }
            case 'strike': {
                const target = selected || '취소선';
                replaced = `~~${target}~~`;
                break;
            }
            case 'quote': {
                const target = selected || '인용문';
                replaced = target
                    .split('\n')
                    .map((line) => (line ? `> ${line}` : '>'))
                    .join('\n');
                break;
            }
            case 'code': {
                if (!selected) {
                    const open = '\n```\n';
                    const placeholderLang = '코드를 입력하세요';
                    const afterPlaceholder = '\n';
                    const close = '```\n';

                    replaced = `${open}${placeholderLang}${afterPlaceholder}${close}`;

                    // "text" 부분이 선택되도록 커서 범위 지정
                    nextSelectionStart = before.length + open.length;
                    nextSelectionEnd = nextSelectionStart + placeholderLang.length;
                    break;
                }

                // 선택이 있는 경우도 코드블록으로 감쌈 (한 줄/여러 줄 모두)
                replaced = `\n\`\`\`text\n${selected}\n\`\`\`\n`;
                break;
            }
            default:
                break;
        }

        const next = `${before}${replaced}${after}`;
        setContent(next);

        // 커서 위치 다시 설정
        const cursorPos = before.length + replaced.length;
        requestAnimationFrame(() => {
            textarea.focus();
            if (nextSelectionStart !== null && nextSelectionEnd !== null) {
                textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
                return;
            }
            textarea.setSelectionRange(cursorPos, cursorPos);
        });
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* 상단: 에디터 + 프리뷰 */}
            <div className="flex flex-1 divide-x border-b">
                {/* 좌측: 작성 영역 */}
                <div className="flex w-1/2 flex-col gap-6 px-10 py-8">
                    {/* 제목 */}
                    <div>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목"
                            className="w-full border-none bg-transparent text-4xl font-bold outline-none placeholder:text-neutral-400"
                        />
                    </div>

                    {/* 태그 */}
                    <div className="relative">
                        {showTagTooltip && (
                            <div className="absolute bottom-full left-0 mb-2 rounded bg-neutral-800 px-3 py-2 text-xs leading-5 text-white">
                                쉼표 혹은 엔터를 입력하여 태그를 등록 할 수 있습니다.<br />
                                등록된 태그를 클릭하면 삭제됩니다.
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-2">
                            {tags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="rounded-full bg-emerald-100 px-3 py-0.5 text-sm text-emerald-700 hover:bg-emerald-200"
                                >
                                    {tag}
                                </button>
                            ))}
                            <input
                                value={tagInput}
                                onChange={handleTagInputChange}
                                onKeyDown={handleTagKeyDown}
                                onFocus={() => setShowTagTooltip(true)}
                                onBlur={() => setShowTagTooltip(false)}
                                placeholder={tags.length === 0 ? '태그를 입력하세요' : ''}
                                className="min-w-[120px] flex-1 border-none bg-transparent text-sm text-neutral-500 outline-none placeholder:text-neutral-400"
                            />
                        </div>
                    </div>

                    {/* 툴바 */}
                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                        <button
                            type="button"
                            className="rounded px-1 py-0.5 hover:bg-neutral-100"
                            onClick={() => insertMarkdown('h1')}
                        >
                            H1
                        </button>
                        <button
                            type="button"
                            className="rounded px-1 py-0.5 hover:bg-neutral-100"
                            onClick={() => insertMarkdown('h2')}
                        >
                            H2
                        </button>
                        <button
                            type="button"
                            className="rounded px-1 py-0.5 hover:bg-neutral-100"
                            onClick={() => insertMarkdown('h3')}
                        >
                            H3
                        </button>
                        <button
                            type="button"
                            className="rounded px-1 py-0.5 hover:bg-neutral-100"
                            onClick={() => insertMarkdown('h4')}
                        >
                            H4
                        </button>
                        <span className="mx-1 h-4 w-px bg-neutral-200" />
                        <button
                            type="button"
                            className="rounded px-1 py-0.5 hover:bg-neutral-100"
                            onClick={() => insertMarkdown('bold')}
                        >
                            <Bold className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            className="rounded px-1 py-0.5 hover:bg-neutral-100"
                            onClick={() => insertMarkdown('italic')}
                        >
                            <Italic className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            className="rounded px-1 py-0.5 hover:bg-neutral-100"
                            onClick={() => insertMarkdown('strike')}
                        >
                            <StrikethroughIcon className="h-4 w-4" />
                        </button>
                        <span className="mx-1 h-4 w-px bg-neutral-200" />
                        <button
                            type="button"
                            className="rounded px-1 py-0.5 hover:bg-neutral-100"
                            onClick={() => insertMarkdown('quote')}
                        >
                            <Quote className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            className="rounded px-1 py-0.5 hover:bg-neutral-100"
                            onClick={() => {
                                imageInputRef.current?.click();
                            }}
                        >
                            {/* 이미지 파일 선택 인풋 (숨김 처리) */}
                            <input
                                ref={imageInputRef}
                                onChange={handleSelectImages}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
                            <ImageIcon className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            className="rounded px-1 py-0.5 hover:bg-neutral-100"
                            onClick={() => insertMarkdown('code')}
                        >
                            <Code2 className="h-4 w-4" />
                        </button>
                    </div>




                    {/* 본문 입력 */}
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={handleEditorKeyDown}
                            ref={textareaRef}
                            className="h-[420px] w-full resize-none rounded-md border border-neutral-200 bg-white p-4 text-sm leading-relaxed outline-none focus:border-neutral-400"
                            placeholder="# 컨텐츠를 마크다운으로 작성해보세요"
                        />
                    </div>
                </div>

                {/* 우측: 프리뷰 */}
                <div className="flex w-1/2 flex-col gap-6 bg-white px-10 py-8">
                    <div>
                        <h1 className="text-4xl font-bold">
                            {title.trim() || '제목'}
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-emerald-100 px-3 py-0.5 text-sm text-emerald-700">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="mt-4 flex-1 overflow-auto text-base leading-relaxed">
                        <div className="markdown-body">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                // blob: URL 등도 허용하도록 모든 URL을 그대로 사용
                                urlTransform={(url) => url}
                                components={{
                                    img: (props) => {
                                        if (!props.src || props.src === '') return null;
                                        // eslint-disable-next-line @next/next/no-img-element
                                        return <img {...props} alt={props.alt ?? '이미지'} />;
                                    },
                                }}
                            >
                                {content || '컨텐츠를 입력해주세요'}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>

            {/* 하단 버튼 영역 */}
            <div className="flex items-center justify-between px-10 py-4 text-sm">
                <button
                    type="button"
                    className="text-neutral-500 hover:text-neutral-700"
                >
                    &larr; 나가기
                </button>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="rounded-md border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                    >
                        임시저장
                    </button>
                    <button
                        onClick={handlePublish}
                        type="button"
                        disabled={isPending}
                        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPending ? '출간 중...' : '출간하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}

