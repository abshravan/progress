"use client";

import { useState } from "react";
import {
  type JournalEntry,
  type Profile,
  saveJournal,
  saveProfile,
  generateId,
} from "@/lib/storage";
import { MOODS } from "@/lib/game-data";

interface Props {
  journal: JournalEntry[];
  profile: Profile;
  onUpdate: (j: JournalEntry[], p: Profile) => void;
  onXPGain: (amount: number) => void;
}

export default function Journal({
  journal,
  profile,
  onUpdate,
  onXPGain,
}: Props) {
  const [mood, setMood] = useState(2);
  const [text, setText] = useState("");

  const saveEntry = () => {
    if (!text.trim()) return;
    const now = new Date();
    const entry: JournalEntry = {
      id: generateId(),
      text: text.trim(),
      mood,
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const newJournal = [entry, ...journal];
    const newProfile = { ...profile, xp: profile.xp + 10 };
    saveJournal(newJournal);
    saveProfile(newProfile);
    onUpdate(newJournal, newProfile);
    onXPGain(10);
    setText("");
    setMood(2);
  };

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h2 className="text-xl font-bold text-white">Adventure Log</h2>
        <p className="text-xs text-gray-500">{journal.length} entries recorded</p>
      </div>

      {/* Entry Form */}
      <div className="p-4 rounded-xl bg-[#12122A] border border-[#1E1E3E] space-y-4">
        {/* Mood Selector */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            How are you feeling?
          </label>
          <div className="flex justify-center gap-3">
            {MOODS.map((m, i) => (
              <button
                key={i}
                onClick={() => setMood(i)}
                className="flex flex-col items-center gap-1 transition-all duration-200"
                style={{
                  transform: mood === i ? "scale(1.25)" : "scale(1)",
                  opacity: mood === i ? 1 : 0.5,
                }}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span
                  className="text-[9px] text-gray-500"
                  style={{ color: mood === i ? "#F59E0B" : undefined }}
                >
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Record your thoughts, adventurer..."
          rows={4}
          className="w-full px-3 py-2 rounded-lg bg-[#0A0A1A] border border-[#1E1E3E] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
          style={{ fontFamily: "'Crimson Pro', 'Georgia', serif" }}
        />

        {/* Save Button */}
        <button
          onClick={saveEntry}
          disabled={!text.trim()}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: text.trim()
              ? "linear-gradient(135deg, #F59E0B, #D97706)"
              : "#1E1E3E",
            color: text.trim() ? "#0A0A1A" : "#666",
          }}
        >
          📝 Save Entry · +10 XP
        </button>
      </div>

      {/* Entries */}
      {journal.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📜</div>
          <p className="text-sm">Your adventure log is empty. Write your first entry!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {journal.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl bg-[#12122A] border border-[#1E1E3E]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{MOODS[entry.mood]?.emoji}</span>
                  <span className="text-xs text-gray-500">
                    {entry.date} · {entry.time}
                  </span>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">
                  +10 XP
                </span>
              </div>
              <p
                className="text-sm text-gray-300 leading-relaxed"
                style={{ fontFamily: "'Crimson Pro', 'Georgia', serif" }}
              >
                {entry.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
