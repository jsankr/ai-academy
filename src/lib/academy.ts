import raw from "@/data/course-data.json";
import { useCallback, useEffect, useMemo, useState } from "react";

export type Week = [title: string, topic: string, exercise: string, project: string];
export type Module = [title: string, learn: string, exercise: string];
export type Track = {
  id: "kids" | "beginners" | "builders" | "experts";
  emoji: string;
  name: string;
  audience: string;
  promise: string;
  modules: Module[];
  capstone: string;
  assessment: string;
};
export type Agent = [name: string, job: string, prompt: string, test: string];
export type Tool = [name: string, url: string, use: string];
export type QuizItem = [q: string, options: string[], answer: number, why: string];

export const DATA = raw as unknown as {
  weeks: Week[];
  tracks: Track[];
  agents: Agent[];
  tools: Tool[];
  terms: Record<string, string>;
  quiz: QuizItem[];
};

export const PHASES = [
  { name: "Foundations", range: "Weeks 1–3", from: 0, to: 3 },
  { name: "Create & apply", range: "Weeks 4–7", from: 3, to: 7 },
  { name: "Agents", range: "Weeks 8–11", from: 7, to: 11 },
  { name: "Ship it", range: "Week 12", from: 11, to: 12 },
] as const;
export const phaseOf = (i: number) => PHASES.find((p) => i >= p.from && i < p.to)!;

/** The site's fixed weekly rhythm (IST). Each session maps onto a field of the week. */
export const SESSIONS = [
  { day: "Monday", short: "Mon", kind: "Understand", time: "7:30–8:30 PM", mins: 60 },
  { day: "Wednesday", short: "Wed", kind: "Experiment", time: "7:30–9:00 PM", mins: 90 },
  { day: "Saturday", short: "Sat", kind: "Build", time: "10:00 AM–12:00 PM", mins: 120 },
  { day: "Sunday", short: "Sun", kind: "Play & review", time: "10:00–10:30 AM", mins: 30 },
] as const;
export const sessionText = (w: Week, s: number) =>
  s === 0 ? w[1] : s === 1 ? w[2] : s === 2 ? w[3] : "Quiz yourself and write down one thing that surprised you.";

/** Same thresholds as the live site's cockpit. */
export const rankFor = (n: number) =>
  n >= 12 ? "Trailblazer" : n >= 9 ? "Architect" : n >= 6 ? "Builder" : n >= 3 ? "Explorer+" : "Explorer";
export const nextRankAt = (n: number) => (n >= 12 ? null : n >= 9 ? 12 : n >= 6 ? 9 : n >= 3 ? 6 : 3);

export const VIEWS = ["overview", "roadmap", "paths", "agents", "quiz", "glossary", "toolbox", "setup"] as const;
export type View = (typeof VIEWS)[number];

type State = {
  track: Track["id"];
  sessions: Record<string, boolean>; // "week-session" -> done
  quiz: Record<number, number>;
  agentChecks: Record<string, boolean>;
  theme: "system" | "light" | "dark";
};
const KEY = "ai-academy-app-v1";
const initial: State = { track: "beginners", sessions: {}, quiz: {}, agentChecks: {}, theme: "system" };

function load(): State {
  try {
    const v = localStorage.getItem(KEY);
    return v ? { ...initial, ...JSON.parse(v) } : initial;
  } catch {
    return initial;
  }
}

