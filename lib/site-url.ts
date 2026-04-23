const LOCAL_APP_URL = "http://localhost:3000";

function normalizeOrigin(value?: string | null) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function getConfiguredAppOrigin() {
  return normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ?? null;
}

export function buildAppUrl(pathname: string, origin?: string | null) {
  const baseOrigin =
    getConfiguredAppOrigin() ?? normalizeOrigin(origin) ?? LOCAL_APP_URL;

  return new URL(pathname, baseOrigin).toString();
}

export function getBrowserAppOrigin() {
  if (typeof window !== "undefined") {
    return normalizeOrigin(window.location.origin);
  }

  return null;
}

export function getAuthCallbackUrl() {
  return buildAppUrl("/api/auth/callback", getBrowserAppOrigin());
}
