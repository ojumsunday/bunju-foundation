import { ArrowUpRight, Construction } from "lucide-react";
import { AppShell } from "./app-shell";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function ComingPage({ title, description }: { title: string; description: string }) {
  return (
    <AppShell>
      <div className="p-4 sm:p-8">
        <div className="mx-auto max-w-5xl bunju-rise">
          <p className="font-mono text-[10px] uppercase text-primary">Bunju / {title}</p>
          <h1 className="mt-2 font-display text-4xl font-medium sm:text-5xl">{title}</h1>
          <div className="mt-8 grid min-h-[55vh] place-items-center rounded-3xl border border-border bg-surface-glass p-8 text-center backdrop-blur-xl">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-xl bg-secondary text-primary"><Construction /></span>
              <h2 className="mt-5 text-lg font-semibold">Visual foundation ready</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
              <Button asChild className="mt-6"><Link to="/dashboard">Return to dashboard <ArrowUpRight /></Link></Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}