export function useAcademy() {
  const [s, set] = useState<State>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* storage blocked: progress lasts this visit only */
    }
  }, [s]);

  const weekSessions = useCallback((w: number) => SESSIONS.map((_, i) => !!s.sessions[`${w}-${i}`]), [s.sessions]);
  const weekDone = useCallback((w: number) => weekSessions(w).every(Boolean), [weekSessions]);
  const doneWeeks = useMemo(() => DATA.weeks.map((_, i) => i).filter((i) => weekDone(i)), [weekDone]);
  const nextWeek = useMemo(() => DATA.weeks.findIndex((_, i) => !weekDone(i)), [weekDone]);
  const sessionsDone = Object.values(s.sessions).filter(Boolean).length;
  const quizCorrect = DATA.quiz.reduce((n, q, i) => n + (s.quiz[i] === q[2] ? 1 : 0), 0);
  const track = DATA.tracks.find((t) => t.id === s.track) ?? DATA.tracks[1];

  return {
    ...s,
    track,
    doneWeeks,
    nextWeek,
    sessionsDone,
    quizCorrect,
    weekSessions,
    weekDone,
    setTrack: (id: Track["id"]) => set((p) => ({ ...p, track: id })),
    setTheme: (theme: State["theme"]) => set((p) => ({ ...p, theme })),
    toggleSession: (w: number, i: number) =>
      set((p) => ({ ...p, sessions: { ...p.sessions, [`${w}-${i}`]: !p.sessions[`${w}-${i}`] } })),
    setWeek: (w: number, done: boolean) =>
      set((p) => {
        const next = { ...p.sessions };
        SESSIONS.forEach((_, i) => (next[`${w}-${i}`] = done));
        return { ...p, sessions: next };
      }),
    answer: (q: number, a: number) => set((p) => ({ ...p, quiz: { ...p.quiz, [q]: a } })),
    resetQuiz: () => set((p) => ({ ...p, quiz: {} })),
    toggleAgentCheck: (k: string) => set((p) => ({ ...p, agentChecks: { ...p.agentChecks, [k]: !p.agentChecks[k] } })),
    resetAll: () => set((p) => ({ ...initial, theme: p.theme, track: p.track })),
    exportJSON: () => JSON.stringify({ app: "ai-adventure-academy", version: 2, exportedAt: new Date().toISOString(), progress: s }, null, 2),
    /** Accepts a file made by Export progress. Returns false if the file isn't one. */
    importJSON: (text: string) => {
      try {
        const data = JSON.parse(text);
        const p = data?.progress;
        if (data?.app !== "ai-adventure-academy" || typeof p !== "object" || p === null) return false;
        const clean: State = {
          track: DATA.tracks.some((t) => t.id === p.track) ? p.track : initial.track,
          theme: ["system", "light", "dark"].includes(p.theme) ? p.theme : "system",
          sessions: pickBools(p.sessions, /^\d{1,2}-[0-3]$/),
          agentChecks: pickBools(p.agentChecks, /^\d-[0-2]$/),
          quiz: Object.fromEntries(
            Object.entries(p.quiz ?? {}).filter(([k, v]) => /^\d$/.test(k) && Number.isInteger(v) && (v as number) >= 0 && (v as number) < 3),
          ) as Record<number, number>,
        };
        set(clean);
        return true;
      } catch {
        return false;
      }
    },
  };
}
export type Academy = ReturnType<typeof useAcademy>;

function pickBools(o: unknown, key: RegExp): Record<string, boolean> {
  if (typeof o !== "object" || o === null) return {};
  return Object.fromEntries(Object.entries(o).filter(([k, v]) => key.test(k) && v === true)) as Record<string, boolean>;
}

export function useHashView(): [View, (v: View) => void] {
  const read = () => {
    const h = location.hash.replace("#", "") as View;
    return VIEWS.includes(h) ? h : "overview";
  };
  const [v, setV] = useState<View>(read);
  useEffect(() => {
    const on = () => setV(read());
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return [
    v,
    (next) => {
      if (location.hash !== "#" + next) location.hash = next;
      setV(next);
      window.scrollTo({ top: 0 });
    },
  ];
}

/** Offline, course-aware answers for Milo. Not a live model: matches built-in topics only. */
export function miloAnswer(q: string, a: Academy): string {
  const t = q.toLowerCase();
  const term = Object.keys(DATA.terms)
    .sort((x, y) => y.length - x.length)
    .find((k) => t.includes(k.toLowerCase()));
  if (term) return `${term}: ${DATA.terms[term]}`;
  if (/next|start|what now|continue/.test(t))
    return a.nextWeek < 0
      ? "You've finished all twelve weeks. Publish your final website and share it."
      : `Go to week ${a.nextWeek + 1}, “${DATA.weeks[a.nextWeek][0]}”. Start with Monday's session: ${DATA.weeks[a.nextWeek][1]}.`;
  if (/progress|rank|how am i|score/.test(t))
    return `You've finished ${a.doneWeeks.length} of 12 weeks (${a.sessionsDone} of 48 sessions). Rank: ${rankFor(a.doneWeeks.length)}. Quiz: ${a.quizCorrect} of ${DATA.quiz.length}.`;
  if (/agent/.test(t))
    return "An agent is a workflow that can use tools to complete tasks, with your approval for anything risky. The Agent lab has nine to try, each with a pass test.";
  if (/safe|privacy|child|kid|password/.test(t))
    return "Use fictional data in exercises, never share passwords, and keep a human approval step before an agent sends, deletes or buys anything. Children should use age-eligible services with an adult.";
  if (/path|level|track|which/.test(t))
    return `You're on ${a.track.name} (${a.track.audience}). You can switch paths any time from the sidebar.`;
  return "I only know this course's built-in topics. Try a word like token, weight, RAG or agent, or ask “what's next?”.";
}
