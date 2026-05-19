import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Si hay sesión, permitir el acceso
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Solo permitir acceso si hay token (sesión activa)
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/assets/:path*"]
};