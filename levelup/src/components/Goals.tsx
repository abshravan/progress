"use client";

import { useState } from "react";
import {
  type Goal,
  type Profile,
  saveGoals,
  saveProfile,
  generateId,
} from "@/lib/storage";

interface Props {
  goals: Goal[];
  profile: Profile;
  onUpdate: (g: Goal[], p: Profile) => void;
  onXPGain: (amount: number) => void;
}

export default function Goals({ goals, profile, onUpdate, onXPGain }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const activeGoals = goals.filter((g) => !g.completed);
  const conqueredGoals = goals.filter((g) => g.completed);

  const addGoal = () => {
    if (!title.trim()) return;
    const goal: Goal = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      deadline,
      progress: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const newGoals = [...goals, goal];
    saveGoals(newGoals);
    onUpdate(newGoals, profile);
    setTitle("");
    setDescription("");
    setDeadline("");
    setShowForm(false);
  };

  const updateProgress = (id: string, progress: number) => {
    const newGoals = goals.map((g) => {
      if (g.id !== id) return g;
      const wasComplete = g.completed;
      const isNowComplete = progress >= 100;
      if (isNowComplete && !wasComplete) {
        const newProfile = { ...profile, xp: profile.xp + 100 };
        saveProfile(newProfile);
        onUpdate(
          goals.map((gg) =>
            gg.id === id ? { ...gg, progress: 100, completed: true } : gg
          ),
          newProfile
        );
        onXPGain(100);
        return g; // handled above
      }
      return { ...g, progress };
    });
    // Only save if not handled by completion branch
    if (!newGoals.find((g) => g.id === id && g.progress >= 100 && !goals.find((og) => og.id === id)?.completed)) {
      saveGoals(newGoals);
      onUpdate(newGoals, profile);
    }
  };

  const deleteGoal = (id: string) => {
    const newGoals = goals.filter((g) => g.id !== id);
    saveGoals(newGoals);
    onUpdate(newGoals, profile);
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Boss Battles</h2>
          <p className="text-xs text-gray-500">
            {activeGoals.length} active · {conqueredGoals.length} conquered
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
            color: "white",
          }}
        >
          + New Goal
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl bg-[#12122A] border border-[#1E1E3E] space-y-3 animate-slide-down">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal title..."
            className="w-full px-3 py-2 rounded-lg bg-[#0A0A1A] border border-[#1E1E3E] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-[#0A0A1A] border border-[#1E1E3E] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0A0A1A] border border-[#1E1E3E] text-white text-sm focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={addGoal}
            disabled={!title.trim()}
            className="w-full py-2 rounded-lg text-sm font-semibold bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all disabled:opacity-30"
          >
            Create Boss Battle
          </button>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length === 0 && conqueredGoals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">🐉</div>
          <p className="text-sm">No boss battles yet. Set your first goal!</p>
        </div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                ⚔️ Active Battles
              </h3>
              {activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-xl bg-[#12122A] border border-[#1E1E3E] space-y-3 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {goal.title}
                      </h4>
                      {goal.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                      {goal.deadline && (
                        <p className="text-[10px] text-gray-600 mt-1">
                          📅 {goal.deadline}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-sm ml-2"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-purple-400 font-bold">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#0A0A1A] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${goal.progress}%`,
                          background:
                            "linear-gradient(90deg, #8B5CF6, #6D28D9)",
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={goal.progress}
                      onChange={(e) =>
                        updateProgress(goal.id, Number(e.target.value))
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {conqueredGoals.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                🏆 Conquered
              </h3>
              {conqueredGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3 rounded-xl bg-[#12122A]/50 border border-emerald-900/30 flex items-center gap-3 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs shrink-0">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-400 line-through truncate block">
                      {goal.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                    +100 XP
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-sm shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
