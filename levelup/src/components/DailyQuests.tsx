"use client";

import { useState, useRef } from "react";
import {
  type Habit,
  type DailyLog,
  type Profile,
  type ViewMode,
  saveHabits,
  saveDailyLog,
  saveProfile,
  generateId,
  loadDailyBonusClaimed,
  saveDailyBonusClaimed,
  loadHabitOrder,
  saveHabitOrder,
} from "@/lib/storage";
import { CATEGORIES, type Category, getTodayString, getXPMultiplier, isHabitActiveToday, getHabitStreak, PRIORITY_LABELS } from "@/lib/game-data";
import { playQuestComplete, playQuestUndo, playBonusXP } from "@/lib/sounds";

const FREQUENCY_OPTIONS: { value: Habit["frequency"]; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
];

const CUSTOM_COLORS = ["#e8a849", "#9d7cd8", "#73daca", "#f7768e", "#7aa2f7", "#ff9e64", "#bb9af7", "#2ac3de"];

interface Props {
  habits: Habit[];
  dailyLog: DailyLog;
  profile: Profile;
  viewMode: ViewMode;
  onUpdate: (h: Habit[], d: DailyLog, p: Profile) => void;
  onXPGain: (amount: number) => void;
  onToast?: (message: string, undoAction?: () => void) => void;
}

