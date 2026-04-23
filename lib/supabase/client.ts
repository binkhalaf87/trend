import { createBrowserClient } from "@supabase/ssr";

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>;

function createMissingBrowserClient(): SupabaseBrowserClient {
  const fail = async () => {
    throw new Error("Supabase browser client is not configured");
  };

  return {
    auth: {
      signInWithOtp: fail,
      signInWithOAuth: fail,
      verifyOtp: fail,
    },
  } as unknown as SupabaseBrowserClient;
}

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return createMissingBrowserClient();
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
