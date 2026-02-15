import { supabase } from "@/integrations/supabase/client";

export async function logActivity(
  entityType: "proposal" | "project",
  entityId: string,
  action: string,
  createdBy: string,
  details: Record<string, any> = {}
) {
  await supabase.from("activity_logs").insert({
    entity_type: entityType,
    entity_id: entityId,
    action,
    details,
    created_by: createdBy,
  } as any);
}

const DEFAULT_CHECKLIST = [
  "✅ 50% entrada pago",
  "Conteúdo recebido",
  "Domínio registrado",
  "Hospedagem configurada",
  "Design aprovado",
  "Desenvolvimento concluído",
  "Revisão do cliente",
  "Site publicado",
  "💰 50% final pago",
];

export async function createDefaultChecklist(projectId: string) {
  const items = DEFAULT_CHECKLIST.map((label, i) => ({
    project_id: projectId,
    label,
    sort_order: i,
    checked: i === 0,
    checked_at: i === 0 ? new Date().toISOString() : null,
  }));
  await supabase.from("project_checklist").insert(items as any);
}
