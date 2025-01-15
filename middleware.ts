import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/dal";

// Define protected routes
const isCustomerRoute = createRouteMatcher(["/profile", "/orders"]);
const isAdminRoute = createRouteMatcher([
  "/admin",
  "/admin/product/create",
  "/admin/analytics",
  "/admin/product/update/:id",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const url = req.nextUrl.clone();

  try {
    // Extract user ID from Clerk's auth function
    const { userId } = await auth();

    // Verify session (assume `verifySession` returns a boolean indicating admin privileges)
    const isAdmin = await verifySession(); // Admin session validation
    const isAuthenticated = !!userId || isAdmin; // Authenticated if userId exists OR admin session is valid

    // Handle public (unauthenticated) users
    if (!isAuthenticated) {
      if (isCustomerRoute(req)) {
        // Redirect public users trying to access user routes
        url.pathname = "/sign-in";
        return NextResponse.redirect(url);
      }
      if (isAdminRoute(req)) {
        // Redirect public users trying to access admin routes
        url.pathname = "/admin/sign-in";
        return NextResponse.redirect(url);
      }
      return NextResponse.next(); // Allow access to public routes
    }

    // Handle authenticated user routes
    if (isCustomerRoute(req)) {
      // Allow access to customer routes for authenticated users
      return NextResponse.next();
    }

    // Handle admin routes
    if (isAdminRoute(req)) {
      // Restrict admin routes to admins only
      if (!isAdmin) {
        url.pathname = "/admin/sign-in";
        return NextResponse.redirect(url);
      }
      return NextResponse.next(); // Allow access to admin routes for admins
    }

    return NextResponse.next(); // Allow access for non-protected routes
  } catch (error) {
    console.error("Middleware error:", error);

    // Redirect to sign-in or admin sign-in on error
    if (isAdminRoute(req)) {
      url.pathname = "/admin/sign-in";
    } else {
      url.pathname = "/sign-in";
    }
    return NextResponse.redirect(url);
  }
});
