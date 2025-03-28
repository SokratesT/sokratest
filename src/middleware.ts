import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
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

export const config = {
  // Matches PostHog's /ingest endpoint
  matcher: "/ingest/:path*",
};
