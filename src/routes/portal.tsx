import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Inbox, MessageSquare, Paperclip, Search } from "lucide-react";
import { AppShell, SignedOutNotice } from "@/components/helpdesk/AppShell";
import { CreateTicketDialog } from "@/components/helpdesk/CreateTicketDialog";
import { TicketDetailDrawer } from "@/components/helpdesk/TicketDetail";
import { PriorityFlag, StatusPill } from "@/components/helpdesk/badges";
import { Input } from "@/components/ui/input";
import { useHelpdesk } from "@/lib/helpdesk/store";
import { STATUSES, type Status } from "@/lib/helpdesk/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My Tickets — Northwind Helpdesk" },
      {
        name: "description",
        content: "Submit IT support tickets, follow their status, and reply to your support agent.",
      },
      { property: "og:title", content: "My Tickets — Northwind Helpdesk" },
      {
        property: "og:description",
        content: "Submit IT support tickets and follow their progress in real time.",
      },
    ],
  }),
  component: Portal,
});

function Portal() {
  const { session, person, tickets } = useHelpdesk();
  const [filter, setFilter] = useState<Status | "All">("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const mine = useMemo(
    () => tickets.filter((t) => t.requesterId === person?.id),
    [tickets, person?.id],
  );

  const visible = mine.filter(
    (t) =>
      (filter === "All" || t.status === filter) &&
      (t.subject.toLowerCase().includes(query.toLowerCase()) ||
        t.id.toLowerCase().includes(query.toLowerCase())),
  );

  if (!session || session.role !== "user") return <SignedOutNotice target="employee portal" />;

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mine.length} request{mine.length === 1 ? "" : "s"} raised by {person?.name}
          </p>
        </div>
        <CreateTicketDialog />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1.5">
          {(["All", ...STATUSES] as const).map((s) => {
            const count = s === "All" ? mine.length : mine.filter((t) => t.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {s} <span className="num opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search my tickets…"
            className="pl-9"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-xl border border-dashed border-border py-16 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No tickets match this view</p>
          <p className="text-sm text-muted-foreground">Try another status filter or search term.</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setOpenId(t.id)}
                className="flex h-full w-full flex-col rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">#{t.id}</span>
                  <StatusPill status={t.status} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm font-semibold">{t.subject}</p>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
                <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                  <PriorityFlag priority={t.priority} />
                  <span>{t.category}</span>
                  <span className="ml-auto inline-flex items-center gap-2">
                    {t.attachments.length > 0 && <Paperclip className="size-3.5" />}
                    <MessageSquare className="size-3.5" />
                    <span className="num">{t.comments.filter((c) => !c.internal).length}</span>
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Created {format(new Date(t.createdAt), "d MMM yyyy, HH:mm")}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <TicketDetailDrawer ticketId={openId} onClose={() => setOpenId(null)} />
    </AppShell>
  );
}