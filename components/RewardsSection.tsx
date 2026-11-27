"use client";

import { useState, useTransition } from "react";
import { createReward, deleteReward } from "@/lib/actions/rewards";
import type { Reward } from "@/lib/types";

function AddRewardForm() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [threshold, setThreshold] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const thresholdValue = Number(threshold);
    if (label.trim() === "" || !Number.isFinite(thresholdValue) || thresholdValue <= 0) {
      setError("Indique un libellé et un nombre d'objectifs valide.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createReward(label, thresholdValue);
      setLabel("");
      setThreshold("");
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
        + Ajouter une récompense
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
      <input
        type="text"
        placeholder="Ex: Un bon resto"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-xl outline-none focus:border-accent"
        autoFocus
      />
      <input
        type="number"
        inputMode="numeric"
        min={1}
        placeholder="Nombre d'objectifs complétés pour l'obtenir"
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-xl outline-none focus:border-accent"
      />
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

export function RewardsSection({
  rewards,
  completedCount,
}: {
  rewards: Reward[];
  completedCount: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Supprimer cette récompense ?")) return;
    startTransition(async () => {
      await deleteReward(id);
    });
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">🎁 Récompenses</h2>

      {rewards.length === 0 ? (
        <p className="text-lg text-muted text-center py-2">Aucune récompense définie pour l&apos;instant.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rewards.map((reward) => {
            const unlocked = completedCount >= reward.threshold;
            const pct = Math.min(100, (completedCount / reward.threshold) * 100);
            return (
              <li
                key={reward.id}
                className="rounded-xl border px-5 py-4 flex flex-col gap-2"
                style={
                  unlocked
                    ? {
                        borderColor: "var(--amber)",
                        background: "linear-gradient(135deg, color-mix(in srgb, var(--amber) 18%, transparent), color-mix(in srgb, var(--amber-soft) 18%, transparent))",
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xl font-semibold">
                    {unlocked ? "🏆 " : ""}
                    {reward.label}
                  </p>
                  <button
                    onClick={() => handleDelete(reward.id)}
                    disabled={isPending}
                    className="shrink-0 text-lg text-red-600 disabled:opacity-60"
                  >
                    Suppr.
                  </button>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: unlocked
                        ? "linear-gradient(90deg, var(--amber), var(--amber-soft))"
                        : "linear-gradient(90deg, var(--course), var(--accent))",
                    }}
                  />
                </div>
                <p className="text-lg text-muted">
                  {unlocked ? "Débloquée !" : `${completedCount} / ${reward.threshold} objectifs complétés`}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <AddRewardForm />
    </div>
  );
}
