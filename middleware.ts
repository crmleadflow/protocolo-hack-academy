import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isProtectedRoute =
    isAdminRoute ||
    nextUrl.pathname.startsWith("/academia") ||
    nextUrl.pathname.startsWith("/cuenta");

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && req.auth?.user?.role !== "super_admin") {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
});

// El middleware corre en Edge por defecto, y ahí el driver de Mongo (que usa
// el módulo `crypto` de Node) no funciona — rompía CADA página protegida con
// "Internal Server Error". Node.js Middleware (estable desde Next.js 15.5)
// lo saca de ese modo.
export const config = {
  runtime: "nodejs",
  matcher: ["/admin/:path*", "/academia/:path*", "/cuenta/:path*"],
};
