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

export default function DailyQuests({
  habits,
  dailyLog,
  profile,
  onUpdate,
  onXPGain,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("productivity");
  const [newXP, setNewXP] = useState(15);

  const today = getTodayString();
  const todayLog = dailyLog[today] || {};

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
    const habit: Habit = {
      id: generateId(),
      name: newName.trim(),
      category: newCategory,
      xp: newXP,
    };
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

  const completedCount = habits.filter((h) => todayLog[h.id]).length;

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Daily Quests</h2>
          <p className="text-xs text-gray-500">
            {completedCount}/{habits.length} quests completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "#0A0A1A",
          }}
        >
          + New
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="p-4 rounded-xl bg-[#12122A] border border-[#1E1E3E] space-y-3 animate-slide-down">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Quest name..."
            className="w-full px-3 py-2 rounded-lg bg-[#0A0A1A] border border-[#1E1E3E] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
          />
          <div className="flex gap-2 flex-wrap">
            {(Object.entries(CATEGORIES) as [Category, (typeof CATEGORIES)[Category]][]).map(
              ([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setNewCategory(key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: newCategory === key ? cat.bgColor : "#0A0A1A",
                    border: `1px solid ${newCategory === key ? cat.color : "#1E1E3E"}`,
                    color: newCategory === key ? cat.color : "#666",
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              )
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">XP:</span>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={newXP}
              onChange={(e) => setNewXP(Number(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <span className="text-sm font-bold text-amber-400 w-8">{newXP}</span>
          </div>
          <button
            onClick={addHabit}
            disabled={!newName.trim()}
            className="w-full py-2 rounded-lg text-sm font-semibold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all disabled:opacity-30"
          >
            Create Quest
          </button>
        </div>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">🗡️</div>
          <p className="text-sm">No quests yet. Add your first quest above!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => {
            const cat = CATEGORIES[habit.category];
            const done = !!todayLog[habit.id];
            return (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
                style={{
                  background: done ? "rgba(16, 185, 129, 0.08)" : "#12122A",
                  border: `1px solid ${done ? "rgba(16, 185, 129, 0.2)" : "#1E1E3E"}`,
                  opacity: done ? 0.7 : 1,
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleHabit(habit)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 hover:scale-110 active:scale-90"
                  style={{
                    background: done ? cat.color : "transparent",
                    border: `2px solid ${done ? cat.color : "#333"}`,
                  }}
                >
                  {done && <span className="text-white text-xs font-bold">✓</span>}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium ${done ? "line-through text-gray-500" : "text-white"}`}
                  >
                    {habit.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px]" style={{ color: cat.color }}>
                      {cat.icon} {cat.label}
                    </span>
                  </div>
                </div>

                {/* XP */}
                <span className="text-xs font-bold text-amber-400 shrink-0">
                  +{habit.xp} XP
                </span>

                {/* Delete */}
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-sm shrink-0"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
