'use client';

import { useEffect, useRef } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function SecretLogin() {
    const { data: session, status } = useSession();

    const hasShownToast = useRef(false);


    useEffect(() => {
        if (status === "authenticated" && session && !hasShownToast.current) {
            toast.success('mejisue, 환영합니다!', {
                description: "관리자 권한으로 접속되었습니다.",
                duration: 3000,
            });
            hasShownToast.current = true;
        }

        if (status === "unauthenticated") {
            hasShownToast.current = false;
        }
    }, [status, session]);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                if (status === "authenticated") {
                    signOut();
                    toast.info("로그아웃 되었습니다!");
                } else {
                    toast.promise(signIn('github'), {
                        loading: 'GitHub 인증 페이지로 이동 중...',
                        success: '인증 요청 완료!',
                        error: '로그인 도중 문제가 발생했습니다.',
                    });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status]);

    return null;
}