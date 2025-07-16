import { Database } from "@/types/database";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getDashboardPath,
  hasAccessToPath,
  ensureUserProfile,
} from "@/lib/user-utils";
import { updateSession } from "@/lib/middleware";

export async function middleware(req: NextRequest) {
  // Add a simple log to see if middleware is running at all

  let supabaseResponse = NextResponse.next({
    request: req,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: req,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  );

  const { pathname } = req.nextUrl;

  // Handle API routes separately
  if (pathname.startsWith("/api/")) {
    // API routes that require authentication
    const protectedApiRoutes = [
      "/api/campaigns",
      "/api/applications",
      "/api/profile",
      "/api/business-profiles",
      "/api/influencer-profiles",
    ];

    // Check if this is a protected API route
    const isProtectedApiRoute = protectedApiRoutes.some(
      (route) =>
        pathname.startsWith(route) &&
        (req.method === "POST" ||
          req.method === "PUT" ||
          req.method === "PATCH" ||
          req.method === "DELETE")
    );

    if (isProtectedApiRoute) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return NextResponse.json(
          { error: "Unauthorized - No valid session" },
          { status: 401 }
        );
      }

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_role")
        .eq("id", session.user.id)
        .single();

      // Add user info to headers for the API route to use
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", session.user.id);
      requestHeaders.set("x-user-email", session.user.email || "");
      requestHeaders.set("x-user-role", profile?.user_role || "");

      // Pass the session token
      if (session.access_token) {
        requestHeaders.set("x-supabase-token", session.access_token);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // For non-protected API routes, just continue
    return supabaseResponse;
  }

  // Rest of your middleware code for page routes...

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/verify-email",
    "/auth/callback",
    "/debug",
    "/test-roles",
    "/test-registration",
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If user is not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated
  if (session) {
    // Handle auth callback - let it complete without interference
    if (pathname === "/auth/callback") {
      return supabaseResponse;
    }

    // Ensure user profile exists, creating it if necessary
    const profile = await ensureUserProfile(
      supabase,
      session.user.id,
      session.user.email || "",
      session.user.user_metadata
    );

    // If user doesn't have a profile, redirect to onboarding
    if (!profile && pathname !== "/register") {
      return NextResponse.redirect(new URL("/register", req.url));
    }

    // If user has a profile, handle route protection based on user role
    if (profile) {
      const userRole = profile.user_role;

      // Redirect to appropriate dashboard based on user role
      if (pathname === "/" || pathname === "/dashboard") {
        const dashboardPath = getDashboardPath(userRole);
        return NextResponse.redirect(new URL(dashboardPath, req.url));
      }

      // Redirect authenticated users away from auth pages
      if (pathname.startsWith("/auth/") && pathname !== "/auth/callback") {
        const dashboardPath = getDashboardPath(userRole);
        return NextResponse.redirect(new URL(dashboardPath, req.url));
      }

      // Protect role-specific routes
      if (!hasAccessToPath(userRole, pathname)) {
        const correctPath = getDashboardPath(userRole);
        return NextResponse.redirect(new URL(correctPath, req.url));
      }

      // Redirect from onboarding if user already has appropriate profile
      if (pathname === "/register") {
        // Check if user has completed their profile setup
        if (userRole === "business") {
          const { data: business } = await supabase
            .from("business_profiles")
            .select("id")
            .eq("id", session.user.id)
            .single();

          if (business) {
            return NextResponse.redirect(new URL("/business", req.url));
          }
        } else if (userRole === "influencer") {
          const { data: influencer } = await supabase
            .from("influencer_profiles")
            .select("id")
            .eq("id", session.user.id)
            .single();

          if (influencer) {
            return NextResponse.redirect(new URL("/influencer", req.url));
          }
        }
      }
    }
  }

  // Refresh the auth token
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - BUT INCLUDE API ROUTES
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
