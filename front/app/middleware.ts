// middleware.ts (루트 폴더에 생성)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // 이미 signIn 콜백에서 걸렀으므로, 
        // 여기까지 왔다면 인증된 사용자입니다.
        return NextResponse.next();
    },
    {
        callbacks: {
            // 세션이 있고 이메일이 내 이메일인지 한 번 더 확인
            authorized: ({ token }) => token?.email === process.env.ADMIN_EMAIL,
        },
    }
);

// 관리자 페이지만 보호하고 싶을 때
export const config = { matcher: ["/admin/:path*", "/dashboard/:path*"] };