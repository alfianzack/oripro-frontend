import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/create-password",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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

  // For protected routes (including /welcome), check authentication
  let session = null;
  let isAuthenticated = false;

  try {
    session = await auth();
    isAuthenticated = !!session?.user;
  } catch (error) {
    console.log('Auth middleware error:', error);
    isAuthenticated = false;
  }

  // If not authenticated and not on public route, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL("/auth/login", req.url);
    // Add a query parameter to indicate redirect reason
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}



// import { auth } from "./auth";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// const publicRoutes = [
//   "/auth/login",
//   "/auth/register",
//   "/auth/forgot-password",
//   "/auth/create-password",
// ];

// export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   if (
//     pathname.startsWith("/_next/") ||   
//     pathname.startsWith("/static/") ||  
//     pathname.startsWith("/favicon.ico") ||
//     pathname.startsWith("/robots.txt") ||
//     pathname.startsWith("/api/") ||      
//     pathname.startsWith("/public/")       
//   ) {
//     return NextResponse.next();
//   }

//   if (publicRoutes.some(route => pathname.startsWith(route))) {
//     return NextResponse.next();
//   }

//   const session = await auth();

//   if (!session) {
//     const loginUrl = new URL("/auth/login", req.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
// }
