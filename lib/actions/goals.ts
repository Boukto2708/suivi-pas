"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { StepGoal } from "@/lib/types";

export async function getGoalForYear(year: number): Promise<StepGoal | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("step_goals")
    .select("*")
    .eq("year", year)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function setGoalForYear(year: number, targetSteps: number) {
  if (!Number.isFinite(targetSteps) || targetSteps <= 0) {
    throw new Error("L'objectif doit être un nombre positif.");
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("step_goals")
    .upsert(
      { year, target_steps: Math.round(targetSteps), updated_at: new Date().toISOString() },
      { onConflict: "year" }
    );
  if (error) throw new Error(error.message);

  revalidatePath("/");
}
