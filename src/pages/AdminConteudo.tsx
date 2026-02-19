import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Instagram, Sparkles, Calendar, Copy, Download, RefreshCw, ImageIcon,
  Clock, Lightbulb, Eye, MessageSquare, X, Send,
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

  // Dialog state
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
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

    // Also update dialog state
    if (type === "feed" && selectedPost?.id === itemId) {
      setSelectedPost((p) => p ? { ...p, isGeneratingImage: true } : p);
    }
    if (type === "story" && selectedStory?.id === itemId) {
      setSelectedStory((s) => s ? { ...s, isGeneratingImage: true } : s);
    }

    updateWeekItem(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-instagram-image", {
        body: { prompt: fullPrompt, type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      updateWeekItem(false, data.imageUrl);

      // Update dialog state with image
      if (type === "feed" && selectedPost?.id === itemId) {
        setSelectedPost((p) => p ? { ...p, isGeneratingImage: false, generatedImage: data.imageUrl } : p);
      }
      if (type === "story" && selectedStory?.id === itemId) {
        setSelectedStory((s) => s ? { ...s, isGeneratingImage: false, generatedImage: data.imageUrl } : s);
      }

      setImageHint("");
      toast({ title: "Imagem gerada! 🎨" });
    } catch (e: any) {
      updateWeekItem(false);
      if (type === "feed" && selectedPost?.id === itemId) {
        setSelectedPost((p) => p ? { ...p, isGeneratingImage: false } : p);
      }
      if (type === "story" && selectedStory?.id === itemId) {
        setSelectedStory((s) => s ? { ...s, isGeneratingImage: false } : s);
      }
      toast({ title: "Erro ao gerar imagem", description: e.message, variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado! 📋" });
  };

  const currentWeek = monthPlan?.weeks?.find((w) => String(w.weekNumber) === activeWeek);
  const currentWeekIdx = currentWeek ? (currentWeek.weekNumber || 1) - 1 : 0;

  const openPostDialog = (post: FeedPost) => {
    // Sync with latest monthPlan data
    const latestPost = currentWeek?.feedPosts?.find((p) => p.id === post.id) || post;
    setSelectedPost(latestPost);
    setSelectedStory(null);
    setImageHint("");
  };

  const openStoryDialog = (story: Story) => {
    const latestStory = currentWeek?.stories?.find((s) => s.id === story.id) || story;
    setSelectedStory(latestStory);
    setSelectedPost(null);
    setImageHint("");
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
            <Card className="p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-white text-sm">Estratégia mensal</h3>
                  <p className="text-white/60 text-sm mt-1.5 leading-relaxed">{monthPlan.monthStrategy}</p>
                </div>
              </div>
            </Card>

            {/* Week selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {monthPlan.weeks?.map((week) => (
                <button
                  key={week.weekNumber}
                  onClick={() => setActiveWeek(String(week.weekNumber))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    String(week.weekNumber) === activeWeek
                      ? "bg-white/[0.08] border-purple-500/40 shadow-lg shadow-purple-500/10"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Semana {week.weekNumber}</div>
                  <div className="text-sm text-white/90 font-medium mt-1 truncate">{week.niche}</div>
                  <div className="text-[11px] text-white/40 mt-1 truncate">{week.theme}</div>
                </button>
              ))}
            </div>

            {/* Current week content */}
            {currentWeek && (
              <div className="space-y-5">
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                  <p className="text-sm text-white/60 leading-relaxed">
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

                  {/* Feed - compact list */}
                  <TabsContent value="feed" className="mt-5">
                    <div className="grid grid-cols-1 gap-3">
                      {currentWeek.feedPosts?.map((post) => (
                        <Card
                          key={post.id}
                          className="p-4 bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] transition-colors cursor-pointer group"
                          onClick={() => openPostDialog(post)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-semibold">
                                  <Calendar className="w-3 h-3 inline mr-1" />{post.day}
                                </span>
                                <span className="px-2 py-1 rounded-lg bg-white/[0.06] text-white/50 text-xs">
                                  <Clock className="w-3 h-3 inline mr-1" />{post.time}
                                </span>
                              </div>
                              <h3 className="font-semibold text-white text-sm truncate">{post.title}</h3>
                              <span className="text-[10px] text-white/30 uppercase shrink-0">{post.contentType}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              {post.generatedImage && (
                                <span className="w-2 h-2 rounded-full bg-green-400" title="Imagem gerada" />
                              )}
                              <Eye className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Stories - compact list grouped by day */}
                  <TabsContent value="stories" className="mt-5 space-y-5">
                    {DAYS_ORDER.map((day) => {
                      const dayStories = currentWeek.stories?.filter((s) => s.day === day) || [];
                      if (dayStories.length === 0) return null;
                      return (
                        <div key={day} className="space-y-2">
                          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider pl-1">{day}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {dayStories.map((story) => (
                              <Card
                                key={story.id}
                                className="p-3.5 bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] transition-colors cursor-pointer group"
                                onClick={() => openStoryDialog(story)}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-[10px] font-semibold uppercase shrink-0">{story.type}</span>
                                    <p className="text-sm text-white/80 truncate">{story.mainText}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {story.generatedImage && (
                                      <span className="w-2 h-2 rounded-full bg-green-400" title="Imagem gerada" />
                                    )}
                                    <Eye className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                                  </div>
                                </div>
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

        {/* ============ Feed Post Dialog ============ */}
        <Dialog open={!!selectedPost} onOpenChange={(open) => { if (!open) setSelectedPost(null); }}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
            {selectedPost && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-semibold">
                      <Calendar className="w-3 h-3 inline mr-1" />{selectedPost.day}
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-white/[0.06] text-white/50 text-xs">
                      <Clock className="w-3 h-3 inline mr-1" />{selectedPost.time}
                    </span>
                    <span className="text-[10px] text-white/30 uppercase">{selectedPost.contentType}</span>
                  </div>
                  <DialogTitle className="text-lg">{selectedPost.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Caption */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/50 uppercase">Legenda</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedPost.caption)} className="text-white/40 hover:text-white h-7 text-xs">
                        <Copy className="w-3 h-3 mr-1" /> Copiar
                      </Button>
                    </div>
                    <p className="text-sm text-white/70 whitespace-pre-wrap bg-white/[0.04] rounded-lg p-4 leading-relaxed">{selectedPost.caption}</p>
                  </div>

                  {/* Marketing tip */}
                  {selectedPost.marketingTip && (
                    <div className="flex items-start gap-2.5 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-200/80">{selectedPost.marketingTip}</p>
                    </div>
                  )}

                  {/* Image section */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-white/50 uppercase">Arte do post</span>
                    <p className="text-xs text-white/40 italic leading-relaxed">{selectedPost.imageDescription}</p>

                    {selectedPost.generatedImage && (
                      <div className="relative rounded-xl overflow-hidden border border-white/10">
                        <img src={selectedPost.generatedImage} alt={selectedPost.title} className="w-full max-w-lg mx-auto aspect-square object-cover" />
                        <a href={selectedPost.generatedImage} download={`feed-${selectedPost.id}.png`} className="absolute top-3 right-3 p-2 bg-black/60 rounded-lg hover:bg-black/80 transition-colors">
                          <Download className="w-4 h-4 text-white" />
                        </a>
                      </div>
                    )}

                    {/* Hint / observation for image */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs text-white/40 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        Observação para {selectedPost.generatedImage ? "refazer" : "gerar"} a imagem (opcional)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: Usar tons mais quentes, incluir logo no canto..."
                          value={imageHint}
                          onChange={(e) => setImageHint(e.target.value)}
                          className="bg-white/[0.05] border-white/10 text-white text-sm flex-1"
                        />
                        <Button
                          onClick={() => handleGenerateImage(currentWeekIdx, selectedPost.id, selectedPost.imageDescription, "feed", imageHint || undefined)}
                          disabled={selectedPost.isGeneratingImage}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white shrink-0"
                        >
                          {selectedPost.isGeneratingImage ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : selectedPost.generatedImage ? (
                            <><RefreshCw className="w-4 h-4 mr-1.5" /> Refazer</>
                          ) : (
                            <><ImageIcon className="w-4 h-4 mr-1.5" /> Gerar</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ============ Story Dialog ============ */}
        <Dialog open={!!selectedStory} onOpenChange={(open) => { if (!open) setSelectedStory(null); }}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto">
            {selectedStory && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2.5 py-1 rounded-md bg-pink-500/20 text-pink-300 text-xs font-semibold uppercase">{selectedStory.type}</span>
                    <span className="text-xs text-white/40">{selectedStory.day}</span>
                  </div>
                  <DialogTitle className="text-base">{selectedStory.mainText}</DialogTitle>
                </DialogHeader>

                <div className="space-y-5 mt-4">
                  {/* CTA */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-white/50 uppercase">Call to Action</span>
                    <div className="flex items-center justify-between bg-white/[0.04] rounded-lg p-3">
                      <p className="text-sm text-white/70">{selectedStory.callToAction}</p>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedStory.callToAction)} className="text-white/30 hover:text-white h-7 w-7 p-0 shrink-0">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Visual description */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-white/50 uppercase">Descrição visual</span>
                    <p className="text-xs text-white/40 italic leading-relaxed">{selectedStory.visualDescription}</p>
                  </div>

                  {/* Main text copy */}
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedStory.mainText)} className="border-white/10 text-white/60 hover:text-white text-xs w-full">
                    <Copy className="w-3 h-3 mr-1.5" /> Copiar texto principal
                  </Button>

                  {/* Image */}
                  {selectedStory.generatedImage && (
                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                      <img src={selectedStory.generatedImage} alt={selectedStory.mainText} className="w-full aspect-[9/16] object-cover max-h-80 mx-auto" />
                      <a href={selectedStory.generatedImage} download={`story-${selectedStory.id}.png`} className="absolute top-3 right-3 p-2 bg-black/60 rounded-lg hover:bg-black/80 transition-colors">
                        <Download className="w-4 h-4 text-white" />
                      </a>
                    </div>
                  )}

                  {/* Hint / observation for image */}
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" />
                      Observação para {selectedStory.generatedImage ? "refazer" : "gerar"} a imagem (opcional)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: Mais minimalista, fundo escuro..."
                        value={imageHint}
                        onChange={(e) => setImageHint(e.target.value)}
                        className="bg-white/[0.05] border-white/10 text-white text-sm flex-1"
                      />
                      <Button
                        onClick={() => handleGenerateImage(currentWeekIdx, selectedStory.id, selectedStory.visualDescription, "story", imageHint || undefined)}
                        disabled={selectedStory.isGeneratingImage}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white shrink-0"
                      >
                        {selectedStory.isGeneratingImage ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : selectedStory.generatedImage ? (
                          <><RefreshCw className="w-4 h-4 mr-1.5" /> Refazer</>
                        ) : (
                          <><ImageIcon className="w-4 h-4 mr-1.5" /> Gerar</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
