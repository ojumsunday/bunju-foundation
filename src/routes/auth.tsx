import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { BunjuBrand } from "@/components/bunju/brand";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirect?: string | undefined; mode?: "signin" | "signup" | undefined } => ({
    redirect: typeof search['redirect'] === "string" ? (search['redirect'] as string) : undefined,
    mode: search['mode'] === "signin" ? "signin" : "signup",
  }),
  head: () => ({
    meta: [
      { title: "Create your Bunju account — Verified proof of work" },
      { name: "description", content: "Join Bunju with email or Google and start building a verified record of real work." },
      { property: "og:title", content: "Create your Bunju account" },
      { property: "og:description", content: "Join Bunju with email or Google and start building a verified record of real work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-secondary px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary";

function AuthPage() {
  const { redirect, mode: initialMode } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "signin">(initialMode ?? "signup");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    dateOfBirth: "",
    email: "",
    password: "",
  });

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const goToApp = () => navigate({ to: redirect ?? "/dashboard", replace: true });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        goToApp();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            resident_address: form.address,
            date_of_birth: form.dateOfBirth,
          },
        },
      });
      if (error) throw error;

      if (data.session?.user) {
        await supabase.from("profiles").upsert({
          user_id: data.session.user.id,
          first_name: form.firstName,
          last_name: form.lastName,
          resident_address: form.address,
          date_of_birth: form.dateOfBirth,
        });
        goToApp();
        return;
      }

      toast.success("Check your email to confirm your account", {
        description: "Your identity verification starts right after you confirm.",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/"><BunjuBrand /></Link>
        <Button variant="glass" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
          {mode === "signup" ? "Sign in" : "Create account"}
        </Button>
      </header>

      <main className="mx-auto grid max-w-5xl gap-10 px-5 pb-20 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,.85fr)]">
        <section className="bunju-rise self-center">
          <h1 className="max-w-xl font-display text-4xl font-medium leading-[1.05] text-balance sm:text-5xl">
            {mode === "signup" ? "Build a record that speaks for itself." : "Welcome back to your proof record."}
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
            Verification protects the community and unlocks payments, hiring, and investment activity — it is what makes proof worth trusting.
          </p>
          <p className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase text-muted-foreground">
            <ShieldCheck className="size-4 text-success" /> Identity verified before you enter the network
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface-glass p-6 backdrop-blur-xl">
          <form className="space-y-3" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs text-muted-foreground">
                    First name
                    <input required value={form.firstName} onChange={set("firstName")} className={`mt-1.5 ${inputClass}`} placeholder="Mara" />
                  </label>
                  <label className="block text-xs text-muted-foreground">
                    Surname
                    <input required value={form.lastName} onChange={set("lastName")} className={`mt-1.5 ${inputClass}`} placeholder="Ansel" />
                  </label>
                </div>
                <label className="block text-xs text-muted-foreground">
                  Resident address
                  <input required value={form.address} onChange={set("address")} className={`mt-1.5 ${inputClass}`} placeholder="Street, city, country" />
                </label>
                <label className="block text-xs text-muted-foreground">
                  Date of birth
                  <input required type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} className={`mt-1.5 ${inputClass}`} />
                </label>
              </>
            )}
            <label className="block text-xs text-muted-foreground">
              Email
              <input required type="email" value={form.email} onChange={set("email")} className={`mt-1.5 ${inputClass}`} placeholder="you@company.com" />
            </label>
            <label className="block text-xs text-muted-foreground">
              Password
              <input required type="password" minLength={8} value={form.password} onChange={set("password")} className={`mt-1.5 ${inputClass}`} placeholder="At least 8 characters" />
            </label>
            <Button type="submit" className="mt-2 w-full rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : null}
              {mode === "signup" ? "Create account" : "Sign in"} <ArrowRight />
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 font-mono text-[10px] uppercase text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <Button variant="glass" className="w-full rounded-xl" onClick={handleGoogle}>
            Continue with Google
          </Button>
        </section>
      </main>
    </div>
  );
}
