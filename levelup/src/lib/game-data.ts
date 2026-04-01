// XP thresholds for 20 levels (exponential curve)
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600, 6000, 7800, 10000,
  13000, 17000, 22000, 28000, 36000, 46000, 60000,
];

export const TITLES = [
  "Novice",
  "Novice",
  "Apprentice",
  "Apprentice",
  "Journeyman",
  "Journeyman",
  "Adept",
  "Adept",
  "Expert",
  "Expert",
  "Veteran",
  "Veteran",
  "Master",
  "Master",
  "Grandmaster",
  "Grandmaster",
  "Legend",
  "Legend",
  "Mythic",
  "Mythic",
];

export function getLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getTitle(level: number): string {
  return TITLES[Math.min(level - 1, TITLES.length - 1)];
}

export function getLevelProgress(xp: number): {
  level: number;
  currentXP: number;
  nextThreshold: number;
  progress: number;
} {
  const level = getLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold =
    level < 20 ? LEVEL_THRESHOLDS[level] : LEVEL_THRESHOLDS[19];
  const currentXP = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  const progress = needed > 0 ? Math.min((currentXP / needed) * 100, 100) : 100;
  return { level, currentXP, nextThreshold: needed, progress };
}

export type Category = "productivity" | "learning" | "health" | "mindset";

export const CATEGORIES: Record<
  Category,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  productivity: {
    label: "Productivity",
    icon: "⚡",
    color: "#e8a849",
    bgColor: "rgba(232, 168, 73, 0.12)",
  },
  learning: {
    label: "Learning",
    icon: "📖",
    color: "#9d7cd8",
    bgColor: "rgba(157, 124, 216, 0.12)",
  },
  health: {
    label: "Health",
    icon: "💪",
    color: "#73daca",
    bgColor: "rgba(115, 218, 202, 0.12)",
  },
  mindset: {
    label: "Mindset",
    icon: "🧠",
    color: "#f7768e",
    bgColor: "rgba(247, 118, 142, 0.12)",
  },
};

export const PRESET_HABITS = [
  { name: "Deep Work Session", category: "productivity" as Category, xp: 30 },
  { name: "Clear Inbox Zero", category: "productivity" as Category, xp: 15 },
  { name: "Read 20 Pages", category: "learning" as Category, xp: 20 },
  { name: "Learn New Skill", category: "learning" as Category, xp: 25 },
  { name: "Workout", category: "health" as Category, xp: 30 },
  { name: "Drink 8 Glasses Water", category: "health" as Category, xp: 10 },
  { name: "Meditate 10 Min", category: "mindset" as Category, xp: 20 },
  { name: "Gratitude Journal", category: "mindset" as Category, xp: 15 },
];

export const MOODS = [
  { emoji: "😫", label: "Struggling" },
  { emoji: "😔", label: "Down" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😄", label: "Great" },
];

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}
