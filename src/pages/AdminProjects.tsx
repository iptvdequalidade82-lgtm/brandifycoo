import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
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
  Plus, RefreshCw, MessageCircle, Trash2, Crown, Award, Star,
} from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  title: string;
  plan: "essencial" | "profissional" | "premium";
  status: "briefing" | "design" | "desenvolvimento" | "revisao" | "entregue";
  notes: string | null;
  due_date: string | null;
  created_at: string;
}

const planConfig = {
  essencial: { label: "Essencial", icon: Star, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  profissional: { label: "Profissional", icon: Award, color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
  premium: { label: "Premium", icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
};

const statusConfig = {
  briefing: { label: "Briefing", color: "text-muted-foreground", bg: "bg-muted" },
  design: { label: "Design", color: "text-blue-400", bg: "bg-blue-400/10" },
  desenvolvimento: { label: "Desenvolvimento", color: "text-amber-400", bg: "bg-amber-400/10" },
  revisao: { label: "Revisão", color: "text-purple-400", bg: "bg-purple-400/10" },
  entregue: { label: "Entregue", color: "text-green-400", bg: "bg-green-400/10" },
};

const filterTabs = [
  { key: "all", label: "Todos" },
  { key: "briefing", label: "Briefing" },
  { key: "design", label: "Design" },
  { key: "desenvolvimento", label: "Dev" },
  { key: "revisao", label: "Revisão" },
  { key: "entregue", label: "Entregue" },
];

export default function AdminProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [title, setTitle] = useState("");
  const [plan, setPlan] = useState<"essencial" | "profissional" | "premium">("essencial");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProjects(data as unknown as Project[]);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = activeFilter === "all"
    ? projects
    : projects.filter(p => p.status === activeFilter);

  const resetForm = () => {
    setClientName(""); setClientPhone(""); setClientEmail("");
    setTitle(""); setPlan("essencial"); setNotes(""); setDueDate("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !title.trim()) {
      toast.error("Nome e título são obrigatórios");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("projects").insert({
      client_name: clientName.trim(),
      client_phone: clientPhone.trim() || null,
      client_email: clientEmail.trim() || null,
      title: title.trim(),
      plan,
      notes: notes.trim() || null,
      due_date: dueDate || null,
      created_by: user!.id,
    } as any);
    if (error) {
      toast.error("Erro ao criar projeto");
    } else {
      toast.success("Projeto criado!");
      setShowForm(false);
      resetForm();
      fetchProjects();
    }
    setSubmitting(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("projects").update({ status } as any).eq("id", id);
    if (error) toast.error("Erro ao atualizar");
    else {
      toast.success("Status atualizado");
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: status as any } : p));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("projects").delete().eq("id", deleteTarget.id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Projeto excluído");
      setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const num = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(`Olá ${name}! Aqui é da Brandify, tudo bem?`)}`, "_blank");
  };

  return (
    <AdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const count = projects.filter(p => p.status === key).length;
          return (
            <div key={key} className={`rounded-xl p-3 border ${cfg.bg} text-center`}>
              <p className={`text-xl font-bold ${cfg.color}`}>{count}</p>
              <p className="text-xs text-muted-foreground">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Projetos</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchProjects}><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" /> Novo Projeto</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {filterTabs.map(tab => {
          const count = tab.key === "all" ? projects.length : projects.filter(p => p.status === tab.key).length;
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

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhum projeto encontrado</div>
        ) : (
          filtered.map(p => {
            const pCfg = planConfig[p.plan];
            const sCfg = statusConfig[p.status];
            const PlanIcon = pCfg.icon;
            return (
              <div key={p.id} className="glass rounded-xl p-5 glow-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${pCfg.bg} ${pCfg.color}`}>
                        <PlanIcon className="w-3 h-3" /> {pCfg.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${sCfg.bg} ${sCfg.color}`}>
                        {sCfg.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.client_name}</p>
                    {p.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.notes}</p>}
                    {p.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Prazo: {new Date(p.due_date).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* Status progression */}
                    <Select value={p.status} onValueChange={(v) => updateStatus(p.id, v)}>
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {p.client_phone && (
                      <Button variant="outline" size="icon" onClick={() => openWhatsApp(p.client_phone!, p.client_name)} title="WhatsApp">
                        <MessageCircle className="w-4 h-4 text-green-400" />
                      </Button>
                    )}
                    <Button variant="outline" size="icon" onClick={() => setDeleteTarget(p)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              O projeto "{deleteTarget?.title}" será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New project dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Projeto</DialogTitle>
            <DialogDescription>Cadastre um novo projeto de site</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nome do Cliente</Label>
                <Input value={clientName} onChange={e => setClientName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp</Label>
                <Input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="(43) 99106-5129" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email (opcional)</Label>
              <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Título do Projeto</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Site Restaurante XYZ" required />
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
                <Label>Prazo de Entrega</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Detalhes do projeto, pendências..." />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Criando..." : "Criar Projeto"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
