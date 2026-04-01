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
  "What should I focus on today?",
  "How can I break my current goal into steps?",
  "Give me a productivity tip",
  "Analyze my progress this week",
];

export default function AICoach({
  profile,
  habits,
  dailyLog,
  goals,
  journal,
  streak,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Greetings, ${profile.name}! I am your AI mentor. I can see your quest log, your goals, and your adventure journal. Ask me anything about your journey, and I shall guide you with wisdom! ⚔️`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const buildContext = () => {
    const { level } = getLevelProgress(profile.xp);
    const title = getTitle(level);
    const today = getTodayString();
    const todayLog = dailyLog[today] || {};
    const completedQuests = habits
      .filter((h) => todayLog[h.id])
      .map((h) => h.name);
    const remainingQuests = habits
      .filter((h) => !todayLog[h.id])
      .map((h) => h.name);
    const activeGoals = goals
      .filter((g) => !g.completed)
      .map((g) => `${g.title} (${g.progress}%)`)
      .join(", ");
    const recentJournal = journal
      .slice(0, 5)
      .map((j) => `${j.date}: ${MOODS[j.mood]?.emoji} ${j.text.slice(0, 100)}`)
      .join("\n");

    return `You are an RPG mentor/coach in a gamified self-improvement app called LevelUp.
User: ${profile.name} | Level ${level} ${title} | ${profile.xp} XP | ${streak}-day streak
Today's completed quests: ${completedQuests.join(", ") || "None yet"}
Today's remaining quests: ${remainingQuests.join(", ") || "All done!"}
Active goals: ${activeGoals || "None set"}
Recent journal entries:
${recentJournal || "No entries yet"}

Be encouraging, use RPG metaphors naturally, give specific actionable advice based on their data. Keep responses concise (2-4 paragraphs). Use emojis sparingly.`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Simulate AI response (since we don't have API access in browser)
    setTimeout(() => {
      const responses = generateResponse(text, profile, habits, dailyLog, goals, streak);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: responses },
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="mb-3">
        <h2 className="text-xl font-bold text-white">AI Coach</h2>
        <p className="text-xs text-gray-500">Your wise mentor awaits</p>
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#12122A] border border-[#1E1E3E] text-gray-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={{
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg, #F59E0B, #D97706)"
                    : "#12122A",
                color: msg.role === "user" ? "#0A0A1A" : "#e0e0e0",
                border:
                  msg.role === "assistant" ? "1px solid #1E1E3E" : "none",
                borderBottomRightRadius:
                  msg.role === "user" ? "4px" : undefined,
                borderBottomLeftRadius:
                  msg.role === "assistant" ? "4px" : undefined,
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl text-sm bg-[#12122A] border border-[#1E1E3E] text-gray-400">
              <span className="animate-pulse">🧙 Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-[#1E1E3E]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Ask your mentor..."
          className="flex-1 px-4 py-3 rounded-xl bg-[#12122A] border border-[#1E1E3E] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "#0A0A1A",
          }}
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
      return `Incredible work, ${profile.name}! You've completed all your daily quests! 🎉\n\nYour dedication is forging you into a true legend. With a ${streak}-day streak, you're building unstoppable momentum.\n\nConsider reviewing your boss battles (goals) — ${activeGoals.length > 0 ? `"${activeGoals[0].title}" is at ${activeGoals[0].progress}%. A push forward there could bring you closer to victory!` : "perhaps it's time to set a new challenge worthy of your growing power!"}`;
    }
    return `Here's your battle plan for today, ${profile.name}! ⚔️\n\nYou've completed ${completed.length}/${habits.length} quests so far. Your remaining quests are: ${remaining.map((h) => h.name).join(", ")}.\n\n${remaining.length <= 2 ? "You're almost there! Just a couple more and you'll have a perfect day!" : `I'd suggest starting with "${remaining[0].name}" — small victories build momentum for the bigger battles ahead.`}\n\n${streak > 0 ? `Your ${streak}-day streak is a testament to your resolve. Don't let it break!` : "Today is a great day to start a new streak!"}`;
  }

  if (lowerInput.includes("goal") || lowerInput.includes("step") || lowerInput.includes("break")) {
    if (activeGoals.length === 0) {
      return `You don't have any active boss battles right now, ${profile.name}! 🐉\n\nEvery great hero needs a worthy challenge. Head to the Boss Battles section and set a goal that excites and slightly scares you — that's the sweet spot for growth!\n\nThink about: What's one thing you want to achieve in the next 30 days?`;
    }
    const goal = activeGoals[0];
    return `Let's strategize about "${goal.title}" (currently at ${goal.progress}%)! 🗺️\n\nHere's how I'd break this down:\n\n1. **Define the finish line** — What does 100% look like specifically?\n2. **Next milestone** — What would get you to ${Math.min(goal.progress + 25, 100)}%?\n3. **Daily action** — What's one small thing you can do TODAY toward this goal?\n4. **Remove blockers** — What's the #1 thing slowing you down?\n\nRemember: every boss was defeated one hit at a time. You're at Level ${level} — you have the skills for this!`;
  }

  if (lowerInput.includes("productivity") || lowerInput.includes("tip")) {
    const tips = [
      `Here's a powerful technique, ${profile.name}: The "2-Minute Rule" ⏱️\n\nIf a task takes less than 2 minutes, do it immediately. This clears mental clutter and builds momentum. Many of your remaining quests might fall into this category!\n\nAlso, try "environment design" — set up your space so the right actions are the easiest actions. Put your book on your pillow, your workout clothes by the door.`,
      `Level ${level} strategy unlocked: "Time Blocking" 📋\n\nInstead of a to-do list, assign each quest to a specific time block. Your brain responds better to "I'll read at 7pm" than "I should read today."\n\nPro tip: Do your hardest quest first thing in the morning when your willpower bar is full!`,
      `Here's a ${getTitle(level)}-tier technique: "Habit Stacking" 🔗\n\nAttach a new habit to an existing one. For example: "After I pour my morning coffee, I will meditate for 10 minutes."\n\nYour current ${habits.length} quests are building strong foundations. The key is connecting them to your daily routines so they become automatic.`,
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  if (lowerInput.includes("progress") || lowerInput.includes("analyze") || lowerInput.includes("week")) {
    const totalXPThisWeek = calculateWeekXP(habits, dailyLog);
    return `Here's your weekly progress report, ${profile.name}! 📊\n\n**Stats:**\n- Total XP this week: ${totalXPThisWeek}\n- Current streak: ${streak} day${streak !== 1 ? "s" : ""}\n- Active goals: ${activeGoals.length}\n- Today's completion: ${completed.length}/${habits.length} quests\n\n${totalXPThisWeek > 200 ? "You're crushing it! Your XP gains show real dedication. 🔥" : totalXPThisWeek > 50 ? "Solid progress! Consistency is building. Push for a bit more each day." : "The journey of a thousand miles begins with a single step. Every XP point counts!"}\n\n${streak >= 7 ? `A ${streak}-day streak! You're entering legendary territory! 🌟` : streak >= 3 ? `${streak} days and counting — you're building real momentum!` : "Focus on building that streak — even one completed quest per day keeps it alive!"}`;
  }

  // Default response
  return `Great question, ${profile.name}! 🧙\n\nAs your Level ${level} ${getTitle(level)} mentor, here's what I see: You have ${habits.length} active quests, ${activeGoals.length} boss battles in progress, and a ${streak}-day streak.\n\n${completed.length >= habits.length / 2 ? "You're making excellent progress today! Keep that momentum going." : "There's still time to complete more quests today. Every small action brings XP and builds your streak."}\n\nRemember: in this RPG of life, there are no game overs — only respawn points. What specific area would you like guidance on?`;
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
