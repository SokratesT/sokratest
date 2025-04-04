import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/ingest")) {
    const url = request.nextUrl.clone();
    const hostname = process.env.NEXT_PUBLIC_POSTHOG_HOST || "eu.i.posthog.com";
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set("host", hostname);

    url.protocol = "https";
    url.hostname = hostname;
    url.port = "443";
    url.pathname = url.pathname.replace(/^\/ingest/, "");

    return NextResponse.rewrite(url, {
      headers: requestHeaders,
    });
  }

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
  // Matches PostHog's /ingest endpoint
  matcher: ["/ingest/:path*", "/app/:path*", "/login", "/register"],
};
