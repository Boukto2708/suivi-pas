"use client";

import { useState } from "react";
import { setGoalForYear } from "@/lib/actions/goals";

function formatSteps(n: number): string {
  return n.toLocaleString("fr-FR");
}

export function GoalSetup({
  year,
  currentTarget,
  compact = false,
}: {
  year: number;
  currentTarget?: number;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(!compact);
  const [value, setValue] = useState(currentTarget ? String(currentTarget) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = Number(value);
    if (!Number.isFinite(target) || target <= 0) {
      setError("Entre un nombre de pas valide.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await setGoalForYear(year, target);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  if (compact && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-lg text-muted underline underline-offset-4"
      >
        Modifier l&apos;objectif {year}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4"
    >
      <label htmlFor="target" className="text-2xl font-semibold">
        Objectif de pas pour {year}
      </label>
      <input
        id="target"
        type="number"
        inputMode="numeric"
        min={1}
        placeholder="Ex: 3650000"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-5 py-4 text-3xl font-mono tabular-nums outline-none focus:border-accent"
        autoFocus
      />
      {value && Number(value) > 0 && (
        <p className="text-lg text-muted">
          Soit {formatSteps(Number(value))} pas sur l&apos;année.
        </p>
      )}
      {error && <p className="text-lg text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl bg-accent px-6 py-4 text-2xl font-semibold text-accent-foreground disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : "Valider"}
        </button>
        {compact && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl border border-border px-6 py-4 text-2xl"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
