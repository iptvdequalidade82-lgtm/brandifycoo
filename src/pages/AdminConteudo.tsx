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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Instagram, Sparkles, Calendar, Copy, Download, RefreshCw, ImageIcon,
  Clock, Lightbulb, MessageSquare, Pencil, CheckCircle2, Circle,
  Lock, CalendarDays, Check, AlertTriangle, Loader2, Wand2, X, Upload,
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
  concluido: { label: "Concluído", color: "bg-white/15 text-white/80 border-white/20", icon: <Check className="w-3 h-3" /> },
  em_andamento: { label: "Em andamento", color: "bg-white/10 text-white/60 border-white/15", icon: <RefreshCw className="w-3 h-3" /> },
  aberto: { label: "Em aberto", color: "bg-white/5 text-white/30 border-white/10", icon: <Lock className="w-3 h-3" /> },
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
  const currentMonth = today.getMonth();
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
    const plan = existingPlans?.[monthKey];
    const hasPlan = plan && Object.keys(plan).length > 0;

    // If the plan has stored weekLabels, use those (they match the generated content)
    if (hasPlan && (plan as any).savedWeekLabels) {
      return {
        key: monthKey,
        label: MONTH_NAMES[i],
        shortLabel: MONTH_SHORT[i],
        status,
        monthIndex: i,
        year,
        weekLabels: (plan as any).savedWeekLabels as WeekLabel[],
      };
    }

    // If a plan EXISTS but has no savedWeekLabels, show from day 1 to display all content
    // Only use "today" when there's NO plan yet (for generation)
    let startFrom: Date;
    if (hasPlan) {
      startFrom = new Date(year, i, 1);
    } else if (status === "em_andamento") {
      startFrom = new Date(today);
    } else {
      startFrom = new Date(year, i, 1);
    }

    const weekLabels = status === "concluido" && !hasPlan
      ? []
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
  if (checked) return { label: "Conferido", color: "bg-white/15 text-white/80 border-white/20" };

  // Parse dateStr "DD/MM" into a Date
  const parts = dateStr.split("/");
  if (parts.length !== 2) return { label: "Pendente", color: "bg-white/10 text-white/50 border-white/15" };
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const itemDate = new Date(year, month, day);

  // Parse time "HH:MM"
  const timeParts = time?.split(":") || [];
  const itemHour = timeParts.length >= 2 ? parseInt(timeParts[0], 10) : 23;
  const itemMin = timeParts.length >= 2 ? parseInt(timeParts[1], 10) : 59;
  itemDate.setHours(itemHour, itemMin, 0, 0);

  const now = new Date();
  if (itemDate < now) return { label: "Atrasado", color: "bg-white/20 text-white/90 border-white/30" };
  return { label: "Pendente", color: "bg-white/10 text-white/50 border-white/15" };
}

