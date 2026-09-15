import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell, BriefcaseBusiness, ChevronDown, Compass, LayoutDashboard, Menu, MessageSquare,
  Search, Settings, UserRound, WalletCards,
} from "lucide-react";
import { BunjuBrand } from "./brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import maraImage from "@/assets/mara-ansel.jpg";

const navigation = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Discover", to: "/discover", icon: Compass },
  { label: "Profile", to: "/profile", icon: UserRound },
  { label: "Workspaces", to: "/workspaces", icon: BriefcaseBusiness },
  { label: "Wallet", to: "/wallet", icon: WalletCards },
  { label: "Messages", to: "/messages", icon: MessageSquare },
  { label: "Settings", to: "/settings", icon: Settings },
] as const;

function Navigation() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"}`}
          >
            <Icon className={`size-4 ${active ? "text-primary" : ""}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent() {
  return (
    <>
      <div className="px-5 py-6"><BunjuBrand /></div>
      <div className="flex-1 px-3"><Navigation /></div>
      <div className="m-3 rounded-2xl border border-border bg-surface-glass p-4">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase text-muted-foreground">
          <span>Wallet balance</span><span className="text-success">+8.2%</span>
        </div>
        <p className="mt-2 font-mono text-xl font-medium">$12,840.00</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-[68%] rounded-full bg-primary" />
        </div>
      </div>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar/70 backdrop-blur-2xl lg:flex">
        <SidebarContent />
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-2xl">
          <div className="grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
            <Sheet>
              <SheetTrigger asChild><Button variant="glass" size="icon" className="lg:hidden" aria-label="Open navigation"><Menu /></Button></SheetTrigger>
              <SheetContent side="left" className="flex w-72 flex-col border-border bg-sidebar p-0">
                <SheetTitle className="sr-only">Bunju navigation</SheetTitle>
                <SheetDescription className="sr-only">Navigate the Bunju platform.</SheetDescription>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <label className="relative hidden max-w-lg sm:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input className="h-10 w-full rounded-xl border border-border bg-secondary/60 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary" placeholder="Search talent, proof, or workspaces" />
            </label>
            <div className="col-start-3 flex items-center gap-2">
              <Button variant="glass" size="icon" aria-label="Notifications" className="relative">
                <Bell /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-success" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="glass" className="h-10 rounded-xl px-1.5 sm:pr-3">
                    <img src={maraImage} width={768} height={768} alt="Mara Ansel" className="size-7 rounded-lg object-cover" />
                    <span className="hidden sm:inline">Mara Ansel</span><ChevronDown className="hidden size-3.5 sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>My account</DropdownMenuLabel><DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/profile">Public profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/settings">Preferences</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSignOut}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}