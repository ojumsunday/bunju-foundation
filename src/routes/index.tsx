import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Building2, ChartNoAxesCombined, Globe2, Menu, Sparkles, UsersRound } from "lucide-react";
import { BunjuBrand } from "@/components/bunju/brand";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/bunju/verified-badge";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Bunju — Proof Over Promises" },
    { name: "description", content: "Bunju connects global talent and opportunity around verified proof of work." },
    { property: "og:title", content: "Bunju — Proof Over Promises" },
    { property: "og:description", content: "A global network where verified ability opens doors." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: LandingPage,
});

const audiences = [
  { icon: Sparkles, name: "Talent", text: "Turn shipped work into a portable, verified record of ability." },
  { icon: UsersRound, name: "Founders", text: "Find collaborators and capital through evidence, not introductions." },
  { icon: Building2, name: "Companies", text: "Hire globally with a clearer signal than titles or résumés." },
  { icon: ChartNoAxesCombined, name: "Investors", text: "Discover operators and companies through measurable execution." },
];

function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="relative z-20 mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 sm:px-8">
        <BunjuBrand />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#philosophy" className="hover:text-foreground">Why Bunju</a>
          <a href="#network" className="hover:text-foreground">For everyone</a>
          <Button asChild variant="glass"><Link to="/dashboard">Open network</Link></Button>
        </nav>
        <Button asChild variant="glass" size="icon" className="md:hidden" aria-label="Open Bunju"><Link to="/dashboard"><Menu /></Link></Button>
      </header>

      <main>
        <section className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl content-center px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
          <div className="bunju-rise self-center">
            <VerifiedBadge>Global proof network</VerifiedBadge>
            <h1 className="mt-7 max-w-4xl font-display text-5xl font-medium leading-[1.02] text-balance sm:text-7xl lg:text-[5.6rem]">
              Proof of ability matters more than claims, connections, or location.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Bunju connects verified talent, founders, companies, and investors around the one signal that travels everywhere: work that stands up to scrutiny.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl"><Link to="/dashboard">Join Bunju <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="glass" className="rounded-xl"><a href="#philosophy">See how it works</a></Button>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[10px] uppercase text-muted-foreground">
              <span>42 countries</span><span>19,340 verified people</span><span>4,218 proofs cleared</span>
            </div>
          </div>

          <div className="relative mt-14 self-center lg:mt-0">
            <div className="glass-panel bunju-rise-delay relative overflow-hidden rounded-3xl p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div><p className="font-mono text-[10px] uppercase text-muted-foreground">Public proof dossier</p><p className="mt-1 font-display text-2xl">Mara Ansel</p></div>
                <VerifiedBadge />
              </div>
              <div className="grid grid-cols-3 gap-3 py-6">
                {[['98.4','Trust'],['27','Proofs'],['12','Peers']].map(([value,label]) => <div key={label}><p className="font-mono text-2xl font-medium">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}
              </div>
              <div className="space-y-3">
                {[
                  ["Real-time payments API", "Fintra · verified delivery"],
                  ["Cross-market onboarding", "Lumen Labs · verified outcome"],
                  ["Risk scoring model", "Northwind · peer attested"],
                ].map(([title,meta]) => <div key={title} className="rounded-2xl border border-border bg-secondary/50 p-4"><div className="flex items-center gap-2"><BadgeCheck className="size-4 text-success"/><p className="text-sm font-medium">{title}</p></div><p className="mt-1 pl-6 text-xs text-muted-foreground">{meta}</p></div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="philosophy" className="border-y border-border bg-card/35 py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <p className="font-mono text-[10px] uppercase text-primary">The Bunju standard</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-20">
              <h2 className="font-display text-4xl font-medium text-balance sm:text-6xl">A professional identity built from evidence.</h2>
              <div className="space-y-6 text-base leading-7 text-muted-foreground">
                <p>Traditional networks reward pedigree, proximity, and polished claims. Bunju starts somewhere more useful: what you made, how it performed, and who can verify it.</p>
                <div className="flex items-center gap-3 text-foreground"><Globe2 className="size-5 text-primary"/><span>One trusted record, visible across borders.</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="network" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="max-w-2xl"><p className="font-mono text-[10px] uppercase text-primary">Built for the whole network</p><h2 className="mt-4 font-display text-4xl font-medium sm:text-5xl">Opportunity moves when trust is visible.</h2></div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map(({ icon: Icon, name, text }) => <article key={name} className="min-h-64 bg-background p-7"><Icon className="size-6 text-primary"/><h3 className="mt-12 font-display text-2xl">{name}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></article>)}
          </div>
        </section>

        <section className="border-t border-border px-5 py-20 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
            <div><p className="font-mono text-[10px] uppercase text-primary">Your work already speaks</p><h2 className="mt-3 max-w-2xl font-display text-4xl font-medium sm:text-6xl">Give it a trusted place to be seen.</h2></div>
            <Button asChild size="lg" className="rounded-xl"><Link to="/dashboard">Build your record <ArrowRight /></Link></Button>
          </div>
        </section>
      </main>
      <footer className="border-t border-border px-5 py-7 text-xs text-muted-foreground sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><span>© 2026 Bunju</span><span>Proof over promises.</span></div></footer>
    </div>
  );
}