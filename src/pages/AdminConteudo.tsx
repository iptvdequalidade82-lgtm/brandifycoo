import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Instagram, Sparkles, Calendar, Copy, Download, RefreshCw, ImageIcon,
  Clock, Lightbulb, ChevronDown, ChevronUp,
} from "lucide-react";

type FeedPost = {
  id: string; day: string; time: string; title: string; caption: string;
  imageDescription: string; contentType: string; marketingTip: string;
  generatedImage?: string; isGeneratingImage?: boolean;
};

type Story = {
  id: string; day: string; type: string; mainText: string;
  visualDescription: string; callToAction: string;
  generatedImage?: string; isGeneratingImage?: boolean;
};

type WeekData = {
  weekNumber: number; niche: string; theme: string; strategy: string;
  feedPosts: FeedPost[]; stories: Story[];
};

type MonthPlan = {
  monthStrategy: string;
  weeks: WeekData[];
};

const NICHES = [
  "Clínicas médicas e consultórios",
  "Dentistas e odontologia",
  "Advogados e escritórios de advocacia",
  "Lojas de roupas e moda",
  "Restaurantes e delivery",
  "Salões de beleza e barbearias",
  "Academias e personal trainers",
  "Imobiliárias e corretores",
  "Contabilidade e finanças",
  "Petshops e veterinárias",
  "Autoescolas e despachantes",
  "Arquitetos e designers de interiores",
  "Fotógrafos e produtoras",
  "Educação e cursos online",
  "Tecnologia e startups",
];

const DAYS_ORDER = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const WEEK_LABELS = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];

