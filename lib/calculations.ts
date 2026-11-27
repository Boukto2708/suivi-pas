import type { StepEntry, StepGoal } from "./types";

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

export function daysLeftInYear(year: number): number {
  const today = new Date();
  if (today.getFullYear() !== year) return 0;
  const endOfYear = new Date(year, 11, 31);
  const diffDays = Math.round((endOfYear.getTime() - today.getTime()) / 86400000);
  return Math.max(0, diffDays + 1);
}

export function dailyPaceNeeded(remaining: number, daysLeft: number): number {
  if (remaining <= 0 || daysLeft <= 0) return 0;
  return Math.ceil(remaining / daysLeft);
}
