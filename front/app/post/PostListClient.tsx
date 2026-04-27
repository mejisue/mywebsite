'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { PostPage, getPostsPage } from '@/lib/api/posts';
import { formatTimeAgo } from '@/lib/time';
import { useEffect } from 'react';

const PAGE_SIZE = 10;

export default function PostListClient({ initialData }: { initialData: PostPage }) {
    const { ref, inView } = useInView();

    const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
        queryKey: ['posts'],
        queryFn: ({ pageParam }) => getPostsPage(pageParam, PAGE_SIZE),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.page + 1 : undefined,
        initialData: {
            pages: [initialData],
            pageParams: [0],
        },
    });

    const posts = data.pages.flatMap((p) => p.content);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (posts.length === 0) {
        return (
            <p className="py-16 text-center text-sm text-neutral-400">아직 작성된 글이 없어요!</p>
        );
    }

    return (
        <>
            <div className="flex flex-col divide-y divide-neutral-100">
                {posts.map((post) => (
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
                                <span>{formatTimeAgo(post.createdAt)}</span>
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
                ))}
            </div>

            <div ref={ref} className="h-1" />

            {isFetchingNextPage && (
                <p className="py-8 text-center text-sm text-neutral-400">불러오는 중...</p>
            )}
        </>
    );
}
