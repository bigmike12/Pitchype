import { Database } from "@/types/database";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getDashboardPath,
  hasAccessToPath,
  ensureUserProfile,
} from "@/lib/user-utils";

export async function middleware(req: NextRequest) {
  console.log(`[Middleware] Processing: ${req.method} ${req.nextUrl.pathname}`);

  const { pathname } = req.nextUrl;

  // Skip middleware for static files and assets
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    (pathname.includes(".") && !pathname.startsWith("/api/"))
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request: req,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    // Get session with error handling
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("[Middleware] Session error:", sessionError);
      // Clear potentially corrupted session
      supabaseResponse.cookies.delete("supabase-auth-token");
      supabaseResponse.cookies.delete("supabase.auth.token");
    }

    // Handle API routes
    if (pathname.startsWith("/api/")) {
      return await handleApiRoutes(req, supabase, session, pathname);
    }

    // Handle page routes
    return await handlePageRoutes(
      req,
      supabase,
      session,
      pathname,
      supabaseResponse
    );
  } catch (error) {
    console.error("[Middleware] Unexpected error:", error);
    return NextResponse.next();
  }
}

async function handleApiRoutes(
  req: NextRequest,
  supabase: any,
  session: any,
  pathname: string
) {
  const protectedApiRoutes = [
    "/api/campaigns",
    "/api/applications",
    "/api/profile",
    "/api/business-profiles",
    "/api/influencer-profiles",
  ];

  const isProtectedApiRoute = protectedApiRoutes.some(
    (route) =>
      pathname.startsWith(route) &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
  );

  if (!isProtectedApiRoute) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized - No valid session" },
      { status: 401 }
    );
  }

  try {
    // Get user profile with error handling
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_role")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      console.error("[Middleware] Profile fetch error:", profileError);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Add user info to headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", session.user.id);
    requestHeaders.set("x-user-email", session.user.email || "");
    requestHeaders.set("x-user-role", profile?.user_role || "");

    if (session.access_token) {
      requestHeaders.set("x-supabase-token", session.access_token);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("[Middleware] API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handlePageRoutes(
  req: NextRequest,
  supabase: any,
  session: any,
  pathname: string,
  supabaseResponse: NextResponse
) {
  const publicRoutes = [
    "/login",
    "/register",
    "/verify-email",
    "/auth/callback",
    "/debug",
    "/test-roles",
    "/test-registration",
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Handle unauthenticated users
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle authenticated users
  if (session) {
    // Allow auth callback to complete
    if (pathname === "/auth/callback") {
      return supabaseResponse;
    }

    try {
      // Ensure user profile exists
      const profile = await ensureUserProfile(
        supabase,
        session.user.id,
        session.user.email || "",
        session.user.user_metadata
      );

      // Redirect to onboarding if no profile
      if (!profile && pathname !== "/register") {
        return NextResponse.redirect(new URL("/register", req.url));
      }

      if (profile) {
        const userRole = profile.user_role;

        // Redirect to appropriate dashboard
        if (pathname === "/" || pathname === "/dashboard") {
          const dashboardPath = getDashboardPath(userRole);
          return NextResponse.redirect(new URL(dashboardPath, req.url));
        }

        // Redirect away from auth pages
        if (pathname.startsWith("/auth/") && pathname !== "/auth/callback") {
          const dashboardPath = getDashboardPath(userRole);
          return NextResponse.redirect(new URL(dashboardPath, req.url));
        }

        // Protect role-specific routes
        if (!hasAccessToPath(userRole, pathname)) {
          const correctPath = getDashboardPath(userRole);
          return NextResponse.redirect(new URL(correctPath, req.url));
        }

        // Handle completed onboarding
        if (pathname === "/register") {
          return await handleOnboardingRedirect(
            supabase,
            session,
            userRole,
            req.url
          );
        }
      }
    } catch (error) {
      console.error("[Middleware] Profile handling error:", error);
      // On profile error, redirect to register to recreate profile
      if (pathname !== "/register") {
        return NextResponse.redirect(new URL("/register", req.url));
      }
    }
  }

  // Refresh auth token
  try {
    await supabase.auth.getUser();
  } catch (error) {
    console.error("[Middleware] Token refresh error:", error);
  }

  return supabaseResponse;
}

async function handleOnboardingRedirect(
  supabase: any,
  session: any,
  userRole: string,
  baseUrl: string
) {
  try {
    if (userRole === "business") {
      const { data: business, error } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (!error && business) {
        return NextResponse.redirect(new URL("/business", baseUrl));
      }
    } else if (userRole === "influencer") {
      const { data: influencer, error } = await supabase
        .from("influencer_profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (!error && influencer) {
        return NextResponse.redirect(new URL("/influencer", baseUrl));
      }
    }
  } catch (error) {
    console.error("[Middleware] Onboarding check error:", error);
  }

  // Stay on register page if profile incomplete
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets with file extensions
     * - BUT INCLUDE API ROUTES
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
