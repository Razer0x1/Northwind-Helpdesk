export type Status = "Open" | "In Progress" | "Pending" | "Resolved" | "Closed";
export type Priority = "Low" | "Medium" | "High" | "Urgent";
export type Category =
  | "Hardware"
  | "Software"
  | "Network"
  | "Access & Accounts"
  | "Email"
  | "Other";

export const STATUSES: Status[] = ["Open", "In Progress", "Pending", "Resolved", "Closed"];
export const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Urgent"];
export const CATEGORIES: Category[] = [
  "Hardware",
  "Software",
  "Network",
  "Access & Accounts",
  "Email",
  "Other",
];

export type Role = "user" | "agent";

export interface Person {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  internal: boolean;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  createdAt: string;
}

export interface Attachment {
  name: string;
  size: number;
  type: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  slaDueAt: string;
  attachments: Attachment[];
  comments: Comment[];
  audit: AuditEntry[];
}