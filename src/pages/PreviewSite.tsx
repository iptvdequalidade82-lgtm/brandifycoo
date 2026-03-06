import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Monitor, Smartphone, RotateCcw, Check, Upload, X, Image, Building2, ThumbsUp, ThumbsDown, Wand2, PenLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import lightningBg from "@/assets/lightning-bg.jpg";
import constellationBg from "@/assets/constellation-bg.jpg";
import galaxyBg from "@/assets/galaxy-bg.jpg";

const planBgs: Record<string, string> = {
  "landing page": lightningBg,
  essencial: constellationBg,
  profissional: constellationBg,
  premium: galaxyBg,
};

const planAccents: Record<string, { from: string; to: string; glow: string }> = {
  "landing page": { from: "#f97316", to: "#ef4444", glow: "rgba(249,115,22,0.15)" },
  essencial: { from: "#3b82f6", to: "#8b5cf6", glow: "rgba(59,130,246,0.15)" },
  profissional: { from: "#06b6d4", to: "#3b82f6", glow: "rgba(6,182,212,0.15)" },
  premium: { from: "#a855f7", to: "#ec4899", glow: "rgba(168,85,247,0.15)" },
};

const planLabels: Record<string, string> = {
  "landing page": "Landing Page — página de vendas",
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
  { id: "rose", label: "Rosé", gradient: "linear-gradient(135deg, #9f1239 0%, #e11d48 50%, #fb7185 100%)" },
  { id: "gold", label: "Gold", gradient: "linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)" },
  { id: "slate", label: "Slate", gradient: "linear-gradient(135deg, #0f172a 0%, #334155 50%, #64748b 100%)" },
  { id: "lavender", label: "Lavanda", gradient: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #c4b5fd 100%)" },
  { id: "mint", label: "Mint", gradient: "linear-gradient(135deg, #064e3b 0%, #059669 50%, #6ee7b7 100%)" },
  { id: "coral", label: "Coral", gradient: "linear-gradient(135deg, #c2410c 0%, #f97316 50%, #fdba74 100%)" },
  { id: "arctic", label: "Arctic", gradient: "linear-gradient(135deg, #0c4a6e 0%, #38bdf8 50%, #e0f2fe 100%)" },
  { id: "cherry", label: "Cherry", gradient: "linear-gradient(135deg, #881337 0%, #e11d48 50%, #fda4af 100%)" },
  { id: "bronze", label: "Bronze", gradient: "linear-gradient(135deg, #451a03 0%, #b45309 50%, #fcd34d 100%)" },
  { id: "forest", label: "Forest", gradient: "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #bbf7d0 100%)" },
  { id: "electric", label: "Electric", gradient: "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #c7d2fe 100%)" },
  { id: "magma", label: "Magma", gradient: "linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #fde68a 100%)" },
  { id: "grape", label: "Grape", gradient: "linear-gradient(135deg, #3b0764 0%, #9333ea 50%, #e9d5ff 100%)" },
  { id: "steel", label: "Steel", gradient: "linear-gradient(135deg, #1c1917 0%, #57534e 50%, #d6d3d1 100%)" },
  { id: "tropical", label: "Tropical", gradient: "linear-gradient(135deg, #134e4a 0%, #14b8a6 50%, #fde047 100%)" },
  { id: "blush", label: "Blush", gradient: "linear-gradient(135deg, #831843 0%, #ec4899 50%, #fce7f3 100%)" },
];

const inputClass = "w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors";
const labelClass = "block text-sm font-medium text-white/70 mb-1.5";

async function uploadToStorage(file: File, prefix: string): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("preview-assets").upload(path, file, { upsert: true });
  if (error) { console.error("Upload error:", error); return null; }
  const { data } = supabase.storage.from("preview-assets").getPublicUrl(path);
  return data.publicUrl;
}

