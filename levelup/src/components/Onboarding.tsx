"use client";

import { useState } from "react";
import { PRESET_HABITS, CATEGORIES, type Category } from "@/lib/game-data";
import {
  type Profile,
  type Habit,
  saveProfile,
  saveHabits,
  generateId,
} from "@/lib/storage";

interface Props {
  onComplete: (profile: Profile, habits: Habit[]) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [step, setStep] = useState<1 | 2>(1);

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const start = () => {
    if (!name.trim()) return;
    const profile: Profile = {
      name: name.trim(),
      xp: 0,
      createdAt: new Date().toISOString(),
    };
    const habits: Habit[] = Array.from(selected).map((i) => ({
      id: generateId(),
      name: PRESET_HABITS[i].name,
      category: PRESET_HABITS[i].category,
      xp: PRESET_HABITS[i].xp,
    }));
    saveProfile(profile);
    saveHabits(habits);
    onComplete(profile, habits);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#191919] p-6">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
              style={{
                background: "var(--accent)",
                color: "#191919",
              }}
            >
              {step === 1 ? "1" : "✓"}
            </div>
            <span className="text-xs text-[var(--text-secondary)] font-medium">Name</span>
          </div>
          <div className="flex-1 h-px bg-[var(--border)]" />
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
              style={{
                background: step === 2 ? "var(--accent)" : "var(--border)",
                color: step === 2 ? "#191919" : "var(--text-muted)",
              }}
            >
              2
            </div>
            <span className="text-xs text-[var(--text-secondary)] font-medium">Quests</span>
          </div>
        </div>

        {step === 1 ? (
          <div className="animate-slide-up">
            <h1 className="text-3xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
              Welcome to LevelUp
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
              Your personal growth RPG. Track habits, set goals, journal your thoughts,
              and level up in real life.
            </p>

            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium block mb-2">
              What should we call you?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors text-sm"
              autoFocus
            />

            <button
              onClick={() => name.trim() && setStep(2)}
              disabled={!name.trim()}
              className="w-full mt-6 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              style={{
                background: name.trim() ? "var(--accent)" : "var(--border)",
                color: name.trim() ? "#191919" : "var(--text-muted)",
              }}
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="animate-slide-up">
            <h1 className="text-3xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
              Choose your quests
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
              Pick habits you want to build. You can always add more later.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_HABITS.map((habit, i) => {
                const cat = CATEGORIES[habit.category as Category];
                const isSelected = selected.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggle(i)}
                    className="relative p-4 rounded-lg text-left transition-all duration-150"
                    style={{
                      background: isSelected ? cat.bgColor : "var(--card)",
                      border: `1px solid ${isSelected ? cat.color + "55" : "var(--border)"}`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-base">{cat.icon}</span>
                      {isSelected && (
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center text-[9px] text-white"
                          style={{ background: cat.color }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="text-[13px] font-medium text-[var(--text-primary)] mb-1">
                      {habit.name}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {cat.label}
                      </span>
                      <span className="text-[10px] font-medium text-[var(--accent)]">
                        +{habit.xp} XP
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors"
              >
                Back
              </button>
              <button
                onClick={start}
                className="flex-1 py-3 rounded-lg text-sm font-medium transition-all"
                style={{ background: "var(--accent)", color: "#191919" }}
              >
                Start your journey
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
