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

// ===== DATA EXPORT/IMPORT =====
export function exportAllData(): string {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: loadProfile(),
    habits: loadHabits(),
    goals: loadGoals(),
    journal: loadJournal(),
    dailyLog: loadDailyLog(),
  };
  return JSON.stringify(data, null, 2);
}

export function downloadExport(): void {
  const data = exportAllData();
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `levelup-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data.profile || !data.habits) return false;
    if (data.profile) saveProfile(data.profile);
    if (data.habits) saveHabits(data.habits);
    if (data.goals) saveGoals(data.goals);
    if (data.journal) saveJournal(data.journal);
    if (data.dailyLog) saveDailyLog(data.dailyLog);
    return true;
  } catch {
    return false;
  }
}

// ===== PERSONAL RECORDS =====
export interface PersonalRecords {
  longestStreak: number;
  maxXPInDay: number;
  totalQuestsCompleted: number;
  totalJournalEntries: number;
  totalGoalsCompleted: number;
  mostProductiveDay: string;
}

export function calculateRecords(): PersonalRecords {
  const habits = loadHabits();
  const dailyLog = loadDailyLog();
  const journal = loadJournal();
  const goals = loadGoals();

  // Longest streak
  const dates = Object.keys(dailyLog).sort();
  let longestStreak = 0;
  let currentStreak = 0;
  let prevDate: Date | null = null;
  for (const dateStr of dates) {
    const log = dailyLog[dateStr];
    if (log && Object.values(log).some(Boolean)) {
      const d = new Date(dateStr + "T12:00:00");
      if (prevDate && d.getTime() - prevDate.getTime() === 86400000) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      if (currentStreak > longestStreak) longestStreak = currentStreak;
      prevDate = d;
    } else {
      currentStreak = 0;
      prevDate = null;
    }
  }

  // Max XP in a day & most productive day
  let maxXPInDay = 0;
  let mostProductiveDay = "";
  for (const dateStr of Object.keys(dailyLog)) {
    const log = dailyLog[dateStr];
    let dayXP = 0;
    for (const h of habits) {
      if (log[h.id]) dayXP += h.xp;
    }
    if (dayXP > maxXPInDay) {
      maxXPInDay = dayXP;
      mostProductiveDay = dateStr;
    }
  }

  // Total quests completed
  let totalQuestsCompleted = 0;
  for (const log of Object.values(dailyLog)) {
    totalQuestsCompleted += Object.values(log).filter(Boolean).length;
  }

  return {
    longestStreak,
    maxXPInDay,
    totalQuestsCompleted,
    totalJournalEntries: journal.length,
    totalGoalsCompleted: goals.filter((g) => g.completed).length,
    mostProductiveDay,
  };
}

// ===== SOUND EFFECTS =====
export function loadSoundEnabled(): boolean {
  return load<boolean>("levelup-sound-enabled", true);
}

export function saveSoundEnabled(enabled: boolean): void {
  save("levelup-sound-enabled", enabled);
}

// ===== DAILY BONUS =====
export function loadDailyBonusClaimed(): Record<string, boolean> {
  return load<Record<string, boolean>>("levelup-daily-bonus", {});
}

export function saveDailyBonusClaimed(data: Record<string, boolean>): void {
  save("levelup-daily-bonus", data);
}
