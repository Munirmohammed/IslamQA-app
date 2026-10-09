// Mirrors app/api/v1/endpoints/audio.py's response models.

export interface Reciter {
  id: number;
  name: string;
  style: string | null;
}

export interface AudioUrlResponse {
  url: string;
}
