import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes
const isProtectedRoute = createRouteMatcher(["/profile(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const url = req.nextUrl.clone();
  const { userId } = await auth();

  if (isProtectedRoute(req)) {
    // If the user is not authenticated, redirect to the sign-in page
    if (!userId) {
      url.pathname = "/sign-in"; // Set the pathname to the sign-in page
      return NextResponse.redirect(url); // Use the cloned URL object
    }
    return NextResponse.next();
  }
});

// Configuration for the middleware
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
