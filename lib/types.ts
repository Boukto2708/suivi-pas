export interface StepGoal {
  id: string;
  year: number;
  target_steps: number;
  created_at: string;
  updated_at: string;
}

export interface StepEntry {
  id: string;
  year: number;
  date: string;
  steps: number;
  note: string | null;
  created_at: string;
}
