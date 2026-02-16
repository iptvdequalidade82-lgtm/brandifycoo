import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { logActivity, createDefaultChecklist } from "@/lib/admin-helpers";

interface Proposal {
  id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  title: string;
  description: string | null;
  amount_cents: number;
  status: string;
  init_amount_cents: number | null;
}

interface ConvertProjectDialogProps {
  proposal: Proposal | null;
  onClose: () => void;
  onConverted: () => void;
  userId: string;
}

const getInitAmount = (p: Proposal) => p.init_amount_cents ?? Math.round(p.amount_cents / 2);
const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function ConvertProjectDialog({ proposal, onClose, onConverted, userId }: ConvertProjectDialogProps) {
  const [plan, setPlan] = useState<"essencial" | "profissional" | "premium">("essencial");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "partial" | "full">("pending");
  const [converting, setConverting] = useState(false);

  const handleConvert = async () => {
    if (!proposal) return;
    setConverting(true);

    await supabase.from("proposals").update({ status: "paid" } as any).eq("id", proposal.id);
    logActivity("proposal", proposal.id, "status_changed", userId, {
      title: proposal.title,
      client_name: proposal.client_name,
      from: proposal.status,
      to: "Convertido em Projeto",
    });

    const received = paymentStatus === "full"
      ? proposal.amount_cents
      : paymentStatus === "partial"
        ? getInitAmount(proposal)
        : 0;

    const { data: project, error } = await supabase.from("projects").insert({
      client_name: proposal.client_name,
      client_phone: proposal.client_phone || null,
      client_email: proposal.client_email || null,
      title: proposal.title,
      plan,
      notes: notes.trim() || proposal.description || null,
      start_date: startDate || null,
      due_date: dueDate || null,
      created_by: userId,
      total_amount_cents: proposal.amount_cents,
      amount_received_cents: received,
      payment_status: paymentStatus,
    } as any).select().single();

    if (error || !project) {
      toast.error("Erro ao criar projeto");
      setConverting(false);
      return;
    }

    const proj = project as any;
    await createDefaultChecklist(proj.id);
    logActivity("project", proj.id, "created", userId, {
      title: proposal.title,
      client_name: proposal.client_name,
      plan,
      from_proposal: proposal.id,
      payment_status: paymentStatus,
    });

    const statusLabels: Record<string, string> = { pending: "Em Aberto", partial: "50% Pago", full: "Quitado" };
    toast.success(`Projeto criado como "${statusLabels[paymentStatus]}"!`);
    onClose();
    onConverted();
    setConverting(false);
  };

  return (
    <Dialog open={!!proposal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-primary" />
            Converter em Projeto
          </DialogTitle>
          <DialogDescription>
            Transforme esta proposta em um projeto ativo. Escolha o status de pagamento.
          </DialogDescription>
        </DialogHeader>

        {proposal && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-1">
              <p className="text-sm font-medium text-foreground">{proposal.title}</p>
              <p className="text-sm text-muted-foreground">{proposal.client_name}</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(proposal.amount_cents)}</p>
            </div>

            <div className="space-y-1.5">
              <Label>Status do Pagamento</Label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: "pending" as const, label: "Em Aberto", desc: "R$ 0 recebido", color: "border-amber-500/30 bg-amber-500/10 text-amber-500" },
                  { key: "partial" as const, label: "50% Pago", desc: formatCurrency(getInitAmount(proposal)), color: "border-amber-400/30 bg-amber-400/10 text-amber-400" },
                  { key: "full" as const, label: "Quitado", desc: formatCurrency(proposal.amount_cents), color: "border-green-400/30 bg-green-400/10 text-green-400" },
                ]).map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPaymentStatus(opt.key)}
                    className={`rounded-lg border p-3 text-center transition-all ${
                      paymentStatus === opt.key ? opt.color : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-[10px] opacity-70">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Plano</Label>
                <Select value={plan} onValueChange={(v: any) => setPlan(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essencial">⭐ Essencial</SelectItem>
                    <SelectItem value="profissional">🏆 Profissional</SelectItem>
                    <SelectItem value="premium">👑 Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Data de Início</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Prazo de Entrega</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Observações do Projeto</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Detalhes, pendências, briefing..." />
            </div>

            <Button onClick={handleConvert} className="w-full" disabled={converting}>
              {converting ? "Criando projeto..." : "Criar Projeto"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
