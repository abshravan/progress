"use client";

import { useState } from "react";
import {
  type Habit,
  type DailyLog,
  type Profile,
  saveHabits,
  saveDailyLog,
  saveProfile,
  generateId,
} from "@/lib/storage";
import { CATEGORIES, type Category, getTodayString } from "@/lib/game-data";

interface Props {
  habits: Habit[];
  dailyLog: DailyLog;
  profile: Profile;
  onUpdate: (h: Habit[], d: DailyLog, p: Profile) => void;
  onXPGain: (amount: number) => void;
}

export default function DailyQuests({ habits, dailyLog, profile, onUpdate, onXPGain }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("productivity");
  const [newXP, setNewXP] = useState(15);

  const today = getTodayString();
  const todayLog = dailyLog[today] || {};
  const completedCount = habits.filter((h) => todayLog[h.id]).length;

  const toggleHabit = (habit: Habit) => {
    const wasComplete = !!todayLog[habit.id];
    const newLog = { ...dailyLog };
    if (!newLog[today]) newLog[today] = {};
    if (wasComplete) {
      delete newLog[today][habit.id];
      const newProfile = { ...profile, xp: Math.max(0, profile.xp - habit.xp) };
      saveDailyLog(newLog);
      saveProfile(newProfile);
      onUpdate(habits, newLog, newProfile);
    } else {
      newLog[today][habit.id] = true;
      const newProfile = { ...profile, xp: profile.xp + habit.xp };
      saveDailyLog(newLog);
      saveProfile(newProfile);
      onUpdate(habits, newLog, newProfile);
      onXPGain(habit.xp);
    }
  };

  const addHabit = () => {
    if (!newName.trim()) return;
    const habit: Habit = { id: generateId(), name: newName.trim(), category: newCategory, xp: newXP };
    const newHabits = [...habits, habit];
    saveHabits(newHabits);
    onUpdate(newHabits, dailyLog, profile);
    setNewName("");
    setNewXP(15);
    setShowForm(false);
  };

  const deleteHabit = (id: string) => {
    const newHabits = habits.filter((h) => h.id !== id);
    saveHabits(newHabits);
    onUpdate(newHabits, dailyLog, profile);
  };

  // Group by category
  const grouped = habits.reduce(
    (acc, h) => {
      acc[h.category] = acc[h.category] || [];
      acc[h.category].push(h);
      return acc;
    },
    {} as Record<Category, Habit[]>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Daily Quests
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-primary)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors"
        >
          + New quest
        </button>
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        {completedCount} of {habits.length} completed today
      </p>

      {/* Inline Add Form */}
      {showForm && (
        <div className="rounded-lg border border-[var(--border-light)] bg-[var(--card)] p-5 mb-5 animate-slide-down">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="Quest name..."
            className="w-full px-3 py-2 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors mb-3"
            autoFocus
          />
          <div className="flex gap-2 mb-3 flex-wrap">
            {(Object.entries(CATEGORIES) as [Category, (typeof CATEGORIES)[Category]][]).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setNewCategory(key)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={{
                  background: newCategory === key ? cat.bgColor : "var(--background)",
                  border: `1px solid ${newCategory === key ? cat.color + "55" : "var(--border)"}`,
                  color: newCategory === key ? cat.color : "var(--text-muted)",
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-[var(--text-muted)] shrink-0">XP reward</span>
            <input type="range" min={5} max={50} step={5} value={newXP} onChange={(e) => setNewXP(Number(e.target.value))} className="flex-1 accent-amber" />
            <span className="text-xs font-medium text-[var(--accent)] w-6 text-right">{newXP}</span>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              Cancel
            </button>
            <button onClick={addHabit} disabled={!newName.trim()} className="px-4 py-1.5 rounded-md text-xs font-medium bg-[var(--accent)] text-[#191919] disabled:opacity-30 transition-opacity">
              Create
            </button>
          </div>
        </div>
      )}

      {/* Habits by category */}
      {habits.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-10 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-2">No quests yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Create your first quest
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {(Object.entries(grouped) as [Category, Habit[]][]).map(([category, catHabits]) => {
            const cat = CATEGORIES[category];
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs">{cat.icon}</span>
                  <h3 className="text-[11px] uppercase tracking-wider font-medium" style={{ color: cat.color }}>
                    {cat.label}
                  </h3>
                  <div className="flex-1 h-px bg-[var(--border-light)]" />
                </div>
                <div className="rounded-lg border border-[var(--border-light)] bg-[var(--card)] overflow-hidden divide-y divide-[var(--border-light)]">
                  {catHabits.map((habit) => {
                    const done = !!todayLog[habit.id];
                    return (
                      <div
                        key={habit.id}
                        className="flex items-center gap-3 px-4 py-3 group notion-row"
                      >
                        <button
                          onClick={() => toggleHabit(habit)}
                          className="w-[18px] h-[18px] rounded flex items-center justify-center transition-all duration-150 shrink-0"
                          style={{
                            background: done ? cat.color : "transparent",
                            border: `1.5px solid ${done ? cat.color : "var(--border)"}`,
                          }}
                        >
                          {done && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <span
                          className="flex-1 text-[13px] transition-colors"
                          style={{
                            color: done ? "var(--text-muted)" : "var(--text-primary)",
                            textDecoration: done ? "line-through" : "none",
                          }}
                        >
                          {habit.name}
                        </span>
                        <span className="text-[11px] font-medium text-[var(--accent)] shrink-0 opacity-60">
                          +{habit.xp}
                        </span>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--pink)] transition-all text-xs ml-1 shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
