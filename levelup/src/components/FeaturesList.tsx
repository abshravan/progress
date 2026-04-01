"use client";

import { useState } from "react";

interface Feature {
  id: string;
  title: string;
  description: string;
  category: "gamification" | "social" | "analytics" | "ux" | "integration";
  difficulty: "easy" | "medium" | "hard";
  impact: "low" | "medium" | "high";
}

const FEATURE_CATEGORIES = {
  gamification: { label: "Gamification", icon: "⚔️", color: "var(--accent)", bgColor: "var(--accent-dim)" },
  social: { label: "Social", icon: "👥", color: "var(--blue)", bgColor: "var(--blue-dim)" },
  analytics: { label: "Analytics", icon: "📊", color: "var(--purple)", bgColor: "var(--purple-dim)" },
  ux: { label: "UX / Polish", icon: "✨", color: "var(--green)", bgColor: "var(--green-dim)" },
  integration: { label: "Integrations", icon: "🔗", color: "var(--pink)", bgColor: "var(--pink-dim)" },
};

const DIFFICULTY_LABELS = {
  easy: { label: "Easy", color: "var(--green)" },
  medium: { label: "Medium", color: "var(--accent)" },
  hard: { label: "Hard", color: "var(--pink)" },
};

const IMPACT_LABELS = {
  low: { label: "Low impact", dots: 1 },
  medium: { label: "Med impact", dots: 2 },
  high: { label: "High impact", dots: 3 },
};

const FEATURES: Feature[] = [
  // Gamification
  { id: "1", title: "Achievement Badges", description: "Unlock badges for milestones like 7-day streak, 100 quests completed, first goal conquered. Display them on the dashboard.", category: "gamification", difficulty: "medium", impact: "high" },
  { id: "2", title: "Daily Bonus XP", description: "Award bonus XP for completing all quests in a day. Multiplier increases with consecutive perfect days.", category: "gamification", difficulty: "easy", impact: "medium" },
  { id: "3", title: "Skill Trees", description: "Each category (Productivity, Learning, Health, Mindset) has a skill tree that unlocks perks as you level up in that area.", category: "gamification", difficulty: "hard", impact: "high" },
  { id: "4", title: "Weekly Challenges", description: "Auto-generated weekly challenges like 'Complete 5 health quests' or 'Journal 3 days in a row' with bonus XP rewards.", category: "gamification", difficulty: "medium", impact: "high" },
  { id: "5", title: "Loot Drops", description: "Random cosmetic rewards (themes, avatars, titles) that drop when completing quests. Rarity system with common to legendary items.", category: "gamification", difficulty: "hard", impact: "medium" },

  // Social
  { id: "6", title: "Share Progress Card", description: "Generate a beautiful shareable image of your weekly stats, level, and streak for social media.", category: "social", difficulty: "medium", impact: "medium" },
  { id: "7", title: "Public Profile Page", description: "Optional public page showing your level, badges, and streak. Shareable link for accountability.", category: "social", difficulty: "hard", impact: "medium" },

  // Analytics
  { id: "8", title: "Heatmap Calendar", description: "GitHub-style contribution heatmap showing quest completion density over months. Color intensity based on daily completion rate.", category: "analytics", difficulty: "medium", impact: "high" },
  { id: "9", title: "Trend Charts", description: "Line charts showing XP earned over time, completion rates per category, and mood trends from journal entries.", category: "analytics", difficulty: "medium", impact: "high" },
  { id: "10", title: "Personal Records", description: "Track and display personal bests: longest streak, most XP in a day, fastest goal completion, most productive category.", category: "analytics", difficulty: "easy", impact: "medium" },
  { id: "11", title: "Weekly Report", description: "Auto-generated weekly summary with key metrics, improvements, and suggestions. Viewable in-app or sent via notification.", category: "analytics", difficulty: "medium", impact: "high" },

  // UX
  { id: "12", title: "Theme Customization", description: "Multiple color themes beyond the current dark mode. Light mode, Tokyo Night, Dracula, Nord, Catppuccin, or custom colors.", category: "ux", difficulty: "medium", impact: "high" },
  { id: "13", title: "Keyboard Shortcuts", description: "Navigate between tabs, toggle quests, and create entries with keyboard shortcuts. Command palette with Cmd+K.", category: "ux", difficulty: "medium", impact: "medium" },
  { id: "14", title: "Drag & Drop Reorder", description: "Reorder quests and goals by dragging them. Priority ordering helps focus on what matters most.", category: "ux", difficulty: "medium", impact: "medium" },
  { id: "15", title: "Undo/Redo Actions", description: "Toast notification with undo button when completing quests, deleting entries, or other destructive actions.", category: "ux", difficulty: "easy", impact: "medium" },
  { id: "16", title: "Sound Effects", description: "Subtle, satisfying sound effects for quest completion, level up, and achievements. Toggle on/off in settings.", category: "ux", difficulty: "easy", impact: "low" },
  { id: "17", title: "Mobile Responsive", description: "Fully responsive layout with bottom tab navigation on mobile. Touch-friendly quest toggles and swipe gestures.", category: "ux", difficulty: "hard", impact: "high" },

  // Integrations
  { id: "18", title: "Data Export/Import", description: "Export all data as JSON for backup. Import from JSON to restore or transfer between devices.", category: "integration", difficulty: "easy", impact: "high" },
  { id: "19", title: "Calendar Sync", description: "Sync deadlines and habits with Google Calendar or iCal. See upcoming goals alongside your schedule.", category: "integration", difficulty: "hard", impact: "medium" },
  { id: "20", title: "Pomodoro Timer", description: "Built-in focus timer linked to quests. Start a 25-min timer for a quest, auto-complete when timer ends. Track focus time.", category: "integration", difficulty: "medium", impact: "high" },
];

