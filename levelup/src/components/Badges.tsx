"use client";

import { useState, useEffect } from "react";
import { type Profile, type DailyLog, type Habit, loadUnlockedBadges, saveUnlockedBadges, loadPomodoroSessions, calculateRecords } from "@/lib/storage";
import { BADGES, type BadgeStats, getLevel } from "@/lib/game-data";

interface Props {
  profile: Profile;
  dailyLog: DailyLog;
  habits: Habit[];
  onNewBadge?: (name: string) => void;
}

export default function Badges({ profile, dailyLog, habits, onNewBadge }: Props) {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  useEffect(() => {
    const existing = new Set(loadUnlockedBadges());
    const records = calculateRecords();
    const pomodoroSessions = loadPomodoroSessions();
    const daysActive = Object.keys(dailyLog).filter(
      (d) => dailyLog[d] && Object.values(dailyLog[d]).some(Boolean)
    ).length;

    const stats: BadgeStats = {
      totalXP: profile.xp,
      level: getLevel(profile.xp),
      streak: 0, // current streak calc not needed for badges
      longestStreak: records.longestStreak,
      totalQuests: records.totalQuestsCompleted,
      totalGoals: records.totalGoalsCompleted,
      totalJournalEntries: records.totalJournalEntries,
      totalPomodoroSessions: pomodoroSessions.filter((s) => s.completed).length,
      daysActive,
    };

    const newUnlocked = new Set(existing);
    for (const badge of BADGES) {
      if (!existing.has(badge.id) && badge.check(stats)) {
        newUnlocked.add(badge.id);
        onNewBadge?.(badge.name);
      }
    }

    if (newUnlocked.size !== existing.size) {
      saveUnlockedBadges(Array.from(newUnlocked));
    }
    setUnlocked(newUnlocked);
  }, [profile, dailyLog, habits, onNewBadge]);

  const unlockedCount = unlocked.size;
  const totalCount = BADGES.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
          Achievements
        </h1>
        <div className="text-sm text-[var(--text-muted)]">
          <span className="text-[var(--accent)] font-semibold">{unlockedCount}</span>/{totalCount}
        </div>
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        {unlockedCount === 0
          ? "Start completing quests to earn your first badge!"
          : `${totalCount - unlockedCount} badges remaining. Keep going!`}
      </p>

      {/* Progress */}
      <div className="w-full h-1.5 rounded-full bg-[var(--border-light)] overflow-hidden mb-8">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(unlockedCount / totalCount) * 100}%`, background: "var(--accent)" }}
        />
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 stagger-children">
        {BADGES.map((badge) => {
          const isUnlocked = unlocked.has(badge.id);
          const isSelected = selectedBadge === badge.id;
          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(isSelected ? null : badge.id)}
              className="relative p-4 rounded-xl border text-center transition-all duration-200"
              style={{
                borderColor: isUnlocked ? badge.color + "44" : "var(--border-light)",
                background: isSelected ? (isUnlocked ? badge.color + "15" : "var(--card-hover)") : "var(--card)",
                opacity: isUnlocked ? 1 : 0.4,
                filter: isUnlocked ? "none" : "grayscale(0.8)",
              }}
            >
              <div className="text-2xl mb-2">{badge.icon}</div>
              <div className="text-[11px] font-medium text-[var(--text-primary)] leading-tight">
                {badge.name}
              </div>
              {isUnlocked && (
                <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full" style={{ background: badge.color }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected badge detail */}
      {selectedBadge && (() => {
        const badge = BADGES.find((b) => b.id === selectedBadge);
        if (!badge) return null;
        const isUnlocked = unlocked.has(badge.id);
        return (
          <div className="mt-6 rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-5 animate-slide-up flex items-center gap-4">
            <div className="text-3xl">{badge.icon}</div>
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">{badge.name}</div>
              <div className="text-[12px] text-[var(--text-muted)] mt-0.5">{badge.description}</div>
              <div className="text-[11px] mt-1.5 font-medium" style={{ color: isUnlocked ? badge.color : "var(--text-muted)" }}>
                {isUnlocked ? "Unlocked!" : "Locked"}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
