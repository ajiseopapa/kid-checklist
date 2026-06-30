import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/**
 * 브라우저 환경에서 Supabase 클라이언트를 생성합니다.
 * 컴포넌트 본문에서 호출돼도 안전하도록, 클라이언트가 처음 만들어진 뒤에는
 * 같은 인스턴스를 재사용합니다(싱글톤).
 */
export function createClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
