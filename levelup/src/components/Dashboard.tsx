"use client";

import {
  type Habit,
  type DailyLog,
  type Goal,
  type Profile,
  type JournalEntry,
} from "@/lib/storage";
import {
  CATEGORIES,
  type Category,
  getTodayString,
  getLevelProgress,
  getTitle,
  MOODS,
} from "@/lib/game-data";

interface Props {
  profile: Profile;
  habits: Habit[];
  dailyLog: DailyLog;
  goals: Goal[];
  journal: JournalEntry[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({
  profile,
  habits,
  dailyLog,
  goals,
  journal,
  onNavigate,
}: Props) {
  const today = getTodayString();
  const todayLog = dailyLog[today] || {};
  const completedToday = habits.filter((h) => todayLog[h.id]).length;
  const totalHabits = habits.length;
  const pct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const { level } = getLevelProgress(profile.xp);
  const title = getTitle(level);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekXP = getWeeklyXP(habits, dailyLog);
  const maxWeekXP = Math.max(...weekXP, 1);
  const categoryRates = getCategoryRates(habits, dailyLog);
  const activeGoals = goals.filter((g) => !g.completed).slice(0, 3);
  const recentJournal = journal.slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Good {getGreetingTime()}, {profile.name}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Level {level} {title} &middot; {profile.xp.toLocaleString()} XP
        </p>
      </div>

      {/* Top row: Today's progress + Weekly XP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Today's Progress */}
        <div className="rounded-lg border border-[var(--border-light)] bg-[var(--card)] p-5">
          <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-4">
            Today&apos;s Progress
          </h3>
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-light)" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${pct * 2.51} 251`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold text-[var(--text-primary)]">{pct}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {completedToday} of {totalHabits} quests
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {pct === 100
                  ? "Perfect day! All quests complete."
                  : pct >= 50
                    ? "Great progress. Keep it up!"
                    : pct > 0
                      ? "You're on your way."
                      : "Start completing quests to earn XP."}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly XP */}
        <div className="rounded-lg border border-[var(--border-light)] bg-[var(--card)] p-5">
          <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-4">
            This Week
          </h3>
          <div className="flex items-end gap-1.5 h-16">
            {weekXP.map((xp, i) => {
              const isToday = i === new Date().getDay();
              const height = Math.max((xp / maxWeekXP) * 100, 6);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-sm transition-all duration-500"
                    style={{
                      height: `${height}%`,
                      background: isToday ? "var(--accent)" : "var(--border)",
                      opacity: isToday ? 1 : 0.6,
                    }}
                  />
                  <span className="text-[9px] text-[var(--text-muted)]" style={{ fontWeight: isToday ? 600 : 400, color: isToday ? "var(--accent)" : undefined }}>
                    {weekDays[i]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-[var(--border-light)]">
            <span className="text-[10px] text-[var(--text-muted)]">
              Total: {weekXP.reduce((a, b) => a + b, 0)} XP
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              Avg: {Math.round(weekXP.reduce((a, b) => a + b, 0) / 7)} XP/day
            </span>
          </div>
        </div>
      </div>

      {/* Second row: Skill Radar + Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Skill Radar */}
        <div className="rounded-lg border border-[var(--border-light)] bg-[var(--card)] p-5">
          <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-4">
            Skills (7-day)
          </h3>
          <div className="flex justify-center">
            <svg viewBox="0 0 200 200" className="w-40 h-40">
              {[0.25, 0.5, 0.75, 1].map((s) => (
                <polygon key={s} points={getRadarPoints(s)} fill="none" stroke="var(--border)" strokeWidth="0.5" />
              ))}
              {[0, 1, 2, 3].map((i) => {
                const angle = (Math.PI / 2) * i - Math.PI / 2;
                return (
                  <line key={i} x1="100" y1="100" x2={100 + Math.cos(angle) * 80} y2={100 + Math.sin(angle) * 80} stroke="var(--border)" strokeWidth="0.5" />
                );
              })}
              <polygon points={getRadarDataPoints(categoryRates)} fill="rgba(232, 168, 73, 0.1)" stroke="var(--accent)" strokeWidth="1.5" />
              {(["productivity", "learning", "health", "mindset"] as Category[]).map((cat, i) => {
                const angle = (Math.PI / 2) * i - Math.PI / 2;
                return (
                  <text key={cat} x={100 + Math.cos(angle) * 95} y={100 + Math.sin(angle) * 95} textAnchor="middle" dominantBaseline="central" fontSize="12">
                    {CATEGORIES[cat].icon}
                  </text>
                );
              })}
            </svg>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {(["productivity", "learning", "health", "mindset"] as Category[]).map((cat) => (
              <div key={cat} className="text-center">
                <div className="text-[10px] text-[var(--text-muted)]">{CATEGORIES[cat].label}</div>
                <div className="text-xs font-medium" style={{ color: CATEGORIES[cat].color }}>
                  {Math.round(categoryRates[cat] * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Goals */}
        <div className="rounded-lg border border-[var(--border-light)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
              Active Goals
            </h3>
            <button
              onClick={() => onNavigate("goals")}
              className="text-[11px] text-[var(--accent)] hover:underline font-medium"
            >
              View all
            </button>
          </div>
          {activeGoals.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-[var(--text-muted)]">No active goals yet.</p>
              <button
                onClick={() => onNavigate("goals")}
                className="text-xs text-[var(--accent)] hover:underline mt-1"
              >
                Create your first goal
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((g) => (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-[var(--text-primary)] font-medium truncate pr-2">
                      {g.title}
                    </span>
                    <span className="text-[11px] text-[var(--purple)] font-medium shrink-0">
                      {g.progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--border-light)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${g.progress}%`,
                        background: g.progress >= 100 ? "var(--green)" : "var(--purple)",
                      }}
                    />
                  </div>
                  {g.deadline && (
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">Due {g.deadline}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Third row: Recent Journal + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Journal */}
        <div className="rounded-lg border border-[var(--border-light)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
              Recent Journal
            </h3>
            <button
              onClick={() => onNavigate("journal")}
              className="text-[11px] text-[var(--accent)] hover:underline font-medium"
            >
              View all
            </button>
          </div>
          {recentJournal.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-[var(--text-muted)]">No journal entries yet.</p>
              <button
                onClick={() => onNavigate("journal")}
                className="text-xs text-[var(--accent)] hover:underline mt-1"
              >
                Write your first entry
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJournal.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <span className="text-base shrink-0 mt-0.5">{MOODS[entry.mood]?.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 journal-text">
                      {entry.text}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      {entry.date} &middot; {entry.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-[var(--border-light)] bg-[var(--card)] p-5">
          <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-4">
            Quick Actions
          </h3>
          <div className="space-y-1.5">
            {[
              { label: "Complete today's quests", desc: `${totalHabits - completedToday} remaining`, tab: "quests", icon: "◆" },
              { label: "Set a new goal", desc: `${activeGoals.length} active`, tab: "goals", icon: "◎" },
              { label: "Write in journal", desc: `${journal.length} entries`, tab: "journal", icon: "✎" },
              { label: "Talk to AI Coach", desc: "Get personalized advice", tab: "coach", icon: "◈" },
            ].map((action) => (
              <button
                key={action.tab}
                onClick={() => onNavigate(action.tab)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors hover:bg-[var(--card-hover)]"
              >
                <span className="text-[var(--text-muted)] text-sm w-5 text-center">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--text-primary)]">{action.label}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{action.desc}</div>
                </div>
                <span className="text-[var(--text-muted)] text-xs">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreetingTime(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
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

function getCategoryRates(habits: Habit[], dailyLog: DailyLog): Record<Category, number> {
  const rates: Record<Category, number> = { productivity: 0, learning: 0, health: 0, mindset: 0 };
  const now = new Date();
  for (const cat of Object.keys(rates) as Category[]) {
    const catHabits = habits.filter((h) => h.category === cat);
    if (catHabits.length === 0) continue;
    let total = 0, completed = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = dailyLog[dateStr] || {};
      for (const h of catHabits) { total++; if (log[h.id]) completed++; }
    }
    rates[cat] = total > 0 ? completed / total : 0;
  }
  return rates;
}

function getRadarPoints(scale: number): string {
  return [0, 1, 2, 3].map((i) => {
    const angle = (Math.PI / 2) * i - Math.PI / 2;
    return `${100 + Math.cos(angle) * 80 * scale},${100 + Math.sin(angle) * 80 * scale}`;
  }).join(" ");
}

function getRadarDataPoints(rates: Record<Category, number>): string {
  return (["productivity", "learning", "health", "mindset"] as Category[]).map((cat, i) => {
    const angle = (Math.PI / 2) * i - Math.PI / 2;
    const r = Math.max(rates[cat], 0.05) * 80;
    return `${100 + Math.cos(angle) * r},${100 + Math.sin(angle) * r}`;
  }).join(" ");
}
