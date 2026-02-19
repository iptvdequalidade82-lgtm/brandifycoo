import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Instagram, Sparkles, Calendar, Copy, Download, RefreshCw, ImageIcon,
  Clock, Lightbulb, MessageSquare, Pencil,
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
  const [feedbackItemId, setFeedbackItemId] = useState<string | null>(null);
  const [imageHint, setImageHint] = useState("");

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

  const handleGenerateImage = async (weekIdx: number, itemId: string, description: string, type: "feed" | "story", hint?: string) => {
    const fullPrompt = hint ? `${description}. OBSERVAÇÃO DO USUÁRIO: ${hint}` : description;

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
        body: { prompt: fullPrompt, type },
      });
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado! 📋" });
  };

  const currentWeek = monthPlan?.weeks?.find((w) => String(w.weekNumber) === activeWeek);
  const currentWeekIdx = currentWeek ? (currentWeek.weekNumber || 1) - 1 : 0;

  const toggleFeedback = (id: string) => {
    if (feedbackItemId === id) {
      setFeedbackItemId(null);
      setImageHint("");
    } else {
      setFeedbackItemId(id);
      setImageHint("");
    }
  };

  // Update any field on a feed post or story
  const updateItemField = (weekIdx: number, itemId: string, type: "feed" | "story", field: string, value: string) => {
    setMonthPlan((prev) => {
      if (!prev) return prev;
      const weeks = [...prev.weeks];
      const week = { ...weeks[weekIdx] };
      const key = type === "feed" ? "feedPosts" : "stories";
      week[key] = (week[key] as any[]).map((i: any) =>
        i.id === itemId ? { ...i, [field]: value } : i
      );
      weeks[weekIdx] = week;
      return { ...prev, weeks };
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500">
            <Instagram className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Conteúdo Instagram</h1>
            <p className="text-sm text-white/40 mt-0.5">Planejamento mensal — um nicho diferente por semana</p>
          </div>
        </div>

        {/* Generator Form */}
        <Card className="p-6 bg-white/[0.03] border-white/[0.06] space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
          <div className="space-y-6">
            {/* Strategy banner */}
            <Card className="p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-white text-sm">Estratégia mensal</h3>
                  <p className="text-white/60 text-sm mt-1.5 leading-relaxed">{monthPlan.monthStrategy}</p>
                </div>
              </div>
            </Card>

            {/* Week tabs */}
            <Tabs value={activeWeek} onValueChange={setActiveWeek} className="w-full">
              <TabsList className="bg-white/[0.05] border border-white/10 h-auto p-1 flex-wrap">
                {monthPlan.weeks?.map((week) => (
                  <TabsTrigger
                    key={week.weekNumber}
                    value={String(week.weekNumber)}
                    className="data-[state=active]:bg-white/10 text-white/50 data-[state=active]:text-white px-4 py-2"
                  >
                    Semana {week.weekNumber}
                  </TabsTrigger>
                ))}
              </TabsList>

              {monthPlan.weeks?.map((week) => (
                <TabsContent key={week.weekNumber} value={String(week.weekNumber)} className="mt-5 space-y-5">
                  {/* Week info */}
                  <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <p className="text-sm text-white/60">
                      <span className="text-white/80 font-medium">Nicho:</span> {week.niche} · <span className="text-white/80 font-medium">Foco:</span> {week.strategy}
                    </p>
                  </Card>

                  {/* Feed / Stories sub-tabs */}
                  <Tabs defaultValue="feed" className="w-full">
                    <TabsList className="bg-white/[0.05] border border-white/10">
                      <TabsTrigger value="feed" className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white">
                        📸 Feed ({week.feedPosts?.length || 0})
                      </TabsTrigger>
                      <TabsTrigger value="stories" className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white">
                        📱 Stories ({week.stories?.length || 0})
                      </TabsTrigger>
                    </TabsList>

                    {/* ===== FEED ===== */}
                    <TabsContent value="feed" className="mt-5">
                      <Accordion type="multiple" className="space-y-2">
                        {DAYS_ORDER.map((day) => {
                          const dayPosts = week.feedPosts?.filter((p) => p.day === day) || [];
                          if (dayPosts.length === 0) return null;
                          return (
                            <AccordionItem key={day} value={`feed-${day}`} className="border-white/[0.06] bg-white/[0.02] rounded-lg px-4 border">
                              <AccordionTrigger className="text-xs font-bold text-white/60 uppercase tracking-widest hover:no-underline py-3">
                                <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {day}</span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-3 pb-1">
                                  {dayPosts.map((post) => (
                                    <Card key={post.id} className="bg-white/[0.03] border-white/[0.06] overflow-hidden">
                                      <div className="flex flex-col md:flex-row">
                                        {/* Image side */}
                                        <div className="md:w-56 shrink-0 bg-white/[0.02] flex items-center justify-center relative min-h-[180px]">
                                          {post.generatedImage ? (
                                            <>
                                              <img src={post.generatedImage} alt={post.title} className="w-full h-full object-cover aspect-square" />
                                              <a href={post.generatedImage} download={`feed-${post.id}.png`} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg hover:bg-black/80 transition-colors">
                                                <Download className="w-3.5 h-3.5 text-white" />
                                              </a>
                                            </>
                                          ) : (
                                            <div className="flex flex-col items-center gap-3 p-4">
                                              <ImageIcon className="w-8 h-8 text-white/15" />
                                              <Button
                                                size="sm"
                                                onClick={() => handleGenerateImage(week.weekNumber - 1, post.id, post.imageDescription, "feed")}
                                                disabled={post.isGeneratingImage}
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white text-xs"
                                              >
                                                {post.isGeneratingImage ? (
                                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                  <><ImageIcon className="w-3.5 h-3.5 mr-1" /> Gerar imagem</>
                                                )}
                                              </Button>
                                            </div>
                                          )}
                                        </div>

                                        {/* Content side */}
                                        <div className="flex-1 p-4 space-y-3">
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <h3 className="font-semibold text-white text-sm">{post.title}</h3>
                                              <span className="text-[10px] text-white/30 uppercase bg-white/[0.06] px-1.5 py-0.5 rounded">{post.contentType}</span>
                                            </div>
                                            <span className="text-xs text-white/40 shrink-0 flex items-center gap-1">
                                              <Clock className="w-3 h-3" /> {post.time}
                                            </span>
                                          </div>

                                          <p className="text-xs text-white/60 leading-relaxed line-clamp-3">{post.caption}</p>

                                          {post.marketingTip && (
                                            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                              <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                                              <p className="text-xs text-amber-200/80 line-clamp-2">{post.marketingTip}</p>
                                            </div>
                                          )}

                                          {/* Action buttons */}
                                          <div className="flex items-center gap-2 pt-1">
                                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(post.caption)} className="text-white/40 hover:text-white h-7 text-xs">
                                              <Copy className="w-3 h-3 mr-1" /> Copiar legenda
                                            </Button>
                                            {post.generatedImage && (
                                              <Button variant="ghost" size="sm" onClick={() => toggleFeedback(post.id)} className="text-white/40 hover:text-white h-7 text-xs">
                                                <MessageSquare className="w-3 h-3 mr-1" /> {feedbackItemId === post.id ? "Fechar" : "Refazer com dica"}
                                              </Button>
                                            )}
                                          </div>

                                          {/* Feedback to redo image */}
                                          {post.generatedImage && feedbackItemId === post.id && (
                                            <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                                              <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1"><Pencil className="w-3 h-3" /> Editar conteúdo</p>
                                              <Input
                                                placeholder="Título do post..."
                                                value={post.title}
                                                onChange={(e) => updateItemField(week.weekNumber - 1, post.id, "feed", "title", e.target.value)}
                                                className="bg-white/[0.05] border-white/10 text-white text-xs h-8"
                                              />
                                              <Textarea
                                                placeholder="Legenda..."
                                                value={post.caption}
                                                onChange={(e) => updateItemField(week.weekNumber - 1, post.id, "feed", "caption", e.target.value)}
                                                className="bg-white/[0.05] border-white/10 text-white text-xs min-h-[60px] resize-none"
                                              />
                                              <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1 mt-2"><ImageIcon className="w-3 h-3" /> Refazer imagem com dica</p>
                                              <div className="flex gap-2">
                                                <Input
                                                  placeholder="Ex: Mais minimalista, tons escuros, incluir logo..."
                                                  value={imageHint}
                                                  onChange={(e) => setImageHint(e.target.value)}
                                                  className="bg-white/[0.05] border-white/10 text-white text-xs flex-1 h-8"
                                                />
                                                <Button
                                                  size="sm"
                                                  onClick={() => handleGenerateImage(week.weekNumber - 1, post.id, post.imageDescription, "feed", imageHint || undefined)}
                                                  disabled={post.isGeneratingImage}
                                                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white text-xs h-8 shrink-0"
                                                >
                                                  {post.isGeneratingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><RefreshCw className="w-3.5 h-3.5 mr-1" /> Refazer</>}
                                                </Button>
                                              </div>
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

                    {/* ===== STORIES ===== */}
                    <TabsContent value="stories" className="mt-5">
                      <Accordion type="multiple" className="space-y-2">
                        {DAYS_ORDER.map((day) => {
                          const dayStories = week.stories?.filter((s) => s.day === day) || [];
                          if (dayStories.length === 0) return null;
                          return (
                            <AccordionItem key={day} value={`story-${day}`} className="border-white/[0.06] bg-white/[0.02] rounded-lg px-4 border">
                              <AccordionTrigger className="text-xs font-bold text-white/60 uppercase tracking-widest hover:no-underline py-3">
                                <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {day} ({dayStories.length} stories)</span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-1">
                                  {dayStories.map((story) => (
                                    <Card key={story.id} className="bg-white/[0.03] border-white/[0.06] overflow-hidden flex flex-col">
                                      {/* Image area */}
                                      <div className="aspect-[9/16] max-h-52 bg-white/[0.02] flex items-center justify-center relative">
                                        {story.generatedImage ? (
                                          <>
                                            <img src={story.generatedImage} alt={story.mainText} className="w-full h-full object-cover" />
                                            <a href={story.generatedImage} download={`story-${story.id}.png`} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg hover:bg-black/80 transition-colors">
                                              <Download className="w-3 h-3 text-white" />
                                            </a>
                                          </>
                                        ) : (
                                          <div className="flex flex-col items-center gap-2">
                                            <ImageIcon className="w-6 h-6 text-white/15" />
                                            <Button
                                              size="sm"
                                              onClick={() => handleGenerateImage(week.weekNumber - 1, story.id, story.visualDescription, "story")}
                                              disabled={story.isGeneratingImage}
                                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white text-[10px] h-7 px-2"
                                            >
                                              {story.isGeneratingImage ? <RefreshCw className="w-3 h-3 animate-spin" /> : <><ImageIcon className="w-3 h-3 mr-1" /> Gerar</>}
                                            </Button>
                                          </div>
                                        )}
                                      </div>

                                      {/* Content */}
                                      <div className="p-3 space-y-2 flex-1">
                                        <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-[10px] font-semibold uppercase">{story.type}</span>
                                        <p className="text-xs text-white/80 line-clamp-2">{story.mainText}</p>
                                        <p className="text-[10px] text-white/40 italic line-clamp-1">{story.callToAction}</p>

                                        <div className="flex items-center gap-1 pt-1">
                                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(story.mainText)} className="text-white/30 hover:text-white h-6 w-6 p-0">
                                            <Copy className="w-3 h-3" />
                                          </Button>
                                          <Button variant="ghost" size="sm" onClick={() => toggleFeedback(story.id)} className="text-white/30 hover:text-white h-6 p-0 px-1 text-[10px]">
                                            <Pencil className="w-3 h-3 mr-0.5" /> Editar
                                          </Button>
                                        </div>

                                        {/* Feedback + edit content */}
                                        {feedbackItemId === story.id && (
                                          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                                            <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Editar conteúdo</p>
                                            <Select value={story.type} onValueChange={(v) => updateItemField(week.weekNumber - 1, story.id, "story", "type", v)}>
                                              <SelectTrigger className="bg-white/[0.05] border-white/10 text-white text-[10px] h-7">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {["dica", "enquete", "bastidor", "CTA", "depoimento", "carrossel"].map((t) => (
                                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <Input
                                              placeholder="Texto principal..."
                                              value={story.mainText}
                                              onChange={(e) => updateItemField(week.weekNumber - 1, story.id, "story", "mainText", e.target.value)}
                                              className="bg-white/[0.05] border-white/10 text-white text-[10px] h-7"
                                            />
                                            <Input
                                              placeholder="Call to action..."
                                              value={story.callToAction}
                                              onChange={(e) => updateItemField(week.weekNumber - 1, story.id, "story", "callToAction", e.target.value)}
                                              className="bg-white/[0.05] border-white/10 text-white text-[10px] h-7"
                                            />
                                            {story.generatedImage && (
                                              <>
                                                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1 mt-1"><ImageIcon className="w-3 h-3" /> Refazer imagem</p>
                                                <div className="flex gap-1.5">
                                                  <Input
                                                    placeholder="Dica para refazer..."
                                                    value={imageHint}
                                                    onChange={(e) => setImageHint(e.target.value)}
                                                    className="bg-white/[0.05] border-white/10 text-white text-[10px] flex-1 h-7"
                                                  />
                                                  <Button
                                                    size="sm"
                                                    onClick={() => handleGenerateImage(week.weekNumber - 1, story.id, story.visualDescription, "story", imageHint || undefined)}
                                                    disabled={story.isGeneratingImage}
                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white h-7 w-7 p-0 shrink-0"
                                                  >
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
              ))}
            </Tabs>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
