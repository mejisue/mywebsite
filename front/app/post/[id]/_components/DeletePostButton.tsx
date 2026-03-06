'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { deletePost } from '@/lib/api/posts';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function DeletePostButton({ id }: { id: string }) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    const { mutate: handleDeletePost, isPending } = useMutation({
        mutationFn: () => deletePost(id),
        onSuccess: () => {
            router.push('/');
            toast.info('포스트가 삭제되었습니다.');
        },
        onError: (error) => {
            console.error(error.message);
            toast.error(error.message);
            setShowModal(false);
        },
    });

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                type="button"
                className="hover:text-red-500"
            >
                삭제
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative rounded-lg bg-white px-8 py-7 shadow-xl w-80">
                        <h2 className="text-lg font-bold text-neutral-900">포스트 삭제</h2>
                        <p className="mt-2 text-sm text-neutral-500">정말로 삭제하시겠습니까?</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-sm text-neutral-500 hover:text-neutral-700"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeletePost()}
                                disabled={isPending}
                                className="rounded-md bg-blue-400 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isPending ? '삭제 중...' : '확인'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
