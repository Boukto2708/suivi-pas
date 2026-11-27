"use client";

import { useState } from "react";
import { addStepEntry } from "@/lib/actions/entries";

function todayIso(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function AddStepsForm({ year }: { year: number }) {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState("");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(steps);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Entre un nombre de pas valide.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addStepEntry(year, date, value, note);
      setSteps("");
      setNote("");
      setDate(todayIso());
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
        + Ajouter des pas manuellement
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4"
    >
      <label htmlFor="steps" className="text-2xl font-semibold">
        J&apos;ai marché
      </label>
      <input
        id="steps"
        type="number"
        inputMode="numeric"
        min={1}
        placeholder="Ex: 10000"
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-5 py-5 text-4xl font-mono tabular-nums outline-none focus:border-accent"
        autoFocus
      />

      <label htmlFor="date" className="text-lg text-muted">
        Date
      </label>
      <input
        id="date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xl outline-none focus:border-accent"
      />

      <input
        type="text"
        placeholder="Note (facultatif)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xl outline-none focus:border-accent"
      />

      {error && <p className="text-lg text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl bg-accent px-6 py-5 text-3xl font-semibold text-accent-foreground disabled:opacity-60"
        >
          {saving ? "Ajout..." : "Ajouter"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-border px-6 py-5 text-2xl"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
