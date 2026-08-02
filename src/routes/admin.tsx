import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Flame,
  Inbox,
  Search,
  Timer,
  TriangleAlert,
  UserX,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { AppShell, SignedOutNotice } from "@/components/helpdesk/AppShell";
import { TicketDetailDrawer } from "@/components/helpdesk/TicketDetail";
import { PriorityFlag, SlaWarning, StatusPill } from "@/components/helpdesk/badges";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { agentName, avgResolutionHours, isBreaching, useHelpdesk } from "@/lib/helpdesk/store";
import {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  type Priority,
  type Status,
  type Ticket,
} from "@/lib/helpdesk/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Agent Console — Northwind Helpdesk" },
      {
        name: "description",
        content:
          "Triage the IT ticket queue, watch SLA breaches, balance agent workload, and review resolution analytics.",
      },
      { property: "og:title", content: "Agent Console — Northwind Helpdesk" },
      {
        property: "og:description",
        content: "Triage tickets, monitor SLAs, and review support analytics.",
      },
    ],
  }),
  component: Admin,
});

type SortKey = "created" | "priority" | "status" | "subject";

const priorityRank: Record<Priority, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

function Admin() {
  const { session, tickets, agents, setStatus, setAssignee } = useHelpdesk();
  const [tab, setTab] = useState("queue");
  const [query, setQuery] = useState("");
  const [status, setStatusFilter] = useState<Status | "All">("All");
  const [priority, setPriorityFilter] = useState<Priority | "All">("All");
  const [sort, setSort] = useState<SortKey>("priority");
  const [asc, setAsc] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const kpis = useMemo(() => {
    const open = tickets.filter((t) => t.status === "Open").length;
    return {
      total: tickets.length,
      open,
      pending: tickets.filter((t) => t.status === "Pending").length,
      unassigned: tickets.filter((t) => !t.assigneeId && t.status !== "Closed").length,
      urgent: tickets.filter(
        (t) => t.priority === "Urgent" && t.status !== "Resolved" && t.status !== "Closed",
      ).length,
      resolved: tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length,
      breaching: tickets.filter(isBreaching).length,
      avg: avgResolutionHours(tickets),
    };
  }, [tickets]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = tickets.filter(
      (t) =>
        (status === "All" || t.status === status) &&
        (priority === "All" || t.priority === priority) &&
        (!q ||
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.requesterName.toLowerCase().includes(q)),
    );
    const dir = asc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort === "priority") return (priorityRank[a.priority] - priorityRank[b.priority]) * dir;
      if (sort === "status") return a.status.localeCompare(b.status) * dir;
      if (sort === "subject") return a.subject.localeCompare(b.subject) * dir;
      return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * dir;
    });
  }, [tickets, query, status, priority, sort, asc]);

  function toggleSort(key: SortKey) {
    if (sort === key) setAsc((v) => !v);
    else {
      setSort(key);
      setAsc(true);
    }
  }

  function batchStatus(next: Status) {
    selected.forEach((id) => setStatus(id, next));
    toast.success(`${selected.length} ticket(s) moved to ${next}`);
    setSelected([]);
  }

  if (!session || session.role !== "agent") return <SignedOutNotice target="agent console" />;

  return (
    <AppShell>
      <h1 className="text-2xl font-bold tracking-tight">Support operations</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Live queue health across {agents.length} agents.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total tickets" value={kpis.total} icon={Inbox} hint={`${kpis.open} open`} />
        <Kpi label="Unassigned" value={kpis.unassigned} icon={UserX} hint="Needs triage" />
        <Kpi label="Urgent active" value={kpis.urgent} icon={Flame} tone="urgent" />
        <Kpi label="Resolved" value={kpis.resolved} icon={CheckCircle2} tone="resolved" />
        <Kpi label="Pending on requester" value={kpis.pending} icon={Clock} />
        <Kpi
          label="Avg resolution"
          value={`${kpis.avg.toFixed(1)}h`}
          icon={Timer}
          hint="Across resolved tickets"
        />
        <Kpi
          label="SLA breaches"
          value={kpis.breaching}
          icon={TriangleAlert}
          tone={kpis.breaching ? "urgent" : undefined}
          hint={kpis.breaching ? "Escalate now" : "All within SLA"}
        />
        <Kpi
          label="First-touch rate"
          value={`${Math.round(
            (tickets.filter((t) => t.comments.length > 0).length / Math.max(tickets.length, 1)) * 100,
          )}%`}
          icon={Timer}
          hint="Tickets with a reply"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-8">
        <TabsList>
          <TabsTrigger value="queue">Ticket queue</TabsTrigger>
          <TabsTrigger value="workload">Agent workload</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ID, subject or requester…"
                className="pl-9"
              />
            </div>
            <Select value={priority} onValueChange={(v) => setPriorityFilter(v as Priority | "All")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All priorities</SelectItem>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected.length > 0 && (
              <div className="ml-auto flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
                <span className="font-semibold num">{selected.length} selected</span>
                <Select onValueChange={(v) => batchStatus(v as Status)}>
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue placeholder="Set status…" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                  Clear
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1.5">
            {(["All", ...STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  status === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {s}{" "}
                <span className="num opacity-70">
                  {s === "All" ? tickets.length : tickets.filter((t) => t.status === s).length}
                </span>
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[56rem] text-sm">
              <thead className="border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={selected.length > 0 && selected.length === rows.length}
                      onCheckedChange={(c) => setSelected(c ? rows.map((t) => t.id) : [])}
                      aria-label="Select all"
                    />
                  </th>
                  <Th onClick={() => toggleSort("subject")}>Ticket</Th>
                  <Th onClick={() => toggleSort("priority")}>Priority</Th>
                  <Th onClick={() => toggleSort("status")}>Status</Th>
                  <th className="px-4 py-3 text-left font-semibold">Assignee</th>
                  <Th onClick={() => toggleSort("created")}>Created</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected.includes(t.id)}
                        onCheckedChange={(c) =>
                          setSelected((prev) =>
                            c ? [...prev, t.id] : prev.filter((id) => id !== t.id),
                          )
                        }
                        aria-label={`Select ${t.id}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setOpenId(t.id)} className="text-left">
                        <span className="font-mono text-xs text-muted-foreground">#{t.id}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="font-semibold hover:underline">{t.subject}</span>
                          {isBreaching(t) && <SlaWarning />}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t.requesterName} · {t.category}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityFlag priority={t.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <Select value={t.status} onValueChange={(v) => setStatus(t.id, v as Status)}>
                        <SelectTrigger className="h-8 w-36 border-none bg-transparent px-1 shadow-none">
                          <StatusPill status={t.status} />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={t.assigneeId ?? "none"}
                        onValueChange={(v) => setAssignee(t.id, v === "none" ? null : v)}
                      >
                        <SelectTrigger className="h-8 w-40 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {agents.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="num px-4 py-3 text-xs text-muted-foreground">
                      {format(new Date(t.createdAt), "d MMM, HH:mm")}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No tickets match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="workload" className="mt-5">
          <Workload tickets={tickets} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-5">
          <Analytics tickets={tickets} />
        </TabsContent>
      </Tabs>

      <TicketDetailDrawer ticketId={openId} onClose={() => setOpenId(null)} />
    </AppShell>
  );
}

function Th({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <th className="px-4 py-3 text-left font-semibold">
      <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-foreground">
        {children}
        <ArrowUpDown className="size-3" />
      </button>
    </th>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  hint,
  tone,
}: {
  label: string;
  value: number | string;
  icon: typeof Inbox;
  hint?: string;
  tone?: "urgent" | "resolved" | undefined;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Icon
          className={cn(
            "size-4 text-muted-foreground",
            tone === "urgent" && "text-urgent",
            tone === "resolved" && "text-status-resolved-foreground",
          )}
        />
      </div>
      <p
        className={cn(
          "num mt-2 text-3xl font-bold tracking-tight",
          tone === "urgent" && "text-urgent",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Workload({ tickets }: { tickets: Ticket[] }) {
  const { agents } = useHelpdesk();
  const max = Math.max(
    1,
    ...agents.map((a) => tickets.filter((t) => t.assigneeId === a.id).length),
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {agents.map((a) => {
        const own = tickets.filter((t) => t.assigneeId === a.id);
        const active = own.filter((t) => t.status !== "Resolved" && t.status !== "Closed");
        return (
          <div key={a.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.email}</p>
              </div>
              <p className="num text-2xl font-bold">{active.length}</p>
            </div>
            <Progress value={(own.length / max) * 100} className="mt-4" />
            <div className="mt-4 flex flex-wrap gap-2">
              {STATUSES.map((s) => {
                const n = own.filter((t) => t.status === s).length;
                if (!n) return null;
                return (
                  <span key={s} className="inline-flex items-center gap-1 text-xs">
                    <StatusPill status={s} />
                    <span className="num font-semibold">{n}</span>
                  </span>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {own.filter((t) => isBreaching(t)).length} at SLA risk · {own.length} lifetime assigned
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Analytics({ tickets }: { tickets: Ticket[] }) {
  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    tickets: tickets.filter((t) => t.category === c).length,
  }));

  const monthly = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      return d;
    });
    const seededRate = [62, 71, 68, 78, 84, 0];
    return months.map((d, i) => {
      const label = format(d, "MMM");
      const created =
        i === 5
          ? tickets.length
          : Math.round(tickets.length * (0.5 + ((i * 7) % 5) / 10));
      const resolvedRate =
        i === 5
          ? Math.round(
              (tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length /
                Math.max(tickets.length, 1)) *
                100,
            )
          : seededRate[i];
      return { month: label, created, resolvedRate };
    });
  }, [tickets]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Ticket volume by category</h3>
        <p className="text-xs text-muted-foreground">Where requests are coming from</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={54}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="tickets" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Monthly resolution rate</h3>
        <p className="text-xs text-muted-foreground">Share of tickets closed within the month</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="resolvedRate"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}