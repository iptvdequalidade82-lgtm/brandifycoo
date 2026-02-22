import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Instagram, Sparkles, Calendar, Copy, Download, RefreshCw, ImageIcon,
  Clock, Lightbulb, MessageSquare, Pencil, CheckCircle2, Circle,
  Lock, CalendarDays, Check, AlertTriangle,
} from "lucide-react";

// ── Types ──
type FeedPost = {
  id: string; day: string; time: string; title: string; caption: string;
  imageDescription: string; contentType: string; marketingTip: string;
  generatedImage?: string; isGeneratingImage?: boolean; checked?: boolean;
};
type Story = {
  id: string; day: string; type: string; mainText: string;
  visualDescription: string; callToAction: string;
  generatedImage?: string; isGeneratingImage?: boolean; checked?: boolean;
};
type WeekData = {
  weekNumber: number; niche: string; theme: string; strategy: string;
  feedPosts: FeedPost[]; stories: Story[];
};
type MonthPlan = { monthStrategy: string; weeks: WeekData[] };
type MonthStatus = "concluido" | "em_andamento" | "aberto";

type WeekLabel = { label: string; range: string; days: string[]; dates: string[] };
type MonthConfig = {
  key: string; label: string; shortLabel: string; status: MonthStatus;
  monthIndex: number; year: number; weekLabels: WeekLabel[];
};

// ── Constants ──
const NICHES = [
  "Clínicas médicas e consultórios", "Dentistas e odontologia",
  "Advogados e escritórios de advocacia", "Lojas de roupas e moda",
  "Restaurantes e delivery", "Salões de beleza e barbearias",
  "Academias e personal trainers", "Imobiliárias e corretores",
  "Contabilidade e finanças", "Petshops e veterinárias",
  "Autoescolas e despachantes", "Arquitetos e designers de interiores",
  "Fotógrafos e produtoras", "Educação e cursos online", "Tecnologia e startups",
];

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MONTH_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const STATUS_CONFIG: Record<MonthStatus, { label: string; color: string; icon: React.ReactNode }> = {
  concluido: { label: "Concluído", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: <Check className="w-3 h-3" /> },
  em_andamento: { label: "Em andamento", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: <RefreshCw className="w-3 h-3" /> },
  aberto: { label: "Em aberto", color: "bg-white/10 text-white/40 border-white/10", icon: <Lock className="w-3 h-3" /> },
};

// ── Date Helpers ──
function formatDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getDayName(d: Date) {
  return DAY_NAMES[d.getDay()];
}

