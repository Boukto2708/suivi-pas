"use client";

import { useState, useTransition } from "react";
import { deleteStepEntry } from "@/lib/actions/entries";
import type { StepEntry } from "@/lib/types";

function formatSteps(n: number): string {
  return n.toLocaleString("fr-FR");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export function EntriesHistory({ entries }: { entries: StepEntry[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Supprimer cette entrée ?")) return;
    setPendingId(id);
    startTransition(async () => {
      await deleteStepEntry(id);
      setPendingId(null);
    });
  }

  if (entries.length === 0) {
    return (
      <p className="text-lg text-muted text-center py-6">
        Aucune entrée pour l&apos;instant. Ajoute tes premiers pas !
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4"
        >
          <div>
            <p className="text-2xl font-mono tabular-nums font-semibold">
              {formatSteps(entry.steps)} pas
            </p>
            <p className="text-lg text-muted">
              {formatDate(entry.date)}
              {entry.note ? ` — ${entry.note}` : ""}
            </p>
          </div>
          <button
            onClick={() => handleDelete(entry.id)}
            disabled={isPending && pendingId === entry.id}
            aria-label="Supprimer"
            className="shrink-0 rounded-lg border border-border px-4 py-3 text-xl text-red-600 disabled:opacity-60"
          >
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  );
}
