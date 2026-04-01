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
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(180deg, #0A0A1A 0%, #0F0F2A 100%)" }}>
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">⚔️</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            LEVEL UP
          </h1>
          <p className="text-gray-400 text-sm">Your Personal Growth RPG</p>
          <p className="text-gray-500 text-xs mt-1">Create your character to begin</p>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Hero Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name, adventurer..."
            className="w-full px-4 py-3 rounded-xl bg-[#12122A] border border-[#1E1E3E] text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
            autoFocus
          />
        </div>

        {/* Preset Habits */}
        <div className="space-y-3">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Choose Your Starting Quests
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PRESET_HABITS.map((habit, i) => {
              const cat = CATEGORIES[habit.category as Category];
              const isSelected = selected.has(i);
              return (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  className="relative p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: isSelected ? cat.bgColor : "#12122A",
                    border: `1px solid ${isSelected ? cat.color : "#1E1E3E"}`,
                    boxShadow: isSelected
                      ? `0 0 16px ${cat.color}33`
                      : "none",
                  }}
                >
                  <div className="text-lg mb-1">{cat.icon}</div>
                  <div className="text-sm font-medium text-white leading-tight">
                    {habit.name}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: cat.color }}
                    >
                      {cat.label}
                    </span>
                    <span className="text-[10px] font-bold text-amber-400">
                      +{habit.xp} XP
                    </span>
                  </div>
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: cat.color }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={start}
          disabled={!name.trim()}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: name.trim()
              ? "linear-gradient(135deg, #F59E0B, #D97706)"
              : "#1E1E3E",
            color: name.trim() ? "#0A0A1A" : "#666",
            boxShadow: name.trim()
              ? "0 0 24px rgba(245, 158, 11, 0.3)"
              : "none",
          }}
        >
          ⚔️ Begin Your Journey
        </button>
      </div>
    </div>
  );
}
