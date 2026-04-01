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
import {
  getLevelProgress,
  getTitle,
  getLevel,
} from "@/lib/game-data";

type Tab = "dashboard" | "quests" | "goals" | "journal" | "coach";

const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
  { id: "dashboard", icon: "🏠", label: "Home" },
  { id: "quests", icon: "⚔️", label: "Quests" },
  { id: "goals", icon: "🐉", label: "Goals" },
  { id: "journal", icon: "📜", label: "Journal" },
  { id: "coach", icon: "🧙", label: "Coach" },
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

  // Load data from localStorage
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

  // Check for level up
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

  // Loading screen
  if (!loaded) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #0A0A1A 0%, #0F0F2A 100%)",
        }}
      >
        <div className="text-center animate-pulse">
          <div className="text-4xl mb-3">⚔️</div>
          <p className="text-gray-500 text-sm">Loading your quest...</p>
        </div>
      </div>
    );
  }

  // Onboarding
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

  const { level, progress } = getLevelProgress(profile.xp);
  const title = getTitle(level);
  const streak = calculateStreak();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, #0A0A1A 0%, #0F0F2A 100%)",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 pt-4 pb-3"
        style={{
          background: "linear-gradient(180deg, #12122E, transparent)",
        }}
      >
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #DC2626)",
              }}
            >
              {profile.name[0].toUpperCase()}
            </div>

            {/* Info + XP Bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white truncate">
                    {profile.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                    Lv.{level}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-sm"
                    style={{ opacity: streak > 0 ? 1 : 0.3 }}
                  >
                    🔥
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    {streak}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 rounded-full bg-[#1E1E3E] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                      background:
                        "linear-gradient(90deg, #F59E0B, #D97706)",
                      boxShadow: "0 0 12px rgba(245, 158, 11, 0.4)",
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 shrink-0">
                  {title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-24">
        <div className="max-w-md mx-auto">
          {tab === "dashboard" && (
            <Dashboard
              profile={profile}
              habits={habits}
              dailyLog={dailyLog}
              goals={goals}
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

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 px-4 py-2"
        style={{
          background: "rgba(13, 13, 34, 0.93)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1px solid #1E1E3E",
        }}
      >
        <div className="max-w-md mx-auto flex justify-around">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all duration-200"
              style={{
                opacity: tab === item.id ? 1 : 0.5,
                transform: tab === item.id ? "scale(1.05)" : "scale(1)",
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span
                className="text-[9px] font-semibold"
                style={{
                  color: tab === item.id ? "#F59E0B" : "#666",
                }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* XP Popup */}
      {xpPopup !== null && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-xp-float pointer-events-none">
          <div
            className="px-4 py-2 rounded-full text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              color: "#0A0A1A",
              boxShadow: "0 0 20px rgba(245, 158, 11, 0.5)",
            }}
          >
            +{xpPopup} XP
          </div>
        </div>
      )}

      {/* Level Up Modal */}
      {levelUpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="bg-[#12122A] border border-amber-500/30 rounded-2xl p-8 text-center max-w-sm w-full animate-scale-in"
            style={{ boxShadow: "0 0 40px rgba(245, 158, 11, 0.2)" }}
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-amber-400 mb-1">
              LEVEL UP!
            </h2>
            <p className="text-4xl font-bold text-white mb-2">
              Level {levelUpModal.level}
            </p>
            <p className="text-lg text-purple-400 font-semibold mb-6">
              {levelUpModal.title}
            </p>
            <button
              onClick={() => setLevelUpModal(null)}
              className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                color: "#0A0A1A",
              }}
            >
              Continue Your Journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
