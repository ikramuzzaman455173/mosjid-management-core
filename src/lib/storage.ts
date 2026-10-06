import { supabase } from "@/integrations/supabase/client";

const BUCKET = "mosque-files";

export async function uploadFile(
  folder: string,
  file: File,
): Promise<{ path: string; url: string }> {
  const ext = file.name.split(".").pop() ?? "bin";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}_${safeName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 365);
  return { path, url: data?.signedUrl ?? "" };
}

export async function deleteFile(path: string) {
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

export async function getSignedUrl(path: string, seconds = 3600): Promise<string> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, seconds);
  return data?.signedUrl ?? "";
}
