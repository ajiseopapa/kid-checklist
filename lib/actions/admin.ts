"use server";

import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("admin_password")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return false;
  return data.admin_password === password;
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; message?: string }> {
  if (!newPassword || newPassword.length < 4) {
    return { ok: false, message: "비밀번호는 4자 이상으로 정해주세요" };
  }
  const valid = await verifyAdminPassword(currentPassword);
  if (!valid) {
    return { ok: false, message: "현재 비밀번호가 올바르지 않아요" };
  }
  const supabase = adminClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ admin_password: newPassword })
    .eq("id", 1);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
