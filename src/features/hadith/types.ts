// Mirrors app/api/v1/endpoints/hadith.py's response models.

export interface HadithCollectionSummary {
  slug: string;
  name: string;
}

export interface HadithGrade {
  name: string;
  grade: string;
}

export interface HadithReference {
  book: number;
  hadith: number;
}

export interface Hadith {
  hadithnumber: number;
  arabicnumber: number;
  text: string;
  grades: HadithGrade[];
  reference: HadithReference;
}

export interface HadithPage {
  total: number;
  page: number;
  page_size: number;
  hadiths: Hadith[];
}
