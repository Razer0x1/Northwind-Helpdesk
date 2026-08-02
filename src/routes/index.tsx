import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, LifeBuoy, Moon, ShieldCheck, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHelpdesk } from "@/lib/helpdesk/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Northwind Helpdesk" },
      {
        name: "description",
        content:
          "Choose a demo profile to explore the Northwind Helpdesk employee portal or the IT agent console.",
      },
      { property: "og:title", content: "Sign in — Northwind Helpdesk" },
      {
        property: "og:description",
        content: "Choose a demo profile to explore the Northwind Helpdesk employee portal or the IT agent console.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { users, agents, signIn, dark, toggleTheme, tickets } = useHelpdesk();
  const navigate = useNavigate();
  const [role, setRole] = useState<"user" | "agent">("user");
  const people = role === "user" ? users : agents;

  function enter(id: string) {
    signIn(id, role);
    navigate({ to: role === "user" ? "/portal" : "/admin" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="grid size-9 place-items-center rounded-lg bg-primary-foreground/15">
            <LifeBuoy className="size-5" />
          </span>
          Northwind Helpdesk
        </div>
        <div>
          <h1 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">
            One queue for every IT request in the company.
          </h1>
          <p className="mt-4 max-w-sm text-sm opacity-80">
            Priority-based SLAs, audit trails on every change, and analytics that show where the
            backlog actually sits.
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-6 text-left">
            {[
              ["Live tickets", tickets.filter((t) => t.status !== "Closed").length],
              ["Agents", agents.length],
              ["Categories", 6],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <dt className="text-xs uppercase tracking-wide opacity-70">{label}</dt>
                <dd className="num mt-1 text-2xl font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="text-xs opacity-60">Demo environment · mock data, no real credentials</p>
      </div>

      <div className="flex flex-col justify-center bg-background px-6 py-14 sm:px-14">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Sign in to the demo</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Pick a role, then choose a profile to continue.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-1.5">
            {(
              [
                ["user", "Employee", User],
                ["agent", "Agent / Admin", ShieldCheck],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                onClick={() => setRole(value)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                  role === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          <ul className="mt-5 space-y-2">
            {people.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => enter(p.id)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-accent"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">
                    {p.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{p.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {p.email}
                      {p.department ? ` · ${p.department}` : ""}
                    </span>
                  </span>
                  <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