/** Get overall day status from items */
function getDayStatus(dateStr: string, items: { time?: string; checked?: boolean }[], monthIndex: number, year: number): { label: string; color: string } {
  if (items.length === 0) return { label: "", color: "" };
  const allChecked = items.every((i) => i.checked);
  if (allChecked) return { label: "Conferido", color: "text-white/80" };

  const parts = dateStr.split("/");
  if (parts.length !== 2) return { label: "", color: "" };
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const dayDate = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayStart = new Date(dayDate);
  dayStart.setHours(0, 0, 0, 0);

  if (dayStart < today) return { label: "Atrasado", color: "text-white/60" };
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

  // Quick Post Generator state
  const [quickPostOpen, setQuickPostOpen] = useState(false);
  const [quickPostTemplate, setQuickPostTemplate] = useState("");
  const [quickPostInput, setQuickPostInput] = useState("");
  const [quickPostLoading, setQuickPostLoading] = useState(false);
  const [quickPostResult, setQuickPostResult] = useState<{ title: string; caption: string; imageDescription: string; marketingTip: string } | null>(null);
  const [quickPostImageUrl, setQuickPostImageUrl] = useState<string | null>(null);
  const [quickPostImageLoading, setQuickPostImageLoading] = useState(false);
  const [quickPostError, setQuickPostError] = useState<string | null>(null);
  const [quickPostRefImage, setQuickPostRefImage] = useState<string | null>(null);
  const [quickPostFormat, setQuickPostFormat] = useState<"feed" | "stories">("feed");
  const refImageInputRef = useRef<HTMLInputElement>(null);

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
              // Clean up any stuck isGeneratingImage flags from previous sessions
              const plan = row.month_plan as MonthPlan;
              if (plan.weeks) {
                for (const week of plan.weeks) {
                  if (week.feedPosts) week.feedPosts = week.feedPosts.map((p: any) => ({ ...p, isGeneratingImage: false }));
                  if (week.stories) week.stories = week.stories.map((s: any) => ({ ...s, isGeneratingImage: false }));
                }
              }
              plans[row.month_key] = plan;
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
      // Save the weekLabels with the plan so dates are preserved across reloads
      plan.savedWeekLabels = currentMonthConfig.weekLabels;
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
      // Use raw fetch with longer timeout (120s) since image generation can take 60+ seconds
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(`${supabaseUrl}/functions/v1/generate-instagram-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${session?.access_token || supabaseKey}`,
        },
        body: JSON.stringify({ prompt: fullPrompt, type }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Erro ${res.status}`);
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

  const QUICK_TEMPLATES = [
    { emoji: "📢", label: "Anúncio", placeholder: "Ex: Anunciar nosso novo serviço de criação de landing pages com 30% de desconto" },
    { emoji: "🔥", label: "Promoção", placeholder: "Ex: Promoção relâmpago — sites profissionais por R$497 até sexta" },
    { emoji: "📖", label: "Storytelling", placeholder: "Ex: Contar como ajudamos a clínica XYZ a triplicar os agendamentos online" },
    { emoji: "🎓", label: "Educativo", placeholder: "Ex: 5 erros que donos de restaurante cometem no Instagram" },
    { emoji: "⭐", label: "Prova social", placeholder: "Ex: Depoimento do cliente João sobre o resultado do novo site" },
    { emoji: "🚀", label: "Lançamento", placeholder: "Ex: Lançar o pacote premium de e-commerce com catálogo inteligente" },
    { emoji: "📅", label: "Data comemorativa", placeholder: "Ex: Post especial para o Dia do Empreendedor" },
    { emoji: "💬", label: "Engajamento", placeholder: "Ex: Enquete sobre qual tipo de site os seguidores mais precisam" },
  ];

  const handleQuickPost = async () => {
    if (!quickPostInput.trim()) {
      toast({ title: "Descreva o que deseja criar", variant: "destructive" });
      return;
    }

    if (quickPostLoading) return;

    const previousResult = quickPostResult;
    setQuickPostLoading(true);
    setQuickPostError(null);
    setQuickPostImageUrl(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const session = (await supabase.auth.getSession()).data.session;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);

      // Anti-repetition: if regenerating, include previous content as negative reference
      const antiRepetition = previousResult?.caption
        ? `\n\nIMPORTANTE — REFAZENDO: O conteúdo anterior foi:\nTítulo: "${previousResult.title}"\nLegenda: "${previousResult.caption.slice(0, 300)}"\n\nCrie uma versão COMPLETAMENTE DIFERENTE com outro tom, ângulo e estrutura. NÃO repita frases anteriores.`
        : "";

      const res = await fetch(`${supabaseUrl}/functions/v1/generate-instagram-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${session?.access_token || supabaseKey}`,
        },
        body: JSON.stringify({
          niches: [quickPostInput],
          brandContext: `MODO POST AVULSO — Tipo: ${quickPostTemplate}. Gere APENAS 1 post de feed (NÃO gere stories, NÃO gere planejamento semanal). Retorne JSON com monthPlan.weeks contendo 1 semana com 1 feedPost e stories vazio.${antiRepetition}`,
          monthLabel: "Post avulso",
          weeksConfig: [{ label: "Post", range: "", days: ["Hoje"] }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) throw new Error("Limite de requisições excedido. Aguarde um momento.");
        if (res.status === 402) throw new Error("Créditos de IA insuficientes.");
        throw new Error((data as any)?.error || `Erro ${res.status}`);
      }
      if ((data as any)?.error) throw new Error((data as any).error);

      const plan = (data as any)?.monthPlan || data;
      const post =
        (plan as any)?.weeks?.flatMap((week: any) => week?.feedPosts || [])?.[0] ||
        (plan as any)?.feedPosts?.[0] ||
        (data as any)?.post;

      if (!post) {
        throw new Error("Não consegui extrair o post da resposta da IA.");
      }

      setQuickPostResult({
        title: post.title || "",
        caption: post.caption || "",
        imageDescription: post.imageDescription || "",
        marketingTip: post.marketingTip || "",
      });
    } catch (e: any) {
      const message = e?.name === "AbortError"
        ? "A geração demorou demais. Tente novamente."
        : (e?.message || "Falha ao gerar o post.");
      setQuickPostError(message);
      toast({ title: "Erro ao gerar post", description: message, variant: "destructive" });
    } finally {
      setQuickPostLoading(false);
    }
  };

  const handleQuickPostImage = async () => {
    if (!quickPostResult?.imageDescription) {
      toast({ title: "Gere a copy primeiro", variant: "destructive" });
      return;
    }

    if (quickPostImageLoading) return;

    setQuickPostImageLoading(true);
    setQuickPostError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const session = (await supabase.auth.getSession()).data.session;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);

      const res = await fetch(`${supabaseUrl}/functions/v1/generate-instagram-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${session?.access_token || supabaseKey}`,
        },
        body: JSON.stringify({
          prompt: quickPostResult.imageDescription,
          type: quickPostFormat,
          ...(quickPostRefImage ? { referenceImage: quickPostRefImage } : {}),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) throw new Error("Limite de requisições excedido. Aguarde um momento.");
        if (res.status === 402) throw new Error("Créditos de IA insuficientes.");
        throw new Error((data as any)?.error || `Erro ${res.status}`);
      }
      if ((data as any)?.error) throw new Error((data as any).error);
      if (!(data as any)?.imageUrl) throw new Error("A imagem não foi retornada pela IA.");

      setQuickPostImageUrl((data as any).imageUrl);
      toast({ title: "Imagem gerada! 🎨" });
    } catch (e: any) {
      const message = e?.name === "AbortError"
        ? "A geração da imagem demorou demais. Tente novamente."
        : (e?.message || "Falha ao gerar imagem.");
      setQuickPostError(message);
      toast({ title: "Erro ao gerar imagem", description: message, variant: "destructive" });
    } finally {
      setQuickPostImageLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 shadow-lg shadow-white/5">
              <Instagram className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight">Conteúdo Instagram</h1>
              <p className="text-xs md:text-sm text-white/40 mt-0.5">Planejamento anual 2026 · IA Premium</p>
            </div>
          </div>
          {isGenerating && (
            <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 animate-pulse">
              <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
              <span className="text-xs text-white/60">Gerando...</span>
            </div>
          )}
        </div>

        {/* Quick Action Templates — Premium style */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5" /> Atalhos rápidos
            </p>
            <span className="text-[10px] text-white/20">Crie posts avulsos em segundos</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {QUICK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => {
                  setQuickPostTemplate(tpl.label);
                  setQuickPostInput("");
                  setQuickPostResult(null);
                  setQuickPostImageUrl(null);
                  setQuickPostError(null);
                  setQuickPostRefImage(null);
                  setQuickPostFormat("feed");
                  setQuickPostOpen(true);
                }}
                className="group flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] text-white/50 hover:text-white text-xs font-medium transition-all hover:shadow-lg hover:shadow-white/5 hover:-translate-y-0.5"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{tpl.emoji}</span>
                <span className="text-[11px]">{tpl.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Navigation — Premium Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5 md:gap-2">
          {months.map((month) => {
            const sc = STATUS_CONFIG[month.status];
            const isActive = month.key === activeMonth;
            const hasPlan = !!monthPlans[month.key];
            return (
              <button
                key={month.key}
                onClick={() => { setActiveMonth(month.key); setActiveWeek("1"); setFeedbackItemId(null); }}
                className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all text-center ${
                  isActive
                    ? "bg-white/12 border-white/25 ring-1 ring-white/20 shadow-lg shadow-white/5"
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]"
                }`}
              >
                <span className={`text-xs font-bold ${isActive ? "text-white" : "text-white/60"}`}>{month.shortLabel}</span>
                <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full border ${sc.color}`}>
                  {sc.icon}
                </span>
                {hasPlan && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white/40" />
                )}
              </button>
            );
          })}
        </div>

        {/* Current Month Content */}
        <Card className="p-3 md:p-5 bg-white/[0.02] border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-white/60" />
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
            <div className="mb-4 p-3 rounded-lg bg-white/[0.04] border border-white/[0.08]">
              <p className="text-xs text-white/50 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {currentMonthConfig.weekLabels.length} semana{currentMonthConfig.weekLabels.length > 1 ? "s" : ""} · {currentMonthConfig.weekLabels[0]?.range.split(" – ")[0]} a {currentMonthConfig.weekLabels[currentMonthConfig.weekLabels.length - 1]?.range.split(" – ")[1]} · Atualizado para hoje
              </p>
            </div>
          )}

          {/* Completed month with no plan */}
          {currentMonthConfig.status === "concluido" && !currentPlan && (
            <div className="text-center py-10">
              <CheckCircle2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
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
                  <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-white/60" /> Gerar planejamento de {currentMonthConfig.label}</span>
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
                      className="w-full md:w-auto bg-white text-black hover:bg-white/90 font-semibold py-5 shadow-lg shadow-white/10 transition-all hover:shadow-white/20"
                    >
                      {isGenerating ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando planejamento com IA...</>
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
              <Card className="p-4 bg-white/[0.04] border-white/[0.08]">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-white/60 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white text-sm">Estratégia de {currentMonthConfig.label}</h3>
                    <p className="text-white/60 text-sm mt-1.5 leading-relaxed">{currentPlan.monthStrategy}</p>
                  </div>
                </div>
              </Card>

              <Tabs value={activeWeek} onValueChange={setActiveWeek} className="w-full">
                <TabsList className="bg-white/[0.05] border border-white/10 h-auto p-1 flex-wrap w-full">
                  {currentPlan.weeks?.map((week, idx) => {
                    const wl = currentMonthConfig.weekLabels[idx];
                    return (
                      <TabsTrigger key={idx} value={String(idx + 1)} className="data-[state=active]:bg-white/10 text-white/50 data-[state=active]:text-white px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm flex-1 min-w-0">
                        <span className="truncate">{wl?.label || `Sem. ${week.weekNumber}`}</span>
                        {wl?.range && <span className="text-white/30 ml-1 text-[9px] md:text-[10px] hidden sm:inline">{wl.range}</span>}
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
                        <TabsList className="bg-white/[0.05] border border-white/10 w-full">
                          <TabsTrigger value="feed" className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white flex-1 text-xs md:text-sm">📸 Feed ({week.feedPosts?.length || 0})</TabsTrigger>
                          <TabsTrigger value="stories" className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white flex-1 text-xs md:text-sm">📱 Stories ({week.stories?.length || 0})</TabsTrigger>
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
                                        <Card key={post.id} className={`border-white/[0.06] overflow-hidden transition-colors ${post.checked ? "bg-white/[0.06] border-white/[0.15]" : "bg-white/[0.03]"}`}>
                                          <div className="flex flex-col sm:flex-row">
                                            <div className="sm:w-44 md:w-56 shrink-0 bg-white/[0.02] flex items-center justify-center relative min-h-[140px] md:min-h-[180px]">
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
                                                  <Button size="sm" onClick={() => handleGenerateImage(weekIdx, post.id, post.imageDescription, "feed")} disabled={post.isGeneratingImage} className="bg-white text-black hover:bg-white/90 text-xs">
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
                                                 <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                                                   <Lightbulb className="w-3.5 h-3.5 text-white/50 mt-0.5 shrink-0" />
                                                   <p className="text-xs text-white/50 line-clamp-2">{post.marketingTip}</p>
                                                </div>
                                              )}
                                              <div className="flex items-center gap-1 md:gap-2 pt-1 flex-wrap">
                                                <Button variant="ghost" size="sm" onClick={() => toggleChecked(weekIdx, post.id, "feed")} className={`h-7 text-[11px] md:text-xs ${post.checked ? "text-white/80 hover:text-white" : "text-white/40 hover:text-white"}`}>
                                                  {post.checked ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <Circle className="w-3.5 h-3.5 mr-1" />}{post.checked ? "Conferido ✓" : "Conferir"}
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(post.caption)} className="text-white/40 hover:text-white h-7 text-[11px] md:text-xs"><Copy className="w-3 h-3 mr-1" /> Copiar</Button>
                                                <Button variant="ghost" size="sm" onClick={() => toggleFeedback(post.id)} className="text-white/30 hover:text-white h-7 text-[11px] md:text-xs"><Pencil className="w-3 h-3 mr-0.5" /> Editar</Button>
                                              </div>
                                              {feedbackItemId === post.id && (
                                                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                                                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Editar conteúdo</p>
                                                  <Input placeholder="Título do post..." value={post.title} onChange={(e) => updateItemField(weekIdx, post.id, "feed", "title", e.target.value)} className="bg-white/[0.05] border-white/10 text-white text-[10px] h-7" />
                                                  <Textarea placeholder="Legenda..." value={post.caption} onChange={(e) => updateItemField(weekIdx, post.id, "feed", "caption", e.target.value)} className="bg-white/[0.05] border-white/10 text-white text-[10px] min-h-[60px] resize-none" />
                                                  {post.generatedImage && (
                                                    <>
                                                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1 mt-1"><ImageIcon className="w-3 h-3" /> Refazer imagem</p>
                                                      <div className="flex gap-2">
                                                        <Input placeholder="Ex: mais colorido, fundo azul..." value={imageHint} onChange={(e) => setImageHint(e.target.value)} className="bg-white/[0.05] border-white/10 text-white text-xs flex-1 h-9" />
                                                        <Button size="sm" onClick={() => handleGenerateImage(weekIdx, post.id, post.imageDescription, "feed", imageHint || undefined)} disabled={post.isGeneratingImage} className="bg-white text-black hover:bg-white/90 h-9 px-3 shrink-0 text-xs gap-1.5">
                                                          {post.isGeneratingImage ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Gerando...</> : <><RefreshCw className="w-3.5 h-3.5" /> Refazer</>}
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-1">
                                      {dayStories.map((story) => (
                                        <Card key={story.id} className={`border-white/[0.06] overflow-hidden flex flex-col transition-colors ${story.checked ? "bg-white/[0.06] border-white/[0.15]" : "bg-white/[0.03]"}`}>
                                          <div className="aspect-[9/16] max-h-52 bg-white/[0.02] flex items-center justify-center relative">
                                            {story.generatedImage ? (
                                              <>
                                                <img src={story.generatedImage} alt={story.mainText} className="w-full h-full object-cover" />
                                                <a href={story.generatedImage} download={`story-${story.id}.png`} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg hover:bg-black/80 transition-colors"><Download className="w-3 h-3 text-white" /></a>
                                              </>
                                            ) : (
                                              <div className="flex flex-col items-center gap-2">
                                                <ImageIcon className="w-6 h-6 text-white/15" />
                                                <Button size="sm" onClick={() => handleGenerateImage(weekIdx, story.id, story.visualDescription, "story")} disabled={story.isGeneratingImage} className="bg-white text-black hover:bg-white/90 text-[10px] h-7 px-2">
                                                  {story.isGeneratingImage ? <><RefreshCw className="w-3 h-3 animate-spin mr-1" /> Gerando...</> : <><ImageIcon className="w-3 h-3 mr-1" /> Gerar</>}
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                          <div className="p-3 space-y-2 flex-1">
                                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/60 text-[10px] font-semibold uppercase">{story.type}</span>
                                            <p className="text-xs text-white/80 line-clamp-2">{story.mainText}</p>
                                            <p className="text-[10px] text-white/40 italic line-clamp-1">{story.callToAction}</p>
                                            <div className="flex items-center gap-1 pt-1">
                                              <Button variant="ghost" size="sm" onClick={() => toggleChecked(weekIdx, story.id, "story")} className={`h-6 p-0 px-1 text-[10px] ${story.checked ? "text-white/80 hover:text-white" : "text-white/30 hover:text-white"}`}>
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
                                                    <div className="flex gap-2">
                                                      <Input placeholder="Ex: mais colorido, fundo azul..." value={imageHint} onChange={(e) => setImageHint(e.target.value)} className="bg-white/[0.05] border-white/10 text-white text-xs flex-1 h-9" />
                                                      <Button size="sm" onClick={() => handleGenerateImage(weekIdx, story.id, story.visualDescription, "story", imageHint || undefined)} disabled={story.isGeneratingImage} className="bg-white text-black hover:bg-white/90 h-9 px-3 shrink-0 text-xs gap-1.5">
                                                        {story.isGeneratingImage ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Gerando...</> : <><RefreshCw className="w-3.5 h-3.5" /> Refazer</>}
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

      {/* Quick Post Generator Dialog */}
      <Dialog open={quickPostOpen} onOpenChange={(open) => { if (!quickPostLoading && !quickPostImageLoading) setQuickPostOpen(open); }}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => { if (quickPostLoading || quickPostImageLoading) e.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-white/60" />
              Criar post: {quickPostTemplate}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <p className="text-xs text-white/40 mb-2">Descreva o que você quer postar:</p>
              <Textarea
                value={quickPostInput}
                onChange={(e) => setQuickPostInput(e.target.value)}
                placeholder={QUICK_TEMPLATES.find(t => t.label === quickPostTemplate)?.placeholder || "Descreva o post que deseja criar..."}
                className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/20 min-h-[80px] resize-none"
              />
            </div>

            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void handleQuickPost();
              }}
              disabled={quickPostLoading || !quickPostInput.trim()}
              className="w-full bg-white text-black hover:bg-white/90 font-semibold"
            >
              {quickPostLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Gerando post...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Gerar copy do post</>
              )}
            </Button>

            {quickPostResult && (
              <>
                {/* Format selector */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Formato</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickPostFormat("feed")}
                      className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                        quickPostFormat === "feed"
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white/70"
                      }`}
                    >
                      <span className="text-lg">📐</span>
                      <span>Feed</span>
                      <span className="text-[9px] text-white/30">1080 × 1080</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickPostFormat("stories")}
                      className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                        quickPostFormat === "stories"
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white/70"
                      }`}
                    >
                      <span className="text-lg">📱</span>
                      <span>Stories</span>
                      <span className="text-[9px] text-white/30">1080 × 1920</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button type="button" variant="outline" onClick={() => void handleQuickPost()} disabled={quickPostLoading} className="border-white/10 text-white/80 hover:bg-white/10 hover:text-white">
                  <RefreshCw className="w-4 h-4 mr-2" /> Refazer copy
                </Button>
                <Button type="button" onClick={() => void handleQuickPostImage()} disabled={quickPostImageLoading} className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90">
                  {quickPostImageLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando imagem...</> : <><ImageIcon className="w-4 h-4 mr-2" /> Gerar imagem ({quickPostFormat === "feed" ? "Feed" : "Stories"})</>}
                </Button>
                <Button type="button" variant="outline" onClick={() => { navigator.clipboard.writeText(quickPostResult.caption); toast({ title: "Legenda copiada! 📋" }); }} className="border-white/10 text-white/80 hover:bg-white/10 hover:text-white">
                  <Copy className="w-4 h-4 mr-2" /> Copiar legenda
                </Button>
              </div>
              </>
            )}

            {quickPostError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                {quickPostError}
              </div>
            )}

            {quickPostResult && (
              <div className="space-y-4 pt-2 border-t border-white/[0.06]">
                {/* Title - editable */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Título</p>
                  <input
                    type="text"
                    value={quickPostResult.title}
                    onChange={(e) => setQuickPostResult({ ...quickPostResult, title: e.target.value })}
                    className="w-full text-sm font-semibold text-white bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 focus:outline-none focus:border-white/20"
                  />
                </div>

                {/* Caption - editable */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] uppercase tracking-wider text-white/30">Legenda</p>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(quickPostResult.caption); toast({ title: "Legenda copiada! 📋" }); }} className="text-white/30 hover:text-white transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={quickPostResult.caption}
                    onChange={(e) => setQuickPostResult({ ...quickPostResult, caption: e.target.value })}
                    rows={5}
                    className="w-full text-xs text-white/70 whitespace-pre-wrap leading-relaxed bg-white/[0.03] rounded-lg p-3 border border-white/[0.06] focus:outline-none focus:border-white/20 resize-y"
                  />
                </div>

                {/* Image Description - editable */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] uppercase tracking-wider text-white/30">Descrição da arte</p>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(quickPostResult.imageDescription); toast({ title: "Descrição copiada! 📋" }); }} className="text-white/30 hover:text-white transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={quickPostResult.imageDescription}
                    onChange={(e) => setQuickPostResult({ ...quickPostResult, imageDescription: e.target.value })}
                    rows={3}
                    className="w-full text-xs text-white/50 italic bg-white/[0.02] rounded-lg p-3 border border-white/[0.04] focus:outline-none focus:border-white/20 resize-y"
                  />
                </div>

                {/* Reference image upload */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Imagem de referência (opcional)</p>
                  <input
                    ref={refImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 10 * 1024 * 1024) {
                        toast({ title: "Imagem muito grande (max 10MB)", variant: "destructive" });
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => setQuickPostRefImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                  {quickPostRefImage ? (
                    <div className="relative">
                      <img src={quickPostRefImage} alt="Referência" className="w-full max-h-40 object-contain rounded-lg border border-white/[0.08]" />
                      <button
                        type="button"
                        onClick={() => { setQuickPostRefImage(null); if (refImageInputRef.current) refImageInputRef.current.value = ""; }}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => refImageInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white/70 bg-white/[0.02] hover:bg-white/[0.06] border border-dashed border-white/[0.08] hover:border-white/20 rounded-lg py-3 transition-colors"
                    >
                      <Upload className="w-4 h-4" /> Enviar imagem como referência para a IA
                    </button>
                  )}
                  <p className="text-[9px] text-white/20 mt-1">A IA usará essa imagem como base visual para criar o post.</p>
                </div>

                {quickPostImageUrl && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] uppercase tracking-wider text-white/30">Prévia da imagem</p>
                      <a
                        href={quickPostImageUrl}
                        download={`post-${quickPostResult.title?.replace(/\s+/g, '-').toLowerCase() || 'avulso'}.png`}
                        className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors bg-white/[0.06] hover:bg-white/[0.12] px-2.5 py-1 rounded-md"
                      >
                        <Download className="w-3.5 h-3.5" /> Baixar
                      </a>
                    </div>
                    <img
                      src={quickPostImageUrl}
                      alt="Prévia do post avulso gerado"
                      loading="lazy"
                      className="w-full rounded-lg border border-white/[0.08]"
                    />
                  </div>
                )}

                {/* Marketing Tip */}
                {quickPostResult.marketingTip && (
                 <div className="flex items-start gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg p-3">
                    <Lightbulb className="w-3.5 h-3.5 text-white/50 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-300/70">{quickPostResult.marketingTip}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
