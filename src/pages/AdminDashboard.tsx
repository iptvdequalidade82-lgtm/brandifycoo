import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  LogOut, Plus, Copy, ExternalLink, RefreshCw,
  FileText, DollarSign, Clock, CheckCircle, XCircle, Send, QrCode, CreditCard, Smartphone
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

const proposalSchema = z.object({
  clientName: z.string().trim().min(1, "Nome é obrigatório").max(200, "Nome muito longo"),
  clientEmail: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  clientPhone: z.string().trim().max(20, "Telefone muito longo").optional().or(z.literal("")),
  title: z.string().trim().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().trim().max(1000, "Descrição muito longa").optional().or(z.literal("")),
  amountReais: z.string().refine((val) => {
    const num = parseFloat(val.replace(",", "."));
    return !isNaN(num) && num > 0 && num <= 1000000;
  }, "Valor deve ser entre R$ 0,01 e R$ 1.000.000,00"),
});

interface Proposal {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  title: string;
  description: string | null;
  amount_cents: number;
  installments: number;
  status: string;
  stripe_checkout_url: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  draft: { label: "Rascunho", icon: FileText, color: "text-muted-foreground" },
  sent: { label: "Enviado", icon: Send, color: "text-accent" },
  paid: { label: "Pago", icon: CheckCircle, color: "text-green-400" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "text-destructive" },
};

