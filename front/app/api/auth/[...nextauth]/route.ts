// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

// 1. 설정 객체를 별도로 선언하고 export 합니다.
export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async signIn({ user }) {
            return user.email === process.env.ADMIN_EMAIL;
        },
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    // 필요하다면 여기에 pages 설정 등을 추가하세요.
};

// 2. NextAuth 핸들러 생성
const handler = NextAuth(authOptions);

// 3. GET, POST 메서드로 export
export { handler as GET, handler as POST };