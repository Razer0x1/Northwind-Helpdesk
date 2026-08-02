import type { Person, Ticket } from "./types";

export const AGENTS: Person[] = [
  { id: "a1", name: "Nadia Rahman", email: "nadia@northwind.io", role: "agent" },
  { id: "a2", name: "Ellis Vance", email: "ellis@northwind.io", role: "agent" },
  { id: "a3", name: "Priya Kapoor", email: "priya@northwind.io", role: "agent" },
  { id: "a4", name: "Tom Bergström", email: "tom@northwind.io", role: "agent" },
];

export const USERS: Person[] = [
  {
    id: "u1",
    name: "Marcus Webb",
    email: "marcus.webb@northwind.io",
    role: "user",
    department: "Finance",
  },
  {
    id: "u2",
    name: "Sofia Lindqvist",
    email: "sofia.l@northwind.io",
    role: "user",
    department: "Design",
  },
  { id: "u3", name: "Dev Patel", email: "dev.patel@northwind.io", role: "user", department: "Sales" },
  {
    id: "u4",
    name: "Hannah Cole",
    email: "hannah.cole@northwind.io",
    role: "user",
    department: "Operations",
  },
];

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

interface Seed {
  n: number;
  subject: string;
  description: string;
  category: Ticket["category"];
  priority: Ticket["priority"];
  status: Ticket["status"];
  requester: string;
  assignee: string | null;
  age: number;
  resolveIn?: number;
  slaHours: number;
}

const seeds: Seed[] = [
  {
    n: 1024,
    subject: "Laptop won't boot after Windows update",
    description:
      "After last night's forced update my ThinkPad stops at the recovery screen. I have a client deck due tomorrow morning.",
    category: "Hardware",
    priority: "Urgent",
    status: "In Progress",
    requester: "u1",
    assignee: "a1",
    age: 5,
    slaHours: 4,
  },
  {
    n: 1025,
    subject: "VPN drops every few minutes on home wifi",
    description:
      "Tunnel disconnects roughly every 4 minutes. Happens on both the 5GHz and 2.4GHz bands.",
    category: "Network",
    priority: "High",
    status: "Open",
    requester: "u2",
    assignee: null,
    age: 9,
    slaHours: 8,
  },
  {
    n: 1026,
    subject: "Request access to the Q3 forecasting workbook",
    description: "Finance shared drive returns 'permission denied' for the forecasting folder.",
    category: "Access & Accounts",
    priority: "Medium",
    status: "Pending",
    requester: "u3",
    assignee: "a2",
    age: 26,
    slaHours: 24,
  },
  {
    n: 1027,
    subject: "Outlook search returns no results",
    description: "Search index appears broken; rebuilding from the client did not help.",
    category: "Email",
    priority: "Low",
    status: "Open",
    requester: "u4",
    assignee: null,
    age: 32,
    slaHours: 48,
  },
  {
    n: 1028,
    subject: "Adobe licence deactivated mid-project",
    description: "Creative Cloud says my seat was released. Cannot open working files.",
    category: "Software",
    priority: "High",
    status: "In Progress",
    requester: "u2",
    assignee: "a3",
    age: 14,
    slaHours: 8,
  },
  {
    n: 1029,
    subject: "New starter setup — Operations, starts Monday",
    description: "Needs laptop, phone, badge, and access to the ops dashboards.",
    category: "Other",
    priority: "Medium",
    status: "Open",
    requester: "u4",
    assignee: "a4",
    age: 40,
    slaHours: 72,
  },
  {
    n: 1030,
    subject: "Printer on 4th floor jams on duplex jobs",
    description: "Single-sided prints fine. Duplex jams every time around page three.",
    category: "Hardware",
    priority: "Low",
    status: "Resolved",
    requester: "u1",
    assignee: "a1",
    age: 96,
    resolveIn: 30,
    slaHours: 48,
  },
  {
    n: 1031,
    subject: "Phishing email reported by three people in Sales",
    description: "Spoofed invoice from a lookalike vendor domain. Nobody clicked as far as we know.",
    category: "Email",
    priority: "Urgent",
    status: "Resolved",
    requester: "u3",
    assignee: "a2",
    age: 70,
    resolveIn: 3,
    slaHours: 4,
  },
  {
    n: 1032,
    subject: "Slack notifications not arriving on iOS",
    description: "Desktop works, mobile is silent since the app update.",
    category: "Software",
    priority: "Low",
    status: "Closed",
    requester: "u2",
    assignee: "a3",
    age: 190,
    resolveIn: 40,
    slaHours: 48,
  },
  {
    n: 1033,
    subject: "Two-factor device lost — need reset",
    description: "Phone was stolen this weekend, locked out of the SSO portal.",
    category: "Access & Accounts",
    priority: "Urgent",
    status: "Open",
    requester: "u1",
    assignee: null,
    age: 2,
    slaHours: 4,
  },
  {
    n: 1034,
    subject: "Meeting room display shows no signal",
    description: "Nordkapp room. HDMI and wireless casting both dead.",
    category: "Hardware",
    priority: "Medium",
    status: "Pending",
    requester: "u4",
    assignee: "a4",
    age: 50,
    slaHours: 24,
  },
  {
    n: 1035,
    subject: "CRM export times out on large date ranges",
    description: "Anything over 90 days fails with a gateway timeout.",
    category: "Software",
    priority: "High",
    status: "In Progress",
    requester: "u3",
    assignee: "a1",
    age: 20,
    slaHours: 8,
  },
  {
    n: 1036,
    subject: "Guest wifi password rotation request",
    description: "Client workshop on Thursday, need a fresh guest credential set.",
    category: "Network",
    priority: "Low",
    status: "Resolved",
    requester: "u2",
    assignee: "a2",
    age: 130,
    resolveIn: 12,
    slaHours: 48,
  },
  {
    n: 1037,
    subject: "Shared mailbox missing from Finance group",
    description: "accounts@ no longer appears for three of us after the tenant migration.",
    category: "Email",
    priority: "Medium",
    status: "Closed",
    requester: "u1",
    assignee: "a3",
    age: 260,
    resolveIn: 55,
    slaHours: 24,
  },
];