type FilterCategory = "all" | Feature["category"];
type SortBy = "impact" | "difficulty" | "category";

export default function FeaturesList() {
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [sortBy, setSortBy] = useState<SortBy>("impact");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = FEATURES.filter((f) => filter === "all" || f.category === filter);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "impact") {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.impact] - order[b.impact];
    }
    if (sortBy === "difficulty") {
      const order = { easy: 0, medium: 1, hard: 2 };
      return order[a.difficulty] - order[b.difficulty];
    }
    return a.category.localeCompare(b.category);
  });

  const categoryCount = (cat: FilterCategory) =>
    cat === "all" ? FEATURES.length : FEATURES.filter((f) => f.category === cat).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
          Feature Ideas
        </h1>
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        {FEATURES.length} features to make LevelUp even better. Sorted by what matters most.
      </p>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(["all", ...Object.keys(FEATURE_CATEGORIES)] as FilterCategory[]).map((cat) => {
          const active = filter === cat;
          const catInfo = cat !== "all" ? FEATURE_CATEGORIES[cat as Feature["category"]] : null;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all btn-press"
              style={{
                background: active ? (catInfo?.bgColor || "var(--accent-dim)") : "var(--card)",
                border: `1px solid ${active ? (catInfo?.color || "var(--accent)") + "55" : "var(--border-light)"}`,
                color: active ? (catInfo?.color || "var(--accent)") : "var(--text-muted)",
              }}
            >
              {catInfo ? `${catInfo.icon} ${catInfo.label}` : "All"}
              <span className="ml-1.5 opacity-60">{categoryCount(cat)}</span>
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[11px] text-[var(--text-muted)]">Sort by</span>
        {(["impact", "difficulty", "category"] as SortBy[]).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className="px-2.5 py-1 rounded text-[11px] font-medium transition-all"
            style={{
              background: sortBy === s ? "var(--card)" : "transparent",
              color: sortBy === s ? "var(--text-primary)" : "var(--text-muted)",
              border: sortBy === s ? "1px solid var(--border)" : "1px solid transparent",
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Feature list */}
      <div className="space-y-2 stagger-children">
        {sorted.map((feature) => {
          const cat = FEATURE_CATEGORIES[feature.category];
          const diff = DIFFICULTY_LABELS[feature.difficulty];
          const impact = IMPACT_LABELS[feature.impact];
          const isExpanded = expandedId === feature.id;

          return (
            <div
              key={feature.id}
              className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] overflow-hidden transition-all duration-200 card-hover"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : feature.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left"
              >
                {/* Category icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ background: cat.bgColor }}
                >
                  {cat.icon}
                </div>

                {/* Title and tags */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--text-primary)] mb-1">
                    {feature.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ color: diff.color, background: diff.color + "18" }}
                    >
                      {diff.label}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: i < impact.dots ? "var(--accent)" : "var(--border)",
                          }}
                        />
                      ))}
                      <span className="ml-0.5">{impact.label}</span>
                    </span>
                  </div>
                </div>

                {/* Expand indicator */}
                <span
                  className="text-[var(--text-muted)] text-xs shrink-0 transition-transform duration-200"
                  style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                >
                  ▸
                </span>
              </button>

              {/* Expanded description */}
              {isExpanded && (
                <div className="px-5 pb-4 animate-slide-down">
                  <div className="ml-13 pl-4 border-l-2 border-[var(--border-light)]" style={{ marginLeft: "52px" }}>
                    <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ color: cat.color, background: cat.bgColor }}>
                        {cat.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6">
        <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium mb-4">
          Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {FEATURES.filter((f) => f.difficulty === "easy").length}
            </div>
            <div className="text-[11px] text-[var(--green)]">Quick wins</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {FEATURES.filter((f) => f.impact === "high").length}
            </div>
            <div className="text-[11px] text-[var(--accent)]">High impact</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {Object.keys(FEATURE_CATEGORIES).length}
            </div>
            <div className="text-[11px] text-[var(--purple)]">Categories</div>
          </div>
        </div>
      </div>
    </div>
  );
}
