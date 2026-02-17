import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, Loader2, Monitor, Smartphone, RotateCcw,
  Check, Upload, X, ShoppingBag, Package, Truck, Plus,
  ThumbsUp, ThumbsDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

interface Product {
  name: string;
  price: string;
  category: string;
  imageFile: File | null;
  imagePreview: string | null;
}

const emptyProduct = (): Product => ({ name: "", price: "", category: "", imageFile: null, imagePreview: null });

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

export default function PreviewLoja() {
  // Store data
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [slogan, setSlogan] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [segment, setSegment] = useState("");
  const [selectedPalette, setSelectedPalette] = useState("midnight");

  // Files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Products
  const [products, setProducts] = useState<Product[]>([emptyProduct()]);

  // Shipping
  const [shippingEnabled, setShippingEnabled] = useState(false);
  const [shippingCep, setShippingCep] = useState("");
  const [shippingValue, setShippingValue] = useState("");
  const [freeShippingAbove, setFreeShippingAbove] = useState("");

  // Generation
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [done, setDone] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [elapsed, setElapsed] = useState(0);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    setProducts(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handleProductImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateProduct(index, "imageFile", file);
      const reader = new FileReader();
      reader.onload = () => updateProduct(index, "imagePreview", reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addProduct = () => {
    if (products.length < 4) setProducts(prev => [...prev, emptyProduct()]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const generate = useCallback(async () => {
    if (!storeName.trim()) return;
    const validProducts = products.filter(p => p.name.trim() && p.price.trim());
    if (validProducts.length === 0) return;

    setGenerating(true);
    setUploading(true);
    setHtmlContent("");
    setDone(false);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    try {
      // Upload files
      let logoUrl: string | null = null;
      let bannerUrl: string | null = null;
      if (logoFile) logoUrl = await uploadToStorage(logoFile, "logos");
      if (bannerFile) bannerUrl = await uploadToStorage(bannerFile, "banners");

      // Upload product images
      const productData = [];
      for (const p of validProducts) {
        let imageUrl: string | null = null;
        if (p.imageFile) imageUrl = await uploadToStorage(p.imageFile, "products");
        productData.push({
          name: p.name.trim(),
          price: p.price.trim(),
          category: p.category.trim() || null,
          imageUrl,
        });
      }

      setUploading(false);

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-store-preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            storeName: storeName.trim(),
            phone: phone.trim(),
            slogan: slogan.trim() || null,
            cnpj: cnpj.trim() || null,
            segment: segment.trim() || null,
            logoUrl,
            bannerUrl,
            products: productData,
            colorPalette: selectedPalette,
            shipping: shippingEnabled ? {
              cep: shippingCep.trim() || null,
              value: shippingValue.trim() || null,
              freeAbove: freeShippingAbove.trim() || null,
            } : null,
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

      // Save to storage + DB
      try {
        let cleaned = fullHtml;
        if (cleaned.startsWith("```html")) cleaned = cleaned.slice(7);
        if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
        if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
        const finalHtml = cleaned.trim();

        const storagePath = `previews/loja-${Date.now()}-${Math.random().toString(36).slice(2)}.html`;
        const htmlBlob = new Blob([finalHtml], { type: "text/html" });
        await supabase.storage.from("site-previews").upload(storagePath, htmlBlob, { upsert: true });

        const { data: insertData } = await supabase.from("site_previews").insert({
          client_name: storeName.trim(),
          client_phone: phone.trim() || null,
          segment: segment.trim() || "loja-virtual",
          slogan: slogan.trim() || null,
          plan: "nuvemshop",
          color_palette: selectedPalette,
          html_storage_path: storagePath,
        }).select("id").single();

        if (insertData) setPreviewId(insertData.id);
      } catch (saveErr) {
        console.error("Failed to save preview:", saveErr);
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
  }, [storeName, phone, slogan, cnpj, segment, logoFile, bannerFile, products, selectedPalette, shippingEnabled, shippingCep, shippingValue, freeShippingAbove]);

  const handleFeedback = async (type: "like" | "dislike") => {
    setFeedbackGiven(type);
    if (previewId) {
      await supabase.from("site_previews").update({ feedback: type, feedback_at: new Date().toISOString() }).eq("id", previewId);
    }
    if (type === "like") {
      window.open(
        `https://wa.me/5543991065129?text=${encodeURIComponent(`Olá! Gerei uma prévia de loja virtual para "${storeName}" e adorei! Quero contratar.`)}`,
        "_blank"
      );
    }
  };

  const validProductCount = products.filter(p => p.name.trim() && p.price.trim()).length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Link to="/#investimento" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <ShoppingBag size={14} className="text-brand-accent" />
            <span className="text-white/60">Prévia</span>
            <span className="text-white font-bold">Loja Virtual</span>
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
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl md:text-4xl font-black mb-3">
                  Prévia da sua{" "}
                  <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-accent-deep">
                    loja virtual
                  </span>
                </h1>
                <p className="text-white/50">Cadastre seus produtos e veja como sua loja ficará — com vitrine, carrinho e frete simulado.</p>
                
                {/* ADM TEST BUTTON - REMOVER DEPOIS */}
                <button
                  type="button"
                  onClick={() => {
                    setStoreName("Style Wear");
                    setPhone("(43) 99999-1234");
                    setSlogan("Vista-se como você é");
                    setSegment("Roupas e Moda");
                    setCnpj("12.345.678/0001-00");
                    setSelectedPalette("midnight");
                    setShippingEnabled(true);
                    setShippingCep("86010-000");
                    setShippingValue("14,90");
                    setFreeShippingAbove("199,90");
                    setProducts([
                      { name: "Camiseta Oversized Premium", price: "89,90", category: "Camisetas", imageFile: null, imagePreview: null },
                      { name: "Calça Cargo Streetwear", price: "179,90", category: "Calças", imageFile: null, imagePreview: null },
                      { name: "Jaqueta Corta-Vento", price: "249,90", category: "Jaquetas", imageFile: null, imagePreview: null },
                      { name: "Tênis Urban Runner", price: "329,90", category: "Calçados", imageFile: null, imagePreview: null },
                    ]);
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500/30 transition-colors"
                >
                  🧪 Preencher Teste (ADM)
                </button>
              </div>

              <div className="space-y-6 bg-white/[0.04] border border-white/10 rounded-2xl p-6 md:p-8">
                {/* Section 1: Store Data */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
                    <ShoppingBag size={14} /> Dados da loja
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={labelClass}>Nome da loja *</label>
                      <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
                        placeholder="Ex: Style Store" className={inputClass} maxLength={100} />
                    </div>
                    <div>
                      <label className={labelClass}>WhatsApp</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="(43) 99999-9999" className={inputClass} maxLength={20} />
                    </div>
                    <div>
                      <label className={labelClass}>Segmento <span className="text-white/30">(opcional)</span></label>
                      <input type="text" value={segment} onChange={e => setSegment(e.target.value)}
                        placeholder="Ex: Roupas, Acessórios, Calçados..." className={inputClass} maxLength={60} />
                    </div>
                    <div>
                      <label className={labelClass}>Slogan <span className="text-white/30">(opcional)</span></label>
                      <input type="text" value={slogan} onChange={e => setSlogan(e.target.value)}
                        placeholder="Ex: Vista-se como você é" className={inputClass} maxLength={100} />
                    </div>
                    <div>
                      <label className={labelClass}>CNPJ <span className="text-white/30">(opcional)</span></label>
                      <input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)}
                        placeholder="00.000.000/0000-00" className={inputClass} maxLength={20} />
                    </div>
                  </div>

                  {/* Logo + Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, setLogoFile, setLogoPreview)} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <label className={labelClass}>Banner <span className="text-white/30">(opcional)</span></label>
                      <label className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl bg-white/[0.06] border border-dashed border-white/15 text-white/40 hover:border-white/30 hover:text-white/60 transition-colors cursor-pointer">
                        {bannerPreview ? (
                          <div className="flex items-center gap-3">
                            <img src={bannerPreview} alt="Banner" className="h-10 w-16 object-cover rounded" />
                            <span className="text-xs text-white/50">Banner enviado ✓</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2"><Upload size={16} /><span className="text-sm">Enviar banner</span></div>
                        )}
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, setBannerFile, setBannerPreview)} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.06]" />

                {/* Section 2: Products */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
                    <Package size={14} /> Produtos (até 4)
                  </h3>

                  <div className="space-y-4">
                    {products.map((product, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative bg-white/[0.04] border border-white/10 rounded-xl p-4"
                      >
                        {products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProduct(i)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/20 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        )}
                        <p className="text-xs text-white/30 mb-3 font-medium">Produto {i + 1}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-3">
                          {/* Product image */}
                          <label className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-white/[0.06] border border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-white/30 transition-colors overflow-hidden flex-shrink-0">
                            {product.imagePreview ? (
                              <img src={product.imagePreview} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Upload size={18} className="text-white/30" />
                            )}
                            <input type="file" accept="image/*" onChange={e => handleProductImage(i, e)} className="hidden" />
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={product.name}
                              onChange={e => updateProduct(i, "name", e.target.value)}
                              placeholder="Nome do produto *"
                              className={inputClass}
                              maxLength={80}
                            />
                            <input
                              type="text"
                              value={product.price}
                              onChange={e => updateProduct(i, "price", e.target.value)}
                              placeholder="Preço (ex: 79,90) *"
                              className={inputClass}
                              maxLength={20}
                            />
                            <input
                              type="text"
                              value={product.category}
                              onChange={e => updateProduct(i, "category", e.target.value)}
                              placeholder="Categoria (opcional)"
                              className={`${inputClass} sm:col-span-2`}
                              maxLength={40}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {products.length < 4 && (
                    <button
                      type="button"
                      onClick={addProduct}
                      className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-dashed border-white/15 text-white/40 hover:text-white/70 hover:border-white/25 transition-colors text-sm w-full justify-center"
                    >
                      <Plus size={14} /> Adicionar produto
                    </button>
                  )}
                </div>

                <div className="border-t border-white/[0.06]" />

                {/* Section 3: Shipping (optional, collapsible) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShippingEnabled(!shippingEnabled)}
                    className="flex items-center gap-3 w-full text-left"
                  >
                    <div className={`w-9 h-5 rounded-full transition-colors relative ${shippingEnabled ? "bg-brand-accent" : "bg-white/15"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${shippingEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
                        <Truck size={14} /> Frete simulado <span className="text-white/20 normal-case font-normal">(opcional)</span>
                      </h3>
                    </div>
                  </button>

                  <AnimatePresence>
                    {shippingEnabled && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <label className={labelClass}>CEP base da loja</label>
                            <input type="text" value={shippingCep} onChange={e => setShippingCep(e.target.value)}
                              placeholder="86000-000" className={inputClass} maxLength={10} />
                          </div>
                          <div>
                            <label className={labelClass}>Valor fixo do frete (R$)</label>
                            <input type="text" value={shippingValue} onChange={e => setShippingValue(e.target.value)}
                              placeholder="15,90" className={inputClass} maxLength={10} />
                          </div>
                          <div>
                            <label className={labelClass}>Frete grátis acima de (R$)</label>
                            <input type="text" value={freeShippingAbove} onChange={e => setFreeShippingAbove(e.target.value)}
                              placeholder="199,90" className={inputClass} maxLength={10} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-t border-white/[0.06]" />

                {/* Section: Palette */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">Tonalidade da loja</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {colorPalettes.map(palette => (
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
                        }`}>
                          {palette.label}
                        </span>
                        {selectedPalette === palette.id && (
                          <motion.div
                            layoutId="store-palette-check"
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-lg"
                          >
                            <Check size={9} className="text-black" strokeWidth={3} />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generate}
                  disabled={!storeName.trim() || validProductCount === 0}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-brand-accent to-brand-accent-deep text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Gerar prévia da loja ({validProductCount} produto{validProductCount !== 1 ? "s" : ""})
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
                        <Loader2 size={16} className="animate-spin text-blue-400" />
                        <span className="text-white/80">{uploading ? "Enviando imagens..." : "Gerando sua loja..."}</span>
                        <span className="text-white/40 tabular-nums">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span>
                      </div>
                    )}
                    {done && <span className="text-sm text-emerald-400">✓ Loja pronta!</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode("desktop")} className={`p-2 rounded-lg transition-colors ${viewMode === "desktop" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}>
                      <Monitor size={18} />
                    </button>
                    <button onClick={() => setViewMode("mobile")} className={`p-2 rounded-lg transition-colors ${viewMode === "mobile" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}>
                      <Smartphone size={18} />
                    </button>
                    {done && (
                      <button onClick={() => { setHtmlContent(""); setDone(false); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-sm text-white/70 hover:text-white transition-colors">
                        <RotateCcw size={14} /> Refazer
                      </button>
                    )}
                  </div>
                </div>

                {generating && !uploading && (
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${Math.min((elapsed / 80) * 100, 95)}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <div
                  className={`rounded-2xl overflow-hidden border border-white/10 bg-white transition-all duration-500 ${viewMode === "mobile" ? "w-[390px]" : "w-full"}`}
                  style={{ height: "75vh" }}
                >
                  <iframe ref={iframeRef} srcDoc={htmlContent} title="Prévia da loja" className="w-full h-full border-0" sandbox="allow-scripts" />
                </div>
              </div>

              {done && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-6 space-y-4">
                  <p className="text-white/50 text-lg">O que achou da sua loja?</p>
                  {!feedbackGiven ? (
                    <div className="flex items-center justify-center gap-4">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleFeedback("like")}
                        className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-lg">
                        <ThumbsUp size={22} /> Adorei!
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleFeedback("dislike")}
                        className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-white/[0.06] border border-white/10 text-white/50 hover:text-white/70 hover:bg-white/[0.1] transition-colors text-lg">
                        <ThumbsDown size={22} /> Não curti
                      </motion.button>
                    </div>
                  ) : feedbackGiven === "like" ? (
                    <div className="space-y-3">
                      <p className="text-emerald-400 font-bold text-lg">🎉 Que ótimo! Redirecionamos você para o WhatsApp!</p>
                      <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        href={`https://wa.me/5543991065129?text=${encodeURIComponent(`Olá! Gerei uma prévia de loja virtual para "${storeName}" e adorei! Quero contratar.`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                        Abrir WhatsApp
                      </motion.a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-white/60 font-medium">Obrigado pelo feedback! 🙏</p>
                      <button onClick={() => { setHtmlContent(""); setDone(false); setFeedbackGiven(null); setPreviewId(null); }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-sm text-white/60 hover:text-white transition-colors">
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