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
  FileText, DollarSign, Clock, CheckCircle, XCircle, Send
} from "lucide-react";
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
  installments: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1 && num <= 12;
  }, "Parcelas devem ser entre 1 e 12"),
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
  const [installments, setInstallments] = useState("1");
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
    setInstallments("1");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const validation = proposalSchema.safeParse({
      clientName, clientEmail, clientPhone, title, description, amountReais, installments,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Dados inválidos";
      toast.error(firstError);
      setSubmitting(false);
      return;
    }

    const cents = Math.round(parseFloat(amountReais.replace(",", ".")) * 100);

    const { error } = await supabase.from("proposals").insert({
      client_name: clientName.trim(),
      client_email: clientEmail.trim(),
      client_phone: clientPhone.trim() || null,
      title: title.trim(),
      description: description.trim() || null,
      amount_cents: cents,
      installments: parseInt(installments),
      created_by: user!.id,
    } as any);

    if (error) {
      toast.error("Erro ao criar proposta");
    } else {
      toast.success("Proposta criada!");
      setShowForm(false);
      resetForm();
      fetchProposals();
    }
    setSubmitting(false);
  };

  const generatePaymentLink = async (proposal: Proposal) => {
    setGeneratingLink(proposal.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          proposal_id: proposal.id,
          amount_cents: proposal.amount_cents,
          installments: proposal.installments,
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
                        {p.installments > 1 && (
                          <p className="text-xs text-muted-foreground">
                            {p.installments}x de {formatCurrency(p.amount_cents / p.installments)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pamount">Valor (R$)</Label>
                <Input id="pamount" value={amountReais} onChange={e => setAmountReais(e.target.value)} placeholder="1500,00" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pinst">Parcelas</Label>
                <Input id="pinst" type="number" min="1" max="12" value={installments} onChange={e => setInstallments(e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Criando..." : "Criar Proposta"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
