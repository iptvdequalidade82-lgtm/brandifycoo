import { useState, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Monitor, Smartphone, Download, RotateCcw, Check } from "lucide-react";

const planLabels: Record<string, string> = {
  essencial: "Essencial — até 6 páginas",
  profissional: "Profissional — até 10 páginas",
  premium: "Premium — páginas ilimitadas",
};

const colorPalettes = [
  { id: "midnight", label: "Midnight", gradient: "linear-gradient(135deg, #0a0a1a 0%, #1e3a8a 50%, #2563eb 100%)" },
  { id: "aurora", label: "Aurora", gradient: "linear-gradient(135deg, #6366f1 0%, #06b6d4 50%, #a78bfa 100%)" },
  { id: "neon", label: "Neon", gradient: "linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #a855f7 100%)" },
  { id: "cyber", label: "Cyber", gradient: "linear-gradient(135deg, #00ff88 0%, #0ea5e9 50%, #22d3ee 100%)" },
  { id: "sunset", label: "Sunset", gradient: "linear-gradient(135deg, #ef4444 0%, #f97316 50%, #eab308 100%)" },
  { id: "royal", label: "Royal", gradient: "linear-gradient(135deg, #7c3aed 0%, #d946ef 50%, #f0abfc 100%)" },
  { id: "ocean", label: "Ocean", gradient: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 50%, #2dd4bf 100%)" },
  { id: "emerald", label: "Emerald", gradient: "linear-gradient(135deg, #059669 0%, #10b981 50%, #a3e635 100%)" },
  { id: "neutral", label: "Clean", gradient: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)" },
];

export default function PreviewSite() {
  const [params] = useSearchParams();
  const plan = params.get("plano") || "essencial";

  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedPalette, setSelectedPalette] = useState("midnight");

  const [generating, setGenerating] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [done, setDone] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generate = useCallback(async () => {
    if (!businessName.trim()) return;
    setGenerating(true);
    setHtmlContent("");
    setDone(false);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-site-preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            plan,
            businessName: businessName.trim(),
            phone: phone.trim(),
            logoUrl: logoPreview || null,
            colorPalette: selectedPalette,
          }),
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
    } catch (err: any) {
      console.error(err);
      setHtmlContent(`<html><body style="background:#111;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><p>${err.message || "Erro ao gerar prévia."}</p></body></html>`);
      setDone(true);
    } finally {
      setGenerating(false);
    }
  }, [businessName, phone, logoPreview, plan, selectedPalette]);

  const downloadHtml = () => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preview-${businessName.replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Link to="/#investimento" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Voltar aos planos
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles size={14} className="text-brand-accent" />
            <span className="text-white/60">Prévia</span>
            <span className="text-white font-bold capitalize">{plan}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <AnimatePresence mode="wait">
          {!htmlContent && !generating ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl md:text-4xl font-black mb-3">
                  Veja seu site{" "}
                  <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-accent-deep">
                    antes de contratar
                  </span>
                </h1>
                <p className="text-white/50">
                  Preencha os dados e nossa IA vai gerar uma prévia do seu site no plano{" "}
                  <span className="text-white font-medium capitalize">{plan}</span>.
                </p>
                <p className="text-xs text-white/30 mt-2">{planLabels[plan]}</p>
              </div>

              <div className="space-y-5 bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Nome da empresa *</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ex: Barbearia do João"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-accent/50 transition-colors"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(43) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-accent/50 transition-colors"
                    maxLength={20}
                  />
                </div>

                {/* Color Palette Picker */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">Tonalidade do site</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                    {colorPalettes.map((palette) => (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => setSelectedPalette(palette.id)}
                        className={`group relative flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all ${
                          selectedPalette === palette.id
                            ? "border-white/30 bg-white/[0.08] ring-1 ring-white/20 scale-[1.04]"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                        }`}
                      >
                        {/* Gradient swatch */}
                        <div
                          className="w-full h-8 rounded-lg border border-white/10"
                          style={{ background: palette.gradient }}
                        />
                        <span className={`text-[10px] font-semibold tracking-wide uppercase leading-none ${
                          selectedPalette === palette.id ? "text-white" : "text-white/40"
                        }`}>
                          {palette.label}
                        </span>
                        {selectedPalette === palette.id && (
                          <motion.div
                            layoutId="palette-check"
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-lg"
                          >
                            <Check size={11} className="text-black" strokeWidth={3} />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Logo da empresa (opcional)</label>
                  <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-dashed border-white/15 text-white/40 hover:border-brand-accent/40 hover:text-white/60 transition-colors cursor-pointer">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-8 w-8 object-contain rounded" />
                    ) : (
                      <span className="text-sm">Clique para enviar sua logo</span>
                    )}
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generate}
                  disabled={!businessName.trim()}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-brand-accent to-brand-accent-deep text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Gerar prévia do meu site
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
              {/* Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  {generating && (
                    <div className="flex items-center gap-2 text-brand-accent text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      Gerando seu site...
                    </div>
                  )}
                  {done && (
                    <span className="text-sm text-green-400">✓ Prévia pronta!</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("desktop")}
                    className={`p-2 rounded-lg transition-colors ${viewMode === "desktop" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
                  >
                    <Monitor size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("mobile")}
                    className={`p-2 rounded-lg transition-colors ${viewMode === "mobile" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
                  >
                    <Smartphone size={18} />
                  </button>
                  {done && (
                    <>
                      <button
                        onClick={downloadHtml}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-sm text-white/70 hover:text-white transition-colors"
                      >
                        <Download size={14} /> Baixar HTML
                      </button>
                      <button
                        onClick={() => { setHtmlContent(""); setDone(false); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-sm text-white/70 hover:text-white transition-colors"
                      >
                        <RotateCcw size={14} /> Refazer
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* iframe */}
              <div className="flex justify-center">
                <div
                  className={`rounded-2xl overflow-hidden border border-white/10 bg-white transition-all duration-500 ${
                    viewMode === "mobile" ? "w-[390px]" : "w-full"
                  }`}
                  style={{ height: "75vh" }}
                >
                  <iframe
                    ref={iframeRef}
                    srcDoc={htmlContent}
                    title="Prévia do site"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>

              {/* CTA */}
              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center pt-4"
                >
                  <p className="text-white/50 mb-4">Gostou da prévia? Entre em contato para transformar em realidade!</p>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={`https://wa.me/5543991065129?text=${encodeURIComponent(`Olá! Gerei uma prévia do site para "${businessName}" no plano ${plan} e gostei! Quero contratar.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-brand-accent to-brand-accent-deep text-white"
                  >
                    Quero meu site assim!
                  </motion.a>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
