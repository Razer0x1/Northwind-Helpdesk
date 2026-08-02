import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { History, Lock, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { PriorityFlag, SlaWarning, StatusPill } from "./badges";
import { agentName, isBreaching, useHelpdesk } from "@/lib/helpdesk/store";
import { PRIORITIES, STATUSES, type Priority, type Status, type Ticket } from "@/lib/helpdesk/types";
import { cn } from "@/lib/utils";

export function TicketDetailDrawer({
  ticketId,
  onClose,
}: {
  ticketId: string | null;
  onClose: () => void;
}) {
  const { tickets } = useHelpdesk();
  const ticket = tickets.find((t) => t.id === ticketId) ?? null;
  return (
    <Sheet open={!!ticket} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-3xl">
        {ticket && (
          <>
            <SheetHeader className="border-b border-border px-6 py-4">
              <SheetTitle className="flex flex-wrap items-center gap-3 text-base">
                <span className="font-mono text-xs text-muted-foreground">#{ticket.id}</span>
                {ticket.subject}
              </SheetTitle>
            </SheetHeader>
            <TicketDetailBody ticket={ticket} />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function TicketDetailBody({ ticket }: { ticket: Ticket }) {
  const { session, agents, setStatus, setPriority, setAssignee, addComment } = useHelpdesk();
  const isAgent = session?.role === "agent";
  const [draft, setDraft] = useState("");
  const [internal, setInternal] = useState(false);

  const visibleComments = ticket.comments.filter((c) => isAgent || !c.internal);

  function submit() {
    if (!draft.trim()) return;
    addComment(ticket.id, draft.trim(), isAgent && internal);
    setDraft("");
    toast.success(internal && isAgent ? "Internal note added" : "Reply posted");
  }

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[1fr_18rem]">
      <div className="min-w-0 space-y-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {ticket.requesterName}
            <span className="text-xs font-normal text-muted-foreground">
              opened {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ticket.description}</p>
          {ticket.attachments.map((a) => (
            <div
              key={a.name}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs"
            >
              <Paperclip className="size-3.5" />
              {a.name}
              <span className="text-muted-foreground">{Math.round(a.size / 1024)} KB</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Discussion ({visibleComments.length})
          </h3>
          {visibleComments.length === 0 && (
            <p className="text-sm text-muted-foreground">No replies yet.</p>
          )}
          {visibleComments.map((c) => (
            <div
              key={c.id}
              className={cn(
                "flex gap-3 rounded-xl border p-4",
                c.internal
                  ? "border-dashed border-medium/60 bg-status-progress/40"
                  : "border-border bg-card",
              )}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-secondary text-[11px] font-semibold">
                  {c.authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold">{c.authorName}</span>
                  <span className="text-muted-foreground">
                    {format(new Date(c.createdAt), "d MMM, HH:mm")}
                  </span>
                  {c.internal && (
                    <span className="inline-flex items-center gap-1 font-semibold text-medium">
                      <Lock className="size-3" /> Internal note
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={internal ? "Write an internal note…" : "Write a reply…"}
            rows={3}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isAgent && (
              <div className="flex rounded-lg border border-border p-0.5">
                <button
                  type="button"
                  onClick={() => setInternal(false)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium",
                    !internal ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  Public reply
                </button>
                <button
                  type="button"
                  onClick={() => setInternal(true)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium",
                    internal ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  Internal note
                </button>
              </div>
            )}
            <Button className="ml-auto" onClick={submit} disabled={!draft.trim()}>
              <Send className="size-4" /> Send
            </Button>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          {isBreaching(ticket) && <SlaWarning />}
          <Field label="Status">
            {isAgent ? (
              <Select
                value={ticket.status}
                onValueChange={(v) => setStatus(ticket.id, v as Status)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <StatusPill status={ticket.status} />
            )}
          </Field>
          <Field label="Priority">
            {isAgent ? (
              <Select
                value={ticket.priority}
                onValueChange={(v) => setPriority(ticket.id, v as Priority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <PriorityFlag priority={ticket.priority} />
            )}
          </Field>
          <Field label="Assigned agent">
            {isAgent ? (
              <Select
                value={ticket.assigneeId ?? "none"}
                onValueChange={(v) => setAssignee(ticket.id, v === "none" ? null : v)}
              >
                <SelectTrigger className="w-full">
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
            ) : (
              <p className="text-sm">{agentName(agents, ticket.assigneeId)}</p>
            )}
          </Field>
          <Separator />
          <Meta label="Category" value={ticket.category} />
          <Meta label="Requester" value={`${ticket.requesterName} · ${ticket.requesterEmail}`} />
          <Meta label="Created" value={format(new Date(ticket.createdAt), "d MMM yyyy, HH:mm")} />
          <Meta label="Last update" value={format(new Date(ticket.updatedAt), "d MMM yyyy, HH:mm")} />
          <Meta label="SLA due" value={format(new Date(ticket.slaDueAt), "d MMM yyyy, HH:mm")} />
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <History className="size-3.5" /> Audit trail
          </h4>
          <ol className="mt-3 space-y-3">
            {ticket.audit.map((a) => (
              <li key={a.id} className="border-l-2 border-border pl-3 text-xs">
                <p className="font-medium">
                  {a.actor} {a.action}
                </p>
                <p className="text-muted-foreground">
                  {format(new Date(a.createdAt), "d MMM yyyy, HH:mm")}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-xs">
      <p className="font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}