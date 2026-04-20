import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// المسارات المحمية — تحتاج تسجيل دخول
const PROTECTED = [
  "/dashboard",
  "/trends",
  "/content",
  "/alerts",
  "/settings",
  "/billing",
  "/onboarding",
];

// مسارات Auth — إذا كان مسجلاً يُعاد توجيهه
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let response = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: req.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: req.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  // 1. لم يُسجَّل دخول + مسار محمي → /login
  if (!user && isProtected) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. مسجَّل دخول + صفحة auth → تحقق من onboarding
  if (user && isAuthRoute) {
    const onboarded = user.user_metadata?.onboarding_completed === true;
    return NextResponse.redirect(new URL(onboarded ? "/dashboard" : "/onboarding", req.url));
  }

  // 3. مسجَّل دخول + مسار dashboard (غير onboarding) → تحقق من onboarding
  if (user && isProtected && !pathname.startsWith("/onboarding")) {
    const onboarded = user.user_metadata?.onboarding_completed === true;
    if (!onboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/webhooks|images|fonts).*)",
  ],
};
