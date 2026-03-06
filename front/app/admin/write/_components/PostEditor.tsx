'use client';

import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Bold, Code2, Image as ImageIcon, Italic, Quote, Strikethrough as StrikethroughIcon } from 'lucide-react';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/api/posts';

type MarkdownType = 'h1' | 'h2' | 'h3' | 'h4' | 'bold' | 'italic' | 'strike' | 'quote' | 'code';

export type PostData = { title: string; content: string; tags: string[] };

interface PostEditorProps {
    initialTitle?: string;
    initialContent?: string;
    initialTags?: string[];
    onSubmit: (data: PostData) => void;
    submitLabel: string;
    pendingLabel: string;
    isPending: boolean;
    isLoading?: boolean;
}

export default function PostEditor({
    initialTitle,
    initialContent,
    initialTags,
    onSubmit,
    submitLabel,
    pendingLabel,
    isPending,
    isLoading,
}: PostEditorProps) {
    const [title, setTitle] = useState(initialTitle ?? '');
    const [tags, setTags] = useState<string[]>(initialTags ?? []);
    const [tagInput, setTagInput] = useState('');
    const [showTagTooltip, setShowTagTooltip] = useState(false);
    const [content, setContent] = useState(initialContent ?? '');

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (initialTitle !== undefined) setTitle(initialTitle);
        if (initialContent !== undefined) setContent(initialContent);
        if (initialTags !== undefined) setTags(initialTags);
    }, [initialTitle, initialContent, initialTags]);

    const addTag = (value: string) => {
        const trimmed = value.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags((prev) => [...prev, trimmed]);
        }
        setTagInput('');
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing) return;
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
            const previewUrl = URL.createObjectURL(file);
            const placeholder = `![업로드 중...](${previewUrl})`;
            setContent((prev) => {
                const prefix = prev.trim() ? `${prev}\n\n` : '';
                return `${prefix}${placeholder}`;
            });

            try {
                const { url } = await uploadImage(file);
                setContent((prev) => prev.replace(placeholder, `![이미지](${url})`));
            } catch {
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
        const tab = '    ';

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

    const insertMarkdown = (type: MarkdownType) => {
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
            case 'h1': replaced = `# ${selected || '제목'}`; break;
            case 'h2': replaced = `## ${selected || '소제목'}`; break;
            case 'h3': replaced = `### ${selected || '소제목'}`; break;
            case 'h4': replaced = `#### ${selected || '소제목'}`; break;
            case 'bold': replaced = `**${selected || '굵게'}**`; break;
            case 'italic': replaced = `_${selected || '기울임'}_`; break;
            case 'strike': replaced = `~~${selected || '취소선'}~~`; break;
            case 'quote': {
                const target = selected || '인용문';
                replaced = target.split('\n').map((line) => (line ? `> ${line}` : '>')).join('\n');
                break;
            }
            case 'code': {
                if (!selected) {
                    const open = '\n```\n';
                    const placeholderLang = '코드를 입력하세요';
                    replaced = `${open}${placeholderLang}\n\`\`\`\n`;
                    nextSelectionStart = before.length + open.length;
                    nextSelectionEnd = nextSelectionStart + placeholderLang.length;
                } else {
                    replaced = `\n\`\`\`text\n${selected}\n\`\`\`\n`;
                }
                break;
            }
        }

        setContent(`${before}${replaced}${after}`);

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

    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center text-sm text-neutral-400">불러오는 중...</div>;
    }

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
                        <button type="button" className="rounded px-1 py-0.5 hover:bg-neutral-100" onClick={() => insertMarkdown('h1')}>H1</button>
                        <button type="button" className="rounded px-1 py-0.5 hover:bg-neutral-100" onClick={() => insertMarkdown('h2')}>H2</button>
                        <button type="button" className="rounded px-1 py-0.5 hover:bg-neutral-100" onClick={() => insertMarkdown('h3')}>H3</button>
                        <button type="button" className="rounded px-1 py-0.5 hover:bg-neutral-100" onClick={() => insertMarkdown('h4')}>H4</button>
                        <span className="mx-1 h-4 w-px bg-neutral-200" />
                        <button type="button" className="rounded px-1 py-0.5 hover:bg-neutral-100" onClick={() => insertMarkdown('bold')}><Bold className="h-4 w-4" /></button>
                        <button type="button" className="rounded px-1 py-0.5 hover:bg-neutral-100" onClick={() => insertMarkdown('italic')}><Italic className="h-4 w-4" /></button>
                        <button type="button" className="rounded px-1 py-0.5 hover:bg-neutral-100" onClick={() => insertMarkdown('strike')}><StrikethroughIcon className="h-4 w-4" /></button>
                        <span className="mx-1 h-4 w-px bg-neutral-200" />
                        <button type="button" className="rounded px-1 py-0.5 hover:bg-neutral-100" onClick={() => insertMarkdown('quote')}><Quote className="h-4 w-4" /></button>
                        <button
                            type="button"
                            className="rounded px-1 py-0.5 hover:bg-neutral-100"
                            onClick={() => imageInputRef.current?.click()}
                        >
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
                        <button type="button" className="rounded px-1 py-0.5 hover:bg-neutral-100" onClick={() => insertMarkdown('code')}><Code2 className="h-4 w-4" /></button>
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
                        onClick={() => onSubmit({ title, content, tags })}
                        type="button"
                        disabled={isPending}
                        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPending ? pendingLabel : submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
