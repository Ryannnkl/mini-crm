import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { session as sessionTable } from "@/db/schema";

const LOGIN_URL = "/login";
const SIGNUP_URL = "/sign-up";
const HOME_URL = "/";

const AUTH_ROUTES = [LOGIN_URL, SIGNUP_URL];

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const coockieStore = await cookies();
  const sessionToken = coockieStore.get("session_token")?.value;

  console.log("Session Token");
  console.log(sessionToken);

  let isAuthenticated = false;
  if (sessionToken) {
    try {
      const [session] = await db
        .select()
        .from(sessionTable)
        .where(eq(sessionTable.token, sessionToken))
        .limit(1);

      if (session && session.expiresAt > new Date()) {
        isAuthenticated = true;
      }
    } catch (e) {
      console.error("Middleware database error:", e);
      isAuthenticated = false;
    }
  }

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
