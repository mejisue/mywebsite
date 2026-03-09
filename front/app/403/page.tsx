import Link from 'next/link';
import Image from 'next/image';

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white">
            <Image src="/403.png" alt="empty" width={400} height={100} />

            <p className="text-2xl font-semibold text-neutral-700">앗! 이곳은 출입 금지 구역이에요!</p>

            <Link
                href="/"
                className="rounded-lg bg-blue-300 px-10 py-3 text-base font-medium text-white transition-colors hover:bg-blue-600"
            >
                홈으로
            </Link>
        </div>
    );
}