export default function PreviewSite() {
  const [params] = useSearchParams();
  const plan = params.get("plano") || "essencial";

  // Mode toggle
  const [mode, setMode] = useState<"manual" | "ia">("ia");

  // Form fields
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [slogan, setSlogan] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [segment, setSegment] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPalette, setSelectedPalette] = useState("midnight");

  // File uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [done, setDone] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [elapsed, setElapsed] = useState(0);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const [previewCount, setPreviewCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const estimatedTimes: Record<string, number> = { "landing page": 30, essencial: 40, profissional: 70, premium: 100 };

  useEffect(() => {
    supabase.from("site_previews").select("id", { count: "exact", head: true }).then(({ count }) => {
      if (count) setPreviewCount(count);
    });
  }, [done]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (s: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 6 - galleryFiles.length);
    if (!files.length) return;
    setGalleryFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setGalleryPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (idx: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const generate = useCallback(async () => {
    // In AI mode, segment is required; in manual mode, businessName is required
    if (mode === "ia" && (!segment.trim() || !businessName.trim() || !phone.trim())) return;
    if (mode === "manual" && !businessName.trim()) return;

    setGenerating(true);
    setUploading(mode === "manual" && (!!logoFile || !!bannerFile || galleryFiles.length > 0));
    setHtmlContent("");
    setDone(false);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);

    try {
      // Upload files to storage (only in manual mode)
      let logoUrl: string | null = null;
      let bannerUrl: string | null = null;
      const galleryUrls: string[] = [];

      if (mode === "manual") {
        if (logoFile) logoUrl = await uploadToStorage(logoFile, "logos");
        if (bannerFile) bannerUrl = await uploadToStorage(bannerFile, "banners");
        for (const gf of galleryFiles) {
          const url = await uploadToStorage(gf, "gallery");
          if (url) galleryUrls.push(url);
        }
      }

      setUploading(false);

      // Build payload — in AI mode, send segment as main info, let the AI generate everything
      const payload: Record<string, any> = {
        plan,
        colorPalette: selectedPalette,
        aiMode: mode === "ia",
      };

      if (mode === "ia") {
        payload.segment = segment.trim();
        payload.businessName = businessName.trim() || null; // optional in AI mode
        payload.phone = phone.trim() || null;
      } else {
        payload.businessName = businessName.trim();
        payload.phone = phone.trim();
        payload.slogan = slogan.trim() || null;
        payload.cnpj = cnpj.trim() || null;
        payload.segment = segment.trim() || null;
        payload.description = description.trim() || null;
        payload.logoUrl = logoUrl;
        payload.bannerUrl = bannerUrl;
        payload.galleryUrls = galleryUrls.length ? galleryUrls : null;
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-site-preview`,
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

      // Save HTML to storage and record in DB
      try {
        let cleaned = fullHtml;
        if (cleaned.startsWith("```html")) cleaned = cleaned.slice(7);
        if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
        if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
        const finalHtml = cleaned.trim();

        const storagePath = `previews/${Date.now()}-${Math.random().toString(36).slice(2)}.html`;
        const htmlBlob = new Blob([finalHtml], { type: "text/html" });
        await supabase.storage.from("site-previews").upload(storagePath, htmlBlob, { upsert: true });

        const displayName = mode === "ia" ? (businessName.trim() || `IA — ${segment.trim()}`) : businessName.trim();
        const { data: insertData } = await supabase.from("site_previews").insert({
          client_name: displayName,
          client_phone: phone.trim() || null,
          segment: segment.trim() || null,
          slogan: slogan.trim() || null,
          plan,
          color_palette: selectedPalette,
          html_storage_path: storagePath,
        }).select("id").single();

        if (insertData) setPreviewId(insertData.id);
      } catch (saveErr) {
        console.error("Failed to save preview record:", saveErr);
      }
    } catch (err: any) {
      console.error(err);
      setHtmlContent(`<html><body style="background:#111;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><p>${err.message || "Erro ao gerar prévia."}</p></body></html>`);
      setDone(true);
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setGenerating(false);
      setUploading(false);
    }
  }, [mode, businessName, phone, slogan, cnpj, segment, description, logoFile, bannerFile, galleryFiles, plan, selectedPalette]);

  const handleFeedback = async (type: "like" | "dislike") => {
    setFeedbackGiven(type);
    if (previewId) {
      await supabase.from("site_previews").update({ feedback: type, feedback_at: new Date().toISOString() }).eq("id", previewId);
    }
    if (type === "like") {
      const name = businessName.trim() || segment.trim();
      window.open(
        `https://wa.me/5543991065129?text=${encodeURIComponent(`Olá! Gerei uma prévia do site para "${name}" no plano ${plan} e adorei! Quero contratar.`)}`,
        "_blank"
      );
    }
  };

  const canGenerate = mode === "ia" ? (!!segment.trim() && !!businessName.trim() && !!phone.trim()) : !!businessName.trim();

  const accent = planAccents[plan] || planAccents.essencial;
  const bgImage = planBgs[plan] || constellationBg;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Plan-specific background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.12,
          maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
        }}
      />
      {/* Accent glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full pointer-events-none z-0 blur-[150px]"
        style={{ background: accent.glow }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Link to="/#investimento" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Voltar aos planos
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }} />
            <span className="text-white/60">Prévia</span>
            <span className="text-white font-bold capitalize">{plan}</span>
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
                  Veja seu site{" "}
                  <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-accent-deep">
                    antes de contratar
                  </span>
                </h1>
                <p className="text-white/50">
                  Escolha como quer gerar sua prévia — deixe a IA criar tudo ou preencha manualmente.
                </p>
                <p className="text-xs text-white/30 mt-2">{planLabels[plan]}</p>

                {previewCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent" />
                    </span>
                    <span className="text-xs text-white/50">
                      <motion.span key={previewCount} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="font-bold text-white/80">{previewCount}</motion.span>
                      {" "}sites já criados
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Mode Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-6">
                <button
                  onClick={() => setMode("ia")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all relative ${
                    mode === "ia"
                      ? "bg-gradient-to-r from-brand-accent to-brand-accent-deep text-white shadow-lg"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <Wand2 size={16} />
                  Prévia Inteligente (IA)
                  <span className="absolute -top-2.5 right-2 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white rounded-full leading-none">Recomendado</span>
                </button>
                <button
                  onClick={() => setMode("manual")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                    mode === "manual"
                      ? "bg-white/10 text-white shadow-lg"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <PenLine size={16} />
                  Preencher Manual
                </button>
              </div>

              <div className="space-y-6 bg-white/[0.04] border border-white/10 rounded-2xl p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {mode === "ia" ? (
                    <motion.div key="ia-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                      {/* AI Mode — Simplified */}
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent/10 border border-brand-accent/20 mb-4">
                          <Wand2 size={14} className="text-brand-accent" />
                          <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">IA gera tudo para você</span>
                        </div>
                        <p className="text-white/40 text-sm max-w-md mx-auto">
                          Informe apenas o ramo do seu negócio e a IA criará nome fictício, slogan, descrição, serviços, depoimentos e imagens profissionais automaticamente.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className={labelClass}>Ramo / Segmento do negócio *</label>
                          <input type="text" value={segment} onChange={(e) => setSegment(e.target.value)}
                            placeholder="Ex: Barbearia, Restaurante, Clínica Odontológica, Loja de Roupas..."
                            className={inputClass} maxLength={60} />
                          <p className="text-[10px] text-white/25 mt-1.5">Quanto mais específico, melhor será o resultado. Ex: "Hamburgueria artesanal" ao invés de "Restaurante".</p>
                        </div>

                        <div className="border-t border-white/[0.06]" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Seu nome ou empresa *</label>
                            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                              placeholder="Para personalizar a prévia" className={inputClass} maxLength={100} required />
                          </div>
                          <div>
                            <label className={labelClass}>WhatsApp *</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                              placeholder="(43) 99999-9999" className={inputClass} maxLength={20} required />
                          </div>
                        </div>

                        <div className="border-t border-white/[0.06]" />

                        {/* Palette */}
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">Tonalidade do site</h3>
                          <div className="grid grid-cols-5 gap-2">
                            {colorPalettes.map((palette) => (
                              <button
                                key={palette.id}
                                type="button"
                                onClick={() => setSelectedPalette(palette.id)}
                                className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                                  selectedPalette === palette.id
                                    ? "border-white/30 bg-white/[0.08] ring-1 ring-white/20 scale-[1.04]"
                                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                                }`}
                              >
                                <div className="w-full h-6 rounded-lg border border-white/10" style={{ background: palette.gradient }} />
                                <span className={`text-[9px] font-semibold tracking-wide uppercase leading-none ${
                                  selectedPalette === palette.id ? "text-white" : "text-white/40"
                                }`}>{palette.label}</span>
                                {selectedPalette === palette.id && (
                                  <motion.div layoutId="palette-check" className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-lg">
                                    <Check size={9} className="text-black" strokeWidth={3} />
                                  </motion.div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="manual-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      {/* Manual Mode — Full form */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
                          <Building2 size={14} /> Dados da empresa
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className={labelClass}>Nome da empresa *</label>
                            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                              placeholder="Ex: Barbearia do João" className={inputClass} maxLength={100} />
                          </div>
                          <div>
                            <label className={labelClass}>Telefone / WhatsApp</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                              placeholder="(43) 99999-9999" className={inputClass} maxLength={20} />
                          </div>
                          <div>
                            <label className={labelClass}>CNPJ <span className="text-white/30">(opcional)</span></label>
                            <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)}
                              placeholder="00.000.000/0000-00" className={inputClass} maxLength={20} />
                          </div>
                          <div>
                            <label className={labelClass}>Segmento <span className="text-white/30">(opcional)</span></label>
                            <input type="text" value={segment} onChange={(e) => setSegment(e.target.value)}
                              placeholder="Ex: Barbearia, Clínica, Restaurante..." className={inputClass} maxLength={60} />
                          </div>
                          <div>
                            <label className={labelClass}>Slogan <span className="text-white/30">(opcional)</span></label>
                            <input type="text" value={slogan} onChange={(e) => setSlogan(e.target.value)}
                              placeholder="Ex: Onde estilo encontra tradição" className={inputClass} maxLength={100} />
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelClass}>Sobre a empresa <span className="text-white/30">(opcional)</span></label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                              placeholder="Descreva brevemente o que sua empresa faz, serviços, diferenciais..."
                              className={`${inputClass} resize-none h-20`} maxLength={500} />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/[0.06] my-6" />

                      {/* Images */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
                          <Image size={14} /> Imagens
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Logo <span className="text-white/30">(opcional)</span></label>
                            <label className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl bg-white/[0.06] border border-dashed border-white/15 text-white/40 hover:border-white/30 hover:text-white/60 transition-colors cursor-pointer">
                              {logoPreview ? (
                                <div className="flex items-center gap-3">
                                  <img src={logoPreview} alt="Logo" className="h-10 w-10 object-contain rounded" />
                                  <span className="text-xs text-white/50">Logo enviada ✓</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2"><Upload size={16} /><span className="text-sm">Enviar logo</span></div>
                              )}
                              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setLogoFile, setLogoPreview)} className="hidden" />
                            </label>
                          </div>
                          <div>
                            <label className={labelClass}>Banner / Hero <span className="text-white/30">(opcional)</span></label>
                            <label className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl bg-white/[0.06] border border-dashed border-white/15 text-white/40 hover:border-white/30 hover:text-white/60 transition-colors cursor-pointer">
                              {bannerPreview ? (
                                <div className="flex items-center gap-3">
                                  <img src={bannerPreview} alt="Banner" className="h-10 w-16 object-cover rounded" />
                                  <span className="text-xs text-white/50">Banner enviado ✓</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2"><Upload size={16} /><span className="text-sm">Enviar banner</span></div>
                              )}
                              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setBannerFile, setBannerPreview)} className="hidden" />
                            </label>
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelClass}>Galeria de fotos <span className="text-white/30">(até 6 fotos)</span></label>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                              {galleryPreviews.map((src, i) => (
                                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                                  <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => removeGalleryImage(i)}
                                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={10} className="text-white" />
                                  </button>
                                </div>
                              ))}
                              {galleryFiles.length < 6 && (
                                <label className="aspect-square rounded-lg border border-dashed border-white/15 flex items-center justify-center text-white/30 hover:text-white/50 hover:border-white/30 cursor-pointer transition-colors">
                                  <Upload size={18} />
                                  <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/[0.06] my-6" />

                      {/* Palette */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">Tonalidade do site</h3>
                        <div className="grid grid-cols-5 gap-2">
                          {colorPalettes.map((palette) => (
                            <button
                              key={palette.id}
                              type="button"
                              onClick={() => setSelectedPalette(palette.id)}
                              className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                                selectedPalette === palette.id
                                  ? "border-white/30 bg-white/[0.08] ring-1 ring-white/20 scale-[1.04]"
                                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                              }`}
                            >
                              <div className="w-full h-6 rounded-lg border border-white/10" style={{ background: palette.gradient }} />
                              <span className={`text-[9px] font-semibold tracking-wide uppercase leading-none ${
                                selectedPalette === palette.id ? "text-white" : "text-white/40"
                              }`}>{palette.label}</span>
                              {selectedPalette === palette.id && (
                                <motion.div layoutId="palette-check-manual" className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-lg">
                                  <Check size={9} className="text-black" strokeWidth={3} />
                                </motion.div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generate}
                  disabled={!canGenerate}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-brand-accent to-brand-accent-deep text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                >
                  {mode === "ia" ? <Wand2 size={16} /> : <Sparkles size={16} />}
                  {mode === "ia" ? "Gerar prévia com IA" : "Gerar prévia do meu site"}
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
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    {generating && (
                      <div className="flex items-center gap-3 text-sm">
                        <Loader2 size={16} className="animate-spin text-brand-accent" />
                        <span className="text-white/80">
                          {uploading ? "Enviando imagens..." : mode === "ia" ? "IA criando seu site..." : "Gerando seu site..."}
                        </span>
                        <span className="text-white/40 tabular-nums">
                          {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
                        </span>
                        {!uploading && (
                          <span className="text-white/30">
                            / ~{Math.floor((estimatedTimes[plan] || 60) / 60)}:{String((estimatedTimes[plan] || 60) % 60).padStart(2, "0")} estimado
                          </span>
                        )}
                      </div>
                    )}
                    {done && (
                      <span className="text-sm text-brand-accent font-medium">✓ Prévia pronta!</span>
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
                      <button
                        onClick={() => { setHtmlContent(""); setDone(false); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-sm text-white/70 hover:text-white transition-colors"
                      >
                        <RotateCcw size={14} /> Refazer
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {generating && !uploading && (
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-brand-accent to-brand-accent-deep"
                      initial={{ width: "0%" }}
                      animate={{ width: `${Math.min((elapsed / (estimatedTimes[plan] || 60)) * 100, 95)}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                )}
              </div>

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

              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center pt-6 space-y-4"
                >
                  <p className="text-white/50 text-lg">O que achou da prévia?</p>
                  {!feedbackGiven ? (
                    <div className="flex items-center justify-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleFeedback("like")}
                        className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-brand-accent/20 border border-brand-accent/30 text-brand-accent hover:bg-brand-accent/30 transition-colors text-lg"
                      >
                        <ThumbsUp size={22} /> Adorei!
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleFeedback("dislike")}
                        className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-white/[0.06] border border-white/10 text-white/50 hover:text-white/70 hover:bg-white/[0.1] transition-colors text-lg"
                      >
                        <ThumbsDown size={22} /> Não curti
                      </motion.button>
                    </div>
                  ) : feedbackGiven === "like" ? (
                    <div className="space-y-3">
                      <p className="text-brand-accent font-bold text-lg">🎉 Que ótimo! Redirecionamos você para o WhatsApp!</p>
                      <p className="text-white/40 text-sm">Caso não tenha aberto, clique abaixo:</p>
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={`https://wa.me/5543991065129?text=${encodeURIComponent(`Olá! Gerei uma prévia do site para "${businessName.trim() || segment.trim()}" no plano ${plan} e adorei! Quero contratar.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-brand-accent to-brand-accent-deep text-white"
                      >
                        Abrir WhatsApp
                      </motion.a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-white/60 font-medium">Obrigado pelo feedback! 🙏</p>
                      <p className="text-white/30 text-sm">Registramos sua opinião. Quer tentar novamente com outras configurações?</p>
                      <button
                        onClick={() => { setHtmlContent(""); setDone(false); setFeedbackGiven(null); setPreviewId(null); }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-sm text-white/60 hover:text-white transition-colors"
                      >
                        <RotateCcw size={14} /> Gerar nova prévia
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
