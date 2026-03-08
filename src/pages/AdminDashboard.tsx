import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import RevenueChart from "@/components/admin/RevenueChart";
import ProposalForm from "@/components/admin/ProposalForm";
import ProposalEditDialog from "@/components/admin/ProposalEditDialog";
import ConvertProjectDialog from "@/components/admin/ConvertProjectDialog";
import { logActivity } from "@/lib/admin-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Copy, RefreshCw, Search, Pencil,
  FileText, DollarSign, Send, Trash2, CheckCircle, XCircle, ArrowRight, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface Proposal {
  id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  title: string;
  description: string | null;
  amount_cents: number;
  installments: number;
  status: string;
  stripe_checkout_url: string | null;
  cakto_offer_id: string | null;
  cakto_checkout_url: string | null;
  init_method: string;
  final_method: string;
  final_cakto_checkout_url: string | null;
  final_cakto_offer_id: string | null;
  init_amount_cents: number | null;
  created_at: string;
}

const getInitAmount = (p: Proposal) => p.init_amount_cents ?? Math.round(p.amount_cents / 2);
const getFinalAmount = (p: Proposal) => p.amount_cents - getInitAmount(p);

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  draft: { label: "Rascunho", icon: FileText, color: "text-muted-foreground" },
  sent: { label: "Enviado", icon: Send, color: "text-accent" },
  partial: { label: "50% Pago", icon: DollarSign, color: "text-amber-400" },
  paid: { label: "Quitado", icon: CheckCircle, color: "text-green-400" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "text-destructive" },
};

