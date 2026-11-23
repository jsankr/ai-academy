import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, Copy, Download, ExternalLink, MonitorDown, RotateCcw, Search, Sparkles, Trash2, Upload, Wifi, WifiOff,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useInstallPrompt, useOnline } from "@/lib/pwa";
import step1 from "@/assets/setup-step-1-download.svg";
import step2 from "@/assets/setup-step-2-extract.svg";
import step3 from "@/assets/setup-step-3-run-local.svg";
import step4 from "@/assets/setup-step-4-open-browser.svg";
import step5 from "@/assets/setup-step-5-install-app.svg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  DATA, PHASES, SESSIONS, nextRankAt, phaseOf, rankFor, sessionText, type Academy, type View,
} from "@/lib/academy";
import { MILO } from "@/lib/milo";

type Ctx = { a: Academy; go: (v: View) => void; openWeek: (w: number) => void; openMilo: () => void; quest: boolean };
const pad = (n: number) => String(n).padStart(2, "0");

function Head({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 max-w-[62ch] space-y-2">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="text-[clamp(1.7rem,3.2vw,2.3rem)] font-bold leading-tight">{title}</h1>
      {children && <div className="text-muted-foreground">{children}</div>}
    </div>
  );
}

function Ring({ value, max, label }: { value: number; max: number; label: string }) {
  const r = 52, c = 2 * Math.PI * r, p = max ? value / max : 0;
  return (
    <div className="relative grid size-[132px] shrink-0 place-items-center" role="img" aria-label={`${label}: ${value} of ${max}`}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p)} style={{ transition: "stroke-dashoffset .5s" }} />
      </svg>
      <div className="text-center">
        <div className="font-display text-3xl font-bold leading-none tnum">{Math.round(p * 100)}%</div>
        <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function SessionDots({ a, w }: { a: Academy; w: number }) {
  return (
    <span className="flex gap-1" aria-label={`${a.weekSessions(w).filter(Boolean).length} of 4 sessions done`}>
      {a.weekSessions(w).map((d, i) => (
        <span key={i} className={cn("size-2 rounded-full", d ? "bg-ok" : "bg-muted-foreground/25")} />
      ))}
    </span>
  );
}

