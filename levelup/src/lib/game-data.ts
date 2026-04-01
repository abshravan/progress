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

// ===== BADGES =====
export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  check: (stats: BadgeStats) => boolean;
}

export interface BadgeStats {
  totalXP: number;
  level: number;
  streak: number;
  longestStreak: number;
  totalQuests: number;
  totalGoals: number;
  totalJournalEntries: number;
  totalPomodoroSessions: number;
  daysActive: number;
}

export const BADGES: BadgeDef[] = [
  { id: "first-quest", name: "First Steps", description: "Complete your first quest", icon: "🌱", color: "#73daca", check: (s) => s.totalQuests >= 1 },
  { id: "streak-3", name: "Momentum", description: "Reach a 3-day streak", icon: "🔥", color: "#e8a849", check: (s) => s.longestStreak >= 3 },
  { id: "streak-7", name: "On Fire", description: "Reach a 7-day streak", icon: "🔥", color: "#f7768e", check: (s) => s.longestStreak >= 7 },
  { id: "streak-30", name: "Unstoppable", description: "Reach a 30-day streak", icon: "💎", color: "#9d7cd8", check: (s) => s.longestStreak >= 30 },
  { id: "quests-10", name: "Quest Hunter", description: "Complete 10 quests", icon: "⚔️", color: "#e8a849", check: (s) => s.totalQuests >= 10 },
  { id: "quests-50", name: "Quest Master", description: "Complete 50 quests", icon: "🏹", color: "#9d7cd8", check: (s) => s.totalQuests >= 50 },
  { id: "quests-100", name: "Century", description: "Complete 100 quests", icon: "💯", color: "#f7768e", check: (s) => s.totalQuests >= 100 },
  { id: "quests-500", name: "Legendary", description: "Complete 500 quests", icon: "👑", color: "#e8a849", check: (s) => s.totalQuests >= 500 },
  { id: "goal-1", name: "Goal Setter", description: "Complete your first goal", icon: "🎯", color: "#73daca", check: (s) => s.totalGoals >= 1 },
  { id: "goals-5", name: "Goal Crusher", description: "Complete 5 goals", icon: "🏆", color: "#e8a849", check: (s) => s.totalGoals >= 5 },
  { id: "journal-1", name: "Dear Diary", description: "Write your first journal entry", icon: "📝", color: "#7aa2f7", check: (s) => s.totalJournalEntries >= 1 },
  { id: "journal-10", name: "Reflector", description: "Write 10 journal entries", icon: "📖", color: "#9d7cd8", check: (s) => s.totalJournalEntries >= 10 },
  { id: "journal-50", name: "Chronicler", description: "Write 50 journal entries", icon: "📚", color: "#e8a849", check: (s) => s.totalJournalEntries >= 50 },
  { id: "level-5", name: "Rising Star", description: "Reach Level 5", icon: "⭐", color: "#e8a849", check: (s) => s.level >= 5 },
  { id: "level-10", name: "Veteran", description: "Reach Level 10", icon: "🌟", color: "#9d7cd8", check: (s) => s.level >= 10 },
  { id: "level-15", name: "Elite", description: "Reach Level 15", icon: "💫", color: "#f7768e", check: (s) => s.level >= 15 },
  { id: "xp-1000", name: "XP Hoarder", description: "Earn 1,000 total XP", icon: "💰", color: "#e8a849", check: (s) => s.totalXP >= 1000 },
  { id: "xp-10000", name: "XP Tycoon", description: "Earn 10,000 total XP", icon: "🏦", color: "#9d7cd8", check: (s) => s.totalXP >= 10000 },
  { id: "pomodoro-1", name: "Focus Mode", description: "Complete your first Pomodoro", icon: "🍅", color: "#f7768e", check: (s) => s.totalPomodoroSessions >= 1 },
  { id: "pomodoro-10", name: "Deep Worker", description: "Complete 10 Pomodoros", icon: "🧠", color: "#9d7cd8", check: (s) => s.totalPomodoroSessions >= 10 },
  { id: "days-7", name: "Week Warrior", description: "Be active for 7 days", icon: "📅", color: "#73daca", check: (s) => s.daysActive >= 7 },
  { id: "days-30", name: "Monthly Master", description: "Be active for 30 days", icon: "🗓️", color: "#7aa2f7", check: (s) => s.daysActive >= 30 },
];

// ===== WEEKLY CHALLENGES =====
export interface ChallengeTemplate {
  title: string;
  description: string;
  target: number;
  xpReward: number;
  type: "quests" | "journal" | "goals" | "category" | "streak" | "pomodoro";
  category?: Category;
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  { title: "Quest Blitz", description: "Complete 15 quests this week", target: 15, xpReward: 75, type: "quests" },
  { title: "Perfect Week", description: "Complete all quests for 5 days", target: 5, xpReward: 150, type: "streak" },
  { title: "Journaling Habit", description: "Write 3 journal entries this week", target: 3, xpReward: 50, type: "journal" },
  { title: "Deep Journals", description: "Write 5 journal entries this week", target: 5, xpReward: 100, type: "journal" },
  { title: "Productivity Push", description: "Complete 8 productivity quests", target: 8, xpReward: 60, type: "category", category: "productivity" },
  { title: "Learner's Path", description: "Complete 6 learning quests", target: 6, xpReward: 60, type: "category", category: "learning" },
  { title: "Health Focus", description: "Complete 8 health quests", target: 8, xpReward: 60, type: "category", category: "health" },
  { title: "Mind Over Matter", description: "Complete 6 mindset quests", target: 6, xpReward: 60, type: "category", category: "mindset" },
  { title: "Goal Progress", description: "Make progress on 2 goals this week", target: 2, xpReward: 80, type: "goals" },
  { title: "Focus Sprint", description: "Complete 3 Pomodoro sessions", target: 3, xpReward: 60, type: "pomodoro" },
  { title: "Focus Marathon", description: "Complete 7 Pomodoro sessions", target: 7, xpReward: 120, type: "pomodoro" },
  { title: "Quest Storm", description: "Complete 25 quests this week", target: 25, xpReward: 120, type: "quests" },
];