const filterTabs = [
  { key: "all", label: "Todos" },
  { key: "draft", label: "Rascunhos" },
  { key: "sent", label: "Enviados" },
  { key: "partial", label: "50% Pago" },
  { key: "paid", label: "Quitados" },
  { key: "cancelled", label: "Cancelados" },
];

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [projects, setProjects] = useState<Array<{ title: string; client_name: string; plan: string; total_amount_cents: number; amount_received_cents: number; payment_status: string; created_at: string }>>([]);
  const [extraRevenue, setExtraRevenue] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [generatingLink, setGeneratingLink] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Proposal | null>(null);
  const [expandedProposalId, setExpandedProposalId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Proposal | null>(null);
  const [convertTarget, setConvertTarget] = useState<Proposal | null>(null);

  useEffect(() => { fetchProposals(); fetchProjects(); fetchExtraRevenue(); }, []);

  const fetchProposals = async () => {
    setLoadingProposals(true);
    const { data, error } = await supabase.from("proposals").select("*").order("created_at", { ascending: false });
    if (!error && data) setProposals(data as unknown as Proposal[]);
    setLoadingProposals(false);
  };

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("title, client_name, plan, total_amount_cents, amount_received_cents, payment_status, created_at");
    if (data) setProjects(data as any);
  };

  const fetchExtraRevenue = async () => {
    const { data } = await supabase.from("extra_revenue" as any).select("amount_cents");
    if (data) setExtraRevenue((data as any[]).reduce((s: number, r: any) => s + r.amount_cents, 0));
  };

  const filteredProposals = proposals
    .filter(p => activeFilter === "all" || p.status === activeFilter)
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return p.client_name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || (p.client_email?.toLowerCase().includes(q));
    });

  const updateStatus = async (id: string, newStatus: string) => {
    const oldProposal = proposals.find(p => p.id === id);
    const { error } = await supabase.from("proposals").update({ status: newStatus } as any).eq("id", id);
    if (error) toast.error("Erro ao atualizar");
    else {
      toast.success(`Status: ${statusConfig[newStatus]?.label || newStatus}`);
      setProposals(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      if (user) logActivity("proposal", id, "status_changed", user.id, {
        title: oldProposal?.title,
        client_name: oldProposal?.client_name,
        from: statusConfig[oldProposal?.status || "draft"]?.label || oldProposal?.status,
        to: statusConfig[newStatus]?.label || newStatus,
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("proposals").delete().eq("id", deleteTarget.id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Proposta excluída");
      setProposals(prev => prev.filter(p => p.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const generateCaktoLink = async (proposal: Proposal) => {
    setGeneratingLink(proposal.id);
    try {
      const halfAmount = getInitAmount(proposal) / 100;
      const { data, error } = await supabase.functions.invoke("create-cakto-payment", {
        body: {
          proposal_id: proposal.id,
          amount_reais: halfAmount,
          client_name: proposal.client_name,
          client_email: proposal.client_email || "",
          description: `${proposal.title} - Inicialização`,
        },
      });
      if (error) throw error;
      if (data?.url) {
        await navigator.clipboard.writeText(data.url);
        toast.success("Link Cakto gerado e copiado!");
        fetchProposals();
      }
    } catch (err: any) {
      toast.error("Erro: " + (err.message || "tente novamente"));
    }
    setGeneratingLink(null);
  };

  const generateFinalCaktoLink = async (proposal: Proposal) => {
    setGeneratingLink(proposal.id);
    try {
      const halfAmount = getFinalAmount(proposal) / 100;
      const { data, error } = await supabase.functions.invoke("create-cakto-payment", {
        body: {
          proposal_id: proposal.id,
          amount_reais: halfAmount,
          client_name: proposal.client_name,
          client_email: proposal.client_email || "",
          description: `${proposal.title} - Finalização`,
          is_final: true,
        },
      });
      if (error) throw error;
      if (data?.url) {
        await supabase.from("proposals").update({ final_cakto_checkout_url: data.url } as any).eq("id", proposal.id);
        toast.success("Link Cakto de finalização gerado!");
        fetchProposals();
      }
    } catch (err: any) {
      toast.error("Erro: " + (err.message || "tente novamente"));
    }
    setGeneratingLink(null);
  };

  const updateStepMethod = async (proposalId: string, step: "init" | "final", method: "pix" | "cakto") => {
    const field = step === "init" ? "init_method" : "final_method";
    const { error } = await supabase.from("proposals").update({ [field]: method } as any).eq("id", proposalId);
    if (error) { toast.error("Erro ao atualizar método"); return; }
    toast.success(`Método ${step === "init" ? "inicialização" : "finalização"} atualizado`);
    setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, [field]: method } : p));

    if (step === "final" && method === "cakto") {
      const proposal = proposals.find(p => p.id === proposalId);
      if (proposal && !proposal.final_cakto_checkout_url) generateFinalCaktoLink(proposal);
    }
    if (step === "init" && method === "cakto") {
      const proposal = proposals.find(p => p.id === proposalId);
      if (proposal && !proposal.cakto_checkout_url) generateCaktoLink(proposal);
    }
  };

  const getStepLink = (p: Proposal, step: "init" | "final" | "full") => {
    if (step === "full") return `https://brandifycoo.lovable.app/pix/${p.id}`;
    const method = step === "init" ? p.init_method : p.final_method;
    if (method === "cakto") return step === "init" ? p.cakto_checkout_url : p.final_cakto_checkout_url;
    return `https://brandifycoo.lovable.app/pix/${p.id}?step=${step}`;
  };

  const copyStepLink = (p: Proposal, step: "init" | "final" | "full") => {
    const link = getStepLink(p, step);
    if (!link) { toast.error("Link ainda não gerado"); return; }
    navigator.clipboard.writeText(link);
    const label = step === "init" ? "inicialização" : step === "final" ? "finalização" : "valor inteiro";
    toast.success(`Link de ${label} copiado!`);
    if (p.status === "draft") updateStatus(p.id, "sent");
  };

  const copyStepMessage = (p: Proposal, step: "init" | "final" | "full") => {
    const link = getStepLink(p, step);
    if (!link) { toast.error("Link ainda não gerado"); return; }
    const amount = step === "full" ? p.amount_cents : step === "init" ? getInitAmount(p) : getFinalAmount(p);
    const label = step === "init" ? "inicialização" : step === "final" ? "finalização" : "pagamento integral";
    const method = step === "full" ? "pix" : (step === "init" ? p.init_method : p.final_method);
    const methodLabel = method === "cakto" ? "cartão" : "PIX";
    const msg = `Olá, ${p.client_name}! 😊\n\nSeu link de pagamento de *${label}* via *${methodLabel}* já está disponível:\n\n${link}\n\n💰 Valor: ${formatCurrency(amount)}\n📋 Serviço: ${p.title}\n\nQualquer dúvida, estou à disposição!`;
    navigator.clipboard.writeText(msg);
    toast.success("Mensagem copiada! Cole no WhatsApp.");
  };

  return (
    <AdminLayout>
      <RevenueChart proposals={proposals} projects={projects} extraRevenue={extraRevenue} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total", value: proposals.length, icon: FileText },
          { label: "Enviados", value: proposals.filter(p => p.status === "sent").length, icon: Send },
          { label: "Pagos", value: proposals.filter(p => p.status === "paid").length, icon: CheckCircle },
          { label: "Recebido", value: formatCurrency(projects.reduce((s, p) => s + p.amount_received_cents, 0) + extraRevenue), icon: DollarSign },
          { label: "Em Aberto", value: formatCurrency(projects.filter(p => p.payment_status === "pending" || p.payment_status === "partial").reduce((s, p) => s + (p.total_amount_cents - p.amount_received_cents), 0)), icon: DollarSign },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl p-4 border border-white/[0.06] bg-white/[0.02]">
            <stat.icon className={`w-5 h-5 mb-2 ${i === 4 ? "text-white/50" : "text-white/60"}`} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/40">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Propostas</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-[160px] text-sm bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchProposals}><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" /> Nova Proposta</Button>
        </div>
      </div>

      {/* Filter Tabs with counts */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {filterTabs.map(tab => {
          const count = tab.key === "all" ? proposals.length : proposals.filter(p => p.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === tab.key ? "bg-white text-black" : "text-white/40 hover:bg-white/[0.04] hover:text-white/60"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Proposals list */}
      <div className="space-y-3">
        {loadingProposals ? (
          <div className="text-center py-12 text-white/30">Carregando...</div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>{activeFilter === "all" ? "Nenhuma proposta ainda" : "Nenhuma proposta nesta categoria"}</p>
          </div>
        ) : (
          filteredProposals.map((p) => {
            const config = statusConfig[p.status] || statusConfig.draft;
            const StatusIcon = config.icon;
            return (
              <div key={p.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                      </div>
                      <h3 className="font-semibold text-white truncate">{p.title}</h3>
                      <p className="text-sm text-white/50">{p.client_name}{p.client_email ? ` · ${p.client_email}` : ""}</p>
                      {p.description && <p className="text-xs text-white/30 mt-1 line-clamp-1">{p.description}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{formatCurrency(p.amount_cents)}</p>
                        <p className="text-[10px] text-white/30">Init: {formatCurrency(getInitAmount(p))} · Final: {formatCurrency(getFinalAmount(p))}</p>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => setExpandedProposalId(expandedProposalId === p.id ? null : p.id)} className="gap-1">
                          <DollarSign className="w-4 h-4" /> Links
                          {expandedProposalId === p.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setConvertTarget(p)} title="Converter em Projeto" className="text-primary hover:text-primary hover:border-primary/50">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                        {p.status !== "paid" && (
                          <Button variant="outline" size="icon" onClick={() => updateStatus(p.id, "paid")} title="Marcar como pago" className="text-green-400 hover:text-green-300 hover:border-green-400/50">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {p.status === "paid" && (
                          <Button variant="outline" size="icon" onClick={() => updateStatus(p.id, "sent")} title="Reverter" className="text-accent hover:text-accent">
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="icon" onClick={() => setEditTarget(p)} title="Editar">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setDeleteTarget(p)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable payment links */}
                {expandedProposalId === p.id && (
                  <div className="border-t border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                    {/* Full amount */}
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-foreground">💳 Valor Inteiro (100%)</span>
                        <span className="text-sm font-bold text-primary">{formatCurrency(p.amount_cents)}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => copyStepLink(p, "full")} className="gap-1 text-xs">
                          <Copy className="w-3 h-3" /> Copiar Link
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyStepMessage(p, "full")} className="gap-1 text-xs">
                          <Send className="w-3 h-3" /> Copiar Msg
                        </Button>
                      </div>
                    </div>

                    {/* Init step */}
                    <div className={`rounded-lg border p-3 ${
                      p.status === "partial" || p.status === "paid" ? "border-green-500/30 bg-green-500/5" : "border-border/50"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">📌 Inicialização (50%)</span>
                          {(p.status === "partial" || p.status === "paid") && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Pago
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-bold text-foreground">{formatCurrency(getInitAmount(p))}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">Método:</span>
                        <button onClick={() => updateStepMethod(p.id, "init", "pix")}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                            p.init_method === "pix" ? "bg-primary/10 text-primary border-primary/30" : "border-transparent text-muted-foreground/50 hover:text-muted-foreground"
                          }`}>PIX</button>
                        <button onClick={() => updateStepMethod(p.id, "init", "cakto")}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                            p.init_method === "cakto" ? "bg-primary/10 text-primary border-primary/30" : "border-transparent text-muted-foreground/50 hover:text-muted-foreground"
                          }`}>Cakto</button>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => copyStepLink(p, "init")} className="gap-1 text-xs">
                          <Copy className="w-3 h-3" /> Copiar Link
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyStepMessage(p, "init")} className="gap-1 text-xs">
                          <Send className="w-3 h-3" /> Copiar Msg
                        </Button>
                      </div>
                    </div>

                    {/* Final step */}
                    <div className={`rounded-lg border p-3 ${
                      p.status === "paid" ? "border-green-500/30 bg-green-500/5" : "border-border/50"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">🏁 Finalização (50%)</span>
                          {p.status === "paid" && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Pago
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-bold text-foreground">{formatCurrency(getFinalAmount(p))}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">Método:</span>
                        <button onClick={() => updateStepMethod(p.id, "final", "pix")}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                            p.final_method === "pix" ? "bg-primary/10 text-primary border-primary/30" : "border-transparent text-muted-foreground/50 hover:text-muted-foreground"
                          }`}>PIX</button>
                        <button onClick={() => updateStepMethod(p.id, "final", "cakto")}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                            p.final_method === "cakto" ? "bg-primary/10 text-primary border-primary/30" : "border-transparent text-muted-foreground/50 hover:text-muted-foreground"
                          }`}>Cakto</button>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => copyStepLink(p, "final")} className="gap-1 text-xs">
                          <Copy className="w-3 h-3" /> Copiar Link
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyStepMessage(p, "final")} className="gap-1 text-xs">
                          <Send className="w-3 h-3" /> Copiar Msg
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir proposta?</AlertDialogTitle>
            <AlertDialogDescription>
              A proposta "{deleteTarget?.title}" para {deleteTarget?.client_name} será excluída permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Extracted Dialogs */}
      <ProposalForm open={showForm} onOpenChange={setShowForm} userId={user?.id ?? ""} onCreated={() => { fetchProposals(); fetchProjects(); }} />
      <ProposalEditDialog proposal={editTarget} onClose={() => setEditTarget(null)} onSaved={fetchProposals} />
      <ConvertProjectDialog proposal={convertTarget} onClose={() => setConvertTarget(null)} onConverted={() => { fetchProposals(); fetchProjects(); }} userId={user?.id ?? ""} />
    </AdminLayout>
  );
};

export default AdminDashboard;
