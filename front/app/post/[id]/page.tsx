import { getPost, getPosts } from '@/lib/api/posts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Image from 'next/image';
import PostAdminActions from './_components/PostAdminActions';
import { formatTimeAgo } from '@/lib/time';
import { notFound } from 'next/navigation';
import { preload } from 'react-dom';

function extractFirstImageUrl(markdown: string): string | null {
    const match = markdown.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    return match ? match[1] : null;
}

// 빌드 시점에 모든 글의 상세 페이지를 미리 만들어 둔다.
// 목록에 없는 새 글은 첫 방문 때 만들어져 캐시된다.
export async function generateStaticParams() {
    try {
        const posts = await getPosts();
        return posts.map((post) => ({ id: String(post.id) }));
    } catch {
        return [];
    }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let post;
    try {
        post = await getPost(id);
    } catch {
        notFound();
    }

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
                    <PostAdminActions id={id} />
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
