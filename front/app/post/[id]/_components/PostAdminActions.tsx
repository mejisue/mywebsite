'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import DeletePostButton from './DeletePostButton';

// 글 상세 페이지의 수정/삭제 버튼.
// 페이지 본문은 정적으로 만들고, 어드민 전용 UI만 이 컴포넌트가 브라우저에서 판단한다.
// 이 사이트는 어드민만 로그인할 수 있으므로 "세션이 있으면 = 어드민"이다.
export default function PostAdminActions({ id }: { id: string }) {
    const { status } = useSession();

    if (status !== 'authenticated') return null;

    return (
        <div className="flex items-center gap-3">
            <Link href={`/admin/write/${id}`} className="hover:text-neutral-800">
                수정
            </Link>
            <DeletePostButton id={id} />
        </div>
    );
}
