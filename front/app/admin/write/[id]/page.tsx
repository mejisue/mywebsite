'use client';

import { use } from 'react';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getPost, updatePost } from '@/lib/api/posts';
import { useRouter } from 'next/navigation';
import PostEditor from '../_components/PostEditor';

export default function AdminEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const { data: post, isLoading } = useQuery({
        queryKey: ['post', id],
        queryFn: () => getPost(id),
    });

    const { mutate: editPost, isPending } = useMutation({
        mutationFn: (data: { title: string; content: string; tags: string[] }) => updatePost(id, data),
        onSuccess: () => {
            router.push(`/post/${id}`);
        },
        onError: (error) => {
            console.error(error.message);
            toast.error('수정에 실패했습니다.');
        },
    });

    return (
        <PostEditor
            initialTitle={post?.title}
            initialContent={post?.content}
            initialTags={post?.tags}
            onSubmit={(data) => editPost(data)}
            submitLabel="수정하기"
            pendingLabel="수정 중..."
            isPending={isPending}
            isLoading={isLoading}
        />
    );
}
