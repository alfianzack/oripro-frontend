import { NextResponse } from "next/server";

export async function GET() {
  try {
    const providers: Record<string, any> = {};

    // Credentials provider (always available)
    providers.credentials = {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
    };

    // Only include OAuth providers if their credentials are configured
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      providers.google = {
        id: "google",
        name: "Google",
        type: "oauth",
        signinUrl: "/api/auth/signin/google",
        callbackUrl: "/api/auth/callback/google",
      };
    }

    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      providers.github = {
        id: "github",
        name: "GitHub",
        type: "oauth",
        signinUrl: "/api/auth/signin/github",
        callbackUrl: "/api/auth/callback/github",
      };
    }

    return NextResponse.json(providers, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

