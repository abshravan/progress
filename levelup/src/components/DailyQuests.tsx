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
  loadDailyBonusClaimed,
  saveDailyBonusClaimed,
} from "@/lib/storage";
import { CATEGORIES, type Category, getTodayString } from "@/lib/game-data";
import { playQuestComplete, playQuestUndo, playBonusXP } from "@/lib/sounds";

interface Props {
  habits: Habit[];
  dailyLog: DailyLog;
  profile: Profile;
  onUpdate: (h: Habit[], d: DailyLog, p: Profile) => void;
  onXPGain: (amount: number) => void;
  onToast?: (message: string, undoAction?: () => void) => void;
}

export default function DailyQuests({ habits, dailyLog, profile, onUpdate, onXPGain, onToast }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("productivity");
  const [newXP, setNewXP] = useState(15);
  const [justToggled, setJustToggled] = useState<string | null>(null);
  const [bonusClaimed, setBonusClaimed] = useState(false);

  const today = getTodayString();
  const todayLog = dailyLog[today] || {};
  const completedCount = habits.filter((h) => todayLog[h.id]).length;
  const allComplete = habits.length > 0 && completedCount === habits.length;

  // Check daily bonus on all-complete
  const checkDailyBonus = (newProfile: Profile, newLog: DailyLog) => {
    const newTodayLog = newLog[today] || {};
    const allDone = habits.length > 0 && habits.every((h) => newTodayLog[h.id]);
    if (allDone && !bonusClaimed) {
      const claimed = loadDailyBonusClaimed();
      if (!claimed[today]) {
        const bonusXP = Math.round(habits.reduce((sum, h) => sum + h.xp, 0) * 0.5);
        claimed[today] = true;
        saveDailyBonusClaimed(claimed);
        setBonusClaimed(true);
        const bonusProfile = { ...newProfile, xp: newProfile.xp + bonusXP };
        saveProfile(bonusProfile);
        playBonusXP();
        onXPGain(bonusXP);
        onToast?.(`Daily Bonus! +${bonusXP} XP for completing all quests`);
        return bonusProfile;
      }
    }
    return newProfile;
  };

  const toggleHabit = (habit: Habit) => {
    setJustToggled(habit.id);
    setTimeout(() => setJustToggled(null), 400);

    const wasComplete = !!todayLog[habit.id];
    const newLog = { ...dailyLog };
    if (!newLog[today]) newLog[today] = {};
    if (wasComplete) {
      delete newLog[today][habit.id];
      const newProfile = { ...profile, xp: Math.max(0, profile.xp - habit.xp) };
      saveDailyLog(newLog);
      saveProfile(newProfile);
      onUpdate(habits, newLog, newProfile);
      playQuestUndo();
      onToast?.(`Unchecked "${habit.name}"`, () => {
        // Undo: re-complete
        const undoLog = { ...newLog };
        undoLog[today][habit.id] = true;
        const undoProfile = { ...newProfile, xp: newProfile.xp + habit.xp };
        saveDailyLog(undoLog);
        saveProfile(undoProfile);
        onUpdate(habits, undoLog, undoProfile);
      });
    } else {
      newLog[today][habit.id] = true;
      let newProfile = { ...profile, xp: profile.xp + habit.xp };
      saveDailyLog(newLog);
      saveProfile(newProfile);
      playQuestComplete();
      newProfile = checkDailyBonus(newProfile, newLog);
      onUpdate(habits, newLog, newProfile);
      onXPGain(habit.xp);
      onToast?.(`Completed "${habit.name}" +${habit.xp} XP`, () => {
        // Undo: uncomplete
        const undoLog = { ...newLog };
        delete undoLog[today][habit.id];
        const undoProfile = { ...newProfile, xp: Math.max(0, newProfile.xp - habit.xp) };
        saveDailyLog(undoLog);
        saveProfile(undoProfile);
        onUpdate(habits, undoLog, undoProfile);
      });
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

  const grouped = habits.reduce(
    (acc, h) => {
      acc[h.category] = acc[h.category] || [];
      acc[h.category].push(h);
      return acc;
    },
    {} as Record<Category, Habit[]>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
          Daily Quests
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] transition-all btn-press"
        >
          + New quest
        </button>
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        {completedCount} of {habits.length} completed today
        {habits.length > 0 && (
          <span className="ml-2 text-[var(--accent)]">
            ({Math.round((completedCount / habits.length) * 100)}%)
          </span>
        )}
      </p>

      {/* Progress bar for today */}
      {habits.length > 0 && (
        <div className="w-full h-1 rounded-full bg-[var(--border-light)] overflow-hidden mb-8">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${(completedCount / habits.length) * 100}%`,
              background: completedCount === habits.length ? "var(--green)" : "var(--accent)",
            }}
          />
        </div>
      )}

      {/* Daily Bonus Banner */}
      {habits.length > 0 && (
        <div
          className="rounded-xl border p-4 mb-6 flex items-center gap-4 transition-all duration-500"
          style={{
            borderColor: allComplete ? "rgba(115, 218, 202, 0.3)" : "var(--border-light)",
            background: allComplete ? "rgba(115, 218, 202, 0.08)" : "var(--card)",
          }}
        >
          <div className="text-2xl">{allComplete ? "🏆" : "🎯"}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium" style={{ color: allComplete ? "var(--green)" : "var(--text-primary)" }}>
              {allComplete ? "Daily Bonus Claimed!" : "Daily Bonus"}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {allComplete
                ? "You completed all quests today — 50% bonus XP awarded!"
                : `Complete all ${habits.length} quests for +${Math.round(habits.reduce((s, h) => s + h.xp, 0) * 0.5)} bonus XP`}
            </div>
          </div>
          <div className="text-xs font-semibold shrink-0" style={{ color: allComplete ? "var(--green)" : "var(--text-muted)" }}>
            {completedCount}/{habits.length}
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 mb-6 animate-slide-down">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="Quest name..."
            className="w-full px-4 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors mb-4"
            autoFocus
          />
          <div className="flex gap-2 mb-4 flex-wrap">
            {(Object.entries(CATEGORIES) as [Category, (typeof CATEGORIES)[Category]][]).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setNewCategory(key)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all btn-press"
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
          <div className="flex items-center gap-4 mb-5">
            <span className="text-xs text-[var(--text-muted)] shrink-0">XP reward</span>
            <input type="range" min={5} max={50} step={5} value={newXP} onChange={(e) => setNewXP(Number(e.target.value))} className="flex-1 accent-amber" />
            <span className="text-sm font-semibold text-[var(--accent)] w-8 text-right">{newXP}</span>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              Cancel
            </button>
            <button onClick={addHabit} disabled={!newName.trim()} className="px-5 py-2 rounded-lg text-xs font-medium bg-[var(--accent)] text-[#191919] disabled:opacity-30 transition-opacity btn-press">
              Create quest
            </button>
          </div>
        </div>
      )}

      {/* Habits */}
      {habits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-14 text-center animate-fade-in">
          <p className="text-base text-[var(--text-muted)] mb-3">No quests yet</p>
          <button onClick={() => setShowForm(true)} className="text-sm text-[var(--accent)] hover:underline btn-press">
            Create your first quest
          </button>
        </div>
      ) : (
        <div className="space-y-6 stagger-children">
          {(Object.entries(grouped) as [Category, Habit[]][]).map(([category, catHabits]) => {
            const cat = CATEGORIES[category];
            return (
              <div key={category}>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-sm">{cat.icon}</span>
                  <h3 className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: cat.color }}>
                    {cat.label}
                  </h3>
                  <div className="flex-1 h-px bg-[var(--border-light)]" />
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {catHabits.filter((h) => todayLog[h.id]).length}/{catHabits.length}
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] overflow-hidden divide-y divide-[var(--border-light)]">
                  {catHabits.map((habit) => {
                    const done = !!todayLog[habit.id];
                    const wasJustToggled = justToggled === habit.id;
                    return (
                      <div
                        key={habit.id}
                        className="flex items-center gap-4 px-5 py-3.5 group notion-row"
                      >
                        <button
                          onClick={() => toggleHabit(habit)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-200 shrink-0 ${wasJustToggled ? "animate-check-bounce" : ""}`}
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
                          className="flex-1 text-sm transition-all duration-200"
                          style={{
                            color: done ? "var(--text-muted)" : "var(--text-primary)",
                            textDecoration: done ? "line-through" : "none",
                          }}
                        >
                          {habit.name}
                        </span>
                        <span className="text-[11px] font-medium text-[var(--accent)] shrink-0 opacity-50">
                          +{habit.xp}
                        </span>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--pink)] transition-all text-sm ml-1 shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--pink-dim)]"
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
