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

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/manifest.json")
  ) {
    return NextResponse.next();
  }

  let session = null;

  try {
    session = await auth();
  } catch (error) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (!session?.user && !isPublic) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
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
