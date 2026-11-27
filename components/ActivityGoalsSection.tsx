"use client";

import { useState, useTransition } from "react";
import { completeNextSession, deleteActivityGoal, setActivityGoalCompleted } from "@/lib/actions/activityGoals";
import { ACTIVITY_TYPE_LABELS, type ActivityGoal } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function PendingGoalItem({
  goal,
  isPending,
  onComplete,
  onCompleteSession,
}: {
  goal: ActivityGoal;
  isPending: boolean;
  onComplete: () => void;
  onCompleteSession: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [showFullProgram, setShowFullProgram] = useState(false);
  const program = goal.program;

  return (
    <li className="rounded-xl border border-border bg-background overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <p className="text-xl font-semibold">{goal.label}</p>
        <span className="shrink-0 text-muted text-xl">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-5 pb-4 flex flex-col gap-3">
          {!program || program.length === 0 ? (
            <>
              <p className="text-lg text-muted">{ACTIVITY_TYPE_LABELS[goal.type]}</p>
              <button
                onClick={onComplete}
                disabled={isPending}
                className="w-full rounded-lg bg-accent px-5 py-3 text-xl font-semibold text-accent-foreground disabled:opacity-60"
              >
                ✓ Fait
              </button>
            </>
          ) : (
            <>
              <p className="text-lg text-muted">
                {ACTIVITY_TYPE_LABELS[goal.type]} — Séance {goal.program_progress + 1}/{program.length}
              </p>

              <div className="rounded-lg bg-surface border border-border px-4 py-3">
                <p className="text-lg font-semibold">
                  {program[goal.program_progress].title}{" "}
                  <span className="text-muted font-normal">({program[goal.program_progress].duration})</span>
                </p>
                <p className="text-lg text-muted mt-1">{program[goal.program_progress].detail}</p>
              </div>

              <button
                onClick={() => setShowFullProgram((v) => !v)}
                className="text-lg text-muted underline underline-offset-4 self-start"
              >
                {showFullProgram ? "Masquer le programme complet" : "Voir le programme complet"}
              </button>

              {showFullProgram && (
                <ul className="flex flex-col gap-2">
                  {program.map((session, i) => (
                    <li
                      key={i}
                      className={`text-lg px-3 py-2 rounded-lg ${
                        i < goal.program_progress
                          ? "text-muted line-through"
                          : i === goal.program_progress
                            ? "font-semibold"
                            : "text-muted"
                      }`}
                    >
                      {session.title} ({session.duration})
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={onCompleteSession}
                disabled={isPending}
                className="w-full rounded-lg bg-accent px-5 py-3 text-xl font-semibold text-accent-foreground disabled:opacity-60"
              >
                ✓ Séance faite
              </button>
            </>
          )}
        </div>
      )}
    </li>
  );
}

export function ActivityGoalsSection({ goals, streak }: { goals: ActivityGoal[]; streak: number }) {
  const [isPending, startTransition] = useTransition();

  const pending = goals.filter((g) => g.completed_at === null);
  const completed = goals.filter((g) => g.completed_at !== null);

  function toggle(id: string, completed: boolean) {
    startTransition(async () => {
      await setActivityGoalCompleted(id, completed);
    });
  }

  function completeSession(id: string) {
    startTransition(async () => {
      await completeNextSession(id);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Supprimer cet objectif ?")) return;
    startTransition(async () => {
      await deleteActivityGoal(id);
    });
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Défis courir / marcher</h2>
        {streak > 0 && (
          <span className="text-lg font-semibold text-accent whitespace-nowrap">
            🔥 {streak} {streak > 1 ? "jours" : "jour"}
          </span>
        )}
      </div>

      {pending.length > 0 && (
        <ul className="flex flex-col gap-3">
          {pending.map((goal) => (
            <PendingGoalItem
              key={goal.id}
              goal={goal}
              isPending={isPending}
              onComplete={() => toggle(goal.id, true)}
              onCompleteSession={() => completeSession(goal.id)}
            />
          ))}
        </ul>
      )}

      {completed.length > 0 && (
        <details>
          <summary className="cursor-pointer text-lg text-muted">
            {completed.length} objectif{completed.length > 1 ? "s" : ""} complété
            {completed.length > 1 ? "s" : ""}
          </summary>
          <ul className="flex flex-col gap-3 mt-3">
            {completed.map((goal) => (
              <li
                key={goal.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border px-5 py-4"
              >
                <div>
                  <p className="text-xl line-through text-muted">{goal.label}</p>
                  <p className="text-lg text-muted">
                    {ACTIVITY_TYPE_LABELS[goal.type]} — {formatDate(goal.completed_at!)}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => toggle(goal.id, false)}
                    disabled={isPending}
                    className="rounded-lg border border-border px-4 py-3 text-lg disabled:opacity-60"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    disabled={isPending}
                    className="rounded-lg border border-border px-4 py-3 text-lg text-red-600 disabled:opacity-60"
                  >
                    Suppr.
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
