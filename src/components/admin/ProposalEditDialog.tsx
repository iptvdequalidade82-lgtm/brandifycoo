import { useState, useEffect } from "react";
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

interface Proposal {
  id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  title: string;
  description: string | null;
  amount_cents: number;
  cakto_checkout_url: string | null;
}

interface ProposalEditDialogProps {
  proposal: Proposal | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProposalEditDialog({ proposal, onClose, onSaved }: ProposalEditDialogProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amountReais, setAmountReais] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cakto">("pix");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (proposal) {
      setClientName(proposal.client_name);
      setClientEmail(proposal.client_email || "");
      setClientPhone(proposal.client_phone || "");
      setTitle(proposal.title);
      setDescription(proposal.description || "");
      setAmountReais((proposal.amount_cents / 100).toFixed(2).replace(".", ","));
      setPaymentMethod(proposal.cakto_checkout_url ? "cakto" : "pix");
    }
  }, [proposal]);

  const handleSave = async () => {
    if (!proposal) return;
    setSaving(true);
    const cents = Math.round(parseFloat(amountReais.replace(",", ".")) * 100);
    if (isNaN(cents) || cents <= 0) { toast.error("Valor inválido"); setSaving(false); return; }

    const wasCakto = !!proposal.cakto_checkout_url;
    const nowCakto = paymentMethod === "cakto";

    const updateData: any = {
      client_name: clientName.trim(),
      client_email: clientEmail.trim() || null,
      client_phone: clientPhone.trim() || null,
      title: title.trim(),
      description: description.trim() || null,
      amount_cents: cents,
    };

    if (wasCakto && !nowCakto) {
      updateData.cakto_checkout_url = null;
      updateData.cakto_offer_id = null;
    }

    const { error } = await supabase.from("proposals").update(updateData).eq("id", proposal.id);
    if (error) { toast.error("Erro ao salvar"); setSaving(false); return; }

    if (!wasCakto && nowCakto) {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("create-cakto-payment", {
          body: {
            proposal_id: proposal.id,
            amount_reais: cents / 100,
            client_name: clientName.trim(),
            client_email: clientEmail.trim() || "",
            description: `${title.trim()}${description.trim() ? " - " + description.trim() : ""}`,
          },
        });
        if (fnError || !data?.url) {
          toast.success("Proposta salva! Gere o link Cakto na lista.");
        } else {
          toast.success("Proposta salva com link Cakto!");
        }
      } catch {
        toast.success("Proposta salva! Gere o link Cakto na lista.");
      }
    } else {
      toast.success("Proposta atualizada!");
    }

    onClose();
    onSaved();
    setSaving(false);
  };

  return (
    <Dialog open={!!proposal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Proposta</DialogTitle>
          <DialogDescription>Atualize os dados da proposta</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nome do Cliente</Label>
              <Input value={clientName} onChange={e => setClientName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp</Label>
            <Input value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Valor (R$)</Label>
            <Input value={amountReais} onChange={e => setAmountReais(e.target.value)} />
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
          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
