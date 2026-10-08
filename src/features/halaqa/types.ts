// Mirrors app/api/v1/endpoints/halaqa.py's response models.

export interface Halaqa {
  id: string;
  name: string;
  join_code: string;
  created_at: string;
}

export interface MyHalaqasResponse {
  teaching: Halaqa[];
  studying: Halaqa[];
}

export interface StudentSummary {
  student_id: string;
  username: string;
  joined_at: string;
  session_count: number;
  correct_count: number;
  correct_rate: number | null;
}

export interface HalaqaMistake {
  type: string;
  expected: string;
  recited: string;
  position: number;
}

export interface StudentSession {
  session_id: string;
  surah_number: number;
  ayah_number: number;
  transcript: string;
  mistake_count: number;
  is_correct: boolean;
  is_duplicate_submission: boolean;
  created_at: string;
  mistakes: HalaqaMistake[];
}
