import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/create-password",
  "/auth/reset-password",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Security: Detect and block React2Shell (CVE-2025-55182) exploitation attempts
  // React2Shell targets RSC (React Server Components) endpoints with malicious serialized payloads
  if (req.method === "POST") {
    // Check for RSC endpoint patterns that are commonly targeted
    if (pathname.includes("/_rsc") || pathname.includes("/_next/static/chunks/app")) {
      const contentType = req.headers.get("content-type") || "";
      const userAgent = req.headers.get("user-agent") || "";
      
      // Block suspicious automated tools attempting to exploit RSC endpoints
      const suspiciousAgents = ["curl", "wget", "python-requests", "go-http-client", "scanner"];
      const isSuspiciousAgent = suspiciousAgents.some(agent => 
        userAgent.toLowerCase().includes(agent)
      );
      
      // Block if suspicious user agent and targeting RSC endpoints
      if (isSuspiciousAgent) {
        // Get client IP from headers
        const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                         req.headers.get("x-real-ip") ||
                         "unknown";
        console.warn(`[SECURITY] Potential React2Shell attack detected from ${clientIp} to ${pathname}`, {
          userAgent,
          contentType,
          pathname
        });
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/manifest.json") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Handle root path - always redirect to /welcome
  // Authentication check for /welcome will happen after redirect
  if (pathname === "/") {
    const welcomeUrl = new URL("/welcome", req.url);
    return NextResponse.redirect(welcomeUrl);
  }

  // Check if it's a public route
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  
  if (isPublic) {
    return NextResponse.next();
  }

  // For protected routes, check for session cookie
  // NextAuth stores session in a cookie named 'authjs.session-token' (or similar)
  // Check for the session cookie instead of calling auth() which requires Node.js runtime
  const sessionToken = req.cookies.get("authjs.session-token") || 
                       req.cookies.get("__Secure-authjs.session-token") ||
                       req.cookies.get("next-auth.session-token") ||
                       req.cookies.get("__Secure-next-auth.session-token");
  
  const isAuthenticated = !!sessionToken;

  // If not authenticated and not on public route, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL("/auth/login", req.url);
    // Add a query parameter to indicate redirect reason
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Export config to ensure middleware runs in Edge Runtime
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
