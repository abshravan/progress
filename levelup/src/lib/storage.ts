export interface Profile {
  name: string;
  xp: number;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  category: "productivity" | "learning" | "health" | "mindset";
  xp: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  progress: number;
  completed: boolean;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  text: string;
  mood: number;
  date: string;
  time: string;
}

export type DailyLog = Record<string, Record<string, boolean>>;

const KEYS = {
  profile: "levelup-profile",
  habits: "levelup-habits",
  goals: "levelup-goals",
  journal: "levelup-journal",
  dailyLog: "levelup-daily-log",
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadProfile(): Profile | null {
  return load<Profile | null>(KEYS.profile, null);
}
export function saveProfile(p: Profile) {
  save(KEYS.profile, p);
}

export function loadHabits(): Habit[] {
  return load<Habit[]>(KEYS.habits, []);
}
export function saveHabits(h: Habit[]) {
  save(KEYS.habits, h);
}

export function loadGoals(): Goal[] {
  return load<Goal[]>(KEYS.goals, []);
}
export function saveGoals(g: Goal[]) {
  save(KEYS.goals, g);
}

export function loadJournal(): JournalEntry[] {
  return load<JournalEntry[]>(KEYS.journal, []);
}
export function saveJournal(j: JournalEntry[]) {
  save(KEYS.journal, j);
}

export function loadDailyLog(): DailyLog {
  return load<DailyLog>(KEYS.dailyLog, {});
}
export function saveDailyLog(d: DailyLog) {
  save(KEYS.dailyLog, d);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
