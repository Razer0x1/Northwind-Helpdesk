import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AGENTS, USERS, buildSeedTickets } from "./mock";
import type { Attachment, Category, Person, Priority, Role, Status, Ticket } from "./types";

const TICKET_KEY = "helpdesk.tickets.v1";
const SESSION_KEY = "helpdesk.session.v1";
const PERSIST_KEY = "helpdesk.persist.v1";
const THEME_KEY = "helpdesk.theme.v1";

export interface Session {
  personId: string;
  role: Role;
}

interface Ctx {
  tickets: Ticket[];
  session: Session | null;
  person: Person | null;
  persist: boolean;
  dark: boolean;
  agents: Person[];
  users: Person[];
  setPersist: (v: boolean) => void;
  toggleTheme: () => void;
  signIn: (personId: string, role: Role) => void;
  signOut: () => void;
  createTicket: (input: {
    subject: string;
    description: string;
    category: Category;
    priority: Priority;
    attachments: Attachment[];
  }) => Ticket | null;
  setStatus: (ticketId: string, status: Status) => void;
  setPriority: (ticketId: string, priority: Priority) => void;
  setAssignee: (ticketId: string, assigneeId: string | null) => void;
  addComment: (ticketId: string, body: string, internal: boolean) => void;
  resetData: () => void;
}

const HelpdeskContext = createContext<Ctx | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);
const SLA_HOURS: Record<Priority, number> = { Urgent: 4, High: 8, Medium: 24, Low: 48 };

export function HelpdeskProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(() => buildSeedTickets());
  const [session, setSession] = useState<Session | null>(null);
  const [persist, setPersistState] = useState(false);
  const [dark, setDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from local storage on the client only.
  useEffect(() => {
    try {
      const p = localStorage.getItem(PERSIST_KEY) === "1";
      setPersistState(p);
      if (p) {
        const raw = localStorage.getItem(TICKET_KEY);
        if (raw) setTickets(JSON.parse(raw) as Ticket[]);
      }
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setSession(JSON.parse(s) as Session);
      const t = localStorage.getItem(THEME_KEY);
      const isDark = t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDark(isDark);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark, hydrated]);

  useEffect(() => {
    if (!hydrated || !persist) return;
    localStorage.setItem(TICKET_KEY, JSON.stringify(tickets));
  }, [tickets, persist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [session, hydrated]);

  const person = useMemo(() => {
    if (!session) return null;
    return [...USERS, ...AGENTS].find((p) => p.id === session.personId) ?? null;
  }, [session]);

  const actorName = person?.name ?? "System";

  const patch = useCallback(
    (ticketId: string, fn: (t: Ticket) => Ticket) =>
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? fn(t) : t))),
    [],
  );

  const logged = (t: Ticket, action: string, actor: string): Ticket => ({
    ...t,
    updatedAt: new Date().toISOString(),
    audit: [{ id: uid(), actor, action, createdAt: new Date().toISOString() }, ...t.audit],
  });

  const value: Ctx = {
    tickets,
    session,
    person,
    persist,
    dark,
    agents: AGENTS,
    users: USERS,
    setPersist: (v) => {
      setPersistState(v);
      localStorage.setItem(PERSIST_KEY, v ? "1" : "0");
      if (v) localStorage.setItem(TICKET_KEY, JSON.stringify(tickets));
      else localStorage.removeItem(TICKET_KEY);
    },
    toggleTheme: () => setDark((d) => !d),
    signIn: (personId, role) => setSession({ personId, role }),
    signOut: () => setSession(null),
    createTicket: (input) => {
      if (!person) return null;
      const now = new Date().toISOString();
      const nextNum =
        tickets.reduce((max, t) => Math.max(max, Number(t.id.replace("TICK-", "")) || 0), 1023) + 1;
      const ticket: Ticket = {
        id: `TICK-${nextNum}`,
        subject: input.subject,
        description: input.description,
        category: input.category,
        priority: input.priority,
        status: "Open",
        requesterId: person.id,
        requesterName: person.name,
        requesterEmail: person.email,
        assigneeId: null,
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
        slaDueAt: new Date(Date.now() + SLA_HOURS[input.priority] * 3600_000).toISOString(),
        attachments: input.attachments,
        comments: [],
        audit: [{ id: uid(), actor: person.name, action: "created the ticket", createdAt: now }],
      };
      setTickets((prev) => [ticket, ...prev]);
      return ticket;
    },
    setStatus: (ticketId, status) =>
      patch(ticketId, (t) => {
        if (t.status === status) return t;
        const next = logged(t, `changed status from ${t.status} to ${status}`, actorName);
        return {
          ...next,
          status,
          resolvedAt:
            status === "Resolved" || status === "Closed"
              ? (t.resolvedAt ?? new Date().toISOString())
              : null,
        };
      }),
    setPriority: (ticketId, priority) =>
      patch(ticketId, (t) =>
        t.priority === priority
          ? t
          : {
              ...logged(t, `changed priority from ${t.priority} to ${priority}`, actorName),
              priority,
            },
      ),
    setAssignee: (ticketId, assigneeId) =>
      patch(ticketId, (t) => {
        if (t.assigneeId === assigneeId) return t;
        const name = AGENTS.find((a) => a.id === assigneeId)?.name;
        return {
          ...logged(t, name ? `assigned to ${name}` : "unassigned the ticket", actorName),
          assigneeId,
        };
      }),
    addComment: (ticketId, body, internal) =>
      patch(ticketId, (t) => ({
        ...logged(t, internal ? "added an internal note" : "replied to the requester", actorName),
        comments: [
          ...t.comments,
          {
            id: uid(),
            authorId: person?.id ?? "system",
            authorName: actorName,
            body,
            internal,
            createdAt: new Date().toISOString(),
          },
        ],
      })),
    resetData: () => {
      const seeded = buildSeedTickets();
      setTickets(seeded);
      if (persist) localStorage.setItem(TICKET_KEY, JSON.stringify(seeded));
    },
  };

  return <HelpdeskContext.Provider value={value}>{children}</HelpdeskContext.Provider>;
}

export function useHelpdesk() {
  const ctx = useContext(HelpdeskContext);
  if (!ctx) throw new Error("useHelpdesk must be used inside HelpdeskProvider");
  return ctx;
}

export function agentName(agents: Person[], id: string | null) {
  if (!id) return "Unassigned";
  return agents.find((a) => a.id === id)?.name ?? "Unknown";
}

export function isBreaching(t: Ticket) {
  if (t.status === "Resolved" || t.status === "Closed") return false;
  return new Date(t.slaDueAt).getTime() < Date.now();
}

export function avgResolutionHours(tickets: Ticket[]) {
  const done = tickets.filter((t) => t.resolvedAt);
  if (!done.length) return 0;
  const total = done.reduce(
    (sum, t) => sum + (new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime()),
    0,
  );
  return total / done.length / 3600_000;
}