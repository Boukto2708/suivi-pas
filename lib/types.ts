export interface StepGoal {
  id: string;
  year: number;
  target_steps: number;
  created_at: string;
  updated_at: string;
}

export type StepEntrySource = "healthkit" | null;

export interface StepEntry {
  id: string;
  year: number;
  date: string;
  steps: number;
  note: string | null;
  source: StepEntrySource;
  created_at: string;
}

export type ActivityType = "course" | "marche";

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  course: "Course",
  marche: "Marche",
};

export interface ProgramSession {
  title: string;
  duration: string;
  detail: string;
}

export interface ActivityGoal {
  id: string;
  label: string;
  type: ActivityType;
  completed_at: string | null;
  program: ProgramSession[] | null;
  program_progress: number;
  created_at: string;
}

export interface Reward {
  id: string;
  label: string;
  threshold: number;
  created_at: string;
}
