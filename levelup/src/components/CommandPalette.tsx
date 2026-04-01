"use client";

import { useState, useEffect, useRef, useMemo } from "react";

interface Action {
  id: string;
  label: string;
  description?: string;
  icon: string;
  action: () => void;
  keywords?: string[];
}

interface Props {
  actions: Action[];
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ actions, isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.toLowerCase();
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.keywords?.some((k) => k.includes(q))
    );
  }, [actions, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh] animate-modal-backdrop"
      style={{ background: "rgba(0, 0, 0, 0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-light)]">
          <span className="text-[var(--text-muted)] text-sm">⌘</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded text-[9px] text-[var(--text-muted)] bg-[var(--background)] border border-[var(--border-light)] font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto scrollbar-hide py-2">
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
              No matching commands
            </div>
          ) : (
            filtered.map((action, i) => (
              <button
                key={action.id}
                onClick={() => {
                  action.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors"
                style={{
                  background: i === selectedIndex ? "var(--card-hover)" : "transparent",
                }}
              >
                <span className="text-sm w-5 text-center shrink-0 opacity-70">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[var(--text-primary)]">{action.label}</div>
                  {action.description && (
                    <div className="text-[11px] text-[var(--text-muted)]">{action.description}</div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[var(--border-light)] flex items-center gap-4">
          <span className="text-[10px] text-[var(--text-muted)]">
            <kbd className="font-mono">↑↓</kbd> navigate
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            <kbd className="font-mono">↵</kbd> select
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            <kbd className="font-mono">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
