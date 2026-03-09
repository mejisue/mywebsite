import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });

    if (token?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.redirect(new URL("/403", req.url));
    }

    return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
