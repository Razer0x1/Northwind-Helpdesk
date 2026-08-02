import { AlertTriangle, ArrowDown, ArrowUp, Flame, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/lib/helpdesk/types";

const statusClass: Record<Status, string> = {
  Open: "bg-status-open text-status-open-foreground",
  "In Progress": "bg-status-progress text-status-progress-foreground",
  Pending: "bg-status-pending text-status-pending-foreground",
  Resolved: "bg-status-resolved text-status-resolved-foreground",
  Closed: "bg-status-closed text-status-closed-foreground",
};

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        statusClass[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

const priorityMeta: Record<Priority, { icon: typeof Flame; color: string }> = {
  Urgent: { icon: Flame, color: "text-urgent" },
  High: { icon: ArrowUp, color: "text-high" },
  Medium: { icon: Minus, color: "text-medium" },
  Low: { icon: ArrowDown, color: "text-low" },
};

export function PriorityFlag({ priority, className }: { priority: Priority; className?: string }) {
  const { icon: Icon, color } = priorityMeta[priority];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", color, className)}>
      <Icon className="size-3.5" />
      {priority}
    </span>
  );
}

export function SlaWarning({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-urgent px-2 py-0.5 text-[11px] font-semibold text-urgent-foreground",
        className,
      )}
    >
      <AlertTriangle className="size-3" />
      SLA breach
    </span>
  );
}