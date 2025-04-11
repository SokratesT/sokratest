import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/app")) {
    const session = getSessionCookie(request);

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register")
  ) {
    const session = getSessionCookie(request);

    if (session) {
      return NextResponse.redirect(new URL("/app", request.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};
