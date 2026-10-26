import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/organization(.*)",
  "/project(.*)",
  "/issue(.*)",
]);

export default clerkMiddleware(
  (auth, req) => {
    if (!auth().userId && isProtectedRoute(req)) {
      return auth().redirectToSignIn();
    }

    if (
      auth().userId &&
      !auth().orgId &&
      req.nextUrl.pathname !== "/onboarding" &&
      req.nextUrl.pathname !== "/" &&
      !req.nextUrl.pathname.startsWith("/organization") &&
      !req.nextUrl.pathname.startsWith("/project") &&
      !req.nextUrl.pathname.startsWith("/issue")
    ) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  },
  { clockSkewInMs: 60000 }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};