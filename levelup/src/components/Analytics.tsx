"use client";

import { useMemo, useState } from "react";
import { type Habit, type DailyLog, type JournalEntry } from "@/lib/storage";
import { CATEGORIES, type Category, MOODS } from "@/lib/game-data";
import Heatmap from "./Heatmap";

interface Props {
  habits: Habit[];
  dailyLog: DailyLog;
  journal: JournalEntry[];
  totalXP: number;
}

type ChartRange = 7 | 14 | 30;

export default function Analytics({ habits, dailyLog, journal, totalXP }: Props) {
  const [range, setRange] = useState<ChartRange>(14);

  const dates = useMemo(() => {
    const result: string[] = [];
    const now = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      result.push(d.toISOString().split("T")[0]);
    }
    return result;
  }, [range]);

  // XP per day
  const xpPerDay = useMemo(() => {
    return dates.map((date) => {
      const log = dailyLog[date] || {};
      return habits.reduce((sum, h) => (log[h.id] ? sum + h.xp : sum), 0);
    });
  }, [dates, dailyLog, habits]);

  const maxXP = Math.max(...xpPerDay, 1);

  // Completion rate per day
  const completionRates = useMemo(() => {
    return dates.map((date) => {
      const log = dailyLog[date] || {};
      if (habits.length === 0) return 0;
      return Object.values(log).filter(Boolean).length / habits.length;
    });
  }, [dates, dailyLog, habits]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const cats = Object.keys(CATEGORIES) as Category[];
    return cats.map((cat) => {
      const catHabits = habits.filter((h) => h.category === cat);
      if (catHabits.length === 0) return { cat, rate: 0 };
      let done = 0, total = 0;
      for (const date of dates) {
        const log = dailyLog[date] || {};
        for (const h of catHabits) { total++; if (log[h.id]) done++; }
      }
      return { cat, rate: total > 0 ? done / total : 0 };
    });
  }, [dates, dailyLog, habits]);

  // Mood trend
  const moodTrend = useMemo(() => {
    return dates.map((date) => {
      const dayEntries = journal.filter((j) => j.date === date);
      if (dayEntries.length === 0) return null;
      return dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length;
    });
  }, [dates, journal]);

  // Cumulative XP
  const cumulativeXP = useMemo(() => {
    let cum = 0;
    return xpPerDay.map((xp) => { cum += xp; return cum; });
  }, [xpPerDay]);
  const maxCum = Math.max(...cumulativeXP, 1);

  // SVG helpers
  const W = 500;
  const H = 120;
  const pad = { l: 0, r: 0, t: 5, b: 20 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const buildLinePath = (data: (number | null)[], maxVal: number) => {
    const points: string[] = [];
    data.forEach((v, i) => {
      if (v === null) return;
      const x = pad.l + (i / (data.length - 1)) * plotW;
      const y = pad.t + plotH - (v / maxVal) * plotH;
      points.push(`${points.length === 0 ? "M" : "L"}${x},${y}`);
    });
    return points.join(" ");
  };

  const buildAreaPath = (data: number[], maxVal: number) => {
    const line = data.map((v, i) => {
      const x = pad.l + (i / (data.length - 1)) * plotW;
      const y = pad.t + plotH - (v / maxVal) * plotH;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    }).join(" ");
    const lastX = pad.l + plotW;
    const firstX = pad.l;
    return `${line} L${lastX},${pad.t + plotH} L${firstX},${pad.t + plotH} Z`;
  };

  const formatShortDate = (d: string) => {
    const date = new Date(d + "T12:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
          Analytics
        </h1>
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        {totalXP.toLocaleString()} total XP &middot; {Object.keys(dailyLog).length} days tracked
      </p>

      {/* Range selector */}
      <div className="flex gap-2 mb-6">
        {([7, 14, 30] as ChartRange[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all btn-press"
            style={{
              background: range === r ? "var(--accent-dim)" : "var(--card)",
              color: range === r ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${range === r ? "var(--accent)" + "44" : "var(--border-light)"}`,
            }}
          >
            {r}d
          </button>
        ))}
      </div>

      {/* Heatmap */}
      <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 mb-5 card-hover">
        <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium mb-4">
          Activity Heatmap
        </h3>
        <Heatmap dailyLog={dailyLog} habits={habits} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 stagger-children">
        {/* XP Trend */}
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 card-hover">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium mb-4">
            Daily XP
          </h3>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <path d={buildAreaPath(xpPerDay, maxXP)} fill="var(--accent-dim)" />
            <path d={buildLinePath(xpPerDay, maxXP)} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
            {xpPerDay.map((v, i) => {
              const x = pad.l + (i / (xpPerDay.length - 1)) * plotW;
              const y = pad.t + plotH - (v / maxXP) * plotH;
              return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--accent)" opacity={v > 0 ? 1 : 0.2} />;
            })}
            {/* X labels */}
            {dates.filter((_, i) => i % Math.max(1, Math.floor(range / 5)) === 0 || i === dates.length - 1).map((d, i, arr) => {
              const idx = dates.indexOf(d);
              const x = pad.l + (idx / (dates.length - 1)) * plotW;
              return <text key={i} x={x} y={H - 2} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{formatShortDate(d)}</text>;
            })}
          </svg>
          <div className="flex justify-between mt-2 text-[10px] text-[var(--text-muted)]">
            <span>Avg: {Math.round(xpPerDay.reduce((a, b) => a + b, 0) / range)}/day</span>
            <span>Peak: {maxXP}</span>
          </div>
        </div>

        {/* Cumulative XP */}
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 card-hover">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium mb-4">
            Cumulative XP
          </h3>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <path d={buildAreaPath(cumulativeXP, maxCum)} fill="var(--green-dim)" />
            <path d={buildLinePath(cumulativeXP, maxCum)} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" />
            {dates.filter((_, i) => i % Math.max(1, Math.floor(range / 5)) === 0 || i === dates.length - 1).map((d) => {
              const idx = dates.indexOf(d);
              const x = pad.l + (idx / (dates.length - 1)) * plotW;
              return <text key={d} x={x} y={H - 2} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{formatShortDate(d)}</text>;
            })}
          </svg>
          <div className="flex justify-between mt-2 text-[10px] text-[var(--text-muted)]">
            <span>Period total: {cumulativeXP[cumulativeXP.length - 1] || 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
        {/* Completion Rate */}
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 card-hover">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium mb-4">
            Completion Rate
          </h3>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <path d={buildAreaPath(completionRates, 1)} fill="var(--purple-dim)" />
            <path d={buildLinePath(completionRates, 1)} fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" />
            {/* 50% line */}
            <line x1={pad.l} y1={pad.t + plotH / 2} x2={pad.l + plotW} y2={pad.t + plotH / 2} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
            {dates.filter((_, i) => i % Math.max(1, Math.floor(range / 5)) === 0 || i === dates.length - 1).map((d) => {
              const idx = dates.indexOf(d);
              const x = pad.l + (idx / (dates.length - 1)) * plotW;
              return <text key={d} x={x} y={H - 2} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{formatShortDate(d)}</text>;
            })}
          </svg>
          <div className="flex justify-between mt-2 text-[10px] text-[var(--text-muted)]">
            <span>Avg: {Math.round((completionRates.reduce((a, b) => a + b, 0) / range) * 100)}%</span>
            <span>Perfect days: {completionRates.filter((r) => r >= 1).length}</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 card-hover">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium mb-5">
            Category Rates ({range}d)
          </h3>
          <div className="space-y-4">
            {categoryBreakdown.map(({ cat, rate }) => {
              const c = CATEGORIES[cat];
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{c.icon}</span>
                      <span className="text-[12px] text-[var(--text-primary)] font-medium">{c.label}</span>
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color: c.color }}>{Math.round(rate * 100)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--border-light)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${rate * 100}%`, background: c.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mood trend */}
      {journal.length > 0 && (
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--card)] p-6 mt-5 card-hover">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-medium mb-4">
            Mood Trend
          </h3>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <path d={buildLinePath(moodTrend, 4)} fill="none" stroke="var(--pink)" strokeWidth="2" strokeLinecap="round" />
            {moodTrend.map((v, i) => {
              if (v === null) return null;
              const x = pad.l + (i / (moodTrend.length - 1)) * plotW;
              const y = pad.t + plotH - (v / 4) * plotH;
              return <circle key={i} cx={x} cy={y} r="3" fill="var(--pink)" />;
            })}
            {dates.filter((_, i) => i % Math.max(1, Math.floor(range / 5)) === 0 || i === dates.length - 1).map((d) => {
              const idx = dates.indexOf(d);
              const x = pad.l + (idx / (dates.length - 1)) * plotW;
              return <text key={d} x={x} y={H - 2} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{formatShortDate(d)}</text>;
            })}
            {/* Mood labels on right */}
            {MOODS.map((m, i) => {
              const y = pad.t + plotH - (i / 4) * plotH;
              return <text key={i} x={W - 2} y={y + 3} textAnchor="end" fontSize="10">{m.emoji}</text>;
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
