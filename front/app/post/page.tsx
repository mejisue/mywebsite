import { getPosts } from '@/lib/api/posts';
import Image from 'next/image';
import Link from 'next/link';

export default async function PostListPage() {
    const posts = await getPosts();

    return (
        <div className="flex min-h-screen justify-center bg-white">
            <div className="w-full max-w-3xl px-16 py-20">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">글 목록</h1>

                <div className="mt-12 flex flex-col divide-y divide-neutral-100">
                    {posts.length === 0 ? (
                        <p className="py-16 text-center text-sm text-neutral-400">아직 작성된 글이 없습니다.</p>
                    ) : (
                        posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/post/${post.id}`}
                                className="group flex items-center justify-between gap-6 py-8"
                            >
                                <div className="flex flex-1 flex-col gap-3 min-w-0">
                                    <h2 className="text-xl font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors truncate">
                                        {post.title}
                                    </h2>

                                    {post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {post.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full bg-blue-50 px-3 py-0.5 text-xs text-blue-700"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                        <span>ssookk</span>
                                        <span>·</span>
                                        {/* TODO: createdAt 필드가 entity에 추가되면 날짜로 교체 */}
                                        <span>날짜 미정</span>
                                    </div>
                                </div>

                                {post.thumbnail && (
                                    <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg">
                                        <Image
                                            src={post.thumbnail}
                                            alt={post.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
