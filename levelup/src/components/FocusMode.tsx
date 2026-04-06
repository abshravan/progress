"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type Habit,
  type DailyLog,
  type Profile,
  saveDailyLog,
  saveProfile,
} from "@/lib/storage";
import { CATEGORIES, getTodayString, isHabitActiveToday, getXPMultiplier } from "@/lib/game-data";
import { playQuestComplete } from "@/lib/sounds";

interface Props {
  habits: Habit[];
  dailyLog: DailyLog;
  profile: Profile;
  onUpdate: (h: Habit[], d: DailyLog, p: Profile) => void;
  onXPGain: (amount: number) => void;
  onClose: () => void;
}

export default function FocusMode({ habits, dailyLog, profile, onUpdate, onXPGain, onClose }: Props) {
  const today = getTodayString();
  const todayLog = dailyLog[today] || {};
  const activeHabits = habits.filter((h) => !h.archived && isHabitActiveToday(h));
  const incompleteHabits = activeHabits.filter((h) => !todayLog[h.id]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedInSession, setCompletedInSession] = useState(0);

  const currentHabit = incompleteHabits[currentIdx] || null;

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " && currentHabit) {
        e.preventDefault();
        completeCurrentQuest();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHabit, currentIdx]);

  const completeCurrentQuest = useCallback(() => {
    if (!currentHabit) return;
    const { multiplier } = getXPMultiplier();
    const effectiveXP = Math.round(currentHabit.xp * multiplier);

    const newLog = { ...dailyLog };
    if (!newLog[today]) newLog[today] = {};
    newLog[today][currentHabit.id] = true;

    const newProfile = { ...profile, xp: profile.xp + effectiveXP };
    saveDailyLog(newLog);
    saveProfile(newProfile);
    playQuestComplete();
    onUpdate(habits, newLog, newProfile);
    onXPGain(effectiveXP);
    setCompletedInSession((c) => c + 1);

    // Move to next
    if (currentIdx >= incompleteHabits.length - 1) {
      // All done
    } else {
      setCurrentIdx((i) => i);
    }
  }, [currentHabit, dailyLog, today, profile, habits, onUpdate, onXPGain, currentIdx, incompleteHabits.length]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const allDone = incompleteHabits.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-fade-in"
      style={{ background: "var(--background)" }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-8 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm flex items-center gap-2"
      >
        <kbd className="px-1.5 py-0.5 rounded text-[9px] bg-[var(--card)] border border-[var(--border-light)] font-mono">ESC</kbd>
        Exit Focus
      </button>

      {/* Timer */}
      <div className="absolute top-6 left-8 flex items-center gap-3">
        <span className="text-2xl font-mono text-[var(--text-muted)]">{formatTime(timer)}</span>
        <button
          onClick={() => setTimerRunning(!timerRunning)}
          className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--card)] border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] transition-all"
        >
          {timerRunning ? "Pause" : "Start"}
        </button>
      </div>

      {/* Session stats */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[11px] text-[var(--text-muted)]">
        {completedInSession} completed this session
      </div>

      {allDone ? (
        <div className="text-center animate-scale-in">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">All Quests Complete!</h2>
          <p className="text-[var(--text-muted)] mb-8">You crushed it today. Time well spent.</p>
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-lg text-sm font-medium bg-[var(--accent)] text-[#191919] btn-press"
          >
            Exit Focus Mode
          </button>
        </div>
      ) : currentHabit ? (
        <div className="text-center max-w-lg w-full px-8 animate-scale-in">
          {/* Category */}
          <div className="mb-4">
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: CATEGORIES[currentHabit.category].bgColor,
                color: CATEGORIES[currentHabit.category].color,
              }}
            >
              {CATEGORIES[currentHabit.category].icon} {CATEGORIES[currentHabit.category].label}
            </span>
          </div>

          {/* Quest name */}
          <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-3">{currentHabit.name}</h2>
          <p className="text-lg text-[var(--accent)] font-medium mb-10">
            +{Math.round(currentHabit.xp * getXPMultiplier().multiplier)} XP
          </p>

          {/* Progress */}
          <div className="flex items-center gap-2 justify-center mb-8">
            {incompleteHabits.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: i < currentIdx ? "var(--green)" : i === currentIdx ? "var(--accent)" : "var(--border)",
                  transform: i === currentIdx ? "scale(1.5)" : "scale(1)",
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setCurrentIdx((i) => Math.min(i + 1, incompleteHabits.length - 1))}
              className="px-6 py-3 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--card)] transition-all"
            >
              Skip
            </button>
            <button
              onClick={completeCurrentQuest}
              className="px-10 py-3 rounded-lg text-sm font-semibold bg-[var(--accent)] text-[#191919] btn-press"
            >
              Complete
              <span className="ml-2 opacity-60">[Space]</span>
            </button>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] mt-6">
            {currentIdx + 1} of {incompleteHabits.length} remaining
          </p>
        </div>
      ) : null}
    </div>
  );
}
