"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActivityGoal, ActivityType, ProgramSession } from "@/lib/types";

/** Marque la prochaine séance du programme comme faite ; si c'était la dernière,
 * l'objectif lui-même passe automatiquement à "complété". */
export async function completeNextSession(id: string) {
  const supabase = createServerSupabaseClient();
  const { data: goal, error: fetchError } = await supabase
    .from("activity_goals")
    .select("program, program_progress")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const program = (goal.program ?? []) as { title: string }[];
  const nextProgress = Math.min(goal.program_progress + 1, program.length);
  const isLastSession = nextProgress >= program.length;

  const { error } = await supabase
    .from("activity_goals")
    .update({
      program_progress: nextProgress,
      ...(isLastSession ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function listActivityGoals(): Promise<ActivityGoal[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("activity_goals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createActivityGoal(
  label: string,
  type: ActivityType,
  program?: ProgramSession[]
) {
  const cleanLabel = label.trim();
  if (cleanLabel === "") throw new Error("Le libellé est requis.");
  if (type !== "course" && type !== "marche" && type !== "velo") throw new Error("Type invalide.");

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("activity_goals")
    .insert({ label: cleanLabel, type, program: program && program.length > 0 ? program : null });
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
