"use client";

import { useState, useEffect, useCallback } from "react";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import DailyQuests from "@/components/DailyQuests";
import Goals from "@/components/Goals";
import Journal from "@/components/Journal";
import AICoach from "@/components/AICoach";
import FeaturesList from "@/components/FeaturesList";
import {
  type Profile,
  type Habit,
  type Goal,
  type JournalEntry,
  type DailyLog,
  loadProfile,
  loadHabits,
  loadGoals,
  loadJournal,
  loadDailyLog,
  downloadExport,
  importAllData,
  loadSoundEnabled,
  saveSoundEnabled,
} from "@/lib/storage";
import { getLevelProgress, getTitle, getLevel } from "@/lib/game-data";
import { playLevelUp, playExport } from "@/lib/sounds";

type Tab = "dashboard" | "quests" | "goals" | "journal" | "coach" | "features";

const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
  { id: "dashboard", icon: "⌘", label: "Dashboard" },
  { id: "quests", icon: "◆", label: "Daily Quests" },
  { id: "goals", icon: "◎", label: "Goals" },
  { id: "journal", icon: "✎", label: "Journal" },
  { id: "coach", icon: "◈", label: "AI Coach" },
  { id: "features", icon: "★", label: "Feature Ideas" },
];

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLog>({});
  const [tab, setTab] = useState<Tab>("dashboard");
  const [xpPopup, setXpPopup] = useState<number | null>(null);
  const [levelUpModal, setLevelUpModal] = useState<{
    level: number;
    title: string;
  } | null>(null);
  const [prevLevel, setPrevLevel] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pageKey, setPageKey] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState<{ message: string; undoAction?: () => void } | null>(null);
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setHabits(loadHabits());
    setGoals(loadGoals());
    setJournal(loadJournal());
    setDailyLog(loadDailyLog());
    setSoundEnabled(loadSoundEnabled());
    if (p) setPrevLevel(getLevel(p.xp));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!profile) return;
    const newLevel = getLevel(profile.xp);
    if (newLevel > prevLevel) {
      setLevelUpModal({ level: newLevel, title: getTitle(newLevel) });
      setPrevLevel(newLevel);
      playLevelUp();
    }
  }, [profile?.xp, prevLevel, profile]);

  const handleXPGain = useCallback((amount: number) => {
    setXpPopup(amount);
    setTimeout(() => setXpPopup(null), 1800);
  }, []);

  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    setPageKey((k) => k + 1);
  };

  const showToast = useCallback((message: string, undoAction?: () => void) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToast({ message, undoAction });
    const timer = setTimeout(() => setToast(null), 4000);
    setToastTimer(timer);
  }, [toastTimer]);

  const handleExport = () => {
    downloadExport();
    playExport();
    showToast("Data exported successfully");
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (importAllData(text)) {
        setProfile(loadProfile());
        setHabits(loadHabits());
        setGoals(loadGoals());
        setJournal(loadJournal());
        setDailyLog(loadDailyLog());
        showToast("Data imported successfully! Refreshing...");
        setShowImportDialog(false);
      } else {
        showToast("Import failed — invalid file format");
      }
    };
    reader.readAsText(file);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    saveSoundEnabled(next);
  };

  const calculateStreak = useCallback((): number => {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = dailyLog[dateStr];
      if (log && Object.keys(log).length > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [dailyLog]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#191919]">
        <div className="text-center animate-pulse">
          <div className="text-3xl mb-4">⚔️</div>
          <p className="text-[var(--text-muted)] text-sm font-light tracking-wide">Loading your world...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Onboarding
        onComplete={(p, h) => {
          setProfile(p);
          setHabits(h);
          setPrevLevel(1);
        }}
      />
    );
  }

  const { level, progress, currentXP, nextThreshold } = getLevelProgress(profile.xp);
  const title = getTitle(level);
  const streak = calculateStreak();

  return (
    <div className="min-h-screen flex bg-[#191919]">
      {/* ===== SIDEBAR ===== */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-[var(--border-light)] bg-[var(--sidebar)] transition-all duration-300 ease-out"
        style={{ width: sidebarCollapsed ? 60 : 260 }}
      >
        {/* Profile area */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border-light)]">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold text-white shrink-0 animate-pulse-glow"
                style={{ background: "linear-gradient(135deg, var(--accent), #c77d2e)" }}
              >
                {profile.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {profile.name}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Lv.{level} {title}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold text-white mx-auto animate-pulse-glow"
              style={{ background: "linear-gradient(135deg, var(--accent), #c77d2e)" }}
            >
              {profile.name[0].toUpperCase()}
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-sm shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--card-hover)]"
          >
            {sidebarCollapsed ? "▸" : "◂"}
          </button>
        </div>

        {/* XP Progress */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3.5 border-b border-[var(--border-light)] animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-medium">
                Experience
              </span>
              <span className="text-[10px] text-[var(--accent)] font-semibold">
                {currentXP}/{nextThreshold}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--border-light)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out animate-progress"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--accent), #c77d2e)",
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-[10px] text-[var(--text-muted)]">
                {profile.xp.toLocaleString()} total XP
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ opacity: streak > 0 ? 1 : 0.3 }}>
                  🔥
                </span>
                <span className="text-[10px] text-[var(--accent)] font-semibold">
                  {streak}d
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2.5 overflow-y-auto scrollbar-hide">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150"
                  style={{
                    background: active ? "var(--card)" : "transparent",
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "var(--card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span className="text-sm shrink-0 w-5 text-center opacity-70">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="text-[13px] font-medium">{item.label}</span>
                  )}
                  {active && !sidebarCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-t border-[var(--border-light)] space-y-1">
            <div className="flex gap-1">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--card-hover)] transition-all"
              >
                <span className="text-xs">↓</span> Export
              </button>
              <button
                onClick={() => setShowImportDialog(true)}
                className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--card-hover)] transition-all"
              >
                <span className="text-xs">↑</span> Import
              </button>
              <button
                onClick={toggleSound}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--card-hover)] transition-all"
              >
                {soundEnabled ? "🔊" : "🔇"}
              </button>
            </div>
            <div className="text-[10px] text-[var(--text-muted)] px-1">
              LevelUp v1.1 &middot; {new Date().getFullYear()}
            </div>
          </div>
        )}
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main
        className="flex-1 min-h-screen transition-all duration-300 ease-out"
        style={{ marginLeft: sidebarCollapsed ? 60 : 260 }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-8 lg:py-10" key={pageKey}>
          <div className="page-enter">
            {tab === "dashboard" && (
              <Dashboard
                profile={profile}
                habits={habits}
                dailyLog={dailyLog}
                goals={goals}
                journal={journal}
                onNavigate={(t) => switchTab(t as Tab)}
              />
            )}
            {tab === "quests" && (
              <DailyQuests
                habits={habits}
                dailyLog={dailyLog}
                profile={profile}
                onUpdate={(h, d, p) => {
                  setHabits(h);
                  setDailyLog(d);
                  setProfile(p);
                }}
                onXPGain={handleXPGain}
                onToast={showToast}
              />
            )}
            {tab === "goals" && (
              <Goals
                goals={goals}
                profile={profile}
                onUpdate={(g, p) => {
                  setGoals(g);
                  setProfile(p);
                }}
                onXPGain={handleXPGain}
              />
            )}
            {tab === "journal" && (
              <Journal
                journal={journal}
                profile={profile}
                onUpdate={(j, p) => {
                  setJournal(j);
                  setProfile(p);
                }}
                onXPGain={handleXPGain}
              />
            )}
            {tab === "coach" && (
              <AICoach
                profile={profile}
                habits={habits}
                dailyLog={dailyLog}
                goals={goals}
                journal={journal}
                streak={streak}
              />
            )}
            {tab === "features" && <FeaturesList />}
          </div>
        </div>
      </main>

      {/* ===== XP POPUP ===== */}
      {xpPopup !== null && (
        <div className="fixed top-8 right-10 z-50 animate-xp-float pointer-events-none">
          <div className="px-4 py-2 rounded-lg text-sm font-bold bg-[var(--accent)] text-[#191919] shadow-lg">
            +{xpPopup} XP
          </div>
        </div>
      )}

      {/* ===== TOAST ===== */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xl">
            <span className="text-sm text-[var(--text-primary)]">{toast.message}</span>
            {toast.undoAction && (
              <button
                onClick={() => {
                  toast.undoAction?.();
                  setToast(null);
                }}
                className="text-xs font-semibold text-[var(--accent)] hover:underline shrink-0 btn-press"
              >
                Undo
              </button>
            )}
            <button
              onClick={() => setToast(null)}
              className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm ml-1 shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ===== IMPORT DIALOG ===== */}
      {showImportDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-modal-backdrop"
          style={{ background: "rgba(0, 0, 0, 0.7)" }}
          onClick={() => setShowImportDialog(false)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 max-w-md w-full animate-scale-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Import Data</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Select a LevelUp backup JSON file. This will overwrite your current data.
            </p>
            <label className="block w-full p-8 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer text-center">
              <div className="text-2xl mb-2">📁</div>
              <div className="text-sm text-[var(--text-secondary)] mb-1">Click to select file</div>
              <div className="text-[11px] text-[var(--text-muted)]">JSON files only</div>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                }}
              />
            </label>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowImportDialog(false)}
                className="px-4 py-2 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== LEVEL UP MODAL ===== */}
      {levelUpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-modal-backdrop"
          style={{ background: "rgba(0, 0, 0, 0.7)" }}
        >
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center max-w-md w-full animate-scale-in shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-[var(--accent-dim)] flex items-center justify-center mx-auto mb-6 animate-confetti">
              <span className="text-4xl">⚔️</span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-3">
              Level Up
            </p>
            <p className="text-5xl font-bold text-[var(--text-primary)] mb-2">
              Level {levelUpModal.level}
            </p>
            <p className="text-xl text-[var(--accent)] font-medium mb-10">
              {levelUpModal.title}
            </p>
            <button
              onClick={() => setLevelUpModal(null)}
              className="px-8 py-3 rounded-lg text-sm font-medium bg-[var(--accent)] text-[#191919] btn-press"
            >
              Continue your journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
