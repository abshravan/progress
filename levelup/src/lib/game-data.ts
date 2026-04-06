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

// ===== XP MULTIPLIERS =====
export function getXPMultiplier(): { multiplier: number; label: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return { multiplier: 1.5, label: "Early Bird 1.5x" };
  if (hour >= 9 && hour < 12) return { multiplier: 1.25, label: "Morning Boost 1.25x" };
  return { multiplier: 1, label: "" };
}

// ===== QUOTE OF THE DAY =====
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "A year from now you will wish you had started today.", author: "Karen Lamb" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Consistency is what transforms average into excellence.", author: "Unknown" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Dream big. Start small. Act now.", author: "Robin Sharma" },
  { text: "Be stronger than your strongest excuse.", author: "Unknown" },
  { text: "One percent better every day.", author: "James Clear" },
  { text: "The pain of discipline is far less than the pain of regret.", author: "Sarah Bombell" },
  { text: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
];

export function getQuoteOfDay(): { text: string; author: string } {
  const today = getTodayString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
  return QUOTES[Math.abs(hash) % QUOTES.length];
}

// ===== DAILY TIPS =====
const TIPS = [
  "Try habit stacking — link a new habit to one you already do consistently.",
  "Start with the two-minute rule: scale any habit down to just two minutes.",
  "Track your wins, not just your failures. Progress is progress.",
  "Your environment shapes your habits more than willpower does.",
  "If you miss a day, never miss two in a row.",
  "Focus on identity, not outcomes. 'I am a reader' beats 'I want to read more.'",
  "The most effective habits are the ones you actually enjoy doing.",
  "Review your habits weekly — what's working and what isn't?",
  "Reward yourself immediately after completing a difficult habit.",
  "Morning routines compound. How you start your day shapes everything after.",
  "Break big goals into tiny daily actions. Systems beat goals.",
  "Remove friction for good habits, add friction for bad ones.",
  "Use implementation intentions: 'I will [habit] at [time] in [location].'",
  "Energy management matters more than time management.",
  "Rest is not the opposite of productivity — it's part of it.",
];

export function getDailyTip(): string {
  const today = getTodayString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) hash = ((hash << 7) - hash + today.charCodeAt(i)) | 0;
  return TIPS[Math.abs(hash) % TIPS.length];
}

// ===== HABIT SCHEDULING =====
export function isHabitActiveToday(habit: { frequency?: "daily" | "weekdays" | "weekends" | number[] }): boolean {
  if (!habit.frequency || habit.frequency === "daily") return true;
  const day = new Date().getDay(); // 0=Sun, 6=Sat
  if (habit.frequency === "weekdays") return day >= 1 && day <= 5;
  if (habit.frequency === "weekends") return day === 0 || day === 6;
  if (Array.isArray(habit.frequency)) return habit.frequency.includes(day);
  return true;
}

// ===== STREAK FREEZE COST =====
export const STREAK_FREEZE_COST = 200;

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

// ===== HABIT STREAKS =====
export function getHabitStreak(habitId: string, dailyLog: Record<string, Record<string, boolean>>): number {
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const log = dailyLog[dateStr];
    if (log && log[habitId]) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// ===== JOURNAL TEMPLATES =====
export interface JournalTemplate {
  id: string;
  name: string;
  icon: string;
  prompts: string[];
}

export const JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    id: "daily-review",
    name: "Daily Review",
    icon: "📋",
    prompts: [
      "What did I accomplish today?",
      "What challenged me?",
      "What am I grateful for?",
      "What will I focus on tomorrow?",
    ],
  },
  {
    id: "gratitude",
    name: "Gratitude",
    icon: "🙏",
    prompts: [
      "Three things I'm grateful for today:",
      "1. ",
      "2. ",
      "3. ",
      "\nSomeone who made my day better:",
    ],
  },
  {
    id: "reflection",
    name: "Weekly Reflection",
    icon: "🪞",
    prompts: [
      "This week's biggest win:",
      "Something I learned:",
      "A habit that's working well:",
      "Something I want to improve:",
      "My intention for next week:",
    ],
  },
  {
    id: "mood-check",
    name: "Mood Check-in",
    icon: "💭",
    prompts: [
      "How am I feeling right now?",
      "What's contributing to this mood?",
      "What would make today better?",
      "One kind thing I can do for myself:",
    ],
  },
  {
    id: "goal-progress",
    name: "Goal Progress",
    icon: "🎯",
    prompts: [
      "Goal I'm working toward:",
      "Progress I made today:",
      "Obstacles I'm facing:",
      "Next small step I can take:",
    ],
  },
];

// ===== MOOD FORECASTING =====
export function getMoodForecast(journal: { mood: number; date: string }[]): {
  trend: "improving" | "declining" | "stable";
  avgRecent: number;
  avgPrevious: number;
  prediction: string;
} {
  if (journal.length < 3) {
    return { trend: "stable", avgRecent: 2, avgPrevious: 2, prediction: "Keep journaling to unlock mood insights!" };
  }

  const sorted = [...journal].sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, Math.min(7, Math.floor(sorted.length / 2)));
  const previous = sorted.slice(recent.length, recent.length * 2);

  const avgRecent = recent.reduce((s, e) => s + e.mood, 0) / recent.length;
  const avgPrevious = previous.length > 0 ? previous.reduce((s, e) => s + e.mood, 0) / previous.length : avgRecent;

  const diff = avgRecent - avgPrevious;
  let trend: "improving" | "declining" | "stable";
  let prediction: string;

  if (diff > 0.3) {
    trend = "improving";
    prediction = "Your mood is trending upward! Keep doing what you're doing.";
  } else if (diff < -0.3) {
    trend = "declining";
    prediction = "Your mood has dipped recently. Consider taking extra care of yourself.";
  } else {
    trend = "stable";
    prediction = "Your mood has been steady. Consistency is its own reward.";
  }

  // Add specific advice based on patterns
  const recentMoods = recent.map((e) => e.mood);
  if (recentMoods.every((m) => m >= 3)) {
    prediction = "You've been feeling great consistently — you're in a great flow!";
  } else if (recentMoods.every((m) => m <= 1)) {
    prediction = "Rough patch detected. Small wins compound — try completing one easy quest today.";
  }

  return { trend, avgRecent: Math.round(avgRecent * 10) / 10, avgPrevious: Math.round(avgPrevious * 10) / 10, prediction };
}

