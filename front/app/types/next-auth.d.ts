// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    /**
     * 세션 객체에 accessToken 속성을 추가합니다.
     */
    interface Session {
        accessToken?: string;
        user: {
            // 기존 user 타입에 필요한 게 있다면 추가할 수 있습니다.
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    /**
     * JWT 객체에도 accessToken 속성을 추가합니다.
     */
    interface JWT {
        accessToken?: string;
    }
}