function SessionList({ a, w, compact, cols }: { a: Academy; w: number; compact?: boolean; cols?: boolean }) {
  const week = DATA.weeks[w];
  return (
    <ul className={cn("grid gap-2", cols && "md:grid-cols-2")}>
      {SESSIONS.map((s, i) => {
        const id = `s-${w}-${i}${compact ? "-c" : ""}`;
        const done = a.weekSessions(w)[i];
        return (
          <li key={i}>
            <label htmlFor={id} className={cn("flex cursor-pointer gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-ring", done && "border-ok/40 bg-ok/5")}>
              <Checkbox id={id} checked={done} onCheckedChange={() => a.toggleSession(w, i)} className="mt-1" />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <b className="font-display">{s.kind}</b>
                  <span className="font-mono text-xs text-muted-foreground tnum">{s.short} · {s.time} IST · {s.mins} min</span>
                </span>
                <span className={cn("block text-[0.92rem]", done && "text-muted-foreground line-through decoration-1")}>{sessionText(week, i)}</span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- Overview ---------------- */
export function Overview({ a, go, openWeek, openMilo, quest }: Ctx) {
  const nx = a.nextWeek;
  const w = nx >= 0 ? DATA.weeks[nx] : null;
  const n = a.doneWeeks.length;
  const nr = nextRankAt(n);

  return (
    <div className="space-y-6">
      {/* Hero: where you are + what to do now */}
      <section className={cn("hero-glow overflow-hidden rounded-2xl border bg-card", quest && "chunky")}>
        <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0 space-y-4">
            <p className="eyebrow">{quest ? "Today's adventure" : `${a.track.name} · ${a.track.audience}`}</p>
            {w ? (
              <>
                <h1 className={cn("font-bold leading-[1.05]", quest ? "text-[clamp(2.1rem,5vw,3.4rem)]" : "text-[clamp(1.8rem,3.6vw,2.7rem)]")}>
                  {quest ? <>Level {nx + 1}: <span className="text-primary">{w[0]}</span></> : <>Week {nx + 1} · {w[0]}</>}
                </h1>
                <p className="max-w-[56ch] text-[1.05rem] text-muted-foreground">{w[1]}.</p>
              </>
            ) : (
              <h1 className="text-[clamp(1.8rem,3.6vw,2.7rem)] font-bold">You finished all twelve weeks.</h1>
            )}
            <div className="flex flex-wrap gap-2">
              {w && (
                <Button size="lg" className={cn(quest && "chunky-primary rounded-full")} onClick={() => openWeek(nx)}>
                  {a.weekSessions(nx).some(Boolean) ? "Continue this week" : "Start this week"} <ArrowRight className="size-4" />
                </Button>
              )}
              <Button size="lg" variant="outline" className={cn(quest && "rounded-full")} onClick={() => go("roadmap")}>
                {quest ? "See the map" : "View roadmap"}
              </Button>
            </div>
          </div>
          {quest ? (
            <div className="relative mx-auto w-[220px]">
              <p className="mb-2 rounded-2xl rounded-bl-sm bg-foreground px-4 py-2.5 font-bold text-background">
                {n === 0 ? "Hi, I'm Milo! Let's start level 1." : `Nice work! ${n} level${n === 1 ? "" : "s"} cleared.`}
              </p>
              <button onClick={openMilo} aria-label="Ask Milo for help" className="block w-full">
                <img src={MILO} alt="Milo the chimp, waving" className="bob mx-auto w-[180px] drop-shadow-[0_16px_20px_rgba(0,0,0,.35)]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Ring value={a.sessionsDone} max={48} label="of course" />
              <dl className="grid gap-2 text-sm">
                <div><dt className="text-muted-foreground">Rank</dt><dd className="font-display text-lg font-bold">{rankFor(n)}</dd></div>
                <div><dt className="text-muted-foreground">Next rank</dt><dd className="font-medium">{nr ? `${rankFor(nr)} at ${nr} weeks` : "Top rank reached"}</dd></div>
              </dl>
            </div>
          )}
        </div>
        {w && (
          <div className="border-t bg-background/40 p-5 sm:px-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">This week's four sessions</h2>
              <span className="font-mono text-xs text-muted-foreground tnum">{a.weekSessions(nx).filter(Boolean).length}/4 done</span>
            </div>
            <SessionList a={a} w={nx} compact cols />
          </div>
        )}
      </section>

      {/* Stats */}
      <section aria-label="Your numbers" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          [`${n}/12`, "Weeks complete"],
          [`${a.sessionsDone}/48`, "Sessions done"],
          [`${a.quizCorrect}/${DATA.quiz.length}`, "Quiz score"],
          [rankFor(n), "Current rank"],
        ].map(([v, l]) => (
          <div key={l} className={cn("rounded-xl border bg-card p-4", quest && "chunky border-0")}>
            <div className={cn("font-display text-2xl font-bold tnum", quest && "text-primary")}>{v}</div>
            <div className="text-sm text-muted-foreground">{l}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Phase progress */}
        <section className={cn("rounded-xl border bg-card p-5", quest && "chunky border-0")}>
          <h2 className="mb-4 font-display text-lg font-semibold">Course progress by phase</h2>
          <ul className="grid gap-4">
            {PHASES.map((p) => {
              const total = p.to - p.from;
              const done = a.doneWeeks.filter((i) => i >= p.from && i < p.to).length;
              return (
                <li key={p.name} className="grid gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span><b className="font-display">{p.name}</b> <span className="text-muted-foreground">· {p.range}</span></span>
                    <span className="font-mono text-xs text-muted-foreground tnum">{done}/{total}</span>
                  </div>
                  <Progress value={(done / total) * 100} aria-label={`${p.name} progress`} />
                </li>
              );
            })}
          </ul>
        </section>

        <TokenDemo quest={quest} />
      </div>

      <ChatbotSteps quest={quest} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={cn("rounded-xl border bg-card p-5", quest && "chunky border-0")}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Your path: {a.track.name}</h2>
            <Button variant="ghost" size="sm" onClick={() => go("paths")}>Change <ChevronRight className="size-4" /></Button>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">{a.track.promise}</p>
          <ol className="grid gap-2">
            {a.track.modules.map((m, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted font-mono text-xs tnum">{i + 1}</span>
                <span><b>{m[0]}</b> <span className="text-muted-foreground">· {m[1]}</span></span>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-lg bg-accent p-3 text-sm text-accent-foreground"><b>Final challenge:</b> {a.track.capstone}</p>
        </section>

        <section className={cn("rounded-xl border bg-card p-5", quest && "chunky border-0")}>
          <h2 className="font-display text-lg font-semibold">Weekly rhythm</h2>
          <p className="mb-4 text-sm text-muted-foreground">About five hours a week, India Standard Time. The first cohort starts Monday 30 November 2026. You can start any time.</p>
          <ul className="grid gap-2">
            {SESSIONS.map((s) => (
              <li key={s.day} className="grid grid-cols-[88px_minmax(0,1fr)_auto] items-baseline gap-3 border-b pb-2 text-sm last:border-0">
                <b className="font-display">{s.day}</b>
                <span>{s.kind}</span>
                <span className="font-mono text-xs text-muted-foreground tnum">{s.time}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

const STEPS = [
  ["Words become tokens", "Your message is split into pieces, and each token is turned into numbers."],
  ["The model processes context", "Learned weights and parameters transform those numbers. GPUs speed up the maths."],
  ["A new token is generated", "The model picks a likely next token, one at a time. Likely is not the same as true."],
  ["Tools may add evidence", "Some assistants can search or calculate. Check the source and date before trusting an answer."],
];
function ChatbotSteps({ quest }: { quest: boolean }) {
  return (
    <section className={cn("rounded-xl border bg-card p-5", quest && "chunky border-0")} aria-labelledby="how-chatbot">
      <p className="eyebrow">Understand the magic trick</p>
      <h2 id="how-chatbot" className="mb-4 mt-1 font-display text-lg font-semibold">How does ChatGPT answer a question?</h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(([h, p], i) => (
          <li key={h} className="relative rounded-lg bg-muted/60 p-4">
            <span className="font-mono text-xs text-muted-foreground tnum">Step {i + 1}</span>
            <b className="mt-1 block font-display">{h}</b>
            <p className="mt-1 text-sm text-muted-foreground">{p}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const TOKENS: [string, number][] = [["mat", 41], ["floor", 18], ["sofa", 12], ["roof", 7], ["keyboard", 3]];
function TokenDemo({ quest }: { quest: boolean }) {
  const [pick, setPick] = useState<string | null>(null);
  const sample = () => {
    let r = Math.random() * 81, acc = 0;
    setPick(TOKENS.find(([, p]) => (acc += p) >= r)![0]);
  };
  return (
    <section className={cn("rounded-xl border bg-card p-5", quest && "chunky border-0")}>
      <p className="eyebrow">Try it · Week 2</p>
      <h2 className="mt-1 font-display text-lg font-semibold">How a language model picks the next word</h2>
      <p className="my-3 font-display text-2xl font-bold">
        The cat sat on the{" "}
        <span className="inline-block min-w-[4ch] border-b-[3px] border-primary text-primary" aria-live="polite">{pick ?? " "}</span>
      </p>
      <ul className="mb-4 grid gap-1.5" aria-label="Next-word probabilities (illustrative)">
        {TOKENS.map(([t, p]) => (
          <li key={t} className={cn("grid grid-cols-[72px_minmax(0,1fr)_40px] items-center gap-2 font-mono text-xs tnum", pick === t && "font-semibold text-primary")}>
            <span>{t}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${(p / 41) * 100}%` }} /></span>
            <span className="text-right">{p}%</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={sample} className={cn(quest && "chunky-primary rounded-full")}><Sparkles className="size-4" /> Sample next word</Button>
        <span className="text-xs text-muted-foreground">Illustrative numbers, not from a real model.</span>
      </div>
    </section>
  );
}

/* ---------------- Roadmap ---------------- */
export function Roadmap({ a, openWeek, quest }: Ctx) {
  if (quest) return <Trail a={a} openWeek={openWeek} />;
  return (
    <div>
      <Head eyebrow="Roadmap" title="12-week curriculum">
        From what AI is to publishing your own tested website. Open a week to tick off its four sessions.
      </Head>
      <div className="grid gap-6">
        {PHASES.map((p) => (
          <section key={p.name} aria-labelledby={`ph-${p.from}`}>
            <h2 id={`ph-${p.from}`} className="mb-2 flex items-baseline gap-2">
              <span className="font-display text-base font-semibold">{p.name}</span>
              <span className="eyebrow">{p.range}</span>
            </h2>
            <ul className="overflow-hidden rounded-xl border bg-card">
              {DATA.weeks.slice(p.from, p.to).map((w, k) => {
                const i = p.from + k, done = a.weekDone(i), next = i === a.nextWeek;
                return (
                  <li key={i} className="border-b last:border-0">
                    <button onClick={() => openWeek(i)} className="grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/60 sm:grid-cols-[40px_minmax(0,1.1fr)_minmax(0,1fr)_auto]">
                      <span className="font-mono text-sm text-muted-foreground tnum">{pad(i + 1)}</span>
                      <span className="min-w-0">
                        <b className="block font-display">{w[0]}</b>
                        <span className="block truncate text-sm text-muted-foreground">{w[1]}</span>
                      </span>
                      <span className="hidden min-w-0 text-sm sm:block"><span className="text-muted-foreground">Build: </span>{w[3]}</span>
                      <span className="flex items-center gap-3">
                        <SessionDots a={a} w={i} />
                        {done ? <Badge className="bg-ok text-background hover:bg-ok">Done</Badge>
                          : next ? <Badge className="bg-highlight text-highlight-foreground hover:bg-highlight">Up next</Badge>
                          : <Badge variant="outline" className="hidden text-muted-foreground md:inline-flex">Not started</Badge>}
                        <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function Trail({ a, openWeek }: { a: Academy; openWeek: (w: number) => void }) {
  return (
    <div>
      <Head eyebrow="The main quest" title="Twelve levels through the AI jungle">
        {a.doneWeeks.length} of 12 levels cleared. Tap a level to see its four missions.
      </Head>
      <ol className="relative mx-auto grid max-w-[820px] gap-4">
        <span aria-hidden className="trail-line absolute bottom-0 left-[30px] top-0 w-1 sm:left-1/2 sm:-translate-x-1/2" />
        {DATA.weeks.map((w, i) => {
          const done = a.weekDone(i), here = i === a.nextWeek, right = i % 2 === 1;
          return (
            <li key={i} className="relative grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)]">
              <span className={cn("z-[1] grid size-[60px] place-items-center rounded-full border-4 font-display text-xl font-extrabold tnum sm:col-start-2 sm:row-start-1",
                done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary",
                here && "border-accent ring-[6px] ring-accent/25")} aria-hidden>
                {done ? <Check className="size-7" /> : i + 1}
              </span>
              <button onClick={() => openWeek(i)}
                className={cn("chunky rounded-2xl bg-card p-4 text-left transition-transform hover:-translate-y-0.5 sm:row-start-1", right ? "sm:col-start-3" : "sm:col-start-1")}>
                <span className="eyebrow">Level {i + 1} · {phaseOf(i).name}</span>
                <b className="mt-0.5 block font-display text-xl leading-tight">{w[0]}</b>
                <span className="mt-1 block text-sm text-muted-foreground">{w[2]}</span>
                <span className="mt-2 flex items-center gap-2 text-sm"><SessionDots a={a} w={i} /> {done ? "Cleared!" : here ? "You are here" : ""}</span>
              </button>
              {here && (
                <img src={MILO} alt="" className={cn("bob pointer-events-none absolute hidden w-16 sm:block", right ? "left-[calc(50%-110px)]" : "left-[calc(50%+46px)]")} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function WeekSheet({ a, week, onClose, quest }: Ctx & { week: number | null; onClose: () => void }) {
  const [shown, setShown] = useState(0);
  useEffect(() => { if (week !== null) setShown(week); }, [week]);
  const w = DATA.weeks[shown];
  const done = a.weekDone(shown);
  return (
    <Sheet open={week !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex w-full flex-col gap-5 overflow-y-auto pb-[max(24px,env(safe-area-inset-bottom,0px))] pt-[max(24px,env(safe-area-inset-top,0px))] sm:max-w-lg">
        <SheetHeader className="space-y-2 text-left">
          <p className="eyebrow">{quest ? `Level ${shown + 1}` : `Week ${pad(shown + 1)}`} · {phaseOf(shown).name}</p>
          <SheetTitle className="font-display text-2xl">{w[0]}</SheetTitle>
          <SheetDescription>{w[1]}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-2 rounded-lg bg-accent p-3 text-sm text-accent-foreground">
          <span><b>Practice:</b> {w[2]}</span>
          <span><b>Build:</b> {w[3]}</span>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display font-semibold">Sessions</h3>
            <span className="font-mono text-xs text-muted-foreground tnum">{a.weekSessions(shown).filter(Boolean).length}/4</span>
          </div>
          <SessionList a={a} w={shown} />
        </div>
        <Button variant={done ? "outline" : "default"} className={cn(quest && !done && "chunky-primary rounded-full")}
          onClick={() => { a.setWeek(shown, !done); toast.success(done ? `Week ${shown + 1} reopened` : `Week ${shown + 1} complete`); }}>
          {done ? <><RotateCcw className="size-4" /> Mark week as not done</> : <><Check className="size-4" /> Mark whole week done</>}
        </Button>
        <div className="mt-auto flex justify-between gap-2 border-t pt-4">
          <Button variant="ghost" disabled={shown === 0} onClick={() => setShown(shown - 1)}><ArrowLeft className="size-4" /> Week {shown}</Button>
          <Button variant="ghost" disabled={shown === 11} onClick={() => setShown(shown + 1)}>Week {shown + 2} <ArrowRight className="size-4" /></Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ---------------- Paths ---------------- */
export function Paths({ a, quest }: Ctx) {
  const [view, setView] = useState(a.track.id);
  const t = DATA.tracks.find((x) => x.id === view)!;
  return (
    <div>
      <Head eyebrow="Learning paths" title="One subject. Four ways in.">
        Age labels are suggestions. Young Explorers needs an adult alongside. Switch any time; your progress stays.
      </Head>
      <div role="tablist" aria-label="Learning paths" className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {DATA.tracks.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === view} onClick={() => setView(x.id)}
            className={cn("rounded-xl border bg-card p-4 text-left transition-colors hover:border-ring", quest && "chunky border-0",
              x.id === view && "border-primary ring-1 ring-primary", quest && x.id === view && "bg-primary text-primary-foreground")}>
            <span className="flex items-center justify-between gap-2">
              <b className="font-display text-lg">{x.name}</b>
              {x.id === a.track.id && <Badge variant="secondary">Current</Badge>}
            </span>
            <span className={cn("mt-1 block text-sm text-muted-foreground", quest && x.id === view && "text-primary-foreground/80")}>{x.audience}</span>
          </button>
        ))}
      </div>
      <section role="tabpanel" className={cn("grid gap-5 rounded-2xl border bg-card p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]", quest && "chunky border-0")}>
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold">{t.name}</h2>
          <p>{t.promise}</p>
          <dl className="grid gap-3 text-sm">
            <div><dt className="eyebrow">Final challenge</dt><dd className="mt-1">{t.capstone}</dd></div>
            <div><dt className="eyebrow">How you're assessed</dt><dd className="mt-1">{t.assessment}</dd></div>
          </dl>
          {t.id === a.track.id ? (
            <p className="flex items-center gap-2 text-sm font-medium text-ok"><Check className="size-4" /> You're learning on this path</p>
          ) : (
            <Button className={cn(quest && "rounded-full")} onClick={() => { a.setTrack(t.id); toast.success(`Switched to ${t.name}`); }}>
              Learn on this path
            </Button>
          )}
        </div>
        <ol className="grid gap-3">
          {t.modules.map((m, i) => (
            <li key={i} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-xl border p-4">
              <span className="grid size-8 place-items-center rounded-full bg-primary font-mono text-sm font-medium text-primary-foreground tnum">{i + 1}</span>
              <div className="space-y-1">
                <b className="font-display">{m[0]}</b>
                <p className="text-sm text-muted-foreground">{m[1]}</p>
                <p className="text-sm"><b>Try it:</b> {m[2]}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/* ---------------- Agents ---------------- */
const CHECKS = ["Ran it with fictional sample data", "Tried missing or tricky input", "Pass test met"];
export function Agents({ a, quest }: Ctx) {
  const [sel, setSel] = useState(() => {
    try { const v = sessionStorage.getItem("agent-select"); sessionStorage.removeItem("agent-select"); return v ? +v : 0; } catch { return 0; }
  });
  useEffect(() => {
    const on = (e: Event) => setSel((e as CustomEvent<number>).detail);
    addEventListener("agent-select", on);
    return () => removeEventListener("agent-select", on);
  }, []);
  const ag = DATA.agents[sel];
  const tested = (i: number) => CHECKS.every((_, k) => a.agentChecks[`${i}-${k}`]);
  const copy = () => navigator.clipboard?.writeText(ag[2]).then(() => toast.success("Prompt copied"), () => toast.error("Copy was blocked. Select the prompt text and copy it by hand."));

  return (
    <div>
      <Head eyebrow="Weeks 9–11 · Agent lab" title="Prototype nine practical agents">
        Each agent is a prompt you run by hand on sample data. None of them sends, deletes or buys anything without your approval.
      </Head>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start">
        <ol className="grid gap-1.5" aria-label="Agents">
          {DATA.agents.map((x, i) => (
            <li key={i}>
              <button onClick={() => setSel(i)} aria-pressed={i === sel}
                className={cn("flex w-full items-center gap-3 rounded-lg border bg-card px-3.5 py-2.5 text-left transition-colors hover:border-ring",
                  i === sel && "border-primary bg-accent text-accent-foreground", quest && "rounded-xl")}>
                <span className="font-mono text-xs text-muted-foreground tnum">{pad(i + 1)}</span>
                <span className="flex-1 font-medium">{x[0]}</span>
                {tested(i) && <Check className="size-4 text-ok" aria-label="Tested" />}
              </button>
            </li>
          ))}
        </ol>
        <article className={cn("space-y-4 rounded-2xl border bg-card p-5 sm:p-6 lg:sticky lg:top-20", quest && "chunky border-0")} aria-live="polite">
          <div>
            <p className="eyebrow">Agent {pad(sel + 1)} of 09 · Week {sel < 3 ? 9 : sel < 6 ? 10 : 11}</p>
            <h2 className="mt-1 font-display text-2xl font-bold">{ag[0]}</h2>
            <p className="mt-1 text-muted-foreground">{ag[1]}</p>
          </div>
          <div className="relative">
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 pr-12 font-mono text-[0.84rem] leading-relaxed">{ag[2]}</pre>
            <Button size="icon" variant="ghost" className="absolute right-2 top-2" onClick={copy} aria-label="Copy prompt"><Copy className="size-4" /></Button>
          </div>
          <div>
            <h3 className="mb-2 font-display font-semibold">Test checklist</h3>
            <ul className="grid gap-2">
              {CHECKS.map((c, k) => {
                const id = `ag-${sel}-${k}`;
                return (
                  <li key={k}>
                    <label htmlFor={id} className="flex cursor-pointer gap-3 rounded-lg border p-3 text-sm hover:border-ring">
                      <Checkbox id={id} checked={!!a.agentChecks[`${sel}-${k}`]} onCheckedChange={() => a.toggleAgentCheck(`${sel}-${k}`)} className="mt-0.5" />
                      <span>{c}{k === 2 && <span className="block text-muted-foreground">{ag[3]}</span>}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex justify-between gap-2 border-t pt-4">
            <Button variant="ghost" disabled={sel === 0} onClick={() => setSel(sel - 1)}><ArrowLeft className="size-4" /> Previous</Button>
            <Button variant="ghost" disabled={sel === 8} onClick={() => setSel(sel + 1)}>Next <ArrowRight className="size-4" /></Button>
          </div>
        </article>
      </div>
    </div>
  );
}

/* ---------------- Quiz ---------------- */
export function Quiz({ a, quest }: Ctx) {
  const total = DATA.quiz.length;
  const firstOpen = DATA.quiz.findIndex((_, i) => a.quiz[i] === undefined);
  const [idx, setIdx] = useState(firstOpen < 0 ? total : firstOpen);
  const answeredCount = Object.keys(a.quiz).length;

  if (idx >= total) {
    return (
      <div>
        <Head eyebrow="Sunday check-in" title="Quiz results" />
        <section className={cn("rounded-2xl border bg-card p-6", quest && "chunky border-0")}>
          <div className="flex flex-wrap items-center gap-5">
            <Ring value={a.quizCorrect} max={total} label="correct" />
            <div className="space-y-2">
              <p className="font-display text-2xl font-bold">{a.quizCorrect} of {total} correct</p>
              <p className="text-muted-foreground">{a.quizCorrect === total ? "Perfect score. Your AI instincts are sharp." : "Review the explanations below, then try again."}</p>
              <Button onClick={() => { a.resetQuiz(); setIdx(0); }}><RotateCcw className="size-4" /> Retake quiz</Button>
            </div>
          </div>
          <ol className="mt-6 grid gap-3">
            {DATA.quiz.map((q, i) => {
              const ok = a.quiz[i] === q[2];
              return (
                <li key={i} className="rounded-lg border p-4 text-sm">
                  <p className="font-semibold">{i + 1}. {q[0]}</p>
                  <p className={cn("mt-1", ok ? "text-ok" : "text-destructive")}>{ok ? "✓ " : "✗ "}{a.quiz[i] !== undefined ? q[1][a.quiz[i]] : "Not answered"}</p>
                  {!ok && <p className="mt-1">Correct: <b>{q[1][q[2]]}</b></p>}
                  <p className="mt-1 text-muted-foreground">{q[3]}</p>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    );
  }

  const q = DATA.quiz[idx];
  const picked = a.quiz[idx];
  return (
    <div>
      <Head eyebrow="Sunday check-in" title="Test your AI instincts" />
      <section className={cn("mx-auto max-w-[680px] rounded-2xl border bg-card p-5 sm:p-7", quest && "chunky border-0")}>
        <div className="mb-5 flex items-center gap-3">
          <span className="font-mono text-sm text-muted-foreground tnum">{idx + 1} / {total}</span>
          <Progress value={(answeredCount / total) * 100} className="flex-1" aria-label="Questions answered" />
        </div>
        <fieldset>
          <legend className="mb-4 font-display text-xl font-bold sm:text-2xl">{q[0]}</legend>
          <div className="grid gap-2">
            {q[1].map((o, j) => {
              const state = picked === undefined ? "" : j === q[2] ? "right" : j === picked ? "wrong" : "dim";
              return (
                <button key={j} disabled={picked !== undefined} onClick={() => a.answer(idx, j)}
                  className={cn("flex items-center gap-3 rounded-xl border-2 p-4 text-left font-medium transition-colors enabled:hover:border-ring",
                    state === "right" && "border-ok bg-ok/10", state === "wrong" && "border-destructive bg-destructive/10", state === "dim" && "opacity-60")}>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border font-mono text-xs">{"ABC"[j]}</span>
                  <span className="flex-1">{o}</span>
                  {state === "right" && <Check className="size-5 text-ok" aria-label="Correct answer" />}
                </button>
              );
            })}
          </div>
        </fieldset>
        {picked !== undefined && (
          <div className="mt-5 space-y-4" aria-live="polite">
            <p className={cn("rounded-lg p-3 text-sm", picked === q[2] ? "bg-ok/10" : "bg-destructive/10")}>
              <b>{picked === q[2] ? "Correct. " : "Not quite. "}</b>{q[3]}
            </p>
            <Button className={cn(quest && "chunky-primary rounded-full")} onClick={() => setIdx(idx + 1)}>
              {idx + 1 === total ? "See results" : "Next question"} <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------- Glossary ---------------- */
export function Glossary({ openMilo, quest }: Ctx) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return Object.entries(DATA.terms).filter(([k, v]) => !t || k.toLowerCase().includes(t) || v.toLowerCase().includes(t));
  }, [q]);
  return (
    <div>
      <Head eyebrow="Glossary" title="Words without the confusion">
        {Object.keys(DATA.terms).length} terms from the course, in plain language.
      </Head>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="gloss-q" className="sr-only">Search terms</label>
          <input id="gloss-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tokens, weights, RAG…"
            className="h-11 w-full rounded-lg border bg-card pl-9 pr-3" />
        </div>
        <span className="font-mono text-xs text-muted-foreground tnum" aria-live="polite">{list.length} of {Object.keys(DATA.terms).length}</span>
      </div>
      {list.length ? (
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(([k, v]) => (
            <div key={k} className={cn("rounded-xl border bg-card p-4", quest && "chunky border-0")}>
              <dt className="font-display text-lg font-semibold">{k}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">No term matches “{q}”.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try “token” or “agent”, or ask Milo.</p>
          <Button variant="outline" className="mt-4" onClick={openMilo}>Ask Milo</Button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Toolbox ---------------- */
export function Toolbox({ quest }: Ctx) {
  return (
    <div>
      <Head eyebrow="Toolbox" title="Creative AI and automation tools">
        Third-party services used in the course. Check each one's age requirements, pricing and availability before you sign up. Never paste private data into them.
      </Head>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DATA.tools.map(([name, url, use]) => (
          <li key={name}>
            <a href={url} target="_blank" rel="noreferrer noopener"
              className={cn("group flex h-full items-start justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-ring", quest && "chunky border-0")}>
              <span>
                <b className="font-display text-lg">{name}</b>
                <span className="mt-0.5 block text-sm text-muted-foreground">{use}</span>
              </span>
              <ExternalLink className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-label="Opens in a new tab" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Install, offline and your data ---------------- */
const SETUP = [
  [step1, "Download the repository", "Download the ZIP from GitHub, or clone it with Git."],
  [step2, "Extract the files", "Unzip the download and open the project folder in a terminal."],
  [step3, "Install and build", "Run pnpm install, then pnpm build. You need Node.js 20 or newer."],
  [step4, "Open it in your browser", "Run pnpm preview and visit the address it prints, usually http://localhost:4173."],
  [step5, "Optional: install it like an app", "Use your browser's Install app option to launch it in its own window, even offline."],
] as const;

export function Setup({ a, quest }: Ctx) {
  const online = useOnline();
  const pwa = useInstallPrompt();
  const [confirm, setConfirm] = useState(false);
  const swActive = typeof navigator !== "undefined" && "serviceWorker" in navigator && !!navigator.serviceWorker.controller;

  const exportFile = () => {
    try {
      const blob = new Blob([a.exportJSON()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-academy-progress-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Progress file downloaded");
    } catch {
      toast.error("This browser blocked the download.");
    }
  };
  const importFile = async (f: File | undefined) => {
    if (!f) return;
    const ok = a.importJSON(await f.text());
    if (ok) toast.success("Progress restored");
    else toast.error("That file isn't an AI Academy progress export.");
  };
  const card = cn("rounded-xl border bg-card p-5", quest && "chunky border-0");

  return (
    <div className="space-y-6">
      <Head eyebrow="Install & offline" title="Use the academy anywhere">
        After your first visit the whole course works without internet: lessons, agents, quiz, glossary and the workbook. Progress stays on this device.
      </Head>

      <div className="grid gap-4 md:grid-cols-3">
        <section className={card}>
          <div className="flex items-center gap-2 font-display font-semibold">
            {online ? <Wifi className="size-4 text-ok" aria-hidden /> : <WifiOff className="size-4" aria-hidden />}
            {online ? "You're online" : "You're offline"}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {swActive ? "Offline copy is saved. You can keep learning without internet." : "The offline copy is saved after the app loads once from the website."}
          </p>
        </section>
        <section className={card}>
          <div className="flex items-center gap-2 font-display font-semibold"><MonitorDown className="size-4" aria-hidden /> Install as an app</div>
          {pwa.installed ? (
            <p className="mt-2 text-sm text-muted-foreground">Installed. You're using the app version now.</p>
          ) : pwa.canInstall ? (
            <Button className={cn("mt-3", quest && "chunky-primary rounded-full")} onClick={async () => { if (await pwa.install()) toast.success("Installed"); }}>
              <Download className="size-4" /> Install AI Academy
            </Button>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Use your browser menu: <b>Install app</b> in Chrome or Edge, <b>Add to Home Screen</b> in Safari on iPhone and iPad.</p>
          )}
        </section>
        <section className={card}>
          <div className="font-display font-semibold">Your progress</div>
          <p className="mt-1 text-sm text-muted-foreground tnum">{a.sessionsDone} of 48 sessions · quiz {a.quizCorrect}/{DATA.quiz.length}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={exportFile}><Download className="size-4" /> Export</Button>
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input px-3 text-sm font-medium hover:bg-muted">
              <Upload className="size-4" aria-hidden /> Import
              <input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => { importFile(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirm(true)}><Trash2 className="size-4" /> Reset</Button>
          </div>
        </section>
      </div>

      <section aria-labelledby="run-local">
        <h2 id="run-local" className="mb-1 font-display text-xl font-semibold">Run it on your own computer</h2>
        <p className="mb-4 max-w-[62ch] text-sm text-muted-foreground">No database or paid AI subscription needed. Works on Windows, macOS and Linux.</p>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {SETUP.map(([img, h, p], i) => (
            <li key={h} className={cn("overflow-hidden rounded-xl border bg-card", quest && "chunky border-0")}>
              <img src={img} alt="" className="aspect-[4/3] w-full bg-muted object-cover" loading="lazy" />
              <div className="p-3.5">
                <span className="font-mono text-xs text-muted-foreground tnum">Step {i + 1}</span>
                <b className="mt-0.5 block font-display leading-snug">{h}</b>
                <p className="mt-1 text-sm text-muted-foreground">{p}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-sm text-muted-foreground">
        No accounts or analytics. Never put API keys or private information in a public GitHub Pages site.
      </p>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset all progress?</DialogTitle>
            <DialogDescription>This clears every ticked session, quiz answer and agent test on this device. Export first if you want a backup.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirm(false)}>Keep my progress</Button>
            <Button variant="destructive" onClick={() => { a.resetAll(); setConfirm(false); toast.success("Progress reset"); }}>Reset progress</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
