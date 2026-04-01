"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type WeeklyChallenge,
  type DailyLog,
  type Habit,
  type JournalEntry,
  type Goal,
  type Profile,
  loadWeeklyChallenges,
  saveWeeklyChallenges,
  saveProfile,
  loadPomodoroSessions,
} from "@/lib/storage";
import { getWeekStart, pickWeeklyChallenges, type Category } from "@/lib/game-data";

interface Props {
  habits: Habit[];
  dailyLog: DailyLog;
  journal: JournalEntry[];
  goals: Goal[];
  profile: Profile;
  onProfileUpdate: (p: Profile) => void;
  onToast?: (message: string) => void;
}

export default function WeeklyChallenges({ habits, dailyLog, journal, goals, profile, onProfileUpdate, onToast }: Props) {
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);

  const weekStart = getWeekStart();

  const generateChallenges = useCallback(() => {
    const existing = loadWeeklyChallenges();
    if (existing.length > 0 && existing[0].weekStart === weekStart) {
      return existing;
    }
    const templates = pickWeeklyChallenges(weekStart);
    const newChallenges: WeeklyChallenge[] = templates.map((t, i) => ({
      id: `${weekStart}-${i}`,
      title: t.title,
      description: t.description,
      target: t.target,
      progress: 0,
      xpReward: t.xpReward,
      completed: false,
      weekStart,
    }));
    saveWeeklyChallenges(newChallenges);
    return newChallenges;
  }, [weekStart]);

  // Calculate progress from real data
  const calcProgress = useCallback(() => {
    const templates = pickWeeklyChallenges(weekStart);
    const weekDates: string[] = [];
    const ws = new Date(weekStart + "T12:00:00");
    for (let i = 0; i < 7; i++) {
      const d = new Date(ws);
      d.setDate(d.getDate() + i);
      weekDates.push(d.toISOString().split("T")[0]);
    }

    return templates.map((t) => {
      switch (t.type) {
        case "quests": {
          let count = 0;
          for (const date of weekDates) {
            const log = dailyLog[date] || {};
            count += Object.values(log).filter(Boolean).length;
          }
          return Math.min(count, t.target);
        }
        case "journal": {
          const weekEntries = journal.filter((j) => weekDates.includes(j.date));
          return Math.min(weekEntries.length, t.target);
        }
        case "category": {
          const catHabits = habits.filter((h) => h.category === (t.category as Category));
          let count = 0;
          for (const date of weekDates) {
            const log = dailyLog[date] || {};
            count += catHabits.filter((h) => log[h.id]).length;
          }
          return Math.min(count, t.target);
        }
        case "streak": {
          let perfectDays = 0;
          for (const date of weekDates) {
            const log = dailyLog[date] || {};
            if (habits.length > 0 && habits.every((h) => log[h.id])) perfectDays++;
          }
          return Math.min(perfectDays, t.target);
        }
        case "goals": {
          const thisWeekGoals = goals.filter((g) => g.completed && weekDates.some((d) => g.createdAt?.startsWith(d)));
          return Math.min(thisWeekGoals.length, t.target);
        }
        case "pomodoro": {
          const sessions = loadPomodoroSessions();
          const weekSessions = sessions.filter((s) => weekDates.includes(s.date) && s.completed);
          return Math.min(weekSessions.length, t.target);
        }
        default:
          return 0;
      }
    });
  }, [weekStart, dailyLog, journal, goals, habits]);

  useEffect(() => {
    const base = generateChallenges();
    const progress = calcProgress();
    const updated = base.map((c, i) => {
      const newProgress = progress[i] ?? c.progress;
      const wasComplete = c.completed;
      const isComplete = newProgress >= c.target;
      if (isComplete && !wasComplete) {
        const newProfile = { ...profile, xp: profile.xp + c.xpReward };
        saveProfile(newProfile);
        onProfileUpdate(newProfile);
        onToast?.(`Challenge complete: "${c.title}" +${c.xpReward} XP!`);
      }
      return { ...c, progress: newProgress, completed: isComplete || wasComplete };
    });
    saveWeeklyChallenges(updated);
    setChallenges(updated);
  }, [generateChallenges, calcProgress, profile, onProfileUpdate, onToast]);

  const totalXP = challenges.reduce((s, c) => s + (c.completed ? c.xpReward : 0), 0);
  const maxXP = challenges.reduce((s, c) => s + c.xpReward, 0);

  return (
    <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
          Weekly Challenges
        </h3>
        <span className="text-[10px] text-[var(--accent)] font-semibold">{totalXP}/{maxXP} XP</span>
      </div>

      <div className="space-y-4">
        {challenges.map((challenge) => {
          const pct = challenge.target > 0 ? Math.round((challenge.progress / challenge.target) * 100) : 0;
          return (
            <div key={challenge.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs">{challenge.completed ? "✅" : "🎯"}</span>
                  <span className="text-[13px] font-medium text-[var(--text-primary)]">{challenge.title}</span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                  {challenge.progress}/{challenge.target}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mb-2 ml-6">{challenge.description}</p>
              <div className="w-full h-1.5 rounded-full bg-[var(--border-light)] overflow-hidden ml-6" style={{ width: "calc(100% - 24px)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: challenge.completed ? "var(--green)" : "var(--accent)",
                  }}
                />
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-[10px] font-medium" style={{ color: challenge.completed ? "var(--green)" : "var(--accent)" }}>
                  +{challenge.xpReward} XP
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