export function getWeekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split("T")[0];
}

export function pickWeeklyChallenges(seed: string): ChallengeTemplate[] {
  // Deterministic pseudo-random from week string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  const shuffled = [...CHALLENGE_TEMPLATES].sort((a, b) => {
    const ha = ((hash * 31 + a.title.charCodeAt(0)) | 0) % 100;
    const hb = ((hash * 31 + b.title.charCodeAt(0)) | 0) % 100;
    return ha - hb;
  });
  return shuffled.slice(0, 3);
}

// ===== THEME DEFINITIONS =====
export const THEMES = {
  "tokyo-night": {
    name: "Tokyo Night",
    preview: ["#191919", "#252525", "#e8a849", "#9d7cd8"],
    vars: {} // default, no overrides needed
  },
  "light": {
    name: "Light",
    preview: ["#ffffff", "#f5f5f5", "#d97706", "#7c3aed"],
    vars: {
      "--background": "#f8f8f8",
      "--foreground": "#1a1a1a",
      "--sidebar": "#f0f0f0",
      "--card": "#ffffff",
      "--card-hover": "#f5f5f5",
      "--border": "#e0e0e0",
      "--border-light": "#ebebeb",
      "--text-primary": "#1a1a1a",
      "--text-secondary": "#555",
      "--text-muted": "#888",
      "--accent": "#d97706",
      "--accent-dim": "rgba(217, 119, 6, 0.1)",
      "--purple": "#7c3aed",
      "--purple-dim": "rgba(124, 58, 237, 0.1)",
      "--green": "#059669",
      "--green-dim": "rgba(5, 150, 105, 0.1)",
      "--pink": "#db2777",
      "--pink-dim": "rgba(219, 39, 119, 0.1)",
      "--blue": "#2563eb",
      "--blue-dim": "rgba(37, 99, 235, 0.1)",
    }
  },
  "dracula": {
    name: "Dracula",
    preview: ["#282a36", "#44475a", "#f1fa8c", "#bd93f9"],
    vars: {
      "--background": "#282a36",
      "--foreground": "#f8f8f2",
      "--sidebar": "#21222c",
      "--card": "#44475a",
      "--card-hover": "#4d5066",
      "--border": "#6272a4",
      "--border-light": "#3a3c4e",
      "--text-primary": "#f8f8f2",
      "--text-secondary": "#b4b8cf",
      "--text-muted": "#6272a4",
      "--accent": "#f1fa8c",
      "--accent-dim": "rgba(241, 250, 140, 0.12)",
      "--purple": "#bd93f9",
      "--purple-dim": "rgba(189, 147, 249, 0.12)",
      "--green": "#50fa7b",
      "--green-dim": "rgba(80, 250, 123, 0.12)",
      "--pink": "#ff79c6",
      "--pink-dim": "rgba(255, 121, 198, 0.12)",
      "--blue": "#8be9fd",
      "--blue-dim": "rgba(139, 233, 253, 0.12)",
    }
  },
  "nord": {
    name: "Nord",
    preview: ["#2e3440", "#3b4252", "#ebcb8b", "#b48ead"],
    vars: {
      "--background": "#2e3440",
      "--foreground": "#eceff4",
      "--sidebar": "#2a2f3a",
      "--card": "#3b4252",
      "--card-hover": "#434c5e",
      "--border": "#4c566a",
      "--border-light": "#3b4252",
      "--text-primary": "#eceff4",
      "--text-secondary": "#d8dee9",
      "--text-muted": "#6b7d98",
      "--accent": "#ebcb8b",
      "--accent-dim": "rgba(235, 203, 139, 0.12)",
      "--purple": "#b48ead",
      "--purple-dim": "rgba(180, 142, 173, 0.12)",
      "--green": "#a3be8c",
      "--green-dim": "rgba(163, 190, 140, 0.12)",
      "--pink": "#bf616a",
      "--pink-dim": "rgba(191, 97, 106, 0.12)",
      "--blue": "#88c0d0",
      "--blue-dim": "rgba(136, 192, 208, 0.12)",
    }
  },
  "catppuccin": {
    name: "Catppuccin",
    preview: ["#1e1e2e", "#313244", "#f9e2af", "#cba6f7"],
    vars: {
      "--background": "#1e1e2e",
      "--foreground": "#cdd6f4",
      "--sidebar": "#181825",
      "--card": "#313244",
      "--card-hover": "#3a3b50",
      "--border": "#45475a",
      "--border-light": "#313244",
      "--text-primary": "#cdd6f4",
      "--text-secondary": "#a6adc8",
      "--text-muted": "#6c7086",
      "--accent": "#f9e2af",
      "--accent-dim": "rgba(249, 226, 175, 0.12)",
      "--purple": "#cba6f7",
      "--purple-dim": "rgba(203, 166, 247, 0.12)",
      "--green": "#a6e3a1",
      "--green-dim": "rgba(166, 227, 161, 0.12)",
      "--pink": "#f38ba8",
      "--pink-dim": "rgba(243, 139, 168, 0.12)",
      "--blue": "#89b4fa",
      "--blue-dim": "rgba(137, 180, 250, 0.12)",
    }
  },
} as const;