export default function DailyQuests({ habits, dailyLog, profile, viewMode, onUpdate, onXPGain, onToast }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("productivity");
  const [newXP, setNewXP] = useState(15);
  const [newFrequency, setNewFrequency] = useState<Habit["frequency"]>("daily");
  const [newColor, setNewColor] = useState<string | undefined>(undefined);
  const [newPriority, setNewPriority] = useState<1 | 2 | 3 | undefined>(undefined);
  const [showArchived, setShowArchived] = useState(false);
  const [justToggled, setJustToggled] = useState<string | null>(null);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const dragItem = useRef<string | null>(null);
  const dragOver = useRef<string | null>(null);

  const today = getTodayString();
  const todayLog = dailyLog[today] || {};

  // Filter habits active today (exclude archived)
  const nonArchived = habits.filter((h) => !h.archived);
  const archivedHabits = habits.filter((h) => h.archived);
  const activeHabits = nonArchived.filter(isHabitActiveToday);
  const completedCount = activeHabits.filter((h) => todayLog[h.id]).length;
  const allComplete = activeHabits.length > 0 && completedCount === activeHabits.length;
  const { multiplier, label: multiplierLabel } = getXPMultiplier();

  // Order habits
  const orderHabits = (list: Habit[]): Habit[] => {
    const order = loadHabitOrder();
    if (order.length === 0) return list;
    return [...list].sort((a, b) => {
      const ai = order.indexOf(a.id);
      const bi = order.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  };

  const orderedActiveHabits = orderHabits(activeHabits);

  // Drag handlers
  const handleDragStart = (id: string) => { dragItem.current = id; };
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragOver.current = id;
  };
  const handleDrop = () => {
    if (!dragItem.current || !dragOver.current || dragItem.current === dragOver.current) return;
    const ordered = orderedActiveHabits.map((h) => h.id);
    const fromIdx = ordered.indexOf(dragItem.current);
    const toIdx = ordered.indexOf(dragOver.current);
    if (fromIdx === -1 || toIdx === -1) return;
    ordered.splice(fromIdx, 1);
    ordered.splice(toIdx, 0, dragItem.current);
    // Merge with non-active habits
    const fullOrder = [...ordered, ...habits.filter((h) => !isHabitActiveToday(h)).map((h) => h.id)];
    saveHabitOrder(fullOrder);
    dragItem.current = null;
    dragOver.current = null;
    // Force re-render
    onUpdate(habits, dailyLog, profile);
  };

  const checkDailyBonus = (newProfile: Profile, newLog: DailyLog) => {
    const newTodayLog = newLog[today] || {};
    const allDone = activeHabits.length > 0 && activeHabits.every((h) => newTodayLog[h.id]);
    if (allDone && !bonusClaimed) {
      const claimed = loadDailyBonusClaimed();
      if (!claimed[today]) {
        const bonusXP = Math.round(activeHabits.reduce((sum, h) => sum + h.xp, 0) * 0.5);
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
    const effectiveXP = Math.round(habit.xp * multiplier);

    if (wasComplete) {
      delete newLog[today][habit.id];
      const newProfile = { ...profile, xp: Math.max(0, profile.xp - effectiveXP) };
      saveDailyLog(newLog);
      saveProfile(newProfile);
      onUpdate(habits, newLog, newProfile);
      playQuestUndo();
      onToast?.(`Unchecked "${habit.name}"`, () => {
        const undoLog = { ...newLog };
        undoLog[today][habit.id] = true;
        const undoProfile = { ...newProfile, xp: newProfile.xp + effectiveXP };
        saveDailyLog(undoLog);
        saveProfile(undoProfile);
        onUpdate(habits, undoLog, undoProfile);
      });
    } else {
      newLog[today][habit.id] = true;
      let newProfile = { ...profile, xp: profile.xp + effectiveXP };
      saveDailyLog(newLog);
      saveProfile(newProfile);
      playQuestComplete();
      newProfile = checkDailyBonus(newProfile, newLog);
      onUpdate(habits, newLog, newProfile);
      onXPGain(effectiveXP);
      onToast?.(`Completed "${habit.name}" +${effectiveXP} XP${multiplier > 1 ? ` (${multiplierLabel})` : ""}`, () => {
        const undoLog = { ...newLog };
        delete undoLog[today][habit.id];
        const undoProfile = { ...newProfile, xp: Math.max(0, newProfile.xp - effectiveXP) };
        saveDailyLog(undoLog);
        saveProfile(undoProfile);
        onUpdate(habits, undoLog, undoProfile);
      });
    }
  };

  const addHabit = () => {
    if (!newName.trim()) return;
    const habit: Habit = {
      id: generateId(),
      name: newName.trim(),
      category: newCategory,
      xp: newXP,
      frequency: newFrequency,
      color: newColor,
      priority: newPriority,
    };
    const newHabits = [...habits, habit];
    saveHabits(newHabits);
    onUpdate(newHabits, dailyLog, profile);
    setNewName("");
    setNewXP(15);
    setNewFrequency("daily");
    setNewColor(undefined);
    setNewPriority(undefined);
    setShowForm(false);
  };

  const deleteHabit = (id: string) => {
    const newHabits = habits.filter((h) => h.id !== id);
    saveHabits(newHabits);
    onUpdate(newHabits, dailyLog, profile);
  };

  const archiveHabit = (id: string) => {
    const newHabits = habits.map((h) => h.id === id ? { ...h, archived: true } : h);
    saveHabits(newHabits);
    onUpdate(newHabits, dailyLog, profile);
    onToast?.("Quest archived");
  };

  const unarchiveHabit = (id: string) => {
    const newHabits = habits.map((h) => h.id === id ? { ...h, archived: false } : h);
    saveHabits(newHabits);
    onUpdate(newHabits, dailyLog, profile);
    onToast?.("Quest restored");
  };

  const compact = viewMode === "compact";
  const py = compact ? "py-2.5" : "py-3.5";
  const px = compact ? "px-4" : "px-5";
  const gap = compact ? "gap-3" : "gap-4";

  const grouped = orderedActiveHabits.reduce(
    (acc, h) => {
      acc[h.category] = acc[h.category] || [];
      acc[h.category].push(h);
      return acc;
    },
    {} as Record<Category, Habit[]>
  );

  const inactiveCount = habits.length - activeHabits.length;

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
      <p className="text-sm text-[var(--text-muted)] mb-4">
        {completedCount} of {activeHabits.length} completed today
        {activeHabits.length > 0 && (
          <span className="ml-2 text-[var(--accent)]">
            ({Math.round((completedCount / activeHabits.length) * 100)}%)
          </span>
        )}
        {inactiveCount > 0 && (
          <span className="ml-2 text-[var(--text-muted)]">
            &middot; {inactiveCount} off today
          </span>
        )}
      </p>

      {/* XP Multiplier banner */}
      {multiplier > 1 && (
        <div className="rounded-lg border border-[var(--accent)] border-opacity-30 bg-[var(--accent-dim)] px-4 py-2.5 mb-4 flex items-center gap-3 animate-fade-in">
          <span className="text-base">⚡</span>
          <div>
            <span className="text-xs font-semibold text-[var(--accent)]">{multiplierLabel}</span>
            <span className="text-[11px] text-[var(--text-muted)] ml-2">Complete quests now for bonus XP!</span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {activeHabits.length > 0 && (
        <div className="w-full h-1 rounded-full bg-[var(--border-light)] overflow-hidden mb-6">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${(completedCount / activeHabits.length) * 100}%`,
              background: allComplete ? "var(--green)" : "var(--accent)",
            }}
          />
        </div>
      )}

      {/* Daily Bonus Banner */}
      {activeHabits.length > 0 && (
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
                : `Complete all ${activeHabits.length} quests for +${Math.round(activeHabits.reduce((s, h) => s + h.xp, 0) * 0.5)} bonus XP`}
            </div>
          </div>
          <div className="text-xs font-semibold shrink-0" style={{ color: allComplete ? "var(--green)" : "var(--text-muted)" }}>
            {completedCount}/{activeHabits.length}
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

          {/* Frequency */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-[var(--text-muted)] shrink-0">Schedule</span>
            <div className="flex gap-1.5">
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setNewFrequency(opt.value)}
                  className="px-2.5 py-1.5 rounded text-[11px] font-medium transition-all"
                  style={{
                    background: newFrequency === opt.value ? "var(--accent-dim)" : "transparent",
                    color: newFrequency === opt.value ? "var(--accent)" : "var(--text-muted)",
                    border: `1px solid ${newFrequency === opt.value ? "var(--accent)" + "44" : "var(--border-light)"}`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom color */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-[var(--text-muted)] shrink-0">Color</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setNewColor(undefined)}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px]"
                style={{
                  borderColor: !newColor ? "var(--accent)" : "var(--border-light)",
                  background: "var(--card-hover)",
                }}
              >
                {!newColor && "✓"}
              </button>
              {CUSTOM_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] text-white"
                  style={{
                    background: c,
                    borderColor: newColor === c ? "white" : c,
                  }}
                >
                  {newColor === c && "✓"}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-[var(--text-muted)] shrink-0">Priority</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setNewPriority(undefined)}
                className="px-2.5 py-1.5 rounded text-[11px] font-medium transition-all"
                style={{
                  background: !newPriority ? "var(--accent-dim)" : "transparent",
                  color: !newPriority ? "var(--accent)" : "var(--text-muted)",
                  border: `1px solid ${!newPriority ? "var(--accent)" + "44" : "var(--border-light)"}`,
                }}
              >
                None
              </button>
              {([1, 2, 3] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className="px-2.5 py-1.5 rounded text-[11px] font-medium transition-all"
                  style={{
                    background: newPriority === p ? PRIORITY_LABELS[p].color + "18" : "transparent",
                    color: newPriority === p ? PRIORITY_LABELS[p].color : "var(--text-muted)",
                    border: `1px solid ${newPriority === p ? PRIORITY_LABELS[p].color + "44" : "var(--border-light)"}`,
                  }}
                >
                  {PRIORITY_LABELS[p].label}
                </button>
              ))}
            </div>
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
      {activeHabits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-14 text-center animate-fade-in">
          <p className="text-base text-[var(--text-muted)] mb-3">
            {habits.length === 0 ? "No quests yet" : "No quests scheduled for today"}
          </p>
          <button onClick={() => setShowForm(true)} className="text-sm text-[var(--accent)] hover:underline btn-press">
            {habits.length === 0 ? "Create your first quest" : "Create a new quest"}
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
                    const habitColor = habit.color || cat.color;
                    const freqLabel = habit.frequency === "weekdays" ? "wkdays" : habit.frequency === "weekends" ? "wkends" : null;
                    const habitStreak = getHabitStreak(habit.id, dailyLog);
                    const pri = habit.priority ? PRIORITY_LABELS[habit.priority] : null;
                    return (
                      <div
                        key={habit.id}
                        draggable
                        onDragStart={() => handleDragStart(habit.id)}
                        onDragOver={(e) => handleDragOver(e, habit.id)}
                        onDrop={handleDrop}
                        className={`flex items-center ${gap} ${px} ${py} group notion-row cursor-grab active:cursor-grabbing`}
                      >
                        <button
                          onClick={() => toggleHabit(habit)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-200 shrink-0 ${wasJustToggled ? "animate-check-bounce" : ""}`}
                          style={{
                            background: done ? habitColor : "transparent",
                            border: `1.5px solid ${done ? habitColor : "var(--border)"}`,
                          }}
                        >
                          {done && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <span
                          className={`flex-1 ${compact ? "text-xs" : "text-sm"} transition-all duration-200`}
                          style={{
                            color: done ? "var(--text-muted)" : "var(--text-primary)",
                            textDecoration: done ? "line-through" : "none",
                          }}
                        >
                          {habit.name}
                        </span>
                        {pri && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ color: pri.color, background: pri.color + "18" }}>
                            {pri.label}
                          </span>
                        )}
                        {freqLabel && (
                          <span className="text-[9px] text-[var(--text-muted)] bg-[var(--border-light)] px-1.5 py-0.5 rounded shrink-0">
                            {freqLabel}
                          </span>
                        )}
                        {habitStreak > 1 && (
                          <span className="text-[9px] text-[var(--accent)] font-semibold shrink-0">
                            🔥{habitStreak}
                          </span>
                        )}
                        {habit.color && (
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: habit.color }} />
                        )}
                        <span className="text-[11px] font-medium text-[var(--accent)] shrink-0 opacity-50">
                          +{Math.round(habit.xp * multiplier)}
                        </span>
                        <button
                          onClick={() => archiveHabit(habit.id)}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--blue)] transition-all text-xs shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--blue-dim)]"
                          title="Archive"
                        >
                          ⌂
                        </button>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--pink)] transition-all text-sm shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--pink-dim)]"
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
      {/* Archived habits */}
      {archivedHabits.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center gap-2"
          >
            <span style={{ transform: showArchived ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▸</span>
            Archived ({archivedHabits.length})
          </button>
          {showArchived && (
            <div className="mt-3 rounded-xl border border-[var(--border-light)] bg-[var(--card)] overflow-hidden divide-y divide-[var(--border-light)] animate-slide-down">
              {archivedHabits.map((habit) => {
                const cat = CATEGORIES[habit.category];
                return (
                  <div key={habit.id} className="flex items-center gap-3 px-5 py-3 group notion-row">
                    <span className="text-sm opacity-40">{cat.icon}</span>
                    <span className="flex-1 text-sm text-[var(--text-muted)] line-through">{habit.name}</span>
                    <button
                      onClick={() => unarchiveHabit(habit.id)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-[var(--green)] hover:underline transition-all"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--pink)] transition-all text-sm"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
