import { getGoalForYear } from "@/lib/actions/goals";
import { listEntriesForYear } from "@/lib/actions/entries";
import { currentYear } from "@/lib/calculations";
import { GoalSetup } from "@/components/GoalSetup";
import { ProgressDisplay } from "@/components/ProgressDisplay";
import { AddStepsForm } from "@/components/AddStepsForm";
import { EntriesHistory } from "@/components/EntriesHistory";

export const dynamic = "force-dynamic";

export default async function Home() {
  const year = currentYear();
  const [goal, entries] = await Promise.all([getGoalForYear(year), listEntriesForYear(year)]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-center text-4xl font-bold">Suivi Pas {year}</h1>

      {!goal ? (
        <GoalSetup year={year} />
      ) : (
        <>
          <ProgressDisplay goal={goal} entries={entries} />
          <AddStepsForm year={year} />
          <GoalSetup year={year} currentTarget={goal.target_steps} compact />
          <h2 className="text-2xl font-semibold mt-2">Historique</h2>
          <EntriesHistory entries={entries} />
        </>
      )}
    </main>
  );
}
