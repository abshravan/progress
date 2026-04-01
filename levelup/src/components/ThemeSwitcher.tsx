"use client";

import { type ThemeId, saveTheme } from "@/lib/storage";
import { THEMES } from "@/lib/game-data";

interface Props {
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
}

export default function ThemeSwitcher({ currentTheme, onThemeChange }: Props) {
  const handleChange = (themeId: ThemeId) => {
    saveTheme(themeId);
    onThemeChange(themeId);
    applyTheme(themeId);
  };

  return (
    <div className="space-y-2">
      {(Object.entries(THEMES) as [ThemeId, (typeof THEMES)[ThemeId]][]).map(([id, theme]) => {
        const isActive = currentTheme === id;
        return (
          <button
            key={id}
            onClick={() => handleChange(id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
            style={{
              background: isActive ? "var(--card)" : "transparent",
              border: isActive ? "1px solid var(--border)" : "1px solid transparent",
            }}
          >
            {/* Color preview */}
            <div className="flex gap-1 shrink-0">
              {theme.preview.map((color, i) => (
                <div key={i} className="w-4 h-4 rounded-sm" style={{ background: color }} />
              ))}
            </div>
            <span className="text-[13px] font-medium" style={{ color: isActive ? "var(--text-primary)" : "var(--text-secondary)" }}>
              {theme.name}
            </span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function applyTheme(themeId: ThemeId) {
  const theme = THEMES[themeId];
  const root = document.documentElement;

  // Reset to defaults first
  const defaultVars = {
    "--background": "#191919",
    "--foreground": "#e0e0e0",
    "--sidebar": "#202020",
    "--card": "#252525",
    "--card-hover": "#2a2a2a",
    "--border": "#333",
    "--border-light": "#2a2a2a",
    "--text-primary": "#ebebeb",
    "--text-secondary": "#999",
    "--text-muted": "#666",
    "--accent": "#e8a849",
    "--accent-dim": "rgba(232, 168, 73, 0.12)",
    "--purple": "#9d7cd8",
    "--purple-dim": "rgba(157, 124, 216, 0.12)",
    "--green": "#73daca",
    "--green-dim": "rgba(115, 218, 202, 0.12)",
    "--pink": "#f7768e",
    "--pink-dim": "rgba(247, 118, 142, 0.12)",
    "--blue": "#7aa2f7",
    "--blue-dim": "rgba(122, 162, 247, 0.12)",
  };

  // Apply defaults
  for (const [key, value] of Object.entries(defaultVars)) {
    root.style.setProperty(key, value);
  }

  // Apply theme overrides
  if (theme.vars) {
    for (const [key, value] of Object.entries(theme.vars)) {
      root.style.setProperty(key, value);
    }
  }
}
