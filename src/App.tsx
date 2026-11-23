import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  BookOpenText, Bot, Compass, Download, GraduationCap, LayoutDashboard, ListChecks, Map as MapIcon, Menu, Monitor, Moon, Search,
  Send, Sun, WifiOff, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DATA, miloAnswer, rankFor, useAcademy, useHashView, type Academy, type View } from "@/lib/academy";
import { MILO } from "@/lib/milo";
import { registerServiceWorker, useOnline } from "@/lib/pwa";
import { Agents, Glossary, Overview, Paths, Quiz, Roadmap, Setup, Toolbox, WeekSheet } from "@/views";

const NAV: { id: View; label: string; icon: typeof Compass }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "roadmap", label: "Roadmap", icon: MapIcon },
  { id: "paths", label: "Learning paths", icon: Compass },
  { id: "agents", label: "Agent lab", icon: Bot },
  { id: "quiz", label: "Quiz", icon: ListChecks },
  { id: "glossary", label: "Glossary", icon: BookOpenText },
  { id: "toolbox", label: "Toolbox", icon: Wrench },
  { id: "setup", label: "Install & offline", icon: Download },
];

export default function App() {
  const a = useAcademy();
  const [view, go] = useHashView();
  const [week, setWeek] = useState<number | null>(null);
  const [cmd, setCmd] = useState(false);
  const [milo, setMilo] = useState(false);
  const [menu, setMenu] = useState(false);
  const quest = a.track.id === "kids";
  const online = useOnline();

  useEffect(() => {
    registerServiceWorker((activate) =>
      toast("A new version of the academy is ready.", {
        duration: Infinity,
        action: { label: "Reload", onClick: activate },
      }),
    );
  }, []);

  useEffect(() => {
    const r = document.documentElement;
    r.classList.toggle("quest", quest);
    if (a.theme === "system") r.removeAttribute("data-theme");
    else r.setAttribute("data-theme", a.theme);
  }, [quest, a.theme]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmd((o) => !o);
      }
    };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, []);

  const ctx = { a, go, openWeek: setWeek, openMilo: () => setMilo(true), quest };
  const counts: Partial<Record<View, string>> = {
    roadmap: `${a.doneWeeks.length}/12`,
    agents: "9",
    quiz: `${Object.keys(a.quiz).length}/${DATA.quiz.length}`,
    glossary: String(Object.keys(DATA.terms).length),
  };

  const side = (
    <div className="flex h-full flex-col gap-6">
      <button onClick={() => go("overview")} className="flex items-center gap-2.5 text-left">
        <span className={cn("grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground", quest && "chunky-primary")}>
          <GraduationCap className="size-5" aria-hidden />
        </span>
        <span className="font-display text-[1.05rem] font-bold leading-tight">AI Adventure<br />Academy</span>
      </button>

      <div className="space-y-1.5">
        <label htmlFor="track-select" className="eyebrow">Learning as</label>
        <Select value={a.track.id} onValueChange={(v) => a.setTrack(v as Academy["track"]["id"])}>
          <SelectTrigger id="track-select" className="h-auto py-2 text-left">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATA.tracks.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <span className="font-medium">{t.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <nav aria-label="Course sections" className="grid gap-0.5">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => { go(n.id); setMenu(false); }}
            aria-current={view === n.id ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-2.5 py-2 text-[0.94rem] transition-colors hover:bg-muted",
              view === n.id && "bg-accent font-semibold text-accent-foreground hover:bg-accent",
            )}
          >
            <n.icon className="size-4 shrink-0" aria-hidden />
            <span className="flex-1 text-left">{n.label}</span>
            {counts[n.id] && <span className="font-mono text-xs text-muted-foreground tnum">{counts[n.id]}</span>}
          </button>
        ))}
        <a
          href="https://jsankr.github.io/ai-academy/workbook.html"
          target="_blank" rel="noreferrer"
          className="flex items-center gap-3 rounded-md px-2.5 py-2 text-[0.94rem] hover:bg-muted"
        >
          <BookOpenText className="size-4" aria-hidden /> <span className="flex-1">Workbook</span>
          <span className="text-xs text-muted-foreground">↗</span>
        </a>
      </nav>

      <div className="mt-auto space-y-3 rounded-lg border bg-card p-3">
        <div className="flex items-baseline justify-between">
          <span className="font-display font-semibold">{rankFor(a.doneWeeks.length)}</span>
          <span className="font-mono text-xs text-muted-foreground tnum">{a.sessionsDone}/48 sessions</span>
        </div>
        <Progress value={(a.sessionsDone / 48) * 100} aria-label="Sessions completed" />
        {!quest && (
          <div className="flex gap-1" role="group" aria-label="Colour theme">
            {([["system", Monitor], ["light", Sun], ["dark", Moon]] as const).map(([t, I]) => (
              <Button key={t} size="sm" variant={a.theme === t ? "secondary" : "ghost"} className="h-8 flex-1" aria-pressed={a.theme === t} aria-label={`${t} theme`} onClick={() => a.setTheme(t)}>
                <I className="size-4" />
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-[env(safe-area-inset-top,0px)] hidden h-[calc(100vh-env(safe-area-inset-top,0px))] overflow-y-auto border-r bg-[hsl(var(--sidebar))] py-6 pl-[max(20px,env(safe-area-inset-left,0px))] pr-5 lg:block">
        {side}
      </aside>

      <div className="min-w-0">
        {/* Top bar */}
        <header className="gutter sticky top-[env(safe-area-inset-top,0px)] z-40 flex items-center gap-2 border-b bg-[hsl(var(--sidebar))/0.9] py-2.5 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--sidebar))/0.75]">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setMenu(true)}>
            <Menu className="size-5" />
          </Button>
          <span className="font-display font-bold lg:hidden">AI Academy</span>
          <button
            onClick={() => setCmd(true)}
            className="ml-auto flex h-9 min-w-0 items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground hover:border-ring sm:w-72 lg:ml-0"
          >
            <Search className="size-4 shrink-0" aria-hidden />
            <span className="hidden truncate sm:inline">Search weeks, agents, terms…</span>
            <kbd className="ml-auto hidden whitespace-nowrap rounded border bg-muted px-1.5 font-mono text-[0.7rem] sm:inline">Ctrl K</kbd>
          </button>
          {!online && (
            <span role="status" className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium lg:ml-auto">
              <WifiOff className="size-3.5" aria-hidden /> Offline
            </span>
          )}
          <Button variant="outline" className={cn("gap-2", online && "lg:ml-auto", quest && "chunky")} onClick={() => setMilo(true)}>
            <img src={MILO} alt="" className="-my-1 size-7 object-contain" /> <span className="hidden sm:inline">Ask Milo</span>
          </Button>
        </header>

        <main className="gutter mx-auto max-w-[1120px] pb-24 pt-6 lg:pt-8">
          {view === "overview" && <Overview {...ctx} />}
          {view === "roadmap" && <Roadmap {...ctx} />}
          {view === "paths" && <Paths {...ctx} />}
          {view === "agents" && <Agents {...ctx} />}
          {view === "quiz" && <Quiz {...ctx} />}
          {view === "glossary" && <Glossary {...ctx} />}
          {view === "toolbox" && <Toolbox {...ctx} />}
          {view === "setup" && <Setup {...ctx} />}
        </main>
        <footer className="gutter border-t py-6 text-sm text-muted-foreground">
          <div className="mx-auto flex max-w-[1120px] flex-wrap justify-between gap-3">
            <span>Free and self-guided. Progress is saved in this browser only.</span>
            <a className="underline underline-offset-4" href="https://github.com/jsankr/ai-academy" target="_blank" rel="noreferrer">Source on GitHub</a>
          </div>
        </footer>
      </div>

      {/* Mobile menu */}
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="w-[300px] overflow-y-auto bg-[hsl(var(--sidebar))] pb-[max(24px,env(safe-area-inset-bottom,0px))] pt-[max(24px,env(safe-area-inset-top,0px))]">
          <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle><SheetDescription>Course sections</SheetDescription></SheetHeader>
          {side}
        </SheetContent>
      </Sheet>

      <WeekSheet {...ctx} week={week} onClose={() => setWeek(null)} />
      <MiloSheet a={a} open={milo} onOpenChange={setMilo} />

      <CommandDialog open={cmd} onOpenChange={setCmd}>
        <CommandInput placeholder="Search weeks, agents, glossary terms…" />
        <CommandList>
          <CommandEmpty>Nothing matches. Try “token” or “agent”.</CommandEmpty>
          <CommandGroup heading="Go to">
            {NAV.map((n) => (
              <CommandItem key={n.id} value={`go ${n.label}`} onSelect={() => { go(n.id); setCmd(false); }}>
                <n.icon className="mr-2 size-4" /> {n.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Weeks">
            {DATA.weeks.map((w, i) => (
              <CommandItem key={i} value={`week ${i + 1} ${w[0]} ${w[1]}`} onSelect={() => { setWeek(i); setCmd(false); }}>
                <span className="mr-2 w-6 font-mono text-xs text-muted-foreground tnum">{String(i + 1).padStart(2, "0")}</span> {w[0]}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Agents">
            {DATA.agents.map((ag, i) => (
              <CommandItem key={i} value={`agent ${ag[0]} ${ag[1]}`} onSelect={() => { location.hash = "agents"; sessionStorageSafe(i); go("agents"); setCmd(false); }}>
                <Bot className="mr-2 size-4" /> {ag[0]}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Glossary">
            {Object.entries(DATA.terms).map(([k, v]) => (
              <CommandItem key={k} value={`term ${k} ${v}`} onSelect={() => { setCmd(false); setMilo(true); window.dispatchEvent(new CustomEvent("milo-ask", { detail: `What is ${k}?` })); }}>
                <BookOpenText className="mr-2 size-4" /> <span className="font-medium">{k}</span>
                <span className="ml-2 truncate text-muted-foreground">{v}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Toaster position="bottom-center" richColors closeButton />
    </div>
  );
}

function sessionStorageSafe(i: number) {
  window.dispatchEvent(new CustomEvent("agent-select", { detail: i }));
  try { sessionStorage.setItem("agent-select", String(i)); } catch { /* ignore */ }
}

type Msg = { from: "me" | "milo"; text: string };
function MiloSheet({ a, open, onOpenChange }: { a: Academy; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "milo", text: "Hi, I'm Milo! Ask me about a word from the course, or ask “what's next?”." },
  ]);
  const [q, setQ] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const ask = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "me", text }, { from: "milo", text: miloAnswer(text, a) }]);
    setQ("");
  };
  useEffect(() => {
    const on = (e: Event) => ask((e as CustomEvent<string>).detail);
    addEventListener("milo-ask", on);
    return () => removeEventListener("milo-ask", on);
  });
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [msgs, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="flex-row items-center gap-3 space-y-0 border-b p-4 pt-[max(16px,env(safe-area-inset-top,0px))] text-left">
          <img src={MILO} alt="" className="bob size-14 object-contain" />
          <div>
            <SheetTitle className="font-display">Milo, your guide</SheetTitle>
            <SheetDescription>Offline helper. Knows this course's topics only, not a live AI model.</SheetDescription>
          </div>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
          {msgs.map((m, i) => (
            <p key={i} className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.93rem]",
              m.from === "milo" ? "rounded-bl-sm bg-muted" : "ml-auto rounded-br-sm bg-primary text-primary-foreground")}>
              {m.text}
            </p>
          ))}
          <div ref={end} />
        </div>
        <div className="space-y-3 border-t p-4 pb-[max(16px,env(safe-area-inset-bottom,0px))]">
          <div className="flex flex-wrap gap-1.5">
            {["What's next?", "How am I doing?", "What is a token?", "What is RAG?", "Is this safe for kids?"].map((s) => (
              <Button key={s} size="sm" variant="secondary" className="h-7 rounded-full text-xs" onClick={() => ask(s)}>{s}</Button>
            ))}
          </div>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(q); }}>
            <label htmlFor="milo-q" className="sr-only">Ask Milo</label>
            <input id="milo-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about tokens, weights, agents…"
              className="h-10 min-w-0 flex-1 rounded-md border bg-card px-3 text-sm" />
            <Button type="submit" size="icon" aria-label="Send"><Send className="size-4" /></Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
