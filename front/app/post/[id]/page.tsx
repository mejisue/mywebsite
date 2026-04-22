import { getPost } from '@/lib/api/posts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import DeletePostButton from './_components/DeletePostButton';
import { formatTimeAgo } from '@/lib/time';
import { notFound } from 'next/navigation';
import { preload } from 'react-dom';

function extractFirstImageUrl(markdown: string): string | null {
    const match = markdown.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    return match ? match[1] : null;
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let post;
    try {
        post = await getPost(id);
    } catch {
        notFound();
    }

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;
    const firstImageUrl = extractFirstImageUrl(post.content);
    if (firstImageUrl) preload(firstImageUrl, { as: 'image', fetchPriority: 'high' });

    return (
        <div className="flex min-h-screen justify-center bg-white">
            <article className="w-full max-w-3xl px-16 py-20">
                <h1 className="text-4xl font-bold leading-tight tracking-tight">{post.title}</h1>

                <div className="mt-6 flex items-center justify-between text-sm text-neutral-500">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-800">ssookk</span>
                        <span>·</span>
                        {/* TODO: createdAt 필드가 entity에 추가되면 날짜로 교체 */}
                        <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    {isAdmin && (
                        <div className="flex items-center gap-3">
                            <Link href={`/admin/write/${id}`} className="hover:text-neutral-800">
                                수정
                            </Link>
                            <DeletePostButton id={id} />
                        </div>
                    )}
                </div>

                <hr className="my-8 border-neutral-100" />

                <div className="markdown-body text-base leading-relaxed">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        urlTransform={(url) => url}
                        components={{
                            img: (props) => {
                                if (!props.src || typeof props.src !== 'string') return null;
                                return (
                                    <span style={{ display: 'block', position: 'relative', width: '100%' }}>
                                        <Image
                                            src={props.src}
                                            alt={props.alt ?? '이미지'}
                                            width={800}
                                            height={600}
                                            style={{ width: '100%', height: 'auto' }}
                                            priority
                                        />
                                    </span>
                                );
                            },
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>
            </article>
        </div>
    );
}
