// Mirrors app/api/v1/endpoints/tajweed.py's response models.

export interface TajweedRule {
  rule: string;
  name: string;
  description: string | null;
  start: number;
  end: number;
  text: string;
}

export interface TajweedAyahResponse {
  surah: number;
  ayah: number;
  plain_text: string;
  rules: TajweedRule[];
}

export interface TajweedRuleInfo {
  rule: string;
  name: string;
  description: string;
}