export default function AdminConteudo() {
  const { toast } = useToast();
  const [weekNiches, setWeekNiches] = useState<string[]>(["", "", "", ""]);
  const [customNiches, setCustomNiches] = useState<string[]>(["", "", "", ""]);
  const [brandContext, setBrandContext] = useState("");
  const [monthPlan, setMonthPlan] = useState<MonthPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeWeek, setActiveWeek] = useState("1");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const setNicheForWeek = (weekIdx: number, value: string) => {
    setWeekNiches((prev) => { const n = [...prev]; n[weekIdx] = value; return n; });
  };
  const setCustomNicheForWeek = (weekIdx: number, value: string) => {
    setCustomNiches((prev) => { const n = [...prev]; n[weekIdx] = value; return n; });
  };

  const resolvedNiches = weekNiches.map((n, i) => n === "custom" ? customNiches[i] : n);
  const allFilled = resolvedNiches.every((n) => n.trim().length > 0);

  const handleGenerate = async () => {
    if (!allFilled) {
      toast({ title: "Selecione um nicho para cada semana", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setMonthPlan(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-instagram-content", {
        body: { niches: resolvedNiches, brandContext },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const plan = data.monthPlan || data;
      setMonthPlan(plan);
      setActiveWeek("1");
      toast({ title: "Planejamento mensal gerado! 🎉" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro ao gerar conteúdo", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async (weekIdx: number, itemId: string, description: string, type: "feed" | "story") => {
    const updateWeekItem = (updating: boolean, imageUrl?: string) => {
      setMonthPlan((prev) => {
        if (!prev) return prev;
        const weeks = [...prev.weeks];
        const week = { ...weeks[weekIdx] };
        const key = type === "feed" ? "feedPosts" : "stories";
        week[key] = (week[key] as any[]).map((i: any) =>
          i.id === itemId ? { ...i, isGeneratingImage: updating, ...(imageUrl ? { generatedImage: imageUrl } : {}) } : i
        );
        weeks[weekIdx] = week;
        return { ...prev, weeks };
      });
    };

    updateWeekItem(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-instagram-image", {
        body: { prompt: description, type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      updateWeekItem(false, data.imageUrl);
      toast({ title: "Imagem gerada! 🎨" });
    } catch (e: any) {
      updateWeekItem(false);
      toast({ title: "Erro ao gerar imagem", description: e.message, variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado! 📋" });
  };

  const currentWeek = monthPlan?.weeks?.find((w) => String(w.weekNumber) === activeWeek);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500">
            <Instagram className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Conteúdo Instagram</h1>
            <p className="text-sm text-white/40">Planejamento mensal — um nicho diferente por semana</p>
          </div>
        </div>

        {/* Generator Form */}
        <Card className="p-5 bg-white/[0.03] border-white/[0.06] space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WEEK_LABELS.map((label, idx) => (
              <div key={idx} className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">{label}</label>
                <Select value={weekNiches[idx]} onValueChange={(v) => setNicheForWeek(idx, v)}>
                  <SelectTrigger className="bg-white/[0.05] border-white/10 text-white">
                    <SelectValue placeholder="Selecione o nicho..." />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                    <SelectItem value="custom">✏️ Digitar outro nicho</SelectItem>
                  </SelectContent>
                </Select>
                {weekNiches[idx] === "custom" && (
                  <Input
                    placeholder="Ex: Pet shop premium..."
                    value={customNiches[idx]}
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
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Gerando planejamento mensal...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Gerar planejamento do mês</>
            )}
          </Button>
        </Card>

        {/* Results */}
        {monthPlan && (
          <div className="space-y-5">
            <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-white text-sm">Estratégia mensal</h3>
                  <p className="text-white/60 text-sm mt-1">{monthPlan.monthStrategy}</p>
                </div>
              </div>
            </Card>

            {/* Week selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {monthPlan.weeks?.map((week) => (
                <button
                  key={week.weekNumber}
                  onClick={() => setActiveWeek(String(week.weekNumber))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    String(week.weekNumber) === activeWeek
                      ? "bg-white/[0.08] border-purple-500/40 shadow-lg"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="text-[10px] text-white/40 font-semibold uppercase">Semana {week.weekNumber}</div>
                  <div className="text-sm text-white/90 font-medium mt-0.5 truncate">{week.niche}</div>
                  <div className="text-[11px] text-white/40 mt-0.5 truncate">{week.theme}</div>
                </button>
              ))}
            </div>

            {/* Current week content */}
            {currentWeek && (
              <div className="space-y-4">
                <Card className="p-3 bg-white/[0.02] border-white/[0.06]">
                  <p className="text-sm text-white/60">
                    <span className="text-white/80 font-medium">Nicho:</span> {currentWeek.niche} · <span className="text-white/80 font-medium">Foco:</span> {currentWeek.strategy}
                  </p>
                </Card>

                <Tabs defaultValue="feed" className="w-full">
                  <TabsList className="bg-white/[0.05] border border-white/10">
                    <TabsTrigger value="feed" className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white">
                      📸 Feed ({currentWeek.feedPosts?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="stories" className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white">
                      📱 Stories ({currentWeek.stories?.length || 0})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="feed" className="space-y-4 mt-4">
                    {currentWeek.feedPosts?.map((post) => {
                      const isExpanded = expandedPost === post.id;
                      const weekIdx = (currentWeek.weekNumber || 1) - 1;
                      return (
                        <Card key={post.id} className="bg-white/[0.03] border-white/[0.06] overflow-hidden">
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-semibold">
                                  <Calendar className="w-3 h-3 inline mr-1" />{post.day}
                                </div>
                                <div className="px-2.5 py-1 rounded-lg bg-white/[0.06] text-white/50 text-xs">
                                  <Clock className="w-3 h-3 inline mr-1" />{post.time}
                                </div>
                                <span className="text-xs text-white/30 uppercase">{post.contentType}</span>
                              </div>
                              <button onClick={() => setExpandedPost(isExpanded ? null : post.id)} className="text-white/40 hover:text-white">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                            <h3 className="font-bold text-white">{post.title}</h3>
                            {isExpanded && (
                              <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-white/50 uppercase">Legenda</span>
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(post.caption)} className="text-white/40 hover:text-white h-7 text-xs">
                                      <Copy className="w-3 h-3 mr-1" /> Copiar
                                    </Button>
                                  </div>
                                  <p className="text-sm text-white/70 whitespace-pre-wrap bg-white/[0.03] rounded-lg p-3">{post.caption}</p>
                                </div>
                                {post.marketingTip && (
                                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                    <p className="text-sm text-amber-200/80">{post.marketingTip}</p>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-white/50 uppercase">Arte do post</span>
                                    <Button variant="ghost" size="sm" onClick={() => handleGenerateImage(weekIdx, post.id, post.imageDescription, "feed")} disabled={post.isGeneratingImage} className="text-purple-300 hover:text-purple-200 h-7 text-xs">
                                      {post.isGeneratingImage ? <><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Gerando...</> : <><ImageIcon className="w-3 h-3 mr-1" /> {post.generatedImage ? "Regerar" : "Gerar imagem"}</>}
                                    </Button>
                                  </div>
                                  <p className="text-xs text-white/40 italic">{post.imageDescription}</p>
                                  {post.generatedImage && (
                                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                                      <img src={post.generatedImage} alt={post.title} className="w-full max-w-md aspect-square object-cover" />
                                      <a href={post.generatedImage} download={`feed-${post.id}.png`} className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg hover:bg-black/80 transition-colors">
                                        <Download className="w-4 h-4 text-white" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </TabsContent>

                  <TabsContent value="stories" className="space-y-3 mt-4">
                    {DAYS_ORDER.map((day) => {
                      const dayStories = currentWeek.stories?.filter((s) => s.day === day) || [];
                      if (dayStories.length === 0) return null;
                      const weekIdx = (currentWeek.weekNumber || 1) - 1;
                      return (
                        <div key={day} className="space-y-2">
                          <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider">{day}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {dayStories.map((story) => (
                              <Card key={story.id} className="p-3 bg-white/[0.03] border-white/[0.06] space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-[10px] font-semibold uppercase">{story.type}</span>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(story.mainText)} className="text-white/30 hover:text-white h-6 w-6 p-0">
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleGenerateImage(weekIdx, story.id, story.visualDescription, "story")} disabled={story.isGeneratingImage} className="text-white/30 hover:text-purple-300 h-6 w-6 p-0">
                                      {story.isGeneratingImage ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-white/80 font-medium">{story.mainText}</p>
                                <p className="text-xs text-white/40">{story.callToAction}</p>
                                {story.generatedImage && (
                                  <div className="relative rounded-lg overflow-hidden border border-white/10">
                                    <img src={story.generatedImage} alt={story.mainText} className="w-full aspect-[9/16] object-cover max-h-60" />
                                    <a href={story.generatedImage} download={`story-${story.id}.png`} className="absolute top-1 right-1 p-1.5 bg-black/60 rounded-md">
                                      <Download className="w-3 h-3 text-white" />
                                    </a>
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
