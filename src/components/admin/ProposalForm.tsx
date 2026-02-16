import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Smartphone, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { logActivity } from "@/lib/admin-helpers";

const proposalSchema = z.object({
  clientName: z.string().trim().min(1, "Nome é obrigatório").max(200, "Nome muito longo"),
  clientEmail: z.string().trim().email("Email inválido").max(255, "Email muito longo").optional().or(z.literal("")),
  clientPhone: z.string().trim().max(20, "Telefone muito longo").optional().or(z.literal("")),
  title: z.string().trim().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().trim().max(1000, "Descrição muito longa").optional().or(z.literal("")),
  amountReais: z.string().refine((val) => {
    const num = parseFloat(val.replace(",", "."));
    return !isNaN(num) && num > 0 && num <= 1000000;
  }, "Valor deve ser entre R$ 0,01 e R$ 1.000.000,00"),
});

interface ProposalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onCreated: () => void;
}

export default function ProposalForm({ open, onOpenChange, userId, onCreated }: ProposalFormProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amountReais, setAmountReais] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cakto">("pix");
  const [submitting, setSubmitting] = useState(false);

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

  const resetForm = () => {
    setClientName(""); setClientEmail(""); setClientPhone("");
    setTitle(""); setDescription(""); setAmountReais(""); setPaymentMethod("pix");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const validation = proposalSchema.safeParse({ clientName, clientEmail, clientPhone, title, description, amountReais });
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Dados inválidos");
      setSubmitting(false);
      return;
    }

    const cents = Math.round(parseFloat(amountReais.replace(",", ".")) * 100);

    const { data: inserted, error } = await supabase.from("proposals").insert({
      client_name: clientName.trim(),
      client_email: clientEmail.trim() || null,
      client_phone: clientPhone.trim() || null,
      title: title.trim(),
      description: description.trim() || null,
      amount_cents: cents,
      installments: 1,
      created_by: userId,
    } as any).select().single();

    if (error || !inserted) {
      toast.error("Erro ao criar proposta");
      setSubmitting(false);
      return;
    }

    const inserted2 = inserted as any;
    logActivity("proposal", inserted2.id, "created", userId, {
      title: title.trim(),
      client_name: clientName.trim(),
      amount: formatCurrency(cents),
    });

    if (paymentMethod === "pix") {
      const link = `https://brandifycoo.lovable.app/pix/${inserted2.id}`;
      const msg = `Olá ${clientName.trim()}! Segue o link para pagamento via PIX:\n\n${link}\n\nValor: R$ ${parseFloat(amountReais.replace(",", ".")).toFixed(2).replace(".", ",")}\nServiço: ${title.trim()}`;
      navigator.clipboard.writeText(msg);
      toast.success("Mensagem com link PIX copiada!");
    } else if (paymentMethod === "cakto") {
      try {
        const amountNum = parseFloat(amountReais.replace(",", "."));
        const { data, error: fnError } = await supabase.functions.invoke("create-cakto-payment", {
          body: {
            proposal_id: inserted2.id,
            amount_reais: amountNum,
            client_name: clientName.trim(),
            client_email: clientEmail.trim() || "",
            description: `${title.trim()}${description.trim() ? " - " + description.trim() : ""}`,
          },
        });
        if (!fnError && data?.url) {
          await navigator.clipboard.writeText(data.url);
          toast.success("Proposta criada! Link Cakto copiado.");
        } else {
          toast.success("Proposta criada! Gere o link na lista.");
        }
      } catch {
        toast.success("Proposta criada! Gere o link na lista.");
      }
    }

    onOpenChange(false);
    resetForm();
    onCreated();
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Proposta</DialogTitle>
          <DialogDescription>Crie um orçamento personalizado para o cliente</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cname">Nome do Cliente</Label>
              <Input id="cname" value={clientName} onChange={e => setClientName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cemail">Email (opcional)</Label>
              <Input id="cemail" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cphone">WhatsApp (opcional)</Label>
            <Input id="cphone" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ptitle">Título do Serviço</Label>
            <Input id="ptitle" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Site Institucional Premium" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pdesc">Descrição (opcional)</Label>
            <Textarea id="pdesc" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pamount">Valor (R$)</Label>
            <Input id="pamount" value={amountReais} onChange={e => setAmountReais(e.target.value)} placeholder="1500,00" required />
          </div>
          <div className="space-y-1.5">
            <Label>Método de Pagamento</Label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setPaymentMethod("pix")}
                className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${paymentMethod === "pix" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                <Smartphone className="w-4 h-4" />
                <div className="text-left"><p className="font-medium">PIX</p><p className="text-xs opacity-70">QR Code direto</p></div>
              </button>
              <button type="button" onClick={() => setPaymentMethod("cakto")}
                className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${paymentMethod === "cakto" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                <ExternalLink className="w-4 h-4" />
                <div className="text-left"><p className="font-medium">Cakto</p><p className="text-xs opacity-70">Checkout completo</p></div>
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Criando..." : paymentMethod === "pix" ? "Criar Proposta PIX" : "Criar Proposta Cakto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