/** Build week configs for a month, starting from `startFrom` date */
function buildWeeksForMonth(year: number, monthIndex: number, startFrom: Date): WeekLabel[] {
  // Get all remaining days in the month from startFrom
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const startDay = (startFrom.getFullYear() === year && startFrom.getMonth() === monthIndex)
    ? startFrom.getDate()
    : 1;

  if (startDay > lastDay) return [];

  // Collect all remaining dates
  const allDates: Date[] = [];
  for (let d = startDay; d <= lastDay; d++) {
    allDates.push(new Date(year, monthIndex, d));
  }

  // Group into weeks (Monday-based)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  for (const date of allDates) {
    const dow = date.getDay(); // 0=Sun
    // Start new week on Monday (unless it's the very first batch)
    if (dow === 1 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  // Convert to WeekLabel
  return weeks.map((dates, i) => {
    const days = dates.map((d) => getDayName(d));
    const dateStrs = dates.map((d) => formatDate(d));
    const range = `${dateStrs[0]} – ${dateStrs[dateStrs.length - 1]}`;
    return {
      label: `Semana ${i + 1}`,
      range,
      days,
      dates: dateStrs,
    };
  });
}

function buildMonthConfigs(today: Date, existingPlans?: Record<string, MonthPlan>): MonthConfig[] {
  const year = 2026;
  const currentMonth = today.getMonth(); // 0-indexed
  const currentYear = today.getFullYear();

  return Array.from({ length: 12 }, (_, i) => {
    let status: MonthStatus;
    if (currentYear > year || (currentYear === year && i < currentMonth)) {
      status = "concluido";
    } else if (currentYear === year && i === currentMonth) {
      status = "em_andamento";
    } else {
      status = "aberto";
    }

    const monthKey = MONTH_SHORT[i].toLowerCase();
    const hasPlan = existingPlans && existingPlans[monthKey] && Object.keys(existingPlans[monthKey]).length > 0;

    // If a plan already exists, show ALL days from day 1 so past content remains visible
    // Only use "start from today" when there's NO plan yet (for generation)
    let startFrom: Date;
    if (hasPlan) {
      startFrom = new Date(year, i, 1); // show full month
    } else if (status === "em_andamento") {
      startFrom = new Date(today); // start from today for new generation
    } else {
      startFrom = new Date(year, i, 1);
    }

    const weekLabels = status === "concluido" && !hasPlan
      ? [] // no weeks needed for completed months without a plan
      : buildWeeksForMonth(year, i, startFrom);

    return {
      key: monthKey,
      label: MONTH_NAMES[i],
      shortLabel: MONTH_SHORT[i],
      status,
      monthIndex: i,
      year,
      weekLabels,
    };
  });
}

/** Determine status of a day item: "atrasado" (past), "pendente" (today/future), "conferido" (checked) */
function getDayItemStatus(dateStr: string, time: string, checked: boolean, monthIndex: number, year: number): { label: string; color: string } {
  if (checked) return { label: "Conferido", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };

  // Parse dateStr "DD/MM" into a Date
  const parts = dateStr.split("/");
  if (parts.length !== 2) return { label: "Pendente", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const itemDate = new Date(year, month, day);

  // Parse time "HH:MM"
  const timeParts = time?.split(":") || [];
  const itemHour = timeParts.length >= 2 ? parseInt(timeParts[0], 10) : 23;
  const itemMin = timeParts.length >= 2 ? parseInt(timeParts[1], 10) : 59;
  itemDate.setHours(itemHour, itemMin, 0, 0);

  const now = new Date();
  if (itemDate < now) return { label: "Atrasado", color: "bg-red-500/20 text-red-300 border-red-500/30" };
  return { label: "Pendente", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
}

/** Get overall day status from items */
function getDayStatus(dateStr: string, items: { time?: string; checked?: boolean }[], monthIndex: number, year: number): { label: string; color: string } {
  if (items.length === 0) return { label: "", color: "" };
  const allChecked = items.every((i) => i.checked);
  if (allChecked) return { label: "Conferido", color: "text-emerald-400" };

  const parts = dateStr.split("/");
  if (parts.length !== 2) return { label: "", color: "" };
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const dayDate = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayStart = new Date(dayDate);
  dayStart.setHours(0, 0, 0, 0);

  if (dayStart < today) return { label: "Atrasado", color: "text-red-400" };
  return { label: "", color: "" };
}

// ── Component ──
export default function AdminConteudo() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const [monthPlans, setMonthPlans] = useState<Record<string, MonthPlan>>({});
  const [weekNiches, setWeekNiches] = useState<Record<string, string[]>>({});
  const [customNiches, setCustomNiches] = useState<Record<string, string[]>>({});
  const [brandContext, setBrandContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeWeek, setActiveWeek] = useState("1");
  const [feedbackItemId, setFeedbackItemId] = useState<string | null>(null);
  const [imageHint, setImageHint] = useState("");
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const months = useMemo(() => {
    void refreshKey;
    return buildMonthConfigs(new Date(), monthPlans);
  }, [refreshKey, monthPlans]);

  const currentMonthKey = months.find((m) => m.status === "em_andamento")?.key || months[0].key;
  const [activeMonth, setActiveMonth] = useState(currentMonthKey);

  // Debounced save ref
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all plans from DB on mount
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const { data, error } = await supabase
          .from("instagram_plans" as any)
          .select("*")
          .eq("year", 2026);
        if (error) throw error;
        if (data && Array.isArray(data)) {
          const plans: Record<string, MonthPlan> = {};
          const niches: Record<string, string[]> = {};
          const customs: Record<string, string[]> = {};
          for (const row of data as any[]) {
            if (row.month_plan && Object.keys(row.month_plan).length > 0) {
              plans[row.month_key] = row.month_plan as MonthPlan;
            }
            if (row.week_niches && Array.isArray(row.week_niches) && row.week_niches.length > 0) {
              niches[row.month_key] = row.week_niches;
            }
            if (row.custom_niches && Array.isArray(row.custom_niches) && row.custom_niches.length > 0) {
              customs[row.month_key] = row.custom_niches;
            }
          }
          setMonthPlans(plans);
          setWeekNiches(niches);
          setCustomNiches(customs);
        }
      } catch (e) {
        console.error("Failed to load plans:", e);
      } finally {
        setIsLoadingPlans(false);
      }
    };
    loadPlans();
  }, []);

  // Save a specific month to DB (debounced for edits)
  const savePlanToDb = useCallback(async (monthKey: string, plan: MonthPlan | null, niches: string[], customs: string[]) => {
    try {
      await supabase.from("instagram_plans" as any).upsert({
        month_key: monthKey,
        year: 2026,
        month_plan: plan || {},
        week_niches: niches || [],
        custom_niches: customs || [],
      } as any, { onConflict: "month_key,year" });
    } catch (e) {
      console.error("Failed to save plan:", e);
    }
  }, []);

  // Debounced save on any plan/niches change (after initial load)
  const hasLoaded = useRef(false);
  useEffect(() => {
    if (isLoadingPlans) return;
    if (!hasLoaded.current) { hasLoaded.current = true; return; }
    // Debounce save for the active month
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const plan = monthPlans[activeMonth] || null;
      const niches = weekNiches[activeMonth] || [];
      const customs = customNiches[activeMonth] || [];
      savePlanToDb(activeMonth, plan, niches, customs);
    }, 1500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [monthPlans, weekNiches, customNiches, activeMonth, isLoadingPlans, savePlanToDb]);

  const currentMonthConfig = months.find((m) => m.key === activeMonth)!;
  const currentPlan = monthPlans[activeMonth] || null;
  const weeksCount = currentMonthConfig.weekLabels.length;

  const getNiches = (monthKey: string) => {
    const config = months.find((m) => m.key === monthKey)!;
    return weekNiches[monthKey] || new Array(config.weekLabels.length).fill("");
  };
  const getCustomNiches = (monthKey: string) => {
    const config = months.find((m) => m.key === monthKey)!;
    return customNiches[monthKey] || new Array(config.weekLabels.length).fill("");
  };

  const setNicheForWeek = (weekIdx: number, value: string) => {
    setWeekNiches((prev) => {
      const arr = [...(prev[activeMonth] || new Array(weeksCount).fill(""))];
      arr[weekIdx] = value;
      return { ...prev, [activeMonth]: arr };
    });
  };
  const setCustomNicheForWeek = (weekIdx: number, value: string) => {
    setCustomNiches((prev) => {
      const arr = [...(prev[activeMonth] || new Array(weeksCount).fill(""))];
      arr[weekIdx] = value;
      return { ...prev, [activeMonth]: arr };
    });
  };

  const niches = getNiches(activeMonth);
  const customs = getCustomNiches(activeMonth);
  const resolvedNiches = niches.map((n, i) => n === "custom" ? customs[i] : n);
  const allFilled = resolvedNiches.length > 0 && resolvedNiches.every((n) => n.trim().length > 0);

  const handleRegenerate = () => {
    setRefreshKey((k) => k + 1);
    setMonthPlans((prev) => { const p = { ...prev }; delete p[activeMonth]; return p; });
    setWeekNiches((prev) => { const p = { ...prev }; delete p[activeMonth]; return p; });
    setCustomNiches((prev) => { const p = { ...prev }; delete p[activeMonth]; return p; });
    setActiveWeek("1");
    // Delete from DB
    supabase.from("instagram_plans" as any).delete().eq("month_key", activeMonth).eq("year", 2026).then(() => {});
    toast({ title: "Calendário atualizado! 📅", description: "Semanas recalculadas a partir de amanhã." });
  };

  const handleGenerate = async () => {
    if (!allFilled) {
      toast({ title: "Selecione um nicho para cada semana", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-instagram-content", {
        body: {
          niches: resolvedNiches,
          brandContext,
          monthLabel: currentMonthConfig.label,
          weeksConfig: currentMonthConfig.weekLabels,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const plan = data.monthPlan || data;
      setMonthPlans((prev) => ({ ...prev, [activeMonth]: plan }));
      setActiveWeek("1");
      toast({ title: `Planejamento de ${currentMonthConfig.label} gerado! 🎉` });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro ao gerar conteúdo", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async (weekIdx: number, itemId: string, description: string, type: "feed" | "story", hint?: string) => {
    const fullPrompt = hint ? `${description}. OBSERVAÇÃO DO USUÁRIO: ${hint}` : description;
    const updateWeekItem = (updating: boolean, imageUrl?: string) => {
      setMonthPlans((prev) => {
        const plan = prev[activeMonth];
        if (!plan) return prev;
        const weeks = [...plan.weeks];
        const week = { ...weeks[weekIdx] };
        const key = type === "feed" ? "feedPosts" : "stories";
        week[key] = (week[key] as any[]).map((i: any) =>
          i.id === itemId ? { ...i, isGeneratingImage: updating, ...(imageUrl ? { generatedImage: imageUrl } : {}) } : i
        );
        weeks[weekIdx] = week;
        return { ...prev, [activeMonth]: { ...plan, weeks } };
      });
    };
    updateWeekItem(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-instagram-image", { body: { prompt: fullPrompt, type } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      updateWeekItem(false, data.imageUrl);
      setImageHint("");
      setFeedbackItemId(null);
      toast({ title: "Imagem gerada! 🎨" });
    } catch (e: any) {
      updateWeekItem(false);
      toast({ title: "Erro ao gerar imagem", description: e.message, variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast({ title: "Copiado! 📋" }); };

  const toggleFeedback = (id: string) => {
    setFeedbackItemId(feedbackItemId === id ? null : id);
    setImageHint("");
  };

  const updateItemField = (weekIdx: number, itemId: string, type: "feed" | "story", field: string, value: string) => {
    setMonthPlans((prev) => {
      const plan = prev[activeMonth];
      if (!plan) return prev;
      const weeks = [...plan.weeks];
      const week = { ...weeks[weekIdx] };
      const key = type === "feed" ? "feedPosts" : "stories";
      week[key] = (week[key] as any[]).map((i: any) => i.id === itemId ? { ...i, [field]: value } : i);
      weeks[weekIdx] = week;
      return { ...prev, [activeMonth]: { ...plan, weeks } };
    });
  };

  const toggleChecked = (weekIdx: number, itemId: string, type: "feed" | "story") => {
    setMonthPlans((prev) => {
      const plan = prev[activeMonth];
      if (!plan) return prev;
      const weeks = [...plan.weeks];
      const week = { ...weeks[weekIdx] };
      const key = type === "feed" ? "feedPosts" : "stories";
      week[key] = (week[key] as any[]).map((i: any) => i.id === itemId ? { ...i, checked: !i.checked } : i);
      weeks[weekIdx] = week;
      return { ...prev, [activeMonth]: { ...plan, weeks } };
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500">
            <Instagram className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Conteúdo Instagram</h1>
            <p className="text-sm text-white/40 mt-0.5">Planejamento anual 2026 — um nicho por semana</p>
          </div>
        </div>

        {/* Monthly Navigation */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {months.map((month) => {
            const sc = STATUS_CONFIG[month.status];
            const isActive = month.key === activeMonth;
            return (
              <button
                key={month.key}
                onClick={() => { setActiveMonth(month.key); setActiveWeek("1"); setFeedbackItemId(null); }}
                className={`relative flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all text-center ${
                  isActive
                    ? "bg-white/10 border-white/20 ring-1 ring-white/20"
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                }`}
              >
                <span className={`text-xs font-bold ${isActive ? "text-white" : "text-white/60"}`}>{month.shortLabel}</span>
                <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full border ${sc.color}`}>
                  {sc.icon}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current Month Content */}
        <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">{currentMonthConfig.label} 2026</h2>
              <Badge variant="outline" className={STATUS_CONFIG[currentMonthConfig.status].color}>
                {STATUS_CONFIG[currentMonthConfig.status].label}
              </Badge>
            </div>
            {currentPlan && (
              <Button variant="outline" size="sm" onClick={handleRegenerate} className="text-xs border-white/10 text-white/60 hover:text-white hover:bg-white/10">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refazer planejamento (atualizar datas)
              </Button>
            )}
          </div>

          {/* Info about date range */}
          {weeksCount > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300/80 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {currentMonthConfig.weekLabels.length} semana{currentMonthConfig.weekLabels.length > 1 ? "s" : ""} · {currentMonthConfig.weekLabels[0]?.range.split(" – ")[0]} a {currentMonthConfig.weekLabels[currentMonthConfig.weekLabels.length - 1]?.range.split(" – ")[1]} · Atualizado para hoje
              </p>
            </div>
          )}

          {/* Completed month with no plan */}
          {currentMonthConfig.status === "concluido" && !currentPlan && (
            <div className="text-center py-10">
              <CheckCircle2 className="w-12 h-12 text-emerald-400/40 mx-auto mb-3" />
              <p className="text-white/50 text-sm">Planejamento de {currentMonthConfig.label} já foi concluído.</p>
            </div>
          )}

          {/* No weeks left */}
          {weeksCount === 0 && currentMonthConfig.status !== "concluido" && (
            <div className="text-center py-10">
              <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">Não há mais dias restantes neste mês.</p>
            </div>
          )}

          {/* Generator Form */}
          {weeksCount > 0 && (
            <Accordion type="single" collapsible defaultValue={currentPlan ? undefined : "generator"}>
              <AccordionItem value="generator" className="border-white/[0.06] bg-white/[0.03] rounded-lg border px-4">
                <AccordionTrigger className="text-sm font-semibold text-white/70 hover:no-underline py-3">
                  <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> Gerar planejamento de {currentMonthConfig.label}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-5 pb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {currentMonthConfig.weekLabels.map((wl, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <label className="text-sm font-medium text-white/70">
                            {wl.label} <span className="text-white/30 text-xs">({wl.range} · {wl.days.length} dias)</span>
                          </label>
                          <Select value={niches[idx] || ""} onValueChange={(v) => setNicheForWeek(idx, v)}>
                            <SelectTrigger className="bg-white/[0.05] border-white/10 text-white">
                              <SelectValue placeholder="Selecione o nicho..." />
                            </SelectTrigger>
                            <SelectContent>
                              {NICHES.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                              <SelectItem value="custom">✏️ Digitar outro nicho</SelectItem>
                            </SelectContent>
                          </Select>
                          {niches[idx] === "custom" && (
                            <Input
                              placeholder="Ex: Pet shop premium..."
                              value={customs[idx] || ""}
                              onChange={(e) => setCustomNicheForWeek(idx, e.target.value)}
                              className="bg-white/[0.05] border-white/10 text-white"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white/70">Contexto adicional (opcional)</label>
                      <Textarea
                        placeholder="Ex: Focar em empresas de médio porte, região sudeste..."
                        value={brandContext}
                        onChange={(e) => setBrandContext(e.target.value)}
                        className="bg-white/[0.05] border-white/10 text-white resize-none h-[68px]"
                      />
                    </div>
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !allFilled}
                      className="w-full md:w-auto bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:opacity-90 text-white font-semibold py-5"
                    >
                      {isGenerating ? (
                        <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Gerando planejamento...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-2" /> Gerar planejamento de {currentMonthConfig.label}</>
                      )}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Plan Results */}
          {currentPlan && (
            <div className="space-y-5 mt-5">
              <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white text-sm">Estratégia de {currentMonthConfig.label}</h3>
                    <p className="text-white/60 text-sm mt-1.5 leading-relaxed">{currentPlan.monthStrategy}</p>
                  </div>
                </div>
              </Card>

              <Tabs value={activeWeek} onValueChange={setActiveWeek} className="w-full">
                <TabsList className="bg-white/[0.05] border border-white/10 h-auto p-1 flex-wrap">
                  {currentPlan.weeks?.map((week, idx) => {
                    const wl = currentMonthConfig.weekLabels[idx];
                    return (
                      <TabsTrigger key={idx} value={String(idx + 1)} className="data-[state=active]:bg-white/10 text-white/50 data-[state=active]:text-white px-4 py-2">
                        {wl?.label || `Sem. ${week.weekNumber}`}
                        {wl?.range && <span className="text-white/30 ml-1 text-[10px]">{wl.range}</span>}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {currentPlan.weeks?.map((week, weekIdx) => {
                  const wl = currentMonthConfig.weekLabels[weekIdx];
                  const daysForWeek = wl?.days || ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

                  return (
                    <TabsContent key={weekIdx} value={String(weekIdx + 1)} className="mt-5 space-y-5">
                      <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                        <p className="text-sm text-white/60">
                          <span className="text-white/80 font-medium">Nicho:</span> {week.niche} · <span className="text-white/80 font-medium">Foco:</span> {week.strategy}
                        </p>
                      </Card>

                      <Tabs defaultValue="feed" className="w-full">
                        <TabsList className="bg-white/[0.05] border border-white/10">
                          <TabsTrigger value="feed" className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white">📸 Feed ({week.feedPosts?.length || 0})</TabsTrigger>
                          <TabsTrigger value="stories" className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white">📱 Stories ({week.stories?.length || 0})</TabsTrigger>
                        </TabsList>

                        {/* FEED */}
                        <TabsContent value="feed" className="mt-5">
                          <Accordion type="multiple" className="space-y-2">
                            {daysForWeek.map((day, dayI) => {
                              const dayPosts = week.feedPosts?.filter((p) => p.day === day) || [];
                              if (dayPosts.length === 0) return null;
                              const dateStr = wl?.dates?.[dayI] || "";
                              const daySt = getDayStatus(dateStr, dayPosts, currentMonthConfig.monthIndex, currentMonthConfig.year);
                              return (
                                <AccordionItem key={day} value={`feed-${day}`} className="border-white/[0.06] bg-white/[0.02] rounded-lg px-4 border">
                                  <AccordionTrigger className="text-xs font-bold text-white/60 uppercase tracking-widest hover:no-underline py-3">
                                    <span className="flex items-center gap-2">
                                      <Calendar className="w-3.5 h-3.5" /> {day}
                                      {dateStr && <span className="text-white/30 normal-case tracking-normal font-normal">{dateStr}</span>}
                                      {daySt.label && (
                                        <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full normal-case tracking-normal font-semibold ${daySt.color}`}>
                                          {daySt.label === "Atrasado" && <AlertTriangle className="w-2.5 h-2.5" />}
                                          {daySt.label === "Conferido" && <CheckCircle2 className="w-2.5 h-2.5" />}
                                          {daySt.label}
                                        </span>
                                      )}
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-3 pb-1">
                                      {dayPosts.map((post) => (
                                        <Card key={post.id} className={`border-white/[0.06] overflow-hidden transition-colors ${post.checked ? "bg-emerald-500/[0.06] border-emerald-500/20" : "bg-white/[0.03]"}`}>
                                          <div className="flex flex-col md:flex-row">
                                            <div className="md:w-56 shrink-0 bg-white/[0.02] flex items-center justify-center relative min-h-[180px]">
                                              {post.generatedImage ? (
                                                <>
                                                  <img src={post.generatedImage} alt={post.title} className="w-full h-full object-cover aspect-square" />
                                                  <div className="absolute top-2 right-2 flex gap-1.5">
                                                    <Button size="sm" onClick={() => handleGenerateImage(weekIdx, post.id, post.imageDescription, "feed")} disabled={post.isGeneratingImage} className="p-1.5 h-auto bg-black/60 hover:bg-black/80 text-white">
                                                      {post.isGeneratingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                                    </Button>
                                                    <a href={post.generatedImage} download={`feed-${post.id}.png`} className="p-1.5 bg-black/60 rounded-lg hover:bg-black/80 transition-colors"><Download className="w-3.5 h-3.5 text-white" /></a>
                                                  </div>
                                                </>
                                              ) : (
                                                <div className="flex flex-col items-center gap-3 p-4">
                                                  <ImageIcon className="w-8 h-8 text-white/15" />
                                                  <Button size="sm" onClick={() => handleGenerateImage(weekIdx, post.id, post.imageDescription, "feed")} disabled={post.isGeneratingImage} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white text-xs">
                                                    {post.isGeneratingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><ImageIcon className="w-3.5 h-3.5 mr-1" /> Gerar imagem</>}
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex-1 p-4 space-y-3">
                                              <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <h3 className="font-semibold text-white text-sm">{post.title}</h3>
                                                  <span className="text-[10px] text-white/30 uppercase bg-white/[0.06] px-1.5 py-0.5 rounded">{post.contentType}</span>
                                                </div>
                                                {(() => {
                                                  const st = getDayItemStatus(dateStr, post.time, !!post.checked, currentMonthConfig.monthIndex, currentMonthConfig.year);
                                                  return (
                                                    <span className="shrink-0 flex items-center gap-1.5">
                                                      <span className="text-xs text-white/40 flex items-center gap-1"><Clock className="w-3 h-3" /> {post.time}</span>
                                                      <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${st.color}`}>
                                                        {st.label === "Atrasado" && <AlertTriangle className="w-2.5 h-2.5" />}
                                                        {st.label === "Conferido" && <CheckCircle2 className="w-2.5 h-2.5" />}
                                                        {st.label}
                                                      </span>
                                                    </span>
                                                  );
                                                })()}
                                              </div>
                                              <p className="text-xs text-white/60 leading-relaxed line-clamp-3">{post.caption}</p>
                                              {post.marketingTip && (
                                                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                                                  <p className="text-xs text-amber-200/80 line-clamp-2">{post.marketingTip}</p>
                                                </div>
                                              )}
                                              <div className="flex items-center gap-2 pt-1">
                                                <Button variant="ghost" size="sm" onClick={() => toggleChecked(weekIdx, post.id, "feed")} className={`h-7 text-xs ${post.checked ? "text-emerald-400 hover:text-emerald-300" : "text-white/40 hover:text-white"}`}>
                                                  {post.checked ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <Circle className="w-3.5 h-3.5 mr-1" />}{post.checked ? "Conferido ✓" : "Conferir"}
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(post.caption)} className="text-white/40 hover:text-white h-7 text-xs"><Copy className="w-3 h-3 mr-1" /> Copiar legenda</Button>
                                                <Button variant="ghost" size="sm" onClick={() => toggleFeedback(post.id)} className="text-white/30 hover:text-white h-7 text-xs"><Pencil className="w-3 h-3 mr-0.5" /> Editar</Button>
                                              </div>
                                              {feedbackItemId === post.id && (
                                                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                                                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Editar conteúdo</p>
                                                  <Input placeholder="Título do post..." value={post.title} onChange={(e) => updateItemField(weekIdx, post.id, "feed", "title", e.target.value)} className="bg-white/[0.05] border-white/10 text-white text-[10px] h-7" />
                                                  <Textarea placeholder="Legenda..." value={post.caption} onChange={(e) => updateItemField(weekIdx, post.id, "feed", "caption", e.target.value)} className="bg-white/[0.05] border-white/10 text-white text-[10px] min-h-[60px] resize-none" />
                                                  {post.generatedImage && (
                                                    <>
                                                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1 mt-1"><ImageIcon className="w-3 h-3" /> Refazer imagem</p>
                                                      <div className="flex gap-1.5">
                                                        <Input placeholder="Dica para refazer..." value={imageHint} onChange={(e) => setImageHint(e.target.value)} className="bg-white/[0.05] border-white/10 text-white text-[10px] flex-1 h-7" />
                                                        <Button size="sm" onClick={() => handleGenerateImage(weekIdx, post.id, post.imageDescription, "feed", imageHint || undefined)} disabled={post.isGeneratingImage} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white h-7 w-7 p-0 shrink-0">
                                                          {post.isGeneratingImage ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                                        </Button>
                                                      </div>
                                                    </>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </Card>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            })}
                          </Accordion>
                        </TabsContent>

                        {/* STORIES */}
                        <TabsContent value="stories" className="mt-5">
                          <Accordion type="multiple" className="space-y-2">
                            {daysForWeek.map((day, dayI) => {
                              const dayStories = week.stories?.filter((s) => s.day === day) || [];
                              if (dayStories.length === 0) return null;
                              const dateStr = wl?.dates?.[dayI] || "";
                              const daySt = getDayStatus(dateStr, dayStories, currentMonthConfig.monthIndex, currentMonthConfig.year);
                              return (
                                <AccordionItem key={day} value={`story-${day}`} className="border-white/[0.06] bg-white/[0.02] rounded-lg px-4 border">
                                  <AccordionTrigger className="text-xs font-bold text-white/60 uppercase tracking-widest hover:no-underline py-3">
                                    <span className="flex items-center gap-2">
                                      <Calendar className="w-3.5 h-3.5" /> {day}
                                      {dateStr && <span className="text-white/30 normal-case tracking-normal font-normal">{dateStr}</span>}
                                      ({dayStories.length} stories)
                                      {daySt.label && (
                                        <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full normal-case tracking-normal font-semibold ${daySt.color}`}>
                                          {daySt.label === "Atrasado" && <AlertTriangle className="w-2.5 h-2.5" />}
                                          {daySt.label === "Conferido" && <CheckCircle2 className="w-2.5 h-2.5" />}
                                          {daySt.label}
                                        </span>
                                      )}
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-1">
                                      {dayStories.map((story) => (
                                        <Card key={story.id} className={`border-white/[0.06] overflow-hidden flex flex-col transition-colors ${story.checked ? "bg-emerald-500/[0.06] border-emerald-500/20" : "bg-white/[0.03]"}`}>
                                          <div className="aspect-[9/16] max-h-52 bg-white/[0.02] flex items-center justify-center relative">
                                            {story.generatedImage ? (
                                              <>
                                                <img src={story.generatedImage} alt={story.mainText} className="w-full h-full object-cover" />
                                                <a href={story.generatedImage} download={`story-${story.id}.png`} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg hover:bg-black/80 transition-colors"><Download className="w-3 h-3 text-white" /></a>
                                              </>
                                            ) : (
                                              <div className="flex flex-col items-center gap-2">
                                                <ImageIcon className="w-6 h-6 text-white/15" />
                                                <Button size="sm" onClick={() => handleGenerateImage(weekIdx, story.id, story.visualDescription, "story")} disabled={story.isGeneratingImage} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white text-[10px] h-7 px-2">
                                                  {story.isGeneratingImage ? <RefreshCw className="w-3 h-3 animate-spin" /> : <><ImageIcon className="w-3 h-3 mr-1" /> Gerar</>}
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                          <div className="p-3 space-y-2 flex-1">
                                            <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-[10px] font-semibold uppercase">{story.type}</span>
                                            <p className="text-xs text-white/80 line-clamp-2">{story.mainText}</p>
                                            <p className="text-[10px] text-white/40 italic line-clamp-1">{story.callToAction}</p>
                                            <div className="flex items-center gap-1 pt-1">
                                              <Button variant="ghost" size="sm" onClick={() => toggleChecked(weekIdx, story.id, "story")} className={`h-6 p-0 px-1 text-[10px] ${story.checked ? "text-emerald-400 hover:text-emerald-300" : "text-white/30 hover:text-white"}`}>
                                                {story.checked ? <CheckCircle2 className="w-3 h-3 mr-0.5" /> : <Circle className="w-3 h-3 mr-0.5" />}{story.checked ? "✓" : "Conferir"}
                                              </Button>
                                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(story.mainText)} className="text-white/30 hover:text-white h-6 w-6 p-0"><Copy className="w-3 h-3" /></Button>
                                              <Button variant="ghost" size="sm" onClick={() => toggleFeedback(story.id)} className="text-white/30 hover:text-white h-6 p-0 px-1 text-[10px]"><Pencil className="w-3 h-3 mr-0.5" /> Editar</Button>
                                            </div>
                                            {feedbackItemId === story.id && (
                                              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                                                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Editar conteúdo</p>
                                                <Select value={story.type} onValueChange={(v) => updateItemField(weekIdx, story.id, "story", "type", v)}>
                                                  <SelectTrigger className="bg-white/[0.05] border-white/10 text-white text-[10px] h-7"><SelectValue /></SelectTrigger>
                                                  <SelectContent>
                                                    {["dica", "enquete", "bastidor", "CTA", "depoimento", "carrossel"].map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                                                  </SelectContent>
                                                </Select>
                                                <Input placeholder="Texto principal..." value={story.mainText} onChange={(e) => updateItemField(weekIdx, story.id, "story", "mainText", e.target.value)} className="bg-white/[0.05] border-white/10 text-white text-[10px] h-7" />
                                                <Input placeholder="Call to action..." value={story.callToAction} onChange={(e) => updateItemField(weekIdx, story.id, "story", "callToAction", e.target.value)} className="bg-white/[0.05] border-white/10 text-white text-[10px] h-7" />
                                                {story.generatedImage && (
                                                  <>
                                                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1 mt-1"><ImageIcon className="w-3 h-3" /> Refazer imagem</p>
                                                    <div className="flex gap-1.5">
                                                      <Input placeholder="Dica para refazer..." value={imageHint} onChange={(e) => setImageHint(e.target.value)} className="bg-white/[0.05] border-white/10 text-white text-[10px] flex-1 h-7" />
                                                      <Button size="sm" onClick={() => handleGenerateImage(weekIdx, story.id, story.visualDescription, "story", imageHint || undefined)} disabled={story.isGeneratingImage} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white h-7 w-7 p-0 shrink-0">
                                                        {story.isGeneratingImage ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                                      </Button>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </Card>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            })}
                          </Accordion>
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
