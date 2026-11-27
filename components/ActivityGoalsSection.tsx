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

const TYPE_BADGE_STYLE: Record<ActivityType, { bg: string; fg: string; emoji: string }> = {
  course: { bg: "var(--course)", fg: "var(--course-foreground)", emoji: "🏃" },
  marche: { bg: "var(--accent)", fg: "var(--accent-foreground)", emoji: "🚶" },
  velo: { bg: "var(--velo)", fg: "var(--velo-foreground)", emoji: "🚴" },
};

function TypeBadge({ type }: { type: ActivityType }) {
  const { bg, fg, emoji } = TYPE_BADGE_STYLE[type];
  return (
    <span
      className="inline-block rounded-full px-3 py-0.5 text-base font-medium"
      style={{ background: bg, color: fg }}
    >
      {emoji} {ACTIVITY_TYPE_LABELS[type]}
    </span>
  );
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
              <TypeBadge type={goal.type} />
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
              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={goal.type} />
                <span className="text-lg text-muted">
                  Séance {goal.program_progress + 1}/{program.length}
                </span>
              </div>

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

function AddGoalForm() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<ActivityType>("course");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-lg text-muted underline underline-offset-4 self-center"
      >
        + Ajouter un objectif personnalisé
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
      <input
        type="text"
        placeholder="Ex: Courir 20 minutes"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-xl outline-none focus:border-accent"
        autoFocus
      />
      <div className="flex gap-2">
        {(["course", "marche", "velo"] as ActivityType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className="flex-1 rounded-xl px-4 py-3 text-xl font-medium border"
            style={
              type === t
                ? {
                    background: TYPE_BADGE_STYLE[t].bg,
                    color: TYPE_BADGE_STYLE[t].fg,
                    borderColor: TYPE_BADGE_STYLE[t].bg,
                  }
                : { borderColor: "var(--border)", color: "var(--muted)" }
            }
          >
            {ACTIVITY_TYPE_LABELS[t]}
          </button>
        ))}
      </div>
      {error && <p className="text-lg text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl bg-accent px-6 py-3 text-xl font-semibold text-accent-foreground disabled:opacity-60"
        >
          {saving ? "Ajout..." : "Ajouter"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-border px-6 py-3 text-xl"
        >
          Annuler
        </button>
      </div>
    </form>
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
        <h2 className="text-2xl font-semibold">🏃 Défis courir / marcher</h2>
        {streak > 0 && (
          <span
            className="text-lg font-semibold whitespace-nowrap rounded-full px-3 py-1"
            style={{ background: "var(--amber)", color: "var(--amber-foreground)" }}
          >
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

      <AddGoalForm />
    </div>
  );
}
