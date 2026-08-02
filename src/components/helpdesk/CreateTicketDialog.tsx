import { useState, type ReactNode } from "react";
import { Paperclip, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHelpdesk } from "@/lib/helpdesk/store";
import { CATEGORIES, PRIORITIES, type Category, type Priority } from "@/lib/helpdesk/types";

export function CreateTicketDialog({ trigger }: { trigger?: ReactNode }) {
  const { createTicket } = useHelpdesk();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Software");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [file, setFile] = useState<{ name: string; size: number; type: string } | null>(null);

  function submit() {
    if (!subject.trim() || !description.trim()) {
      toast.error("Add a subject and a description.");
      return;
    }
    const ticket = createTicket({
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority,
      attachments: file ? [file] : [],
    });
    if (!ticket) return;
    toast.success(`Ticket #${ticket.id} submitted`);
    setSubject("");
    setDescription("");
    setFile(null);
    setPriority("Medium");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="size-4" /> Create new ticket
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit a support ticket</DialogTitle>
          <DialogDescription>
            Our team responds within the SLA window for the priority you pick.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Short summary of the problem"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
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
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened, when it started, and anything you already tried."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="file">Attachment (optional)</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setFile(f ? { name: f.name, size: f.size, type: f.type } : null);
              }}
            />
            {file && (
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Paperclip className="size-3.5" /> {file.name} · {Math.round(file.size / 1024)} KB
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Submit ticket</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}