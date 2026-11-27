"use client";

import { useState, useTransition } from "react";
import {
  completeNextSession,
  createActivityGoal,
  deleteActivityGoal,
  setActivityGoalCompleted,
} from "@/lib/actions/activityGoals";
import { ACTIVITY_TYPE_LABELS, type ActivityGoal, type ActivityType } from "@/lib/types";

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
  const [expanded, setExpanded] = useState(false);
  const program = goal.program;

  if (!program || program.length === 0) {
    return (
      <li className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-5 py-4">
        <div>
          <p className="text-xl font-semibold">{goal.label}</p>
          <p className="text-lg text-muted">{ACTIVITY_TYPE_LABELS[goal.type]}</p>
        </div>
        <button
          onClick={onComplete}
          disabled={isPending}
          className="shrink-0 rounded-lg bg-accent px-5 py-3 text-xl font-semibold text-accent-foreground disabled:opacity-60"
        >
          ✓ Fait
        </button>
      </li>
    );
  }

  const currentSession = program[goal.program_progress];

  return (
    <li className="rounded-xl border border-border bg-background px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xl font-semibold">{goal.label}</p>
          <p className="text-lg text-muted">
            {ACTIVITY_TYPE_LABELS[goal.type]} — Séance {goal.program_progress + 1}/{program.length}
          </p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-lg text-muted underline underline-offset-4"
        >
          {expanded ? "Masquer" : "Voir le programme"}
        </button>
      </div>

      <div className="rounded-lg bg-surface border border-border px-4 py-3">
        <p className="text-lg font-semibold">
          {currentSession.title} <span className="text-muted font-normal">({currentSession.duration})</span>
        </p>
        <p className="text-lg text-muted mt-1">{currentSession.detail}</p>
      </div>

      {expanded && (
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
    </li>
  );
}

export function ActivityGoalsSection({ goals, streak }: { goals: ActivityGoal[]; streak: number }) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<ActivityType>("course");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const pending = goals.filter((g) => g.completed_at === null);
  const completed = goals.filter((g) => g.completed_at !== null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (label.trim() === "") {
      setError("Entre un libellé.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createActivityGoal(label, type);
      setLabel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout.");
    } finally {
      setSaving(false);
    }
  }

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

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Ex: Courir 20 minutes"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xl outline-none focus:border-accent"
        />
        <div className="flex gap-2">
          {(["course", "marche"] as ActivityType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 rounded-xl px-4 py-3 text-xl font-medium border ${
                type === t
                  ? "bg-accent text-accent-foreground border-accent"
                  : "border-border text-muted"
              }`}
            >
              {ACTIVITY_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        {error && <p className="text-lg text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-accent px-6 py-4 text-2xl font-semibold text-accent-foreground disabled:opacity-60"
        >
          {saving ? "Ajout..." : "Ajouter l'objectif"}
        </button>
      </form>

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
