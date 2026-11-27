"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActivityGoal, ActivityType } from "@/lib/types";

export async function listActivityGoals(): Promise<ActivityGoal[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("activity_goals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createActivityGoal(label: string, type: ActivityType) {
  const cleanLabel = label.trim();
  if (cleanLabel === "") throw new Error("Le libellé est requis.");
  if (type !== "course" && type !== "marche") throw new Error("Type invalide.");

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("activity_goals").insert({ label: cleanLabel, type });
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function setActivityGoalCompleted(id: string, completed: boolean) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("activity_goals")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function deleteActivityGoal(id: string) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("activity_goals").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}
