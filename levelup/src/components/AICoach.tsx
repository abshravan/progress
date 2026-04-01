"use client";

import { useState, useRef, useEffect } from "react";
import {
  type Profile,
  type Habit,
  type DailyLog,
  type Goal,
  type JournalEntry,
} from "@/lib/storage";
import {
  getLevelProgress,
  getTitle,
  getTodayString,
  MOODS,
} from "@/lib/game-data";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  profile: Profile;
  habits: Habit[];
  dailyLog: DailyLog;
  goals: Goal[];
  journal: JournalEntry[];
  streak: number;
}

const QUICK_PROMPTS = [
  { label: "Today's focus", text: "What should I focus on today?" },
  { label: "Break down goal", text: "How can I break my current goal into steps?" },
  { label: "Productivity tip", text: "Give me a productivity tip" },
  { label: "Weekly analysis", text: "Analyze my progress this week" },
];

export default function AICoach({ profile, habits, dailyLog, goals, journal, streak }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Welcome, ${profile.name}. I'm your personal coach — I can see your quests, goals, journal, and progress. Ask me anything about your journey, and I'll provide tailored guidance.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const response = generateResponse(text, profile, habits, dailyLog, goals, streak);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-80px)]">
      <div className="mb-1">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          AI Coach
        </h1>
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-5">
        Your personal growth mentor, powered by your data
      </p>

      {/* Quick prompts */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.text}
            onClick={() => sendMessage(p.text)}
            className="px-3 py-1.5 rounded-md text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--card)] border border-[var(--border-light)] hover:border-[var(--border)] hover:text-[var(--text-primary)] transition-all"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-md bg-[var(--purple-dim)] flex items-center justify-center text-xs shrink-0 mr-3 mt-0.5">
                ◈
              </div>
            )}
            <div
              className="max-w-[75%] text-[13px] leading-relaxed"
              style={{
                color: msg.role === "user" ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              {msg.role === "user" ? (
                <div className="px-4 py-2.5 rounded-lg bg-[var(--accent-dim)] border border-[var(--accent)]" style={{ borderColor: "rgba(232, 168, 73, 0.25)" }}>
                  {msg.content}
                </div>
              ) : (
                <div className="px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border-light)]">
                  {msg.content.split("\n\n").map((para, j) => (
                    <p key={j} className={j > 0 ? "mt-3" : ""}>
                      {para.split("\n").map((line, k) => (
                        <span key={k}>
                          {k > 0 && <br />}
                          {line}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-md bg-[var(--purple-dim)] flex items-center justify-center text-xs shrink-0 mr-3 mt-0.5">
              ◈
            </div>
            <div className="px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border-light)] text-[13px] text-[var(--text-muted)]">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border-light)]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Ask your coach..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border-light)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[#191919] disabled:opacity-30 transition-opacity"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function generateResponse(
  input: string,
  profile: Profile,
  habits: Habit[],
  dailyLog: DailyLog,
  goals: Goal[],
  streak: number
): string {
  const today = getTodayString();
  const todayLog = dailyLog[today] || {};
  const completed = habits.filter((h) => todayLog[h.id]);
  const remaining = habits.filter((h) => !todayLog[h.id]);
  const activeGoals = goals.filter((g) => !g.completed);
  const { level } = getLevelProgress(profile.xp);
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes("focus") || lowerInput.includes("today")) {
    if (remaining.length === 0) {
      return `Outstanding work, ${profile.name}. You've completed all your daily quests.\n\nWith a ${streak}-day streak, you're building serious momentum. ${activeGoals.length > 0 ? `Consider pushing forward on "${activeGoals[0].title}" (currently at ${activeGoals[0].progress}%). Even 5% progress compounds over time.` : "It might be a good time to set a new goal to keep challenging yourself."}`;
    }
    return `Here's my recommendation for today, ${profile.name}.\n\nYou've completed ${completed.length}/${habits.length} quests so far. Remaining: ${remaining.map((h) => h.name).join(", ")}.\n\n${remaining.length <= 2 ? "You're close to a perfect day. Two more quests and you'll have completed everything." : `Start with "${remaining[0].name}" — building momentum with one small win makes the rest easier.`}\n\n${streak > 0 ? `Your ${streak}-day streak shows real commitment. Keep it going.` : "Today is day one. Make it count."}`;
  }

  if (lowerInput.includes("goal") || lowerInput.includes("step") || lowerInput.includes("break")) {
    if (activeGoals.length === 0) {
      return `You don't have any active goals right now.\n\nSet a goal that's specific and time-bound. Something like "Complete an online course by end of month" is better than "Learn more." Head to the Goals tab to create one.`;
    }
    const goal = activeGoals[0];
    return `Let's break down "${goal.title}" (currently at ${goal.progress}%).\n\n1. Define what 100% looks like — be specific about the end state\n2. Identify the next milestone that would get you to ${Math.min(goal.progress + 25, 100)}%\n3. Pick one action you can take today toward that milestone\n4. Remove or delegate the biggest thing slowing you down\n\nProgress isn't always linear. Focus on consistent effort over perfection.`;
  }

  if (lowerInput.includes("productivity") || lowerInput.includes("tip")) {
    const tips = [
      `Try the "two-minute rule," ${profile.name}.\n\nIf something takes less than two minutes, do it now. This prevents small tasks from piling up and creating mental overhead.\n\nAlso consider environment design — make the right actions the default. Put your book on your desk, keep your workout clothes visible.`,
      `Here's a strategy for Level ${level}: time blocking.\n\nInstead of a vague to-do list, assign each quest to a specific time slot. "Read at 7pm" is more effective than "read today" because it removes the decision of when.\n\nDo your hardest quest first when your energy is highest.`,
      `Try habit stacking, ${profile.name}.\n\nLink a new habit to one you already do consistently. "After I make coffee, I meditate for 10 minutes."\n\nYour ${habits.length} quests are building a foundation. The goal is to make them automatic — that's when real transformation happens.`,
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  if (lowerInput.includes("progress") || lowerInput.includes("analyze") || lowerInput.includes("week")) {
    const totalXPThisWeek = calculateWeekXP(habits, dailyLog);
    return `Weekly progress report for ${profile.name}.\n\nTotal XP this week: ${totalXPThisWeek}\nCurrent streak: ${streak} day${streak !== 1 ? "s" : ""}\nActive goals: ${activeGoals.length}\nToday: ${completed.length}/${habits.length} quests completed\n\n${totalXPThisWeek > 200 ? "Strong week. Your consistency is paying off — this kind of sustained effort leads to real results." : totalXPThisWeek > 50 ? "Steady progress. You're showing up, which is the hardest part. Try to push a little more each day." : "Every journey starts somewhere. Focus on completing just one quest each day to build the habit of showing up."}`;
  }

  return `Good question, ${profile.name}.\n\nHere's what I see: ${habits.length} active quests, ${activeGoals.length} goals in progress, and a ${streak}-day streak at Level ${level}.\n\n${completed.length >= habits.length / 2 ? "You're making solid progress today. Keep the momentum going." : "There's still time to make today count. Start with the easiest quest to build momentum."}\n\nWhat specific area would you like to dig into — habits, goals, or general strategy?`;
}

function calculateWeekXP(habits: Habit[], dailyLog: DailyLog): number {
  let total = 0;
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const log = dailyLog[dateStr] || {};
    total += habits.reduce((sum, h) => (log[h.id] ? sum + h.xp : sum), 0);
  }
  return total;
}