const nameOf = (id: string) => [...USERS, ...AGENTS].find((p) => p.id === id)?.name ?? "Unknown";

export function buildSeedTickets(): Ticket[] {
  return seeds.map((s) => {
    const requester = USERS.find((u) => u.id === s.requester)!;
    const createdAt = hoursAgo(s.age);
    const resolvedAt = s.resolveIn ? hoursAgo(s.age - s.resolveIn) : null;
    const audit = [
      {
        id: `au-${s.n}-1`,
        actor: requester.name,
        action: "created the ticket",
        createdAt,
      },
    ];
    if (s.assignee) {
      audit.push({
        id: `au-${s.n}-2`,
        actor: "Nadia Rahman",
        action: `assigned to ${nameOf(s.assignee)}`,
        createdAt: hoursAgo(Math.max(s.age - 1, 0.2)),
      });
    }
    if (s.status !== "Open") {
      audit.push({
        id: `au-${s.n}-3`,
        actor: s.assignee ? nameOf(s.assignee) : "System",
        action: `changed status to ${s.status}`,
        createdAt: resolvedAt ?? hoursAgo(Math.max(s.age - 2, 0.1)),
      });
    }
    return {
      id: `TICK-${s.n}`,
      subject: s.subject,
      description: s.description,
      category: s.category,
      priority: s.priority,
      status: s.status,
      requesterId: requester.id,
      requesterName: requester.name,
      requesterEmail: requester.email,
      assigneeId: s.assignee,
      createdAt,
      updatedAt: resolvedAt ?? hoursAgo(Math.max(s.age - 2, 0.1)),
      resolvedAt,
      slaDueAt: new Date(new Date(createdAt).getTime() + s.slaHours * 3600_000).toISOString(),
      attachments: s.n % 4 === 0 ? [{ name: "screenshot.png", size: 184320, type: "image/png" }] : [],
      comments:
        s.status === "Open"
          ? []
          : [
              {
                id: `c-${s.n}-1`,
                authorId: s.assignee ?? "a1",
                authorName: s.assignee ? nameOf(s.assignee) : "Nadia Rahman",
                body: "Thanks for the report — I'm picking this up now and will keep you posted.",
                internal: false,
                createdAt: hoursAgo(Math.max(s.age - 1.5, 0.1)),
              },
              {
                id: `c-${s.n}-2`,
                authorId: requester.id,
                authorName: requester.name,
                body: "Appreciated. Let me know if you need remote access to my machine.",
                internal: false,
                createdAt: hoursAgo(Math.max(s.age - 2.5, 0.05)),
              },
            ],
      audit,
    };
  });
}