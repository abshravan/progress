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
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    if (progress >= 100 && !goal.completed) {
      const newProfile = { ...profile, xp: profile.xp + 100 };
      const newGoals = goals.map((g) =>
        g.id === id ? { ...g, progress: 100, completed: true } : g
      );
      saveGoals(newGoals);
      saveProfile(newProfile);
      onUpdate(newGoals, newProfile);
      onXPGain(100);
    } else if (!goal.completed) {
      const newGoals = goals.map((g) =>
        g.id === id ? { ...g, progress } : g
      );
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
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
          Goals
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] transition-all btn-press"
        >
          + New goal
        </button>
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        {activeGoals.length} active &middot; {conqueredGoals.length} completed
      </p>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 mb-6 animate-slide-down">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal title..."
            className="w-full px-3 py-2 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)] transition-colors mb-3"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)..."
            rows={2}
            className="w-full px-3 py-2 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)] transition-colors resize-none mb-3"
          />
          <div className="flex items-center gap-3 mb-4">
            <label className="text-xs text-[var(--text-muted)] shrink-0">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="px-3 py-1.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--purple)] transition-colors"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              Cancel
            </button>
            <button onClick={addGoal} disabled={!title.trim()} className="px-4 py-1.5 rounded-md text-xs font-medium bg-[var(--purple)] text-white disabled:opacity-30 transition-opacity">
              Create goal
            </button>
          </div>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length === 0 && conqueredGoals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-14 text-center animate-fade-in">
          <p className="text-base text-[var(--text-muted)] mb-3">No goals yet</p>
          <button onClick={() => setShowForm(true)} className="text-sm text-[var(--accent)] hover:underline btn-press">
            Set your first goal
          </button>
        </div>
      ) : (
        <div className="space-y-8 stagger-children">
          {activeGoals.length > 0 && (
            <div>
              <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-semibold mb-3 flex items-center gap-2.5">
                <span>Active</span>
                <div className="flex-1 h-px bg-[var(--border-light)]" />
              </h3>
              <div className="space-y-3">
                {activeGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-5 group card-hover"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-[15px] font-medium text-[var(--text-primary)]">
                          {goal.title}
                        </h4>
                        {goal.description && (
                          <p className="text-[13px] text-[var(--text-muted)] mt-1 line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                        {goal.deadline && (
                          <p className="text-[11px] text-[var(--text-muted)] mt-2">
                            Due {goal.deadline}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--pink)] transition-all text-xs shrink-0"
                      >
                        ×
                      </button>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1.5">
                        <span className="text-[var(--text-muted)]">Progress</span>
                        <span className="text-[var(--purple)] font-medium">{goal.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--border-light)] overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${goal.progress}%`, background: "var(--purple)" }}
                        />
                      </div>
                      <input
                        type="range" min={0} max={100} step={5}
                        value={goal.progress}
                        onChange={(e) => updateProgress(goal.id, Number(e.target.value))}
                        className="w-full accent-purple"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {conqueredGoals.length > 0 && (
            <div>
              <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-semibold mb-3 flex items-center gap-2.5">
                <span>Completed</span>
                <div className="flex-1 h-px bg-[var(--border-light)]" />
              </h3>
              <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] overflow-hidden divide-y divide-[var(--border-light)]">
                {conqueredGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center gap-4 px-5 py-3.5 group notion-row">
                    <div className="w-[18px] h-[18px] rounded flex items-center justify-center bg-[var(--green)] shrink-0">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="flex-1 text-[13px] text-[var(--text-muted)] line-through">{goal.title}</span>
                    <span className="text-[10px] text-[var(--green)] font-medium">+100 XP</span>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--pink)] transition-all text-xs ml-1 shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
