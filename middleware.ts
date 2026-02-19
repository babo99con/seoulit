import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/login"]);

const isBypassPath = (pathname: string) => {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/oauth2") ||
    pathname.startsWith("/login/oauth2") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  );
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isBypassPath(pathname)) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) {
    const token = request.cookies.get("his_access_token")?.value;
    const forcePasswordChange = request.cookies.get("his_force_password_change")?.value === "1";
    if (token) {
      if (forcePasswordChange) {
        return NextResponse.redirect(new URL("/my_account?forcePasswordChange=1", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("his_access_token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const forcePasswordChange = request.cookies.get("his_force_password_change")?.value === "1";
  if (forcePasswordChange && pathname !== "/my_account") {
    return NextResponse.redirect(new URL("/my_account?forcePasswordChange=1", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
