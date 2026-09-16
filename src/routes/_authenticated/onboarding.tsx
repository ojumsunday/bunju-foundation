import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, BadgeCheck, Loader2 } from "lucide-react";
import { BunjuBrand } from "@/components/bunju/brand";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  QUESTION_SETS,
  ROLE_OPTIONS,
  STEP_LABELS,
  type OnboardingRole,
} from "@/lib/onboarding-questions";
import { askQuestion, getInterview, setInterviewRole, submitAnswer } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/_authenticated/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your Bunju interview — 2 minutes, no forms" },
      { name: "description", content: "A short conversation so Bunju understands your role, your work, and what you're looking for." },
      { property: "og:title", content: "Your Bunju interview" },
      { property: "og:description", content: "A short conversation so Bunju understands your role and your work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

type Turn = { id: string; from: "agent" | "you"; text: string };

let turnSeq = 0;
const nextId = () => `t${++turnSeq}`;

function OnboardingPage() {
  const navigate = useNavigate();
  const load = useServerFn(getInterview);
  const chooseRole = useServerFn(setInterviewRole);
  const ask = useServerFn(askQuestion);
  const send = useServerFn(submitAnswer);

  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<OnboardingRole | null>(null);
  const [index, setIndex] = useState(0);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addTurn = (from: Turn["from"], text: string) =>
    setTurns((prev) => [...prev, { id: nextId(), from, text }]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const state = await load();
        if (cancelled) return;
        if (state.status === "completed") {
          setComplete(true);
          setRole(state.role);
          setReady(true);
          return;
        }
        if (state.role) {
          const answered = state.answers.length;
          setRole(state.role);
          setIndex(answered);
          setTurns(
            state.answers.flatMap((answer) => [
              { id: nextId(), from: "agent" as const, text: answer.question ?? "" },
              { id: nextId(), from: "you" as const, text: answer.answer },
            ]),
          );
          setReady(true);
          void pushQuestion(state.role, answered);
          return;
        }
        setReady(true);
      } catch (error) {
        console.error(error);
        toast.error("We couldn't load your interview. Please refresh.");
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns, busy]);

  useEffect(() => {
    if (ready && role && !complete && !busy) inputRef.current?.focus();
  }, [ready, role, complete, busy]);

  async function pushQuestion(activeRole: OnboardingRole, at: number) {
    setBusy(true);
    try {
      const result = await ask({ data: { role: activeRole, index: at } });
      if (result.question) addTurn("agent", result.question);
    } catch (error) {
      console.error(error);
      addTurn("agent", QUESTION_SETS[activeRole][at]?.question ?? "Tell me a bit more.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRole(selected: OnboardingRole) {
    setBusy(true);
    try {
      await chooseRole({ data: { role: selected } });
      setRole(selected);
      setIndex(0);
      addTurn("you", ROLE_OPTIONS.find((option) => option.role === selected)?.label ?? selected);
      setBusy(false);
      await pushQuestion(selected, 0);
    } catch (error) {
      console.error(error);
      toast.error("We couldn't save your role. Try again.");
      setBusy(false);
    }
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const answer = draft.trim();
    if (!answer || !role || busy) return;
    setDraft("");
    addTurn("you", answer);
    setBusy(true);
    try {
      const result = await send({ data: { role, index, answer, followUpCount } });
      if (result.status === "followup") {
        setFollowUpCount((count) => count + 1);
        addTurn("agent", result.followUp);
        setBusy(false);
        return;
      }
      setFollowUpCount(0);
      setBusy(false);
      if (result.done) {
        setComplete(true);
        return;
      }
      setIndex(result.nextIndex);
      await pushQuestion(role, result.nextIndex);
    } catch (error) {
      console.error(error);
      toast.error("That answer didn't save. Please try again.");
      setBusy(false);
    }
  }

  const total = role ? QUESTION_SETS[role].length : 0;
  const step = !role ? 1 : (QUESTION_SETS[role][Math.min(index, total - 1)]?.step ?? 3);
  const percent = complete ? 100 : role ? Math.round((index / total) * 100) : 4;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <BunjuBrand compact />
          <span className="font-mono text-[10px] uppercase text-muted-foreground">2–4 minutes</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="bunju-rise">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">
            Step {complete ? 3 : step} of 3: {STEP_LABELS[complete ? 3 : (step as 1 | 2 | 3)]}
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium sm:text-4xl">
            {complete ? "That's everything we need" : "Let's set up your record"}
          </h1>
          <Progress value={percent} className="mt-5 h-1.5" />
        </div>

        {!ready ? (
          <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Preparing your interview…
          </div>
        ) : complete ? (
          <section className="mt-8 rounded-2xl border border-border bg-surface-glass p-6 backdrop-blur-xl">
            <BadgeCheck className="size-6 text-success" />
            <h2 className="mt-4 font-display text-2xl">Interview complete</h2>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
              Your answers are saved to your account and shape what you see across Bunju.
            </p>
            <Button className="mt-6 rounded-xl" onClick={() => navigate({ to: "/dashboard" })}>
              Go to dashboard <ArrowRight />
            </Button>
          </section>
        ) : !role ? (
          <section className="mt-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              First — which of these is closest to you right now?
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.role}
                  type="button"
                  disabled={busy}
                  onClick={() => handleRole(option.role)}
                  className="rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary disabled:opacity-60"
                >
                  <p className="font-medium">{option.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{option.blurb}</p>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-8">
            <div className="space-y-5">
              {turns.map((turn) =>
                turn.from === "agent" ? (
                  <div key={turn.id} className="flex gap-3">
                    <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-[10px] text-primary">
                      B
                    </span>
                    <p className="max-w-prose pt-0.5 text-sm leading-relaxed">{turn.text}</p>
                  </div>
                ) : (
                  <div key={turn.id} className="flex justify-end">
                    <p className="max-w-prose rounded-2xl bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                      {turn.text}
                    </p>
                  </div>
                ),
              )}
              {busy && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" /> Thinking…
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="sticky bottom-4 mt-8">
              <div className="rounded-2xl border border-border bg-card p-2">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend(event);
                    }
                  }}
                  rows={2}
                  placeholder="Type your answer…"
                  className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="rounded-xl" disabled={busy || !draft.trim()}>
                    Send <ArrowRight />
                  </Button>
                </div>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
