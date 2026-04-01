"use client";

import { useState, useEffect } from "react";
import {
  type Habit,
  type DailyLog,
  type Goal,
  type Profile,
  type JournalEntry,
  type PersonalRecords,
  calculateRecords,
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

export default function Dashboard({ profile, habits, dailyLog, goals, journal, onNavigate }: Props) {
  const [records, setRecords] = useState<PersonalRecords | null>(null);

  useEffect(() => {
    setRecords(calculateRecords());
  }, []);

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
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
          Good {getGreetingTime()}, {profile.name}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1.5">
          Level {level} {title} &middot; {profile.xp.toLocaleString()} XP
        </p>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 stagger-children">
        {/* Today's Progress */}
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 card-hover">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium mb-5">
            Today&apos;s Progress
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-light)" strokeWidth="5" />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${pct * 2.51} 251`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-[var(--text-primary)]">{pct}%</span>
              </div>
            </div>
            <div>
              <p className="text-base font-medium text-[var(--text-primary)]">
                {completedToday} of {totalHabits} quests
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
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
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 card-hover">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium mb-5">
            This Week
          </h3>
          <div className="flex items-end gap-2 h-20">
            {weekXP.map((xp, i) => {
              const isToday = i === new Date().getDay();
              const height = Math.max((xp / maxWeekXP) * 100, 6);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded transition-all duration-700 ease-out"
                    style={{
                      height: `${height}%`,
                      background: isToday ? "var(--accent)" : "var(--border)",
                      opacity: isToday ? 1 : 0.5,
                    }}
                  />
                  <span className="text-[10px] text-[var(--text-muted)]" style={{ fontWeight: isToday ? 600 : 400, color: isToday ? "var(--accent)" : undefined }}>
                    {weekDays[i]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-[var(--border-light)]">
            <span className="text-[11px] text-[var(--text-muted)]">
              Total: {weekXP.reduce((a, b) => a + b, 0)} XP
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              Avg: {Math.round(weekXP.reduce((a, b) => a + b, 0) / 7)}/day
            </span>
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 stagger-children">
        {/* Skill Radar */}
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 card-hover">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium mb-5">
            Skills (7-day)
          </h3>
          <div className="flex justify-center">
            <svg viewBox="0 0 200 200" className="w-44 h-44">
              {[0.25, 0.5, 0.75, 1].map((s) => (
                <polygon key={s} points={getRadarPoints(s)} fill="none" stroke="var(--border)" strokeWidth="0.5" />
              ))}
              {[0, 1, 2, 3].map((i) => {
                const angle = (Math.PI / 2) * i - Math.PI / 2;
                return (
                  <line key={i} x1="100" y1="100" x2={100 + Math.cos(angle) * 80} y2={100 + Math.sin(angle) * 80} stroke="var(--border)" strokeWidth="0.5" />
                );
              })}
              <polygon points={getRadarDataPoints(categoryRates)} fill="rgba(232, 168, 73, 0.1)" stroke="var(--accent)" strokeWidth="1.5" className="transition-all duration-700" />
              {(["productivity", "learning", "health", "mindset"] as Category[]).map((cat, i) => {
                const angle = (Math.PI / 2) * i - Math.PI / 2;
                return (
                  <text key={cat} x={100 + Math.cos(angle) * 95} y={100 + Math.sin(angle) * 95} textAnchor="middle" dominantBaseline="central" fontSize="13">
                    {CATEGORIES[cat].icon}
                  </text>
                );
              })}
            </svg>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {(["productivity", "learning", "health", "mindset"] as Category[]).map((cat) => (
              <div key={cat} className="text-center">
                <div className="text-[10px] text-[var(--text-muted)]">{CATEGORIES[cat].label}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: CATEGORIES[cat].color }}>
                  {Math.round(categoryRates[cat] * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Goals */}
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 card-hover">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
              Active Goals
            </h3>
            <button onClick={() => onNavigate("goals")} className="text-[11px] text-[var(--accent)] hover:underline font-medium btn-press">
              View all →
            </button>
          </div>
          {activeGoals.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[var(--text-muted)] mb-2">No active goals yet.</p>
              <button onClick={() => onNavigate("goals")} className="text-sm text-[var(--accent)] hover:underline">
                Create your first goal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeGoals.map((g) => (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-[var(--text-primary)] font-medium truncate pr-3">{g.title}</span>
                    <span className="text-[11px] text-[var(--purple)] font-semibold shrink-0">{g.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--border-light)] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${g.progress}%`, background: "var(--purple)" }} />
                  </div>
                  {g.deadline && <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Due {g.deadline}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
        {/* Recent Journal */}
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 card-hover">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Recent Journal</h3>
            <button onClick={() => onNavigate("journal")} className="text-[11px] text-[var(--accent)] hover:underline font-medium btn-press">
              View all →
            </button>
          </div>
          {recentJournal.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[var(--text-muted)] mb-2">No journal entries yet.</p>
              <button onClick={() => onNavigate("journal")} className="text-sm text-[var(--accent)] hover:underline">Write your first entry</button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJournal.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <span className="text-lg shrink-0 mt-0.5">{MOODS[entry.mood]?.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 journal-text">{entry.text}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1.5">{entry.date} &middot; {entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personal Records */}
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 card-hover">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium mb-5">Personal Records</h3>
          {records ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Longest Streak", value: `${records.longestStreak}d`, icon: "🔥", color: "var(--accent)" },
                { label: "Best Day XP", value: `${records.maxXPInDay}`, icon: "⚡", color: "var(--accent)" },
                { label: "Quests Done", value: `${records.totalQuestsCompleted}`, icon: "◆", color: "var(--green)" },
                { label: "Goals Crushed", value: `${records.totalGoalsCompleted}`, icon: "◎", color: "var(--purple)" },
                { label: "Journal Entries", value: `${records.totalJournalEntries}`, icon: "✎", color: "var(--blue)" },
                { label: "Best Day", value: records.mostProductiveDay ? new Date(records.mostProductiveDay + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—", icon: "📅", color: "var(--pink)" },
              ].map((rec) => (
                <div key={rec.label} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0"
                    style={{ background: rec.color + "18" }}
                  >
                    {rec.icon}
                  </div>
                  <div>
                    <div className="text-base font-bold text-[var(--text-primary)]">{rec.value}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{rec.label}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-[var(--text-muted)]">Loading records...</div>
          )}
        </div>
      </div>

      {/* Fourth row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
        {/* Quick Actions */}
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 card-hover">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium mb-5">Quick Actions</h3>
          <div className="space-y-1">
            {[
              { label: "Complete today's quests", desc: `${totalHabits - completedToday} remaining`, tab: "quests", icon: "◆" },
              { label: "Set a new goal", desc: `${activeGoals.length} active`, tab: "goals", icon: "◎" },
              { label: "Write in journal", desc: `${journal.length} entries`, tab: "journal", icon: "✎" },
              { label: "Talk to AI Coach", desc: "Get personalized advice", tab: "coach", icon: "◈" },
            ].map((action) => (
              <button
                key={action.tab}
                onClick={() => onNavigate(action.tab)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left notion-row"
              >
                <span className="text-[var(--text-muted)] text-sm w-5 text-center">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--text-primary)]">{action.label}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{action.desc}</div>
                </div>
                <span className="text-[var(--text-muted)] text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
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
  const result = [0, 0, 0, 0, 0, 0, 0];
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
      const log = dailyLog[d.toISOString().split("T")[0]] || {};
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
