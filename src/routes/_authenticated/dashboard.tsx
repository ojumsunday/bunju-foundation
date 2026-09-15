import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowUpRight, BadgeCheck, CircleDollarSign, FileCheck2, Plus, Sparkles } from "lucide-react";
import { AppShell } from "@/components/bunju/app-shell";
import { ProgressRing } from "@/components/bunju/progress-ring";
import { VerifiedBadge } from "@/components/bunju/verified-badge";
import { EmptyState } from "@/components/bunju/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import julianImage from "@/assets/julian-dube.jpg";
import sarahImage from "@/assets/sarah-kim.jpg";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [
    { title: "Dashboard — Bunju" },
    { name: "description", content: "Review verified work, trust signals, and network activity on Bunju." },
    { property: "og:title", content: "Dashboard — Bunju" },
    { property: "og:description", content: "Your Bunju proof-of-work dashboard." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: DashboardPage,
});

const proofRows = [
  ["Payment reconciliation API", "Fintra", "Verified", "+$4,200"],
  ["Onboarding system", "Lumen Labs", "Verified", "+$7,800"],
  ["Churn prediction model", "Northwind", "In review", "+$5,500"],
];

function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 bunju-rise">
          <div className="min-w-0"><p className="font-mono text-[10px] uppercase text-muted-foreground">Dashboard / overview</p><h1 className="mt-2 truncate font-display text-3xl font-medium sm:text-4xl">Good morning, Mara</h1></div>
          <Dialog>
            <DialogTrigger asChild><Button className="rounded-xl"><Plus /> <span className="hidden sm:inline">Add proof</span></Button></DialogTrigger>
            <DialogContent className="border-border bg-card sm:rounded-2xl">
              <DialogHeader><DialogTitle>Add proof of work</DialogTitle><DialogDescription>This visual demo shows how a new proof record will be added.</DialogDescription></DialogHeader>
              <div className="space-y-3 py-3"><input className="h-11 w-full rounded-xl border border-border bg-secondary px-3 text-sm outline-none focus:border-primary" placeholder="Project or outcome"/><textarea className="min-h-24 w-full rounded-xl border border-border bg-secondary p-3 text-sm outline-none focus:border-primary" placeholder="What changed because of your work?" /></div>
              <DialogFooter><Button variant="glass">Cancel</Button><Button onClick={() => toast.success("Proof draft created")}>Create draft</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 bunju-rise-delay">
          {[
            ["Verified proof", "27", "across 3 workspaces"], ["Trust score", "92", "top 4% globally"],
            ["Wallet balance", "$12.8k", "settled this month"], ["Open invites", "6", "from teams and investors"],
          ].map(([label,value,meta]) => <article key={label} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{label}</p><span className="size-1.5 rounded-full bg-success" /></div><p className="mt-4 font-mono text-3xl font-medium">{value}</p><p className="mt-1 text-xs text-muted-foreground">{meta}</p></article>)}
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(260px,.65fr)]">
          <section className="overflow-hidden rounded-2xl border border-border bg-surface-glass backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-semibold">Proof-of-work ledger</h2><p className="mt-1 text-xs text-muted-foreground">Recent outcomes connected to your record</p></div><Button variant="glass" size="sm">View all <ArrowUpRight /></Button></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-border font-mono text-[10px] uppercase text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Work</th><th className="px-5 py-3 font-medium">Workspace</th><th className="px-5 py-3 font-medium">Proof</th><th className="px-5 py-3 text-right font-medium">Value</th></tr></thead><tbody className="divide-y divide-border">{proofRows.map(([work,company,status,value]) => <tr key={work} className="hover:bg-secondary/40"><td className="px-5 py-4 font-medium">{work}</td><td className="px-5 py-4 text-muted-foreground">{company}</td><td className="px-5 py-4">{status === "Verified" ? <VerifiedBadge /> : <Badge variant="pending" className="rounded-full">{status}</Badge>}</td><td className="px-5 py-4 text-right font-mono text-muted-foreground">{value}</td></tr>)}</tbody></table>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between"><div><h2 className="font-semibold">Trust ring</h2><p className="mt-1 text-xs text-muted-foreground">Verified identity strength</p></div><VerifiedBadge /></div>
            <div className="grid place-items-center py-7"><ProgressRing value={92} /></div>
            <div className="space-y-3 border-t border-border pt-5 text-xs"><div className="flex justify-between"><span className="text-muted-foreground">Peer attestations</span><span className="font-mono">41</span></div><div className="flex justify-between"><span className="text-muted-foreground">Delivery rate</span><span className="font-mono">98.6%</span></div></div>
          </section>
        </div>

        <section>
          <div className="mb-4 flex items-end justify-between"><div><h2 className="font-semibold">Discover verified talent</h2><p className="mt-1 text-xs text-muted-foreground">People selected by demonstrated ability</p></div><span className="font-mono text-[10px] text-muted-foreground">1,204 available</span></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[[julianImage,"Julian Dube","Systems Engineer","Rust · Infrastructure"],[sarahImage,"Sarah Kim","AI Safety Researcher","Evaluation · Governance"]].map(([image,name,role,skills]) => <article key={name} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"><img src={image} alt={name} width={768} height={768} loading="lazy" className="size-12 shrink-0 rounded-xl object-cover"/><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><p className="truncate text-sm font-semibold">{name}</p><BadgeCheck className="size-4 shrink-0 text-success"/></div><p className="truncate text-xs text-muted-foreground">{role}</p><p className="mt-2 truncate font-mono text-[10px] text-primary">{skills}</p></div><Button variant="glass" size="icon" aria-label={`View ${name}`}><ArrowUpRight /></Button></article>)}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <div><div className="mb-3 flex items-center gap-2"><FileCheck2 className="size-4 text-primary"/><h2 className="text-sm font-semibold">Empty state</h2></div><EmptyState /></div>
          <div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2"><Sparkles className="size-4 text-primary"/><h2 className="text-sm font-semibold">Loading state</h2></div><div className="mt-7 space-y-5">{[0,1,2].map((item) => <div key={item} className="flex items-center gap-3"><Skeleton className="size-10 shrink-0 rounded-xl"/><div className="flex-1 space-y-2"><Skeleton className="h-3 w-2/3"/><Skeleton className="h-2.5 w-1/2"/></div></div>)}</div></div>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><CircleDollarSign className="size-5"/></span><div><h2 className="text-sm font-semibold">Component actions</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Preview polished notifications and modal states from the Bunju component system.</p></div></div><Button variant="glass" className="mt-8 w-full" onClick={() => toast.success("Payment proof verified", { description: "The ledger has been updated." })}>Show toast</Button></div>
        </section>
      </div>
    </AppShell>
  );
}