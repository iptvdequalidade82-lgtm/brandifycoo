import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import RevenueChart from "@/components/admin/RevenueChart";
import { logActivity, createDefaultChecklist } from "@/lib/admin-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Copy, ExternalLink, RefreshCw, Search, Pencil,
  FileText, DollarSign, Send, Smartphone, Trash2, CheckCircle, XCircle, ArrowRight, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
  created_at: string;
}

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

const AdminDashboard = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [projects, setProjects] = useState<Array<{ title: string; client_name: string; plan: string; total_amount_cents: number; amount_received_cents: number; payment_status: string; created_at: string }>>([]);
  const [showForm, setShowForm] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [generatingLink, setGeneratingLink] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Proposal | null>(null);
  const [expandedProposalId, setExpandedProposalId] = useState<string | null>(null);

  // Convert to project state
  const [convertTarget, setConvertTarget] = useState<Proposal | null>(null);
  const [convertPlan, setConvertPlan] = useState<"essencial" | "profissional" | "premium">("essencial");
  const [convertStartDate, setConvertStartDate] = useState("");
  const [convertDueDate, setConvertDueDate] = useState("");
  const [convertNotes, setConvertNotes] = useState("");
  const [converting, setConverting] = useState(false);

  // Edit proposal state
  const [editTarget, setEditTarget] = useState<Proposal | null>(null);
  const [editClientName, setEditClientName] = useState("");
  const [editClientEmail, setEditClientEmail] = useState("");
  const [editClientPhone, setEditClientPhone] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAmountReais, setEditAmountReais] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editPaymentMethod, setEditPaymentMethod] = useState<"pix" | "cakto">("pix");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amountReais, setAmountReais] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cakto">("pix");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchProposals(); fetchProjects(); }, []);

  const fetchProposals = async () => {
    setLoadingProposals(true);
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProposals(data as unknown as Proposal[]);
    setLoadingProposals(false);
  };

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("title, client_name, plan, total_amount_cents, amount_received_cents, payment_status, created_at");
    if (data) setProjects(data as any);
  };

  const filteredProposals = proposals
    .filter(p => activeFilter === "all" || p.status === activeFilter)
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return p.client_name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || (p.client_email?.toLowerCase().includes(q));
    });

  const openEdit = (p: Proposal) => {
    setEditTarget(p);
    setEditClientName(p.client_name);
    setEditClientEmail(p.client_email || "");
    setEditClientPhone(p.client_phone || "");
    setEditTitle(p.title);
    setEditDescription(p.description || "");
    setEditAmountReais((p.amount_cents / 100).toFixed(2).replace(".", ","));
    setEditPaymentMethod(p.cakto_checkout_url ? "cakto" : "pix");
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setEditSaving(true);
    const cents = Math.round(parseFloat(editAmountReais.replace(",", ".")) * 100);
    if (isNaN(cents) || cents <= 0) { toast.error("Valor inválido"); setEditSaving(false); return; }

    const wasCakto = !!editTarget.cakto_checkout_url;
    const nowCakto = editPaymentMethod === "cakto";

    // Base update
    const updateData: any = {
      client_name: editClientName.trim(),
      client_email: editClientEmail.trim() || null,
      client_phone: editClientPhone.trim() || null,
      title: editTitle.trim(),
      description: editDescription.trim() || null,
      amount_cents: cents,
    };

    // Switching from Cakto to PIX: clear Cakto data
    if (wasCakto && !nowCakto) {
      updateData.cakto_checkout_url = null;
      updateData.cakto_offer_id = null;
    }

    const { error } = await supabase.from("proposals").update(updateData).eq("id", editTarget.id);
    if (error) { toast.error("Erro ao salvar"); setEditSaving(false); return; }

    // Switching from PIX to Cakto: generate Cakto link
    if (!wasCakto && nowCakto) {
      try {
        const amountReais = cents / 100;
        const { data, error: fnError } = await supabase.functions.invoke("create-cakto-payment", {
          body: {
            proposal_id: editTarget.id,
            amount_reais: amountReais,
            client_name: editClientName.trim(),
            client_email: editClientEmail.trim() || "",
            description: `${editTitle.trim()}${editDescription.trim() ? " - " + editDescription.trim() : ""}`,
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

    setEditTarget(null);
    fetchProposals();
    setEditSaving(false);
  };

  const resetForm = () => {
    setClientName(""); setClientEmail(""); setClientPhone("");
    setTitle(""); setDescription(""); setAmountReais(""); setPaymentMethod("pix");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const validation = proposalSchema.safeParse({
      clientName, clientEmail, clientPhone, title, description, amountReais,
    });
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
      created_by: user!.id,
    } as any).select().single();

    if (error || !inserted) {
      toast.error("Erro ao criar proposta");
      setSubmitting(false);
      return;
    }

    const inserted2 = inserted as any;

    // Log creation
    logActivity("proposal", inserted2.id, "created", user!.id, {
      title: title.trim(),
      client_name: clientName.trim(),
      amount: formatCurrency(cents),
    });

    if (paymentMethod === "pix") {
      const link = `https://brandifycoo.lovable.app/pix/${(inserted as any).id}`;
      const msg = `Olá ${clientName.trim()}! Segue o link para pagamento via PIX:\n\n${link}\n\nValor: R$ ${parseFloat(amountReais.replace(",", ".")).toFixed(2).replace(".", ",")}\nServiço: ${title.trim()}`;
      navigator.clipboard.writeText(msg);
      toast.success("Mensagem com link PIX copiada!");
    } else if (paymentMethod === "cakto") {
      try {
        const proposal = inserted as any;
        const amountNum = parseFloat(amountReais.replace(",", "."));
        const { data, error: fnError } = await supabase.functions.invoke("create-cakto-payment", {
          body: {
            proposal_id: proposal.id,
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

    setShowForm(false);
    resetForm();
    fetchProposals();
    setSubmitting(false);
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

  const updateStatus = async (id: string, newStatus: string) => {
    if (newStatus === "paid") {
      const proposal = proposals.find(p => p.id === id);
      if (proposal) {
        setConvertTarget(proposal);
        setConvertPlan("essencial");
        setConvertStartDate(new Date().toISOString().split("T")[0]);
        setConvertDueDate("");
        setConvertNotes("");
        return;
      }
    }
    const oldProposal = proposals.find(p => p.id === id);
    const { error } = await supabase.from("proposals").update({ status: newStatus } as any).eq("id", id);
    if (error) toast.error("Erro ao atualizar");
    else {
      toast.success(`Status: ${statusConfig[newStatus]?.label || newStatus}`);
      setProposals(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      logActivity("proposal", id, "status_changed", user!.id, {
        title: oldProposal?.title,
        client_name: oldProposal?.client_name,
        from: statusConfig[oldProposal?.status || "draft"]?.label || oldProposal?.status,
        to: statusConfig[newStatus]?.label || newStatus,
      });
    }
  };

  const handleConvertToProject = async () => {
    if (!convertTarget || !user) return;
    setConverting(true);

    // 1. Mark proposal as paid
    await supabase.from("proposals").update({ status: "paid" } as any).eq("id", convertTarget.id);
    logActivity("proposal", convertTarget.id, "status_changed", user.id, {
      title: convertTarget.title,
      client_name: convertTarget.client_name,
      from: statusConfig[convertTarget.status]?.label || convertTarget.status,
      to: "Pago",
    });

    // 2. Create project from proposal data with partial payment
    const halfAmount = Math.round(convertTarget.amount_cents / 2);
    const { data: project, error } = await supabase.from("projects").insert({
      client_name: convertTarget.client_name,
      client_phone: convertTarget.client_phone || null,
      client_email: convertTarget.client_email || null,
      title: convertTarget.title,
      plan: convertPlan,
      notes: convertNotes.trim() || convertTarget.description || null,
      start_date: convertStartDate || null,
      due_date: convertDueDate || null,
      created_by: user.id,
      total_amount_cents: convertTarget.amount_cents,
      amount_received_cents: halfAmount,
      payment_status: "partial",
    } as any).select().single();

    if (error || !project) {
      toast.error("Erro ao criar projeto");
      setConverting(false);
      return;
    }

    const proj = project as any;
    await createDefaultChecklist(proj.id);
    logActivity("project", proj.id, "created", user.id, {
      title: convertTarget.title,
      client_name: convertTarget.client_name,
      plan: convertPlan,
      from_proposal: convertTarget.id,
    });

    toast.success("Proposta paga e projeto criado com sucesso!");
    setConvertTarget(null);
    fetchProposals();
    fetchProjects();
    setConverting(false);
  };

  const generateCaktoLink = async (proposal: Proposal) => {
    setGeneratingLink(proposal.id);
    try {
      const halfAmount = proposal.amount_cents / 200; // half in reais
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

  const copyLink = (url: string) => { navigator.clipboard.writeText(url); toast.success("Link copiado!"); };
  const copyPixLink = (id: string) => { navigator.clipboard.writeText(`https://brandifycoo.lovable.app/pix/${id}`); toast.success("Link PIX copiado!"); };

  const copyPaymentMessage = (p: Proposal) => {
    const isCakto = !!p.cakto_checkout_url;
    const link = isCakto ? p.cakto_checkout_url! : `https://brandifycoo.lovable.app/pix/${p.id}`;
    const msg = isCakto
      ? `Olá, ${p.client_name}! 😊\n\nSeu link de pagamento via *cartão* ou outras opções já está disponível:\n\n${link}\n\n💰 Valor: ${formatCurrency(p.amount_cents)}\n📋 Serviço: ${p.title}\n\nQualquer dúvida, estou à disposição!`
      : `Olá, ${p.client_name}! 😊\n\nSeu link de pagamento via *PIX* já está disponível:\n\n${link}\n\n💰 Valor: ${formatCurrency(p.amount_cents)}\n📋 Serviço: ${p.title}\n\nQualquer dúvida, estou à disposição!`;
    navigator.clipboard.writeText(msg);
    toast.success("Mensagem copiada! Cole no WhatsApp.");
  };

  const copyPaymentLink = (p: Proposal) => {
    const isCakto = !!p.cakto_checkout_url;
    const link = isCakto ? p.cakto_checkout_url! : `https://brandifycoo.lovable.app/pix/${p.id}`;
    navigator.clipboard.writeText(link);
    toast.success(`Link ${isCakto ? "Cakto" : "PIX"} copiado!`);
  };

  const updateStepMethod = async (proposalId: string, step: "init" | "final", method: "pix" | "cakto") => {
    const field = step === "init" ? "init_method" : "final_method";
    const { error } = await supabase.from("proposals").update({ [field]: method } as any).eq("id", proposalId);
    if (error) { toast.error("Erro ao atualizar método"); return; }
    toast.success(`Método ${step === "init" ? "inicialização" : "finalização"} atualizado`);
    setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, [field]: method } : p));

    // If switching to cakto for finalization, generate the link
    if (step === "final" && method === "cakto") {
      const proposal = proposals.find(p => p.id === proposalId);
      if (proposal && !proposal.final_cakto_checkout_url) {
        generateFinalCaktoLink(proposal);
      }
    }
    if (step === "init" && method === "cakto") {
      const proposal = proposals.find(p => p.id === proposalId);
      if (proposal && !proposal.cakto_checkout_url) {
        generateCaktoLink(proposal);
      }
    }
  };

  const generateFinalCaktoLink = async (proposal: Proposal) => {
    setGeneratingLink(proposal.id);
    try {
      const halfAmount = proposal.amount_cents / 200; // half in reais
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

  const getStepLink = (p: Proposal, step: "init" | "final" | "full") => {
    if (step === "full") {
      return `https://brandifycoo.lovable.app/pix/${p.id}`;
    }
    const method = step === "init" ? p.init_method : p.final_method;
    if (method === "cakto") {
      return step === "init" ? p.cakto_checkout_url : p.final_cakto_checkout_url;
    }
    return `https://brandifycoo.lovable.app/pix/${p.id}?step=${step}`;
  };

  const copyStepLink = (p: Proposal, step: "init" | "final" | "full") => {
    const link = getStepLink(p, step);
    if (!link) {
      toast.error("Link ainda não gerado");
      return;
    }
    navigator.clipboard.writeText(link);
    const label = step === "init" ? "inicialização" : step === "final" ? "finalização" : "valor inteiro";
    toast.success(`Link de ${label} copiado!`);
  };

  const copyStepMessage = (p: Proposal, step: "init" | "final" | "full") => {
    const link = getStepLink(p, step);
    if (!link) { toast.error("Link ainda não gerado"); return; }
    const amount = step === "full" ? p.amount_cents : Math.round(p.amount_cents / 2);
    const label = step === "init" ? "inicialização" : step === "final" ? "finalização" : "pagamento integral";
    const method = step === "full" ? "pix" : (step === "init" ? p.init_method : p.final_method);
    const methodLabel = method === "cakto" ? "cartão" : "PIX";
    const msg = `Olá, ${p.client_name}! 😊\n\nSeu link de pagamento de *${label}* via *${methodLabel}* já está disponível:\n\n${link}\n\n💰 Valor: ${formatCurrency(amount)}\n📋 Serviço: ${p.title}\n\nQualquer dúvida, estou à disposição!`;
    navigator.clipboard.writeText(msg);
    toast.success("Mensagem copiada! Cole no WhatsApp.");
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

  return (
    <AdminLayout>
      {/* Revenue Chart */}
      <RevenueChart proposals={proposals} projects={projects} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total", value: proposals.length, icon: FileText },
          { label: "Enviados", value: proposals.filter(p => p.status === "sent").length, icon: Send },
          { label: "Pagos", value: proposals.filter(p => p.status === "paid").length, icon: CheckCircle },
          { label: "Recebido", value: formatCurrency(projects.reduce((s, p) => s + p.amount_received_cents, 0)), icon: DollarSign },
          { label: "Em Aberto", value: formatCurrency(projects.filter(p => p.payment_status === "partial").reduce((s, p) => s + (p.total_amount_cents - p.amount_received_cents), 0)), icon: DollarSign },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-4 glow-border">
            <stat.icon className={`w-5 h-5 mb-2 ${i === 4 ? "text-amber-400" : "text-primary"}`} />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Propostas</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-[160px] text-sm"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchProposals}><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" /> Nova Proposta</Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {filterTabs.map(tab => {
          const count = tab.key === "all" ? proposals.length : proposals.filter(p => p.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
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
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>{activeFilter === "all" ? "Nenhuma proposta ainda" : "Nenhuma proposta nesta categoria"}</p>
          </div>
        ) : (
          filteredProposals.map((p) => {
            const config = statusConfig[p.status] || statusConfig.draft;
            const StatusIcon = config.icon;
            return (
              <div key={p.id} className="glass rounded-xl glow-border overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                      </div>
                      <h3 className="font-semibold text-foreground truncate">{p.title}</h3>
                      <p className="text-sm text-muted-foreground">{p.client_name}{p.client_email ? ` · ${p.client_email}` : ""}</p>
                      {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.description}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{formatCurrency(p.amount_cents)}</p>
                        <p className="text-[10px] text-muted-foreground">50% = {formatCurrency(Math.round(p.amount_cents / 2))}</p>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {/* Expand payment links */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedProposalId(expandedProposalId === p.id ? null : p.id)}
                          className="gap-1"
                        >
                          <DollarSign className="w-4 h-4" />
                          Links
                          {expandedProposalId === p.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>

                        {/* Status actions */}
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
                        <Button variant="outline" size="icon" onClick={() => openEdit(p)} title="Editar">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setDeleteTarget(p)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable payment links section */}
                {expandedProposalId === p.id && (
                  <div className="border-t border-border/50 bg-muted/20 p-4 space-y-3">
                    {/* Valor Inteiro */}
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

                    {/* Inicialização */}
                    <div className="rounded-lg border border-border/50 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-foreground">📌 Inicialização (50%)</span>
                        <span className="text-sm font-bold text-foreground">{formatCurrency(Math.round(p.amount_cents / 2))}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">Método:</span>
                        <button
                          onClick={() => updateStepMethod(p.id, "init", "pix")}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                            p.init_method === "pix" ? "bg-primary/10 text-primary border-primary/30" : "border-transparent text-muted-foreground/50 hover:text-muted-foreground"
                          }`}
                        >
                          PIX
                        </button>
                        <button
                          onClick={() => updateStepMethod(p.id, "init", "cakto")}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                            p.init_method === "cakto" ? "bg-primary/10 text-primary border-primary/30" : "border-transparent text-muted-foreground/50 hover:text-muted-foreground"
                          }`}
                        >
                          Cakto
                        </button>
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

                    {/* Finalização */}
                    <div className="rounded-lg border border-border/50 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-foreground">🏁 Finalização (50%)</span>
                        <span className="text-sm font-bold text-foreground">{formatCurrency(Math.round(p.amount_cents / 2))}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">Método:</span>
                        <button
                          onClick={() => updateStepMethod(p.id, "final", "pix")}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                            p.final_method === "pix" ? "bg-primary/10 text-primary border-primary/30" : "border-transparent text-muted-foreground/50 hover:text-muted-foreground"
                          }`}
                        >
                          PIX
                        </button>
                        <button
                          onClick={() => updateStepMethod(p.id, "final", "cakto")}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                            p.final_method === "cakto" ? "bg-primary/10 text-primary border-primary/30" : "border-transparent text-muted-foreground/50 hover:text-muted-foreground"
                          }`}
                        >
                          Cakto
                        </button>
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

      {/* Convert to Project Dialog */}
      <Dialog open={!!convertTarget} onOpenChange={(open) => !open && setConvertTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary" />
              Confirmar Pagamento e Criar Projeto
            </DialogTitle>
            <DialogDescription>
              A proposta será marcada como paga e um novo projeto será criado automaticamente.
            </DialogDescription>
          </DialogHeader>

          {convertTarget && (
            <div className="space-y-4">
              {/* Proposal summary */}
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-1">
                <p className="text-sm font-medium text-foreground">{convertTarget.title}</p>
                <p className="text-sm text-muted-foreground">{convertTarget.client_name}</p>
                <p className="text-lg font-bold text-primary">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(convertTarget.amount_cents / 100)}
                </p>
              </div>

              {/* Project config */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Plano</Label>
                  <Select value={convertPlan} onValueChange={(v: any) => setConvertPlan(v)}>
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
                  <Input type="date" value={convertStartDate} onChange={e => setConvertStartDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Prazo de Entrega</Label>
                <Input type="date" value={convertDueDate} onChange={e => setConvertDueDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Observações do Projeto</Label>
                <Textarea
                  value={convertNotes}
                  onChange={e => setConvertNotes(e.target.value)}
                  rows={2}
                  placeholder="Detalhes, pendências, briefing..."
                />
              </div>

              <Button onClick={handleConvertToProject} className="w-full" disabled={converting}>
                {converting ? "Criando projeto..." : "Confirmar Pagamento e Criar Projeto"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Proposal Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Proposta</DialogTitle>
            <DialogDescription>Atualize os dados da proposta</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nome do Cliente</Label>
                <Input value={editClientName} onChange={e => setEditClientName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={editClientEmail} onChange={e => setEditClientEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp</Label>
              <Input value={editClientPhone} onChange={e => setEditClientPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Valor (R$)</Label>
              <Input value={editAmountReais} onChange={e => setEditAmountReais(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Método de Pagamento</Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setEditPaymentMethod("pix")}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${editPaymentMethod === "pix" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                  <Smartphone className="w-4 h-4" />
                  <div className="text-left"><p className="font-medium">PIX</p><p className="text-xs opacity-70">QR Code direto</p></div>
                </button>
                <button type="button" onClick={() => setEditPaymentMethod("cakto")}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${editPaymentMethod === "cakto" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                  <ExternalLink className="w-4 h-4" />
                  <div className="text-left"><p className="font-medium">Cakto</p><p className="text-xs opacity-70">Checkout completo</p></div>
                </button>
              </div>
            </div>
            <Button onClick={handleEditSave} className="w-full" disabled={editSaving}>
              {editSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDashboard;
