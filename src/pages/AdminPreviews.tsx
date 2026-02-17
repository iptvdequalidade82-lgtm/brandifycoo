import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { ThumbsUp, ThumbsDown, Eye, Trash2, Phone, Calendar, Palette, X, MessageCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type SitePreview = {
  id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  segment: string | null;
  slogan: string | null;
  plan: string;
  color_palette: string | null;
  feedback: string | null;
  feedback_at: string | null;
  html_storage_path: string | null;
  created_at: string;
};

const planColors: Record<string, string> = {
  essencial: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  profissional: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  premium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function AdminPreviews() {
  const [viewingHtml, setViewingHtml] = useState<string | null>(null);
  const [viewingName, setViewingName] = useState("");

  const { data: previews = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-site-previews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_previews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SitePreview[];
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar esta prévia?")) return;
    const preview = previews.find(p => p.id === id);
    if (preview?.html_storage_path) {
      await supabase.storage.from("site-previews").remove([preview.html_storage_path]);
    }
    await supabase.from("site_previews").delete().eq("id", id);
    refetch();
  };

  const handleViewHtml = async (preview: SitePreview) => {
    if (!preview.html_storage_path) return;
    const { data } = supabase.storage.from("site-previews").getPublicUrl(preview.html_storage_path);
    try {
      const resp = await fetch(data.publicUrl);
      const html = await resp.text();
      setViewingHtml(html);
      setViewingName(preview.client_name);
    } catch {
      setViewingHtml("<html><body style='background:#111;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh'><p>Erro ao carregar prévia</p></body></html>");
      setViewingName(preview.client_name);
    }
  };

  const stats = {
    total: previews.length,
    likes: previews.filter(p => p.feedback === "like").length,
    dislikes: previews.filter(p => p.feedback === "dislike").length,
    noFeedback: previews.filter(p => !p.feedback).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Prévias Geradas</h2>
          <p className="text-sm text-white/40">Acompanhe as prévias geradas pelos clientes no site</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Adoraram 👍", value: stats.likes, color: "text-emerald-400" },
            { label: "Não curtiram 👎", value: stats.dislikes, color: "text-red-400" },
            { label: "Sem feedback", value: stats.noFeedback, color: "text-white/40" },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
              <p className="text-xs text-white/40 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <p className="text-white/40 text-center py-12">Carregando...</p>
        ) : previews.length === 0 ? (
          <p className="text-white/40 text-center py-12">Nenhuma prévia gerada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-white/40 text-left">
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Segmento</th>
                  <th className="pb-3 font-medium">Plano</th>
                  <th className="pb-3 font-medium">Feedback</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Data</th>
                  <th className="pb-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {previews.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{p.client_name}</p>
                          {new Date(p.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                            <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Novo</span>
                          )}
                        </div>
                        {p.client_phone && (
                          <div className="flex items-center gap-2 mt-1">
                            <a 
                              href={`tel:${p.client_phone.replace(/\D/g, '')}`} 
                              className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
                              title="Ligar"
                            >
                              <Phone size={10} /> {p.client_phone}
                            </a>
                            <a 
                              href={`https://wa.me/55${p.client_phone.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle size={10} />
                            </a>
                          </div>
                        )}
                        {p.slogan && (
                          <p className="text-[10px] text-white/20 italic mt-0.5 truncate max-w-[200px]" title={p.slogan}>
                            "{p.slogan}"
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <span className="text-white/50">{p.segment || "—"}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${planColors[p.plan] || "bg-white/10 text-white/50"}`}>
                        {p.plan}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {p.feedback === "like" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <ThumbsUp size={14} /> Adorou
                        </span>
                      ) : p.feedback === "dislike" ? (
                        <span className="inline-flex items-center gap-1 text-red-400">
                          <ThumbsDown size={14} /> Não curtiu
                        </span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-white/30 text-xs">
                        <Calendar size={10} />
                        {format(new Date(p.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.html_storage_path && (
                          <button
                            onClick={() => handleViewHtml(p)}
                            className="p-2 rounded-lg text-white/30 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="Ver prévia"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Deletar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {viewingHtml && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[85vh] bg-[#111] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-medium text-white">Prévia: {viewingName}</p>
              <button onClick={() => setViewingHtml(null)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <X size={18} />
              </button>
            </div>
            <iframe srcDoc={viewingHtml} className="flex-1 w-full bg-white" title="Preview" sandbox="allow-scripts" />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
