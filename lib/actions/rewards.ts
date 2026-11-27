"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Reward } from "@/lib/types";

export async function listRewards(): Promise<Reward[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .order("threshold", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createReward(label: string, threshold: number) {
  const cleanLabel = label.trim();
  if (cleanLabel === "") throw new Error("Le libellé est requis.");
  if (!Number.isFinite(threshold) || threshold <= 0) {
    throw new Error("Le seuil doit être un nombre positif.");
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("rewards")
    .insert({ label: cleanLabel, threshold: Math.round(threshold) });
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function deleteReward(id: string) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("rewards").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}
