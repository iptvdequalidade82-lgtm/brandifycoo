import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { History, FileText, FolderKanban, Clock } from "lucide-react";

interface ActivityLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

const actionLabels: Record<string, string> = {
  created: "Criado",
  status_changed: "Status alterado",
  deleted: "Excluído",
  checklist_updated: "Checklist atualizado",
  payment_link_generated: "Link de pagamento gerado",
};

const entityIcons: Record<string, any> = {
  proposal: FileText,
  project: FolderKanban,
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "proposal" | "project">("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) setLogs(data as unknown as ActivityLog[]);
      setLoading(false);
    })();
  }, []);

  const filtered = filter === "all" ? logs : logs.filter(l => l.entity_type === filter);

  // Group by date
  const grouped = filtered.reduce<Record<string, ActivityLog[]>>((acc, log) => {
    const date = formatDate(log.created_at);
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Histórico de Atividades</h2>
        </div>
        <div className="flex gap-1">
          {[
            { key: "all", label: "Tudo" },
            { key: "proposal", label: "Propostas" },
            { key: "project", label: "Projetos" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Nenhuma atividade registrada ainda</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateLogs]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 sticky top-0 bg-background py-1">{date}</h3>
              <div className="relative border-l-2 border-border ml-3 space-y-3 pl-5">
                {dateLogs.map(log => {
                  const Icon = entityIcons[log.entity_type] || FileText;
                  const details = log.details || {};
                  return (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-[25px] top-2 w-2.5 h-2.5 rounded-full bg-brand-accent border-2 border-[#0a0a0a]" />
                      <div className="rounded-xl p-3 border border-white/[0.06] bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs font-medium text-foreground">
                            {actionLabels[log.action] || log.action}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {formatTime(log.created_at)}
                          </span>
                        </div>
                        {details.title && (
                          <p className="text-sm text-foreground font-medium">{details.title}</p>
                        )}
                        {details.client_name && (
                          <p className="text-xs text-muted-foreground">{details.client_name}</p>
                        )}
                        {details.from && details.to && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {details.from} → {details.to}
                          </p>
                        )}
                        {details.item && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {details.checked ? "✅" : "⬜"} {details.item}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
