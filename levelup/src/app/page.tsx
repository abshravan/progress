"use client";

import { useState, useEffect, useCallback } from "react";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import DailyQuests from "@/components/DailyQuests";
import Goals from "@/components/Goals";
import Journal from "@/components/Journal";
import AICoach from "@/components/AICoach";
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
} from "@/lib/storage";
import { getLevelProgress, getTitle, getLevel } from "@/lib/game-data";

type Tab = "dashboard" | "quests" | "goals" | "journal" | "coach";

const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
  { id: "dashboard", icon: "⌘", label: "Dashboard" },
  { id: "quests", icon: "◆", label: "Daily Quests" },
  { id: "goals", icon: "◎", label: "Goals" },
  { id: "journal", icon: "✎", label: "Journal" },
  { id: "coach", icon: "◈", label: "AI Coach" },
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

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setHabits(loadHabits());
    setGoals(loadGoals());
    setJournal(loadJournal());
    setDailyLog(loadDailyLog());
    if (p) setPrevLevel(getLevel(p.xp));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!profile) return;
    const newLevel = getLevel(profile.xp);
    if (newLevel > prevLevel) {
      setLevelUpModal({ level: newLevel, title: getTitle(newLevel) });
      setPrevLevel(newLevel);
    }
  }, [profile?.xp, prevLevel, profile]);

  const handleXPGain = useCallback((amount: number) => {
    setXpPopup(amount);
    setTimeout(() => setXpPopup(null), 1500);
  }, []);

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
        <div className="text-center">
          <div className="text-2xl mb-3 text-[var(--text-muted)]">⚔️</div>
          <p className="text-[var(--text-muted)] text-sm font-light">Loading...</p>
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
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-[var(--border-light)] bg-[var(--sidebar)] transition-all duration-200"
        style={{ width: sidebarCollapsed ? 56 : 240 }}
      >
        {/* Logo area */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[var(--border-light)]">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold text-white shrink-0"
                style={{ background: "linear-gradient(135deg, var(--accent), #c77d2e)" }}
              >
                {profile.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                  {profile.name}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  Lv.{level} {title}
                </div>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold text-white mx-auto"
              style={{ background: "linear-gradient(135deg, var(--accent), #c77d2e)" }}
            >
              {profile.name[0].toUpperCase()}
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-xs shrink-0"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? "▸" : "◂"}
          </button>
        </div>

        {/* XP Progress */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-[var(--border-light)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
                Experience
              </span>
              <span className="text-[10px] text-[var(--accent)] font-medium">
                {currentXP}/{nextThreshold} XP
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--border-light)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--accent), #c77d2e)",
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-[var(--text-muted)]">
                {profile.xp.toLocaleString()} total XP
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px]" style={{ opacity: streak > 0 ? 1 : 0.3 }}>
                  🔥
                </span>
                <span className="text-[10px] text-[var(--accent)] font-medium">
                  {streak}d streak
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2">
          {NAV_ITEMS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-all duration-100 mb-0.5"
                style={{
                  background: active ? "var(--card)" : "transparent",
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "var(--card-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <span className="text-[13px] shrink-0 w-5 text-center">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="text-[13px] font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom stats */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-t border-[var(--border-light)]">
            <div className="text-[10px] text-[var(--text-muted)]">
              LevelUp v1.0
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-200"
        style={{ marginLeft: sidebarCollapsed ? 56 : 240 }}
      >
        <div className="max-w-4xl mx-auto px-8 py-8 lg:px-12">
          {tab === "dashboard" && (
            <Dashboard
              profile={profile}
              habits={habits}
              dailyLog={dailyLog}
              goals={goals}
              journal={journal}
              onNavigate={(t) => setTab(t as Tab)}
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
        </div>
      </main>

      {/* XP Popup */}
      {xpPopup !== null && (
        <div className="fixed top-6 right-8 z-50 animate-xp-float pointer-events-none">
          <div className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--accent)] text-[#191919]">
            +{xpPopup} XP
          </div>
        </div>
      )}

      {/* Level Up Modal */}
      {levelUpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-10 text-center max-w-sm w-full animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-dim)] flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">⚔️</span>
            </div>
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium mb-2">
              Level Up
            </p>
            <p className="text-4xl font-bold text-[var(--text-primary)] mb-1">
              Level {levelUpModal.level}
            </p>
            <p className="text-lg text-[var(--accent)] font-medium mb-8">
              {levelUpModal.title}
            </p>
            <button
              onClick={() => setLevelUpModal(null)}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent)] text-[#191919] hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
