"use client";

import { useState, useTransition } from "react";
import { createReward, deleteReward } from "@/lib/actions/rewards";
import type { Reward } from "@/lib/types";

export function RewardsSection({
  rewards,
  completedCount,
}: {
  rewards: Reward[];
  completedCount: number;
}) {
  const [label, setLabel] = useState("");
  const [threshold, setThreshold] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout.");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string) {
    if (!confirm("Supprimer cette récompense ?")) return;
    startTransition(async () => {
      await deleteReward(id);
    });
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">Récompenses</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Ex: Un bon resto"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xl outline-none focus:border-accent"
        />
        <input
          type="number"
          inputMode="numeric"
          min={1}
          placeholder="Nombre d'objectifs complétés pour l'obtenir"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xl outline-none focus:border-accent"
        />
        {error && <p className="text-lg text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-accent px-6 py-4 text-2xl font-semibold text-accent-foreground disabled:opacity-60"
        >
          {saving ? "Ajout..." : "Ajouter une récompense"}
        </button>
      </form>

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
                className={`rounded-xl border px-5 py-4 flex flex-col gap-2 ${
                  unlocked ? "border-accent bg-accent/10" : "border-border bg-background"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xl font-semibold">
                    {unlocked ? "🎉 " : ""}
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
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${pct}%` }}
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
    </div>
  );
}
