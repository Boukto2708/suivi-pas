import { getGoalForYear } from "@/lib/actions/goals";
import { listEntriesForYear } from "@/lib/actions/entries";
import { listActivityGoals } from "@/lib/actions/activityGoals";
import { listRewards } from "@/lib/actions/rewards";
import { completedGoalsCount, computeStreak, currentYear } from "@/lib/calculations";
import { GoalSetup } from "@/components/GoalSetup";
import { ProgressDisplay } from "@/components/ProgressDisplay";
import { AddStepsForm } from "@/components/AddStepsForm";
import { EntriesHistory } from "@/components/EntriesHistory";
import { ActivityGoalsSection } from "@/components/ActivityGoalsSection";
import { RewardsSection } from "@/components/RewardsSection";
import { ConfettiOverlay } from "@/components/Confetti";

export const dynamic = "force-dynamic";

export default async function Home() {
  const year = currentYear();
  const [goal, entries, activityGoals, rewards] = await Promise.all([
    getGoalForYear(year),
    listEntriesForYear(year),
    listActivityGoals(),
    listRewards(),
  ]);
  const streak = computeStreak(activityGoals);
  const completedCount = completedGoalsCount(activityGoals);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
      <ConfettiOverlay />
      <h1 className="text-center text-4xl font-bold">
        🏃{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(90deg, var(--accent), var(--course))" }}
        >
          Bastide summerbody
        </span>
      </h1>

      {!goal ? (
        <GoalSetup year={year} />
      ) : (
        <>
          <ProgressDisplay goal={goal} entries={entries} />
          <GoalSetup year={year} currentTarget={goal.target_steps} compact />
          <h2 className="text-2xl font-semibold mt-2">📅 Historique</h2>
          <EntriesHistory entries={entries} />
        </>
      )}

      <ActivityGoalsSection goals={activityGoals} streak={streak} />
      <RewardsSection rewards={rewards} completedCount={completedCount} />

      {goal && <AddStepsForm year={year} />}
    </main>
  );
}
