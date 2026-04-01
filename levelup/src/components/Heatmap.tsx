"use client";

import { useMemo } from "react";
import { type DailyLog, type Habit } from "@/lib/storage";

interface Props {
  dailyLog: DailyLog;
  habits: Habit[];
}

export default function Heatmap({ dailyLog, habits }: Props) {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const cells: { date: string; level: number; count: number; total: number }[] = [];

    // Go back ~6 months (26 weeks)
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 26 * 7 - startDate.getDay());

    const d = new Date(startDate);
    while (d <= today) {
      const dateStr = d.toISOString().split("T")[0];
      const log = dailyLog[dateStr] || {};
      const count = Object.values(log).filter(Boolean).length;
      const total = habits.length || 1;
      const pct = count / total;
      const level = count === 0 ? 0 : pct < 0.25 ? 1 : pct < 0.5 ? 2 : pct < 0.75 ? 3 : 4;
      cells.push({ date: dateStr, level, count, total });
      d.setDate(d.getDate() + 1);
    }

    // Group into weeks (columns)
    const weeks: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    // Month labels
    const labels: { text: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const mid = week[Math.min(3, week.length - 1)];
      if (mid) {
        const month = new Date(mid.date + "T12:00:00").getMonth();
        if (month !== lastMonth) {
          labels.push({
            text: new Date(mid.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" }),
            col: wi,
          });
          lastMonth = month;
        }
      }
    });

    return { weeks, monthLabels: labels };
  }, [dailyLog, habits]);

  const COLORS = [
    "var(--border-light)",
    "rgba(232, 168, 73, 0.25)",
    "rgba(232, 168, 73, 0.45)",
    "rgba(232, 168, 73, 0.7)",
    "var(--accent)",
  ];

  const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div>
      {/* Month labels */}
      <div className="flex ml-8 mb-1.5" style={{ gap: 0 }}>
        {monthLabels.map((label, i) => (
          <div
            key={i}
            className="text-[10px] text-[var(--text-muted)]"
            style={{ position: "relative", left: `${label.col * 15}px`, width: 0, whiteSpace: "nowrap" }}
          >
            {label.text}
          </div>
        ))}
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1.5 shrink-0">
          {DAYS.map((d, i) => (
            <div key={i} className="h-[13px] text-[9px] text-[var(--text-muted)] leading-[13px] w-6 text-right pr-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px] overflow-x-auto scrollbar-hide">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, di) => {
                const cell = week[di];
                if (!cell) return <div key={di} className="w-[13px] h-[13px]" />;
                return (
                  <div
                    key={di}
                    className="w-[13px] h-[13px] rounded-sm transition-colors duration-200"
                    style={{ background: COLORS[cell.level] }}
                    title={`${cell.date}: ${cell.count}/${cell.total} quests`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[9px] text-[var(--text-muted)]">Less</span>
        {COLORS.map((color, i) => (
          <div key={i} className="w-[11px] h-[11px] rounded-sm" style={{ background: color }} />
        ))}
        <span className="text-[9px] text-[var(--text-muted)]">More</span>
      </div>
    </div>
  );
}
