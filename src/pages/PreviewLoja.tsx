import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Monitor, Smartphone, RotateCcw, Wand2, PenLine, Plus, X, Store, ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import auroraBg from "@/assets/aurora-bg.jpg";

const colorSchemes = [
  { id: "modern", label: "Moderno", colors: ["#0ea5e9", "#06b6d4", "#f0fdfa"] },
  { id: "midnight", label: "Midnight", colors: ["#0f172a", "#1e3a8a", "#38bdf8"] },
  { id: "neon", label: "Neon", colors: ["#a855f7", "#06ffa5", "#0a0a0a"] },
  { id: "sunset", label: "Sunset", colors: ["#f97316", "#ec4899", "#1e1b4b"] },
  { id: "arctic", label: "Ártico", colors: ["#e0f2fe", "#0284c7", "#0c4a6e"] },
  { id: "emerald", label: "Esmeralda", colors: ["#064e3b", "#10b981", "#d1fae5"] },
  { id: "cyber", label: "Cyber", colors: ["#facc15", "#0f0f0f", "#a3e635"] },
  { id: "rose", label: "Rosé", colors: ["#fda4af", "#9f1239", "#fff1f2"] },
  { id: "lavender", label: "Lavanda", colors: ["#c4b5fd", "#4c1d95", "#ede9fe"] },
  { id: "volcanic", label: "Vulcânico", colors: ["#dc2626", "#1c1917", "#fbbf24"] },
  { id: "ocean", label: "Oceano", colors: ["#0077b6", "#00b4d8", "#caf0f8"] },
  { id: "monochrome", label: "Mono", colors: ["#18181b", "#71717a", "#f4f4f5"] },
  { id: "coral", label: "Coral", colors: ["#fb7185", "#fdba74", "#1e293b"] },
  { id: "forest", label: "Floresta", colors: ["#14532d", "#4ade80", "#f0fdf4"] },
  { id: "galaxy", label: "Galáxia", colors: ["#581c87", "#7c3aed", "#c084fc"] },
];

type Product = { name: string; price: string; category: string; imageUrl: string };

const inputClass = "w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors";
const labelClass = "block text-sm font-medium text-white/70 mb-1.5";

