import type { ActivityGoal, StepEntry, StepGoal } from "./types";

function utcMidnight(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day));
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function currentYear(): number {
  return new Date().getFullYear();
}

export function totalStepsWalked(entries: StepEntry[]): number {
  return entries.reduce((sum, e) => sum + e.steps, 0);
}

export function remainingSteps(goal: StepGoal, entries: StepEntry[]): number {
  return Math.max(0, goal.target_steps - totalStepsWalked(entries));
}

export function progressPercent(goal: StepGoal, entries: StepEntry[]): number {
  if (goal.target_steps <= 0) return 0;
  const pct = (totalStepsWalked(entries) / goal.target_steps) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function completedGoalsCount(goals: ActivityGoal[]): number {
  return goals.filter((g) => g.completed_at !== null).length;
}

/** Jours consécutifs (jusqu'à aujourd'hui inclus) avec au moins un objectif coché.
 * Aujourd'hui ne casse pas la série tant qu'il n'est pas terminé : si rien n'est
 * encore coché aujourd'hui mais que hier l'était, la série reste affichée. */
export function computeStreak(goals: ActivityGoal[], now: Date = new Date()): number {
  const completedDates = new Set(
    goals.filter((g) => g.completed_at !== null).map((g) => toIsoDate(new Date(g.completed_at!)))
  );
  if (completedDates.size === 0) return 0;

  let cursor = utcMidnight(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (!completedDates.has(toIsoDate(cursor))) {
    cursor = utcMidnight(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() - 1);
    if (!completedDates.has(toIsoDate(cursor))) return 0;
  }

  let streak = 0;
  while (completedDates.has(toIsoDate(cursor))) {
    streak++;
    cursor = utcMidnight(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() - 1);
  }
  return streak;
}
