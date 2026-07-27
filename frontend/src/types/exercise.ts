export interface ExerciseCreate {
  name: string;
  muscle_group: string | null;
}

export interface ExerciseUpdate {
  name?: string;
  muscle_group?: string | null;
}

export interface ExerciseOut {
  id: number;
  name: string;
  muscle_group: string | null;
  created_at: string;
}
