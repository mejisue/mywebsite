'use client';

import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { createPost } from '@/lib/api/posts';
import PostEditor from './_components/PostEditor';
import { useRouter } from 'next/navigation';

export default function AdminWritePage() {
    const router = useRouter();

    const { mutate: publishPost, isPending } = useMutation({
        mutationFn: createPost,
        onSuccess: (post) => {
            toast.success('출간되었습니다.');
            router.push(`/post/${post.id}`);
        },
        onError: () => {
            toast.error('출간에 실패했습니다.');
        },
    });

    return (
        <PostEditor
            onSubmit={(data) => publishPost(data)}
            submitLabel="출간하기"
            pendingLabel="출간 중..."
            isPending={isPending}
        />
    );
}

