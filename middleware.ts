import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
const isCustomerRoute = createRouteMatcher(["/profile"]);
const isAdminRoute = createRouteMatcher(["/admin", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const url = req.nextUrl.clone();

  try {
    const { userId } = await auth(); // Get session claims directly from auth()

    // Determine if the user is the admin
    const isAdmin = userId == process.env.AUTH_ID;

    if (!userId) {
      // Public users should not access any protected routes
      if (isCustomerRoute(req) || isAdminRoute(req)) {
        url.pathname = "/sign-in";
        return NextResponse.redirect(url);
      }
    }

    if (userId) {
      if (isCustomerRoute(req)) {
        // Redirect customers trying to access admin routes
        if (!isAdmin && isAdminRoute(req)) {
          url.pathname = "/";
          return NextResponse.redirect(url);
        }

        return NextResponse.next();
      }

      if (isAdminRoute(req)) {
        // Restrict admin routes to only authors
        if (!isAdmin) {
          url.pathname = "/sign-in";
          return NextResponse.redirect(url);
        }

        return NextResponse.next();
      }
    }

    return NextResponse.next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Redirect to an error page or sign-in if something goes wrong
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }
});
