"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { StepEntry } from "@/lib/types";

export async function listEntriesForYear(year: number): Promise<StepEntry[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("step_entries")
    .select("*")
    .eq("year", year)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addStepEntry(year: number, date: string, steps: number, note: string) {
  if (!date) throw new Error("La date est requise.");
  if (!Number.isFinite(steps) || steps <= 0) {
    throw new Error("Le nombre de pas doit être un nombre positif.");
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("step_entries").insert({
    year,
    date,
    steps: Math.round(steps),
    note: note.trim() || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function deleteStepEntry(id: string) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("step_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}
