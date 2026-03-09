import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '페이지를 찾을 수 없습니다',
    description: '요청하신 페이지가 존재하지 않습니다.',
};

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white">
            <Image src="/404.png" alt="empty" width={400} height={100} />

            <p className="text-2xl font-semibold text-neutral-700">아무것도 없네요!</p>

            <Link
                href="/"
                className="rounded-lg bg-blue-300 px-10 py-3 text-base font-medium text-white transition-colors hover:bg-blue-600"
            >
                홈으로
            </Link>
        </div>
    );
}
