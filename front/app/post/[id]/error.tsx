'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import Image from 'next/image';

export default function PostError({ error }: { error: Error; reset: () => void }) {
    useEffect(() => {
        console.error(error.message);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white">
            <Image src="/404.png" alt="empty" width={400} height={100} />

            <p className="text-2xl font-semibold text-neutral-700">아무것도 없네요!</p>

            <Link
                href="/"
                className="rounded-lg bg-blue-300 px-10 py-3 text-base font-medium text-white transition-colors hover:bg-emerald-600"
            >
                홈으로
            </Link>
        </div>
    );
}