export default function PreviewLoja() {
  const [mode, setMode] = useState<"manual" | "ia">("ia");
  const [storeName, setStoreName] = useState("");
  const [segment, setSegment] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedScheme, setSelectedScheme] = useState("modern");
  const [products, setProducts] = useState<Product[]>([{ name: "", price: "", category: "", imageUrl: "" }]);

  const [generating, setGenerating] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [done, setDone] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [elapsed, setElapsed] = useState(0);
  const [previewCount, setPreviewCount] = useState(0);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    supabase.from("site_previews").select("id", { count: "exact", head: true }).then(({ count }) => {
      if (count) setPreviewCount(count);
    });
  }, [done]);

  const addProduct = () => {
    if (products.length < 8) setProducts([...products, { name: "", price: "", category: "", imageUrl: "" }]);
  };

  const removeProduct = (idx: number) => {
    setProducts(products.filter((_, i) => i !== idx));
  };

  const updateProduct = (idx: number, field: keyof Product, value: string) => {
    setProducts(products.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const generate = useCallback(async () => {
    if (mode === "ia" && !segment.trim()) return;
    if (mode === "manual" && !storeName.trim()) return;

    setGenerating(true);
    setHtmlContent("");
    setDone(false);
    setElapsed(0);
    setFeedbackGiven(null);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);

    try {
      const payload: Record<string, any> = {
        aiMode: mode === "ia",
        segment: segment.trim() || "Moda",
        colorScheme: selectedScheme,
      };

      if (mode === "ia") {
        payload.storeName = storeName.trim() || null;
        payload.phone = phone.trim() || null;
      } else {
        payload.storeName = storeName.trim();
        payload.phone = phone.trim() || null;
        payload.products = products.filter(p => p.name.trim());
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-store-preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Erro ao gerar." }));
        throw new Error(err.error || "Erro ao gerar prévia.");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullHtml = "";

      while (true) {
        const { done: rDone, value } = await reader.read();
        if (rDone) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullHtml += content;
              let cleaned = fullHtml;
              if (cleaned.startsWith("```html")) cleaned = cleaned.slice(7);
              if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
              if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
              setHtmlContent(cleaned.trim());
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      setDone(true);

      // Save to DB
      try {
        let cleaned = fullHtml;
        if (cleaned.startsWith("```html")) cleaned = cleaned.slice(7);
        if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
        if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
        const finalHtml = cleaned.trim();

        const storagePath = `previews/loja-${Date.now()}-${Math.random().toString(36).slice(2)}.html`;
        const htmlBlob = new Blob([finalHtml], { type: "text/html" });
        await supabase.storage.from("site-previews").upload(storagePath, htmlBlob, { upsert: true });

        const displayName = mode === "ia" ? (storeName.trim() || `Loja IA — ${segment.trim()}`) : storeName.trim();
        await supabase.from("site_previews").insert({
          client_name: displayName,
          client_phone: phone.trim() || null,
          segment: segment.trim() || null,
          plan: "nuvemshop",
          color_palette: selectedScheme,
          html_storage_path: storagePath,
        });
      } catch (saveErr) {
        console.error("Failed to save:", saveErr);
      }
    } catch (err: any) {
      console.error(err);
      setHtmlContent(`<html><body style="background:#111;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><p>${err.message || "Erro ao gerar prévia."}</p></body></html>`);
      setDone(true);
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setGenerating(false);
    }
  }, [mode, storeName, segment, phone, products, selectedScheme]);

  const handleFeedback = async (type: "like" | "dislike") => {
    setFeedbackGiven(type);
    if (type === "like") {
      const name = storeName.trim() || segment.trim();
      window.open(
        `https://wa.me/5543991065129?text=${encodeURIComponent(`Olá! Gerei uma prévia da loja "${name}" e adorei! Quero contratar a configuração Nuvemshop.`)}`,
        "_blank"
      );
    }
  };

  const canGenerate = mode === "ia" ? !!segment.trim() : !!storeName.trim();




  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Unique aurora background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${auroraBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
          maskImage: "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
        }}
      />
      {/* Teal glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none z-0 blur-[140px]" style={{ background: "rgba(6,182,212,0.12)" }} />

      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Link to="/#investimento" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Store size={14} className="text-cyan-400" />
            <span className="text-white font-bold">Prévia Loja Virtual</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {!htmlContent && !generating ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl md:text-4xl font-black mb-3">
                  Visualize sua{" "}
                  <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-accent-deep">
                    loja virtual
                  </span>
                </h1>
                <p className="text-white/50">
                  Prévia com layout idêntico à Nuvemshop — veja como sua loja ficará antes de contratar.
                </p>

                {previewCount > 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent" />
                    </span>
                    <span className="text-xs text-white/50">
                      <span className="font-bold text-white/80">{previewCount}</span> sites já criados
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Mode Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-6">
                <button onClick={() => setMode("ia")} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all relative ${mode === "ia" ? "bg-gradient-to-r from-brand-accent to-brand-accent-deep text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}>
                  <Wand2 size={16} /> Prévia Inteligente (IA)
                  <span className="absolute -top-2.5 right-2 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white rounded-full leading-none">Recomendado</span>
                </button>
                <button onClick={() => setMode("manual")} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${mode === "manual" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}>
                  <PenLine size={16} /> Preencher Manual
                </button>
              </div>

              <div className="space-y-6 bg-white/[0.04] border border-white/10 rounded-2xl p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {mode === "ia" ? (
                    <motion.div key="ia-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-bold mb-3">
                          <Wand2 size={12} /> A IA cria tudo por você
                        </div>
                        <p className="text-sm text-white/40">Informe o segmento e a IA gera produtos, preços, categorias e toda a loja.</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className={labelClass}>Ramo / Segmento da loja *</label>
                          <input className={inputClass} placeholder="Ex: Joias femininas, Roupas fitness, Pet shop..." value={segment} onChange={(e) => setSegment(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Nome da loja (opcional)</label>
                            <input className={inputClass} placeholder="A IA pode criar um" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                          </div>
                          <div>
                            <label className={labelClass}>WhatsApp (opcional)</label>
                            <input className={inputClass} placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="manual-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Nome da loja *</label>
                            <input className={inputClass} placeholder="Minha Loja" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                          </div>
                          <div>
                            <label className={labelClass}>Segmento</label>
                            <input className={inputClass} placeholder="Ex: Moda feminina" value={segment} onChange={(e) => setSegment(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>WhatsApp (opcional)</label>
                          <input className={inputClass} placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>

                        {/* Products */}
                        <div>
                          <label className={labelClass}>Produtos (até 8)</label>
                          <div className="space-y-3">
                            {products.map((p, i) => (
                              <div key={i} className="flex gap-2 items-start">
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <input className={inputClass + " text-xs"} placeholder="Nome" value={p.name} onChange={(e) => updateProduct(i, "name", e.target.value)} />
                                  <input className={inputClass + " text-xs"} placeholder="Preço (ex: 89,90)" value={p.price} onChange={(e) => updateProduct(i, "price", e.target.value)} />
                                  <input className={inputClass + " text-xs"} placeholder="Categoria" value={p.category} onChange={(e) => updateProduct(i, "category", e.target.value)} />
                                  <input className={inputClass + " text-xs"} placeholder="URL imagem (opc.)" value={p.imageUrl} onChange={(e) => updateProduct(i, "imageUrl", e.target.value)} />
                                </div>
                                {products.length > 1 && (
                                  <button onClick={() => removeProduct(i)} className="mt-2 text-white/30 hover:text-red-400 transition-colors"><X size={16} /></button>
                                )}
                              </div>
                            ))}
                          </div>
                          {products.length < 8 && (
                            <button onClick={addProduct} className="mt-2 flex items-center gap-1 text-xs text-brand-accent hover:text-brand-accent-deep transition-colors">
                              <Plus size={14} /> Adicionar produto
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Color Scheme */}
                <div>
                  <label className={labelClass}>Esquema de cores</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {colorSchemes.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedScheme(c.id)}
                        className={`relative rounded-xl p-2 border-2 transition-all ${selectedScheme === c.id ? "border-white shadow-lg" : "border-white/10 hover:border-white/20"}`}
                      >
                        <div className="flex gap-0.5 w-full h-6 rounded-lg overflow-hidden">
                          {c.colors.map((color, i) => (
                            <div key={i} className="flex-1 h-full" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        <span className="text-[10px] text-white/50 mt-1 block text-center">{c.label}</span>
                        {selectedScheme === c.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-black rounded-full" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={canGenerate ? { scale: 1.02 } : {}}
                  whileTap={canGenerate ? { scale: 0.98 } : {}}
                  onClick={generate}
                  disabled={!canGenerate}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${canGenerate ? "bg-gradient-to-r from-brand-accent to-brand-accent-deep text-white shadow-lg shadow-brand-accent/20 hover:shadow-xl" : "bg-white/10 text-white/30 cursor-not-allowed"}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={20} />
                    Gerar Prévia da Loja
                  </span>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {generating && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20">
                      <Loader2 size={14} className="animate-spin text-brand-accent" />
                      <span className="text-xs text-brand-accent font-medium">Gerando... {elapsed}s</span>
                    </div>
                  )}
                  {done && (
                    <span className="text-xs text-white/40">Gerado em {elapsed}s</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setViewMode("desktop")} className={`p-2 rounded-lg transition-colors ${viewMode === "desktop" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"}`}><Monitor size={16} /></button>
                  <button onClick={() => setViewMode("mobile")} className={`p-2 rounded-lg transition-colors ${viewMode === "mobile" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"}`}><Smartphone size={16} /></button>
                  {done && (
                    <button onClick={() => { setHtmlContent(""); setDone(false); setFeedbackGiven(null); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] text-white/50 hover:text-white text-xs transition-colors">
                      <RotateCcw size={14} /> Nova prévia
                    </button>
                  )}
                </div>
              </div>

              {/* Iframe */}
              <div className={`mx-auto transition-all duration-500 ${viewMode === "mobile" ? "max-w-[390px]" : "max-w-full"}`}>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white">
                  <iframe
                    ref={iframeRef}
                    srcDoc={htmlContent}
                    className="w-full bg-white"
                    style={{ height: "80vh", border: "none" }}
                    sandbox="allow-scripts allow-same-origin"
                    title="Prévia da Loja Virtual"
                  />
                </div>
              </div>

              {/* Feedback */}
              {done && !feedbackGiven && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4 py-6">
                  <p className="text-white/50 text-sm">O que achou da prévia?</p>
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleFeedback("like")} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-accent to-brand-accent-deep text-white font-bold">
                      <ThumbsUp size={18} /> Adorei! Quero contratar
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleFeedback("dislike")} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white/60 font-bold hover:bg-white/10">
                      <ThumbsDown size={18} /> Precisa melhorar
                    </motion.button>
                  </div>
                </motion.div>
              )}
              {feedbackGiven === "like" && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-brand-accent text-sm font-medium py-4">
                  ✨ Obrigado! Redirecionando para o WhatsApp...
                </motion.p>
              )}
              {feedbackGiven === "dislike" && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-white/40 text-sm py-4">
                  Obrigado pelo feedback! Clique em "Nova prévia" para gerar novamente.
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
