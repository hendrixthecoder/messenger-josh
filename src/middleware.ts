import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;

    const isAuth = await getToken({ req });
    const isLoginPage = pathname.startsWith("/login");

    const sensitiveRoutes = ["/dashboard"];
    const isAccessingSensitiveRoutes = sensitiveRoutes.some((route) =>
      pathname.startsWith(route)
    );

    //if the login page they should be redirected to the dashboard
    if (isLoginPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      //but if its the login page, let them through a second redirect isnt necessary
      return NextResponse.next();
    }

    //but if they arent on the login page and they arent authenticated and theyre accessing an authorized only route send them to the login page
    if (!isAuth && isAccessingSensitiveRoutes) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    //but if they arent on the login page and are authenticated and they try to access the / route send them to /dashboard as we really arent using it
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      async authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
