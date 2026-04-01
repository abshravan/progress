"use client";

import {
  type Habit,
  type DailyLog,
  type Goal,
  type Profile,
} from "@/lib/storage";
import {
  CATEGORIES,
  type Category,
  getTodayString,
  getLevelProgress,
  getTitle,
} from "@/lib/game-data";

interface Props {
  profile: Profile;
  habits: Habit[];
  dailyLog: DailyLog;
  goals: Goal[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({
  profile,
  habits,
  dailyLog,
  goals,
  onNavigate,
}: Props) {
  const today = getTodayString();
  const todayLog = dailyLog[today] || {};
  const completedToday = habits.filter((h) => todayLog[h.id]).length;
  const totalHabits = habits.length;
  const pct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const { level } = getLevelProgress(profile.xp);
  const title = getTitle(level);

  // Weekly XP data
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekXP = getWeeklyXP(habits, dailyLog);
  const maxWeekXP = Math.max(...weekXP, 1);

  // Category completion rates (last 7 days)
  const categoryRates = getCategoryRates(habits, dailyLog);

  // Active goals
  const activeGoals = goals.filter((g) => !g.completed).slice(0, 3);

  const motivational =
    pct === 0
      ? "Time to start your quests!"
      : pct < 50
        ? "Keep going, adventurer!"
        : pct < 100
          ? "Almost there, hero!"
          : "All quests complete! ⚡";

  return (
    <div className="space-y-4 pb-4">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-white">
          Welcome back, {profile.name}
        </h2>
        <p className="text-xs text-gray-500">
          Level {level} {title} · {profile.xp.toLocaleString()} XP
        </p>
      </div>

      {/* Completion Ring + Stats */}
      <div className="p-5 rounded-xl bg-[#12122A] border border-[#1E1E3E] flex items-center gap-6">
        {/* SVG Ring */}
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#1E1E3E"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#ring-gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${pct * 2.64} 264`}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-amber-400">{pct}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm text-white font-semibold">
            {completedToday}/{totalHabits} Quests Done
          </p>
          <p className="text-xs text-gray-500 mt-1">{motivational}</p>
        </div>
      </div>

      {/* Weekly XP Chart */}
      <div className="p-4 rounded-xl bg-[#12122A] border border-[#1E1E3E]">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">
          Weekly XP
        </h3>
        <div className="flex items-end gap-2 h-24">
          {weekXP.map((xp, i) => {
            const isToday = i === new Date().getDay();
            const height = Math.max((xp / maxWeekXP) * 100, 4);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-gray-500">
                  {xp > 0 ? xp : ""}
                </span>
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${height}%`,
                    background: isToday
                      ? "linear-gradient(180deg, #F59E0B, #D97706)"
                      : "linear-gradient(180deg, #2D2B55, #1E1E3E)",
                    boxShadow: isToday
                      ? "0 0 8px rgba(245, 158, 11, 0.3)"
                      : "none",
                  }}
                />
                <span
                  className="text-[9px]"
                  style={{
                    color: isToday ? "#F59E0B" : "#555",
                    fontWeight: isToday ? 700 : 400,
                  }}
                >
                  {weekDays[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill Radar */}
      <div className="p-4 rounded-xl bg-[#12122A] border border-[#1E1E3E]">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">
          Skill Radar
        </h3>
        <div className="flex justify-center">
          <svg viewBox="0 0 200 200" className="w-48 h-48">
            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((s) => (
              <polygon
                key={s}
                points={getRadarPoints(s)}
                fill="none"
                stroke="#1E1E3E"
                strokeWidth="0.5"
              />
            ))}
            {/* Axes */}
            {[0, 1, 2, 3].map((i) => {
              const angle = (Math.PI / 2) * i - Math.PI / 2;
              const x = 100 + Math.cos(angle) * 80;
              const y = 100 + Math.sin(angle) * 80;
              return (
                <line
                  key={i}
                  x1="100"
                  y1="100"
                  x2={x}
                  y2={y}
                  stroke="#1E1E3E"
                  strokeWidth="0.5"
                />
              );
            })}
            {/* Data polygon */}
            <polygon
              points={getRadarDataPoints(categoryRates)}
              fill="rgba(245, 158, 11, 0.15)"
              stroke="#F59E0B"
              strokeWidth="2"
            />
            {/* Category labels */}
            {(["productivity", "learning", "health", "mindset"] as Category[]).map(
              (cat, i) => {
                const angle = (Math.PI / 2) * i - Math.PI / 2;
                const x = 100 + Math.cos(angle) * 95;
                const y = 100 + Math.sin(angle) * 95;
                return (
                  <text
                    key={cat}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="14"
                  >
                    {CATEGORIES[cat].icon}
                  </text>
                );
              }
            )}
          </svg>
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="p-4 rounded-xl bg-[#12122A] border border-[#1E1E3E]">
          <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">
            Active Boss Battles
          </h3>
          <div className="space-y-2">
            {activeGoals.map((g) => (
              <div key={g.id} className="flex items-center gap-3">
                <span className="text-sm">🐉</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-white truncate block">
                    {g.title}
                  </span>
                  <div className="w-full h-1.5 rounded-full bg-[#0A0A1A] mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${g.progress}%`,
                        background: "linear-gradient(90deg, #8B5CF6, #6D28D9)",
                      }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-purple-400 font-bold shrink-0">
                  {g.progress}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Do Quests", icon: "⚔️", tab: "quests", color: "#F59E0B" },
          { label: "Set Goal", icon: "🐉", tab: "goals", color: "#8B5CF6" },
          { label: "Journal", icon: "📜", tab: "journal", color: "#10B981" },
          { label: "AI Coach", icon: "🧙", tab: "coach", color: "#EC4899" },
        ].map((action) => (
          <button
            key={action.tab}
            onClick={() => onNavigate(action.tab)}
            className="p-4 rounded-xl text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `${action.color}10`,
              border: `1px solid ${action.color}30`,
            }}
          >
            <div className="text-2xl mb-1">{action.icon}</div>
            <div className="text-xs font-semibold" style={{ color: action.color }}>
              {action.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function getWeeklyXP(habits: Habit[], dailyLog: DailyLog): number[] {
  const result: number[] = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay() + i);
    const dateStr = d.toISOString().split("T")[0];
    const log = dailyLog[dateStr] || {};
    result[i] = habits.reduce((sum, h) => (log[h.id] ? sum + h.xp : sum), 0);
  }
  return result;
}

function getCategoryRates(
  habits: Habit[],
  dailyLog: DailyLog
): Record<Category, number> {
  const categories: Category[] = [
    "productivity",
    "learning",
    "health",
    "mindset",
  ];
  const rates: Record<Category, number> = {
    productivity: 0,
    learning: 0,
    health: 0,
    mindset: 0,
  };
  const now = new Date();
  for (const cat of categories) {
    const catHabits = habits.filter((h) => h.category === cat);
    if (catHabits.length === 0) continue;
    let total = 0;
    let completed = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = dailyLog[dateStr] || {};
      for (const h of catHabits) {
        total++;
        if (log[h.id]) completed++;
      }
    }
    rates[cat] = total > 0 ? completed / total : 0;
  }
  return rates;
}

function getRadarPoints(scale: number): string {
  const categories = [0, 1, 2, 3];
  return categories
    .map((i) => {
      const angle = (Math.PI / 2) * i - Math.PI / 2;
      const x = 100 + Math.cos(angle) * 80 * scale;
      const y = 100 + Math.sin(angle) * 80 * scale;
      return `${x},${y}`;
    })
    .join(" ");
}

function getRadarDataPoints(rates: Record<Category, number>): string {
  const cats: Category[] = ["productivity", "learning", "health", "mindset"];
  return cats
    .map((cat, i) => {
      const angle = (Math.PI / 2) * i - Math.PI / 2;
      const r = Math.max(rates[cat], 0.05) * 80;
      const x = 100 + Math.cos(angle) * r;
      const y = 100 + Math.sin(angle) * r;
      return `${x},${y}`;
    })
    .join(" ");
}
