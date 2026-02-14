import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logActivity } from "@/lib/admin-helpers";
import { CheckSquare, Square } from "lucide-react";

interface ChecklistItem {
  id: string;
  project_id: string;
  label: string;
  checked: boolean;
  sort_order: number;
  checked_at: string | null;
}

interface Props {
  projectId: string;
  projectTitle: string;
}

export default function ProjectChecklist({ projectId, projectTitle }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("project_checklist")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });
    if (data) setItems(data as unknown as ChecklistItem[]);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [projectId]);

  const toggleItem = async (item: ChecklistItem) => {
    const newChecked = !item.checked;
    const { error } = await supabase
      .from("project_checklist")
      .update({
        checked: newChecked,
        checked_at: newChecked ? new Date().toISOString() : null,
      } as any)
      .eq("id", item.id);

    if (!error) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: newChecked, checked_at: newChecked ? new Date().toISOString() : null } : i));
      if (user) {
        logActivity("project", projectId, "checklist_updated", user.id, {
          title: projectTitle,
          item: item.label,
          checked: newChecked,
        });
      }
    }
  };

  const completed = items.filter(i => i.checked).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) return <p className="text-xs text-muted-foreground">Carregando...</p>;
  if (items.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground">Checklist de Entrega</p>
        <span className="text-[10px] text-muted-foreground">{completed}/{total} ({pct}%)</span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-muted mb-2">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="space-y-1">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => toggleItem(item)}
            className="flex items-center gap-2 w-full text-left py-1 px-1 rounded hover:bg-muted/50 transition-colors"
          >
            {item.checked ? (
              <CheckSquare className="w-3.5 h-3.5 text-green-400 shrink-0" />
            ) : (
              <Square className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className={`text-xs ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {item.label}
            </span>
            {item.checked && item.checked_at && (
              <span className="text-[9px] text-muted-foreground ml-auto">
                {new Date(item.checked_at).toLocaleDateString("pt-BR")}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