// ===== XP SHOP =====
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: "title" | "cosmetic" | "perk";
  icon: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Titles
  { id: "title-warrior", name: "Warrior", description: "Custom title: Warrior", cost: 500, category: "title", icon: "⚔️" },
  { id: "title-sage", name: "Sage", description: "Custom title: Sage", cost: 500, category: "title", icon: "🧙" },
  { id: "title-phoenix", name: "Phoenix", description: "Custom title: Phoenix", cost: 1000, category: "title", icon: "🔥" },
  { id: "title-shadow", name: "Shadow", description: "Custom title: Shadow", cost: 1000, category: "title", icon: "🌑" },
  { id: "title-celestial", name: "Celestial", description: "Custom title: Celestial", cost: 2000, category: "title", icon: "✨" },
  { id: "title-eternal", name: "Eternal", description: "Custom title: Eternal", cost: 5000, category: "title", icon: "♾️" },
  // Cosmetics
  { id: "cosmetic-gold-border", name: "Gold Border", description: "Golden glow on your profile avatar", cost: 300, category: "cosmetic", icon: "👑" },
  { id: "cosmetic-rainbow-xp", name: "Rainbow XP Bar", description: "Animated rainbow XP progress bar", cost: 800, category: "cosmetic", icon: "🌈" },
  { id: "cosmetic-sparkle", name: "Sparkle Effect", description: "Sparkle animation on quest completion", cost: 600, category: "cosmetic", icon: "✦" },
  // Perks
  { id: "perk-double-bonus", name: "Double Daily Bonus", description: "Daily bonus XP is doubled for a week", cost: 1500, category: "perk", icon: "⚡" },
  { id: "perk-freeze-3pack", name: "Freeze 3-Pack", description: "Get 3 streak freezes at a discount", cost: 450, category: "perk", icon: "🧊" },
  { id: "perk-xp-boost", name: "XP Boost", description: "+10% XP for all quests permanently", cost: 3000, category: "perk", icon: "🚀" },
];

// ===== PRIORITY LABELS =====
export const PRIORITY_LABELS: Record<number, { label: string; color: string; icon: string }> = {
  1: { label: "P1", color: "#f7768e", icon: "🔴" },
  2: { label: "P2", color: "#e8a849", icon: "🟡" },
  3: { label: "P3", color: "#73daca", icon: "🟢" },
};

// ===== MONTHLY RECAP =====
export function getMonthlyRecap(
  dailyLog: Record<string, Record<string, boolean>>,
  habits: { id: string; xp: number; category: Category }[],
  journal: { date: string; mood: number }[],
  goals: { completed: boolean; createdAt: string }[],
  month?: string // YYYY-MM format, defaults to previous month
): {
  monthLabel: string;
  totalXP: number;
  questsCompleted: number;
  activeDays: number;
  totalDays: number;
  journalEntries: number;
  goalsCompleted: number;
  avgMood: number;
  bestCategory: string;
  bestDay: string;
  bestDayXP: number;
} {
  const now = new Date();
  const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;
  const [year, mon] = targetMonth.split("-").map(Number);
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const monthLabel = new Date(year, mon, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  let totalXP = 0;
  let questsCompleted = 0;
  let activeDays = 0;
  let bestDayXP = 0;
  let bestDay = "";
  const catXP: Record<string, number> = {};

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(mon + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const log = dailyLog[dateStr];
    if (!log) continue;
    const completedIds = Object.keys(log).filter((k) => log[k]);
    if (completedIds.length > 0) activeDays++;
    let dayXP = 0;
    for (const h of habits) {
      if (log[h.id]) {
        dayXP += h.xp;
        catXP[h.category] = (catXP[h.category] || 0) + h.xp;
      }
    }
    questsCompleted += completedIds.length;
    totalXP += dayXP;
    if (dayXP > bestDayXP) { bestDayXP = dayXP; bestDay = dateStr; }
  }

  const monthJournals = journal.filter((j) => j.date.startsWith(`${year}-${String(mon + 1).padStart(2, "0")}`));
  const avgMood = monthJournals.length > 0 ? monthJournals.reduce((s, j) => s + j.mood, 0) / monthJournals.length : -1;
  const monthGoals = goals.filter((g) => g.completed && g.createdAt.startsWith(`${year}-${String(mon + 1).padStart(2, "0")}`));

  const bestCategory = Object.entries(catXP).sort((a, b) => b[1] - a[1])[0]?.[0] || "none";

  return {
    monthLabel,
    totalXP,
    questsCompleted,
    activeDays,
    totalDays: daysInMonth,
    journalEntries: monthJournals.length,
    goalsCompleted: monthGoals.length,
    avgMood: Math.round(avgMood * 10) / 10,
    bestCategory,
    bestDay,
    bestDayXP,
  };
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
