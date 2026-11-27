import { progressPercent, remainingSteps, totalStepsWalked } from "@/lib/calculations";
import type { StepEntry, StepGoal } from "@/lib/types";

function formatSteps(n: number): string {
  return n.toLocaleString("fr-FR");
}

export function ProgressDisplay({ goal, entries }: { goal: StepGoal; entries: StepEntry[] }) {
  const remaining = remainingSteps(goal, entries);
  const walked = totalStepsWalked(entries);
  const pct = progressPercent(goal, entries);
  const reached = remaining <= 0;

  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4 relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: "linear-gradient(90deg, var(--accent), var(--course), var(--amber))" }}
      />
      <p className="text-xl text-muted">
        {reached ? `🎉 Objectif ${goal.year} atteint !` : `👣 Pas restants pour ${goal.year}`}
      </p>
      <p className="text-6xl font-bold font-mono tabular-nums text-accent">
        {formatSteps(remaining)}
      </p>

      <div className="h-4 w-full overflow-hidden rounded-full bg-background border border-border">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-soft))" }}
        />
      </div>
      <p className="text-lg text-muted">
        {formatSteps(walked)} pas faits sur {formatSteps(goal.target_steps)} ({pct.toFixed(1)} %)
      </p>
    </div>
  );
}
