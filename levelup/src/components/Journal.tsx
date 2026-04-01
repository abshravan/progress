"use client";

import { useState, useMemo } from "react";
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

export default function Journal({ journal, profile, onUpdate, onXPGain }: Props) {
  const [mood, setMood] = useState(2);
  const [text, setText] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMood, setFilterMood] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

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
    setIsComposing(false);
  };

  const updateEntry = (id: string) => {
    if (!editText.trim()) return;
    const newJournal = journal.map((e) =>
      e.id === id ? { ...e, text: editText.trim() } : e
    );
    saveJournal(newJournal);
    onUpdate(newJournal, profile);
    setEditingId(null);
    setEditText("");
  };

  const deleteEntry = (id: string) => {
    const newJournal = journal.filter((e) => e.id !== id);
    saveJournal(newJournal);
    onUpdate(newJournal, profile);
  };

  // Filter and search
  const filteredEntries = useMemo(() => {
    let entries = journal;
    if (filterMood !== null) {
      entries = entries.filter((e) => e.mood === filterMood);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      entries = entries.filter((e) => e.text.toLowerCase().includes(q));
    }
    return entries;
  }, [journal, filterMood, searchQuery]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: Record<string, JournalEntry[]> = {};
    for (const entry of filteredEntries) {
      if (!groups[entry.date]) groups[entry.date] = [];
      groups[entry.date].push(entry);
    }
    return groups;
  }, [filteredEntries]);

  // Mood distribution for stats
  const moodCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const e of journal) counts[e.mood]++;
    return counts;
  }, [journal]);
  const maxMoodCount = Math.max(...moodCounts, 1);

  const formatDate = (dateStr: string): string => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Journal
        </h1>
        {!isComposing && (
          <button
            onClick={() => setIsComposing(true)}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-primary)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors"
          >
            + New entry
          </button>
        )}
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        {journal.length} {journal.length === 1 ? "entry" : "entries"} &middot; {journal.length * 10} XP earned
      </p>

      {/* Stats bar */}
      {journal.length > 0 && (
        <div className="rounded-lg border border-[var(--border-light)] bg-[var(--card)] p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
              Mood Distribution
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">
              {journal.length} total entries
            </span>
          </div>
          <div className="flex items-end gap-3 h-10">
            {MOODS.map((m, i) => {
              const height = Math.max((moodCounts[i] / maxMoodCount) * 100, 8);
              const isActive = filterMood === i;
              return (
                <button
                  key={i}
                  onClick={() => setFilterMood(filterMood === i ? null : i)}
                  className="flex-1 flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className="w-full rounded-sm transition-all duration-300"
                    style={{
                      height: `${height}%`,
                      background: isActive ? "var(--accent)" : "var(--border)",
                      opacity: isActive ? 1 : filterMood !== null ? 0.3 : 0.6,
                    }}
                  />
                  <div className="flex flex-col items-center">
                    <span className="text-xs">{m.emoji}</span>
                    <span className="text-[9px] text-[var(--text-muted)]">{moodCounts[i]}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {filterMood !== null && (
            <button
              onClick={() => setFilterMood(null)}
              className="text-[10px] text-[var(--accent)] hover:underline mt-2"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Compose area */}
      {isComposing && (
        <div className="rounded-lg border border-[var(--border-light)] bg-[var(--card)] p-5 mb-5 animate-slide-down">
          {/* Mood selector */}
          <div className="flex items-center gap-1 mb-4">
            <span className="text-[11px] text-[var(--text-muted)] mr-2">Mood</span>
            {MOODS.map((m, i) => (
              <button
                key={i}
                onClick={() => setMood(i)}
                className="w-9 h-9 rounded-md flex items-center justify-center transition-all duration-150"
                style={{
                  background: mood === i ? "var(--accent-dim)" : "transparent",
                  border: mood === i ? "1px solid var(--accent)" : "1px solid transparent",
                  transform: mood === i ? "scale(1.1)" : "scale(1)",
                }}
              >
                <span className="text-base">{m.emoji}</span>
              </button>
            ))}
            <span className="text-[11px] text-[var(--text-muted)] ml-2">{MOODS[mood].label}</span>
          </div>

          {/* Text area */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind? Reflect on your day, your goals, your growth..."
            rows={6}
            className="w-full px-0 py-0 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none journal-text text-[15px]"
            autoFocus
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-light)]">
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-[var(--text-muted)]">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                {text.length} chars
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setIsComposing(false); setText(""); setMood(2); }}
                className="px-3 py-1.5 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Discard
              </button>
              <button
                onClick={saveEntry}
                disabled={!text.trim()}
                className="px-4 py-1.5 rounded-md text-xs font-medium bg-[var(--accent)] text-[#191919] disabled:opacity-30 transition-opacity flex items-center gap-1.5"
              >
                Save
                <span className="opacity-70">+10 XP</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {journal.length > 3 && (
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full px-3 py-2 rounded-md bg-[var(--card)] border border-[var(--border-light)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
      )}

      {/* Entries by date */}
      {filteredEntries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-10 text-center">
          {journal.length === 0 ? (
            <>
              <p className="text-sm text-[var(--text-muted)] mb-2">Your journal is empty</p>
              <button onClick={() => setIsComposing(true)} className="text-sm text-[var(--accent)] hover:underline">
                Write your first entry
              </button>
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No entries match your search</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([date, entries]) => (
            <div key={date}>
              <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-3 flex items-center gap-2">
                <span>{formatDate(date)}</span>
                <div className="flex-1 h-px bg-[var(--border-light)]" />
                <span>{entries.length} {entries.length === 1 ? "entry" : "entries"}</span>
              </h3>
              <div className="space-y-2">
                {entries.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  const isEditing = editingId === entry.id;
                  const isLong = entry.text.length > 200;

                  return (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-[var(--border-light)] bg-[var(--card)] group transition-colors hover:border-[var(--border)]"
                    >
                      <div className="p-5">
                        {/* Entry header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{MOODS[entry.mood]?.emoji}</span>
                            <div>
                              <span className="text-xs text-[var(--text-muted)]">
                                {entry.time}
                              </span>
                              <span className="text-xs text-[var(--text-muted)] mx-1.5">&middot;</span>
                              <span className="text-xs text-[var(--text-muted)]">
                                {MOODS[entry.mood]?.label}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  setEditingId(null);
                                } else {
                                  setEditingId(entry.id);
                                  setEditText(entry.text);
                                }
                              }}
                              className="px-2 py-1 rounded text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--card-hover)] transition-all"
                            >
                              {isEditing ? "Cancel" : "Edit"}
                            </button>
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              className="px-2 py-1 rounded text-[10px] text-[var(--text-muted)] hover:text-[var(--pink)] hover:bg-[var(--pink-dim)] transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Entry body */}
                        {isEditing ? (
                          <div>
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              rows={4}
                              className="w-full px-0 py-0 bg-transparent text-[var(--text-primary)] focus:outline-none resize-none journal-text text-[15px]"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-[var(--border-light)]">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1.5 rounded-md text-xs text-[var(--text-muted)]"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => updateEntry(entry.id)}
                                className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--accent)] text-[#191919]"
                              >
                                Save changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p
                              className={`text-[15px] text-[var(--text-secondary)] journal-text ${!isExpanded && isLong ? "line-clamp-3" : ""}`}
                            >
                              {entry.text}
                            </p>
                            {isLong && (
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                                className="text-[11px] text-[var(--accent)] hover:underline mt-2"
                              >
                                {isExpanded ? "Show less" : "Read more"}
                              </button>
                            )}
                          </>
                        )}

                        {/* Entry footer */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border-light)]">
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {entry.text.split(/\s+/).filter(Boolean).length} words
                          </span>
                          <span className="text-[10px] text-[var(--accent)] font-medium">
                            +10 XP
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
