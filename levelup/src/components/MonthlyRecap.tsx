"use client";

import { useState, useMemo } from "react";
import {
  type Habit,
  type DailyLog,
  type JournalEntry,
  type Goal,
} from "@/lib/storage";
import { getMonthlyRecap, CATEGORIES, MOODS, type Category } from "@/lib/game-data";

interface Props {
  habits: Habit[];
  dailyLog: DailyLog;
  journal: JournalEntry[];
  goals: Goal[];
}

export default function MonthlyRecap({ habits, dailyLog, journal, goals }: Props) {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0); // 0 = previous month, 1 = 2 months ago, etc.

  const targetMonth = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1 - monthOffset, 1);
    return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
  }, [monthOffset, now]);

  const recap = useMemo(
    () => getMonthlyRecap(dailyLog, habits, journal, goals, targetMonth),
    [dailyLog, habits, journal, goals, targetMonth]
  );

  const catInfo = recap.bestCategory !== "none" ? CATEGORIES[recap.bestCategory as Category] : null;

  return (
    <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 card-hover">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
          Monthly Recap
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-xs px-1.5 py-0.5 rounded hover:bg-[var(--card-hover)] transition-all"
          >
            ◂
          </button>
          <span className="text-xs font-medium text-[var(--text-primary)] min-w-[120px] text-center">
            {recap.monthLabel}
          </span>
          <button
            onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
            disabled={monthOffset === 0}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-xs px-1.5 py-0.5 rounded hover:bg-[var(--card-hover)] transition-all disabled:opacity-30"
          >
            ▸
          </button>
        </div>
      </div>

      {recap.totalXP === 0 ? (
        <div className="py-6 text-center text-sm text-[var(--text-muted)]">
          No activity recorded for this month.
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--accent)]">{recap.totalXP.toLocaleString()}</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--green)]">{recap.questsCompleted}</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Quests Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--purple)]">{recap.activeDays}/{recap.totalDays}</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Active Days</div>
            </div>
          </div>

          {/* Activity bar */}
          <div className="w-full h-2 rounded-full bg-[var(--border-light)] overflow-hidden mb-5">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(recap.activeDays / recap.totalDays) * 100}%`,
                background: "linear-gradient(90deg, var(--accent), var(--green))",
              }}
            />
          </div>

          {/* Details */}
          <div className="space-y-3">
            {recap.journalEntries > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Journal Entries</span>
                <span className="font-medium text-[var(--text-primary)]">{recap.journalEntries}</span>
              </div>
            )}
            {recap.goalsCompleted > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Goals Completed</span>
                <span className="font-medium text-[var(--text-primary)]">{recap.goalsCompleted}</span>
              </div>
            )}
            {recap.avgMood >= 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Avg Mood</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {MOODS[Math.round(recap.avgMood)]?.emoji} {MOODS[Math.round(recap.avgMood)]?.label}
                </span>
              </div>
            )}
            {catInfo && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Top Category</span>
                <span className="font-medium" style={{ color: catInfo.color }}>
                  {catInfo.icon} {catInfo.label}
                </span>
              </div>
            )}
            {recap.bestDay && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Best Day</span>
                <span className="font-medium text-[var(--accent)]">
                  {new Date(recap.bestDay + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {recap.bestDayXP} XP
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
