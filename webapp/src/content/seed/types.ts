export interface SeedService {
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  /** CSV of onsite, remote, workshop */
  delivery: string;
  priceFrom?: string;
  priceNotes?: string;
  icon?: string;
  /** Slot length for the live scheduler, in minutes. */
  durationMinutes?: number;
  sortOrder: number;
}

export interface SeedFaq {
  question: string;
  answer: string;
  sortOrder: number;
}

export interface SeedArea {
  zone: string;
  suburb: string;
  sortOrder: number;
}

export interface SeedSetting {
  key: string;
  value: string;
}
