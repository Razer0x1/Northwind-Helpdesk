import { Link, useNavigate } from "@tanstack/react-router";
import { LifeBuoy, LogOut, Moon, Sun, Database, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useHelpdesk } from "@/lib/helpdesk/store";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  nav,
}: {
  children: ReactNode;
  nav?: { label: string; to: string }[];
}) {
  const { person, session, signOut, dark, toggleTheme, persist, setPersist, resetData } =
    useHelpdesk();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <LifeBuoy className="size-4.5" />
            </span>
            <span className="text-sm font-bold tracking-tight">Northwind Helpdesk</span>
          </Link>

          {nav && (
            <nav className="ml-4 hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  activeProps={{ className: "bg-accent text-foreground" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-3">
            <label className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
              <Database className="size-3.5" />
              Local persistence
              <Switch checked={persist} onCheckedChange={setPersist} aria-label="Local persistence" />
            </label>
            <Button variant="ghost" size="icon" onClick={resetData} title="Reset demo data">
              <RotateCcw className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            {person && (
              <div className="flex items-center gap-2 border-l border-border pl-3">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-secondary text-xs font-semibold">
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold leading-tight">{person.name}</p>
                  <p className="text-[11px] capitalize text-muted-foreground">
                    {session?.role === "agent" ? "Support agent" : "Employee"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Sign out"
                  onClick={() => {
                    signOut();
                    navigate({ to: "/", replace: true });
                  }}
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className={cn("mx-auto max-w-7xl px-4 py-8 sm:px-6")}>{children}</main>
    </div>
  );
}

export function SignedOutNotice({ target }: { target: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-lg font-semibold">Sign in required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a demo profile to open the {target}.
        </p>
        <Button asChild className="mt-5">
          <Link to="/">Go to sign in</Link>
        </Button>
      </div>
    </div>
  );
}