const AdminDashboard = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [generatingLink, setGeneratingLink] = useState<string | null>(null);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amountReais, setAmountReais] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "stripe">("pix");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchProposals();
  }, [isAdmin]);

  const fetchProposals = async () => {
    setLoadingProposals(true);
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProposals(data as unknown as Proposal[]);
    setLoadingProposals(false);
  };

  const resetForm = () => {
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setTitle("");
    setDescription("");
    setAmountReais("");
    setPaymentMethod("pix");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const validation = proposalSchema.safeParse({
      clientName, clientEmail, clientPhone, title, description, amountReais,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Dados inválidos";
      toast.error(firstError);
      setSubmitting(false);
      return;
    }

    const cents = Math.round(parseFloat(amountReais.replace(",", ".")) * 100);

    const { data: inserted, error } = await supabase.from("proposals").insert({
      client_name: clientName.trim(),
      client_email: clientEmail.trim(),
      client_phone: clientPhone.trim() || null,
      title: title.trim(),
      description: description.trim() || null,
      amount_cents: cents,
      installments: 1,
      created_by: user!.id,
    } as any).select().single();

    if (error || !inserted) {
      toast.error("Erro ao criar proposta");
      setSubmitting(false);
      return;
    }

    if (paymentMethod === "pix") {
      const link = `https://brandifycoo.lovable.app/pix/${(inserted as any).id}`;
      navigator.clipboard.writeText(link);
      const whatsappMsg = encodeURIComponent(`Olá ${clientName.trim()}! Segue o link para pagamento via PIX:\n\n${link}\n\nValor: R$ ${parseFloat(amountReais.replace(",", ".")).toFixed(2).replace(".", ",")}\nServiço: ${title.trim()}`);
      const whatsappUrl = `https://wa.me/${clientPhone.trim().replace(/\D/g, "")}?text=${whatsappMsg}`;
      window.open(whatsappUrl, "_blank");
      toast.success("Link PIX copiado e WhatsApp aberto!");
    } else {
      // Generate Stripe link automatically
      try {
        const proposal = inserted as any;
        const { data, error: fnError } = await supabase.functions.invoke("create-payment", {
          body: {
            proposal_id: proposal.id,
            amount_cents: cents,
            installments: 1,
            client_name: clientName.trim(),
            client_email: clientEmail.trim(),
            description: `${title.trim()}${description.trim() ? " - " + description.trim() : ""}`,
          },
        });
        if (!fnError && data?.url) {
          await supabase
            .from("proposals")
            .update({ stripe_checkout_url: data.url, status: "sent", stripe_session_id: data.session_id } as any)
            .eq("id", proposal.id);
          await navigator.clipboard.writeText(data.url);
          toast.success("Proposta criada! Link Stripe copiado.");
        } else {
          toast.success("Proposta criada! Gere o link de pagamento na lista.");
        }
      } catch {
        toast.success("Proposta criada! Gere o link de pagamento na lista.");
      }
    }

    setShowForm(false);
    resetForm();
    fetchProposals();
    setSubmitting(false);
  };

  const generatePaymentLink = async (proposal: Proposal) => {
    setGeneratingLink(proposal.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          proposal_id: proposal.id,
          amount_cents: proposal.amount_cents,
          installments: 1,
          client_name: proposal.client_name,
          client_email: proposal.client_email,
          description: `${proposal.title}${proposal.description ? " - " + proposal.description : ""}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        await supabase
          .from("proposals")
          .update({ stripe_checkout_url: data.url, status: "sent", stripe_session_id: data.session_id } as any)
          .eq("id", proposal.id);
        toast.success("Link de pagamento gerado!");
        fetchProposals();
      }
    } catch (err: any) {
      toast.error("Erro ao gerar link: " + (err.message || "tente novamente"));
    }
    setGeneratingLink(null);
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const copyPixLink = (proposalId: string) => {
    const link = `https://brandifycoo.lovable.app/pix/${proposalId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link PIX copiado!");
  };

  const sharePixWhatsApp = (proposal: Proposal) => {
    const link = `https://brandifycoo.lovable.app/pix/${proposal.id}`;
    const msg = encodeURIComponent(`Olá ${proposal.client_name}! Segue o link para pagamento via PIX:\n\n${link}\n\nValor: ${formatCurrency(proposal.amount_cents)}\nServiço: ${proposal.title}`);
    const phone = proposal.client_phone?.replace(/\D/g, "") || "";
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading text-foreground">Painel Brandify</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </Button>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: proposals.length, icon: FileText },
            { label: "Enviados", value: proposals.filter(p => p.status === "sent").length, icon: Send },
            { label: "Pagos", value: proposals.filter(p => p.status === "paid").length, icon: CheckCircle },
            { label: "Faturado", value: formatCurrency(proposals.filter(p => p.status === "paid").reduce((s, p) => s + p.amount_cents, 0)), icon: DollarSign },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-4 glow-border">
              <stat.icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Propostas</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchProposals}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1" /> Nova Proposta
            </Button>
          </div>
        </div>

        {/* Proposals list */}
        <div className="space-y-3">
          {loadingProposals ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Nenhuma proposta ainda</p>
            </div>
          ) : (
            proposals.map((p) => {
              const config = statusConfig[p.status] || statusConfig.draft;
              const StatusIcon = config.icon;
              return (
                <div key={p.id} className="glass rounded-xl p-5 glow-border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                      </div>
                      <h3 className="font-semibold text-foreground truncate">{p.title}</h3>
                      <p className="text-sm text-muted-foreground">{p.client_name} · {p.client_email}</p>
                      {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.description}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{formatCurrency(p.amount_cents)}</p>
                      </div>
                      <div className="flex gap-1">
                        {/* PIX QR Code button - copy link */}
                        <Button variant="outline" size="icon" onClick={() => copyPixLink(p.id)} title="Copiar link PIX">
                          <QrCode className="w-4 h-4" />
                        </Button>
                        {/* WhatsApp share button */}
                        <Button variant="outline" size="icon" onClick={() => sharePixWhatsApp(p)} title="Enviar PIX via WhatsApp">
                          <Send className="w-4 h-4" />
                        </Button>
                        {p.stripe_checkout_url ? (
                          <>
                            <Button variant="outline" size="icon" onClick={() => copyLink(p.stripe_checkout_url!)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <a href={p.stripe_checkout_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => generatePaymentLink(p)}
                            disabled={generatingLink === p.id}
                          >
                            {generatingLink === p.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <DollarSign className="w-4 h-4 mr-1" /> Gerar Link
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* New Proposal Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
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
                <Label htmlFor="cemail">Email</Label>
                <Input id="cemail" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} required />
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
                <button
                  type="button"
                  onClick={() => setPaymentMethod("pix")}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                    paymentMethod === "pix"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <div className="text-left">
                    <p className="font-medium">PIX</p>
                    <p className="text-xs opacity-70">QR Code direto</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                    paymentMethod === "stripe"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <div className="text-left">
                    <p className="font-medium">Cartão/Boleto</p>
                    <p className="text-xs opacity-70">Via checkout</p>
                  </div>
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Criando..." : paymentMethod === "pix" ? "Criar Proposta PIX" : "Criar Proposta"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
