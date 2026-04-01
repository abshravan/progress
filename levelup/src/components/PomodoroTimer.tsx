"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  type Habit,
  type Profile,
  type PomodoroSession,
  loadPomodoroSessions,
  savePomodoroSessions,
  saveProfile,
} from "@/lib/storage";
import { getTodayString } from "@/lib/game-data";
import { playQuestComplete, playBonusXP } from "@/lib/sounds";

interface Props {
  habits: Habit[];
  profile: Profile;
  onProfileUpdate: (p: Profile) => void;
  onXPGain: (amount: number) => void;
  onToast?: (message: string) => void;
}

const DURATIONS = [
  { label: "25m", value: 25 * 60 },
  { label: "15m", value: 15 * 60 },
  { label: "50m", value: 50 * 60 },
  { label: "5m", value: 5 * 60 },
];

export default function PomodoroTimer({ habits, profile, onProfileUpdate, onXPGain, onToast }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sessions = loadPomodoroSessions();
    const today = getTodayString();
    setSessionCount(sessions.filter((s) => s.date === today && s.completed).length);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isRunning) {
      completeSession();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft]);

  const completeSession = useCallback(() => {
    setIsRunning(false);
    playBonusXP();

    const session: PomodoroSession = {
      date: getTodayString(),
      habitId: selectedHabit || undefined,
      duration,
      completed: true,
    };
    const sessions = loadPomodoroSessions();
    savePomodoroSessions([...sessions, session]);

    const xp = 25;
    const newProfile = { ...profile, xp: profile.xp + xp };
    saveProfile(newProfile);
    onProfileUpdate(newProfile);
    onXPGain(xp);
    setSessionCount((c) => c + 1);
    setTimeLeft(duration);
    onToast?.(`Pomodoro complete! +${xp} XP`);
  }, [duration, selectedHabit, profile, onProfileUpdate, onXPGain, onToast]);

  const start = () => {
    setIsRunning(true);
    playQuestComplete();
  };

  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const selectDuration = (val: number) => {
    setDuration(val);
    setTimeLeft(val);
    setIsRunning(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all btn-press"
        style={{
          background: isRunning ? "var(--pink)" : "var(--accent)",
          color: "#191919",
        }}
      >
        {isRunning ? (
          <span className="text-sm font-bold">{minutes}:{seconds.toString().padStart(2, "0")}</span>
        ) : (
          <span className="text-lg">🍅</span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-30 w-80 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl animate-scale-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-light)]">
        <div className="flex items-center gap-2">
          <span>🍅</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">Pomodoro</span>
          <span className="text-[10px] text-[var(--text-muted)]">{sessionCount} today</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--card-hover)] transition-all"
        >
          ×
        </button>
      </div>

      <div className="p-5">
        {/* Timer display */}
        <div className="relative w-40 h-40 mx-auto mb-5">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border-light)" strokeWidth="4" />
            <circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke={isRunning ? "var(--pink)" : "var(--accent)"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.76} 276`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] mt-1">
              {isRunning ? "Focus time" : "Ready"}
            </span>
          </div>
        </div>

        {/* Duration presets */}
        {!isRunning && (
          <div className="flex gap-2 mb-4 justify-center">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => selectDuration(d.value)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all btn-press"
                style={{
                  background: duration === d.value ? "var(--accent-dim)" : "transparent",
                  color: duration === d.value ? "var(--accent)" : "var(--text-muted)",
                  border: `1px solid ${duration === d.value ? "var(--accent)" + "44" : "var(--border-light)"}`,
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}

        {/* Habit link */}
        {!isRunning && (
          <div className="mb-4">
            <select
              value={selectedHabit || ""}
              onChange={(e) => setSelectedHabit(e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border-light)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent)] transition-colors"
            >
              <option value="">No linked quest</option>
              {habits.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!isRunning ? (
            <button
              onClick={start}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent)] text-[#191919] btn-press"
            >
              {timeLeft < duration ? "Resume" : "Start"}
            </button>
          ) : (
            <button
              onClick={pause}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[var(--card-hover)] text-[var(--text-primary)] border border-[var(--border)] btn-press"
            >
              Pause
            </button>
          )}
          {(isRunning || timeLeft < duration) && (
            <button
              onClick={reset}
              className="px-4 py-2.5 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-[var(--border-light)] btn-press"
            >
              Reset
            </button>
          )}
        </div>

        <div className="text-center mt-3 text-[10px] text-[var(--text-muted)]">
          +25 XP per completed session
        </div>
      </div>
    </div>
  );
}
