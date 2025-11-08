import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const LOGIN_URL = "/login";
const SIGNUP_URL = "/sign-up";
const HOME_URL = "/";

const AUTH_ROUTES = [LOGIN_URL, SIGNUP_URL];

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAuthenticated = !!session;

  const isAuthRoute = AUTH_ROUTES.includes(nextUrl.pathname);

  if (isAuthRoute) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(HOME_URL, nextUrl));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL(LOGIN_URL, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - .svg, .ico (static assets)
     */
    "/((?!api|_next/static|_next/image|.*.svg|.*.ico).*)",
  ],
};
