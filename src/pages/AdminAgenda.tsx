import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { CalendarDays, Clock, Crown, Award, Star } from "lucide-react";

interface Project {
  id: string;
  client_name: string;
  title: string;
  plan: "essencial" | "profissional" | "premium";
  status: "briefing" | "design" | "desenvolvimento" | "revisao" | "entregue";
  due_date: string | null;
  created_at: string;
}

const planIcons = { essencial: Star, profissional: Award, premium: Crown };
const planColors = { essencial: "text-blue-400", profissional: "text-purple-400", premium: "text-amber-400" };

const statusLabels: Record<string, string> = {
  briefing: "Briefing", design: "Design", desenvolvimento: "Desenvolvimento",
  revisao: "Revisão", entregue: "Entregue",
};

export default function AdminAgenda() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .not("status", "eq", "entregue")
        .order("due_date", { ascending: true, nullsFirst: false });
      if (data) setProjects(data as unknown as Project[]);
      setLoading(false);
    })();
  }, []);

  const overdue = projects.filter(p => p.due_date && new Date(p.due_date) < new Date());
  const upcoming = projects.filter(p => p.due_date && new Date(p.due_date) >= new Date());
  const noDueDate = projects.filter(p => !p.due_date);

  const renderProject = (p: Project) => {
    const Icon = planIcons[p.plan];
    const daysLeft = p.due_date ? Math.ceil((new Date(p.due_date).getTime() - Date.now()) / 86400000) : null;
    return (
      <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl glass glow-border">
        <Icon className={`w-5 h-5 ${planColors[p.plan]} shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{p.title}</p>
          <p className="text-xs text-muted-foreground">{p.client_name} · {statusLabels[p.status]}</p>
        </div>
        {p.due_date && (
          <div className={`text-right shrink-0 ${daysLeft !== null && daysLeft < 0 ? "text-destructive" : daysLeft !== null && daysLeft <= 3 ? "text-amber-400" : "text-muted-foreground"}`}>
            <p className="text-sm font-bold">
              {daysLeft !== null && daysLeft < 0
                ? `${Math.abs(daysLeft)}d atrasado`
                : daysLeft !== null && daysLeft === 0
                ? "Hoje"
                : `${daysLeft}d restantes`}
            </p>
            <p className="text-xs">{new Date(p.due_date).toLocaleDateString("pt-BR")}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays className="w-6 h-6 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Agenda de Entregas</h2>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Nenhum projeto em andamento</p>
        </div>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-destructive mb-3">⚠️ Atrasados ({overdue.length})</h3>
              <div className="space-y-2">{overdue.map(renderProject)}</div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">📅 Próximas entregas ({upcoming.length})</h3>
              <div className="space-y-2">{upcoming.map(renderProject)}</div>
            </div>
          )}
          {noDueDate.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Sem prazo definido ({noDueDate.length})</h3>
              <div className="space-y-2">{noDueDate.map(renderProject)}</div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
