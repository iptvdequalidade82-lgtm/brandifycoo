import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, Clock, Plus, Trash2, Copy, Check, Eye, Edit3,
  Sparkles, ChevronRight, Phone, MessageSquare, Zap, Globe,
  CheckCircle2, ArrowRight, Settings, Palette, Share2, X, GripVertical
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PlanGate from "@/components/PlanGate";
import { useToast } from "@/hooks/use-toast";

interface TimeSlot {
  id: string;
  day: string;
  start: string;
  end: string;
}

interface SchedulerConfig {
  businessName: string;
  whatsapp: string;
  services: string[];
  slots: TimeSlot[];
  message: string;
  accentColor: string;
}

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const DAYS_SHORT: Record<string, string> = {
  Segunda: "Seg", Terça: "Ter", Quarta: "Qua", Quinta: "Qui", Sexta: "Sex", Sábado: "Sáb", Domingo: "Dom",
};

const ACCENT_COLORS = [
  { name: "Rosa", value: "pink", from: "from-pink-500", to: "to-rose-500", bg: "bg-pink-500", text: "text-pink-400", border: "border-pink-500/20", bgSoft: "bg-pink-500/10" },
  { name: "Azul", value: "blue", from: "from-blue-500", to: "to-cyan-500", bg: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/20", bgSoft: "bg-blue-500/10" },
  { name: "Violeta", value: "violet", from: "from-violet-500", to: "to-purple-500", bg: "bg-violet-500", text: "text-violet-400", border: "border-violet-500/20", bgSoft: "bg-violet-500/10" },
  { name: "Esmeralda", value: "emerald", from: "from-emerald-500", to: "to-teal-500", bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/20", bgSoft: "bg-emerald-500/10" },
  { name: "Âmbar", value: "amber", from: "from-amber-500", to: "to-orange-500", bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/20", bgSoft: "bg-amber-500/10" },
];

const STEP_CONFIG = [
  { label: "Negócio", icon: Edit3, color: "pink" },
  { label: "Serviços", icon: Zap, color: "amber" },
  { label: "Horários", icon: Clock, color: "blue" },
  { label: "Mensagem", icon: MessageSquare, color: "emerald" },
  { label: "Estilo", icon: Palette, color: "violet" },
];

const getAccent = (color: string) => ACCENT_COLORS.find(c => c.value === color) || ACCENT_COLORS[0];

export function AgendadorContent() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<SchedulerConfig>({
    businessName: "",
    whatsapp: "",
    services: [""],
    slots: [{ id: crypto.randomUUID(), day: "Segunda", start: "09:00", end: "18:00" }],
    message: "Olá! Gostaria de agendar um horário para {servico} no dia {dia} às {hora}. Pode confirmar?",
    accentColor: "pink",
  });
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const accent = getAccent(config.accentColor);

  const addService = useCallback(() => setConfig(p => ({ ...p, services: [...p.services, ""] })), []);
  const removeService = useCallback((i: number) => setConfig(p => ({ ...p, services: p.services.filter((_, idx) => idx !== i) })), []);
  const updateService = useCallback((i: number, val: string) => setConfig(p => ({ ...p, services: p.services.map((s, idx) => idx === i ? val : s) })), []);

  const addSlot = useCallback(() => setConfig(p => ({
    ...p,
    slots: [...p.slots, { id: crypto.randomUUID(), day: "Segunda", start: "09:00", end: "18:00" }],
  })), []);
  const removeSlot = useCallback((id: string) => setConfig(p => ({ ...p, slots: p.slots.filter(s => s.id !== id) })), []);
  const updateSlot = useCallback((id: string, field: keyof TimeSlot, val: string) => setConfig(p => ({
    ...p,
    slots: p.slots.map(s => s.id === id ? { ...s, [field]: val } : s),
  })), []);

  const generateWhatsAppLink = useCallback(() => {
    const msg = config.message
      .replace("{servico}", selectedService || "consulta")
      .replace("{dia}", selectedDay || "a combinar")
      .replace("{hora}", selectedTime || "a combinar");
    const phone = config.whatsapp.replace(/\D/g, "");
    return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
  }, [config.message, config.whatsapp, selectedService, selectedDay, selectedTime]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(generateWhatsAppLink());
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  }, [generateWhatsAppLink, toast]);

  const canProceed = useMemo(() => {
    if (step === 0) return config.businessName.trim() && config.whatsapp.trim();
    if (step === 1) return config.services.some(s => s.trim());
    if (step === 2) return config.slots.length > 0;
    return true;
  }, [step, config]);

  const completedSteps = useMemo(() => {
    const c = new Set<number>();
    if (config.businessName.trim() && config.whatsapp.trim()) c.add(0);
    if (config.services.some(s => s.trim())) c.add(1);
    if (config.slots.length > 0) c.add(2);
    if (config.message.trim()) c.add(3);
    c.add(4); // style always complete
    return c;
  }, [config]);

  const totalSteps = 5;
  const progressPct = (completedSteps.size / totalSteps) * 100;

  if (!showPreview) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm hidden sm:inline">Voltar</span>
            </Link>

            {/* Center: Step indicator (mobile) */}
            <div className="flex items-center gap-1.5 sm:hidden">
              {STEP_CONFIG.map((_, i) => (
                <button key={i} onClick={() => setStep(i)} className={`w-2 h-2 rounded-full transition-all ${step === i ? `${accent.bg} w-5` : completedSteps.has(i) ? "bg-emerald-500/50" : "bg-white/10"}`} />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setShowPreview(true)}
                disabled={completedSteps.size < 3}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${accent.from} ${accent.to} text-white text-xs font-bold disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-lg`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </motion.button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 lg:gap-10">

            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block space-y-4 lg:sticky lg:top-24 lg:self-start"
            >
              <nav className="rounded-2xl bg-white/[0.015] border border-white/[0.06] overflow-hidden">
                {STEP_CONFIG.map((s, i) => {
                  const active = step === i;
                  const completed = completedSteps.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all relative ${
                        active
                          ? "bg-white/[0.04] text-white"
                          : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-indicator"
                          className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b ${accent.from} ${accent.to}`}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        active ? `${accent.bgSoft}` : completed ? "bg-emerald-500/10" : "bg-white/[0.03]"
                      }`}>
                        {completed && !active ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <s.icon className={`w-3.5 h-3.5 ${active ? accent.text : "text-white/20"}`} />
                        )}
                      </div>
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Progress bar */}
              <div className="rounded-2xl bg-white/[0.015] border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-white/20 font-semibold">Progresso</span>
                  <span className={`text-xs font-bold ${accent.text}`}>{completedSteps.size}/{totalSteps}</span>
                </div>
                <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${accent.from} ${accent.to} rounded-full`}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.aside>

            {/* Content */}
            <div className="min-w-0">
              {/* Mobile step title */}
              <div className="flex items-center gap-3 mb-6 lg:hidden">
                <div className={`w-9 h-9 rounded-xl ${accent.bgSoft} flex items-center justify-center`}>
                  {(() => { const Icon = STEP_CONFIG[step].icon; return <Icon className={`w-4 h-4 ${accent.text}`} />; })()}
                </div>
                <div>
                  <h2 className="font-['Playfair_Display'] font-bold text-base">{STEP_CONFIG[step].label}</h2>
                  <p className="text-white/25 text-[11px]">Etapa {step + 1} de {totalSteps}</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* ── Step 0: Business Info ── */}
                  {step === 0 && (
                    <div className="space-y-5">
                      <div className="hidden lg:flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 flex items-center justify-center">
                          <Edit3 className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <h2 className="font-['Playfair_Display'] font-bold text-xl">Dados do Negócio</h2>
                          <p className="text-white/25 text-xs">Informações que aparecerão na página</p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] divide-y divide-white/[0.04]">
                        <div className="p-5">
                          <label className="text-[11px] uppercase tracking-wider text-white/25 font-semibold mb-2.5 block">Nome do negócio</label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                            <input
                              value={config.businessName}
                              onChange={e => setConfig(p => ({ ...p, businessName: e.target.value }))}
                              placeholder="Ex: Studio Hair, Clínica Bella..."
                              className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] focus:border-pink-500/30 focus:ring-1 focus:ring-pink-500/10 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/12 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="p-5">
                          <label className="text-[11px] uppercase tracking-wider text-white/25 font-semibold mb-2.5 block">WhatsApp (com DDD)</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                            <input
                              value={config.whatsapp}
                              onChange={e => setConfig(p => ({ ...p, whatsapp: e.target.value }))}
                              placeholder="Ex: 11999998888"
                              className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] focus:border-pink-500/30 focus:ring-1 focus:ring-pink-500/10 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/12 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-gradient-to-r from-pink-500/[0.03] to-transparent border border-pink-500/[0.08] p-4 flex gap-3">
                        <Sparkles className="w-4 h-4 text-pink-400/60 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-white/30 leading-relaxed">
                          O nome aparecerá como título principal da página. Use algo curto e memorável.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Step 1: Services ── */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <div className="hidden lg:flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h2 className="font-['Playfair_Display'] font-bold text-xl">Serviços</h2>
                          <p className="text-white/25 text-xs">Adicione os serviços disponíveis para agendamento</p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-2.5">
                        {config.services.map((s, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex gap-2 group items-center"
                          >
                            <div className="w-7 h-10 rounded-lg bg-white/[0.02] flex items-center justify-center shrink-0 text-white/10 text-[10px] font-bold">
                              {i + 1}
                            </div>
                            <input
                              value={s}
                              onChange={e => updateService(i, e.target.value)}
                              placeholder={["Corte de cabelo", "Consulta de marketing", "Massagem relaxante", "Design de logo"][i % 4]}
                              className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.06] focus:border-amber-500/25 focus:ring-1 focus:ring-amber-500/10 px-4 py-2.5 text-sm text-white placeholder:text-white/10 outline-none transition-all"
                            />
                            {config.services.length > 1 && (
                              <button
                                onClick={() => removeService(i)}
                                className="text-white/8 hover:text-red-400 transition-colors p-1.5 opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </motion.div>
                        ))}

                        <button
                          onClick={addService}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/[0.06] hover:border-amber-500/20 hover:bg-amber-500/[0.02] text-white/20 hover:text-amber-400 text-xs font-medium transition-all mt-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar serviço
                        </button>
                      </div>

                      {config.services.filter(Boolean).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {config.services.filter(Boolean).map((s, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-full bg-amber-500/[0.06] border border-amber-500/10 text-[11px] text-amber-400/70 font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Step 2: Time Slots ── */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <div className="hidden lg:flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h2 className="font-['Playfair_Display'] font-bold text-xl">Horários</h2>
                          <p className="text-white/25 text-xs">Configure os dias e horários de atendimento</p>
                        </div>
                      </div>

                      {/* Weekly overview at top */}
                      <div className="rounded-2xl bg-white/[0.015] border border-white/[0.06] p-4">
                        <span className="text-[10px] uppercase tracking-widest text-white/15 font-semibold mb-3 block">Visão Semanal</span>
                        <div className="grid grid-cols-7 gap-1.5">
                          {DAYS.map(d => {
                            const daySlots = config.slots.filter(s => s.day === d);
                            const has = daySlots.length > 0;
                            return (
                              <div
                                key={d}
                                className={`rounded-xl py-3 text-center transition-all ${
                                  has
                                    ? "bg-blue-500/[0.08] border border-blue-500/15"
                                    : "bg-white/[0.01] border border-white/[0.03]"
                                }`}
                              >
                                <div className={`text-[10px] font-bold mb-1 ${has ? "text-blue-400" : "text-white/12"}`}>
                                  {DAYS_SHORT[d]}
                                </div>
                                {has && (
                                  <div className="text-[9px] text-blue-400/40 font-medium">
                                    {daySlots[0].start}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 sm:p-5 space-y-2.5">
                        {config.slots.map((slot, i) => (
                          <motion.div
                            key={slot.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="rounded-xl bg-white/[0.015] border border-white/[0.05] p-3 sm:p-4 group hover:border-blue-500/15 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                              <select
                                value={slot.day}
                                onChange={e => updateSlot(slot.id, "day", e.target.value)}
                                className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2.5 text-sm text-white outline-none appearance-none min-w-[110px] cursor-pointer focus:border-blue-500/25"
                              >
                                {DAYS.map(d => <option key={d} value={d} className="bg-[#0a0a0a]">{d}</option>)}
                              </select>

                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="time"
                                  value={slot.start}
                                  onChange={e => updateSlot(slot.id, "start", e.target.value)}
                                  className="flex-1 sm:flex-none rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/25"
                                />
                                <span className="text-white/10 text-xs">até</span>
                                <input
                                  type="time"
                                  value={slot.end}
                                  onChange={e => updateSlot(slot.id, "end", e.target.value)}
                                  className="flex-1 sm:flex-none rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/25"
                                />
                              </div>

                              {config.slots.length > 1 && (
                                <button
                                  onClick={() => removeSlot(slot.id)}
                                  className="text-white/8 hover:text-red-400 transition-colors p-2 self-end sm:self-auto sm:opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}

                        <button
                          onClick={addSlot}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/[0.06] hover:border-blue-500/20 hover:bg-blue-500/[0.02] text-white/20 hover:text-blue-400 text-xs font-medium transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar horário
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Message ── */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <div className="hidden lg:flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h2 className="font-['Playfair_Display'] font-bold text-xl">Mensagem</h2>
                          <p className="text-white/25 text-xs">Personalize o texto enviado ao WhatsApp</p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-4">
                        <textarea
                          value={config.message}
                          onChange={e => setConfig(p => ({ ...p, message: e.target.value }))}
                          rows={4}
                          className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] focus:border-emerald-500/25 focus:ring-1 focus:ring-emerald-500/10 px-4 py-3.5 text-sm text-white placeholder:text-white/12 resize-none outline-none transition-all leading-relaxed"
                        />

                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10px] text-white/15 self-center mr-1">Variáveis:</span>
                          {["{servico}", "{dia}", "{hora}"].map(v => (
                            <button
                              key={v}
                              onClick={() => {
                                if (!config.message.includes(v)) {
                                  setConfig(p => ({ ...p, message: p.message + " " + v }));
                                }
                              }}
                              className="px-2.5 py-1 rounded-md bg-emerald-500/[0.06] border border-emerald-500/12 text-[10px] text-emerald-400/80 font-mono font-medium hover:bg-emerald-500/10 transition-all cursor-pointer"
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* WhatsApp-style preview */}
                      <div className="rounded-2xl bg-white/[0.015] border border-white/[0.06] p-5">
                        <span className="text-[10px] uppercase tracking-widest text-white/15 font-semibold mb-3 block">Pré-visualização</span>
                        <div className="rounded-2xl bg-[#0b3d2e]/30 border border-[#0b3d2e]/40 p-4 relative">
                          <div className="absolute top-2 right-3 text-[9px] text-white/15">12:30</div>
                          <p className="text-[13px] text-white/60 leading-relaxed pr-10">
                            {config.message
                              .replace("{servico}", config.services.find(s => s.trim()) || "consulta")
                              .replace("{dia}", "Segunda")
                              .replace("{hora}", "10:00")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 4: Style ── */}
                  {step === 4 && (
                    <div className="space-y-5">
                      <div className="hidden lg:flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center">
                          <Palette className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <h2 className="font-['Playfair_Display'] font-bold text-xl">Estilo Visual</h2>
                          <p className="text-white/25 text-xs">Escolha a cor de destaque da página</p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
                        <label className="text-[11px] uppercase tracking-wider text-white/20 font-semibold mb-4 block">Cor de Destaque</label>
                        <div className="grid grid-cols-5 gap-3">
                          {ACCENT_COLORS.map(c => (
                            <button
                              key={c.value}
                              onClick={() => setConfig(p => ({ ...p, accentColor: c.value }))}
                              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all ${
                                config.accentColor === c.value
                                  ? `${c.border} bg-white/[0.04]`
                                  : "border-white/[0.04] hover:border-white/[0.08]"
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.from} ${c.to} shadow-lg`} />
                              <span className={`text-[10px] font-semibold ${config.accentColor === c.value ? c.text : "text-white/25"}`}>
                                {c.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mini preview */}
                      <div className="rounded-2xl bg-white/[0.015] border border-white/[0.06] p-5">
                        <span className="text-[10px] uppercase tracking-widest text-white/15 font-semibold mb-4 block">Pré-visualização</span>
                        <div className="bg-black/60 rounded-xl border border-white/[0.06] p-6 text-center space-y-4">
                          <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${accent.from} ${accent.to} opacity-20 flex items-center justify-center`}>
                            <Calendar className={`w-7 h-7 ${accent.text}`} />
                          </div>
                          <h3 className="font-['Playfair_Display'] font-bold text-lg">{config.businessName || "Seu Negócio"}</h3>
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${accent.from} ${accent.to} text-white text-xs font-bold`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                            Agendar via WhatsApp
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/[0.04]">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 disabled:opacity-10 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {step < totalSteps - 1 ? (
                  <motion.button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-sm text-white font-medium disabled:opacity-15 transition-all"
                  >
                    Próximo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => setShowPreview(true)}
                    disabled={completedSteps.size < 3}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r ${accent.from} ${accent.to} text-sm text-white font-bold disabled:opacity-20 transition-all shadow-lg`}
                  >
                    <Eye className="w-4 h-4" />
                    Ver Preview
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PREVIEW MODE
  // ═══════════════════════════════════════════
  const availableDays = [...new Set(config.slots.map(s => s.day))];
  const previewSteps = [
    { num: 1, label: "Serviço", done: !!selectedService },
    { num: 2, label: "Dia", done: !!selectedDay },
    { num: 3, label: "Horário", done: !!selectedTime },
  ];

  const allSelected = selectedService && selectedDay && selectedTime;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Preview toolbar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => { setShowPreview(false); setSelectedService(""); setSelectedDay(""); setSelectedTime(""); }} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">Editar</span>
          </button>
          <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.04] text-[9px] text-white/25 uppercase tracking-widest font-semibold">Preview</span>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] text-[11px] text-white/40 hover:text-white transition-all">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Brand */}
          <div className="text-center space-y-5">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${accent.from}/15 ${accent.to}/10 border ${accent.border} flex items-center justify-center shadow-2xl`}
            >
              <Calendar className={`w-9 h-9 ${accent.text}`} />
            </motion.div>
            <div>
              <h1 className="font-['Playfair_Display'] font-bold text-2xl sm:text-3xl mb-2">{config.businessName}</h1>
              <p className="text-white/25 text-sm">Escolha o serviço, dia e horário</p>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2">
            {previewSteps.map((ps, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                  ps.done
                    ? `${accent.bgSoft} ${accent.text} ${accent.border} border`
                    : "bg-white/[0.02] text-white/15 border border-white/[0.04]"
                }`}>
                  {ps.done ? <Check className="w-2.5 h-2.5" /> : <span className="w-3 text-center">{ps.num}</span>}
                  {ps.label}
                </div>
                {i < previewSteps.length - 1 && <div className="w-3 h-px bg-white/[0.06]" />}
              </div>
            ))}
          </div>

          {/* Service selection */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-white/20 font-semibold">Escolha o serviço</label>
            <div className="space-y-1.5">
              {config.services.filter(Boolean).map((s, i) => (
                <motion.button
                  key={s}
                  onClick={() => { setSelectedService(s); setSelectedDay(""); setSelectedTime(""); }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                    selectedService === s
                      ? `${accent.border} ${accent.bgSoft} text-white`
                      : "border-white/[0.05] bg-white/[0.015] text-white/40 hover:bg-white/[0.03] hover:border-white/[0.08]"
                  }`}
                >
                  <span>{s}</span>
                  {selectedService === s && <CheckCircle2 className={`w-4 h-4 ${accent.text}`} />}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Day selection */}
          <AnimatePresence>
            {selectedService && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <label className="text-[10px] uppercase tracking-widest text-white/20 font-semibold">Escolha o dia</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableDays.map(d => {
                    const daySlot = config.slots.find(s => s.day === d);
                    return (
                      <motion.button
                        key={d}
                        onClick={() => { setSelectedDay(d); setSelectedTime(""); }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          selectedDay === d
                            ? `${accent.border} ${accent.bgSoft} text-white`
                            : "border-white/[0.05] bg-white/[0.015] text-white/30 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="text-xs font-semibold">{d}</div>
                        {daySlot && (
                          <div className="text-[9px] text-white/15 mt-0.5">{daySlot.start} - {daySlot.end}</div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Time selection */}
          <AnimatePresence>
            {selectedDay && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <label className="text-[10px] uppercase tracking-widest text-white/20 font-semibold">Escolha o horário</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                  {config.slots.filter(s => s.day === selectedDay).flatMap(slot => {
                    const startH = parseInt(slot.start.split(":")[0]);
                    const endH = parseInt(slot.end.split(":")[0]);
                    const times: string[] = [];
                    for (let h = startH; h < endH; h++) {
                      times.push(`${String(h).padStart(2, "0")}:00`);
                      times.push(`${String(h).padStart(2, "0")}:30`);
                    }
                    return times;
                  }).map(t => (
                    <motion.button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      whileTap={{ scale: 0.93 }}
                      className={`py-2.5 rounded-lg border text-xs font-medium transition-all ${
                        selectedTime === t
                          ? `${accent.border} ${accent.bgSoft} text-white`
                          : "border-white/[0.04] bg-white/[0.015] text-white/25 hover:bg-white/[0.03]"
                      }`}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.a
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={allSelected ? { scale: 1.02 } : undefined}
            whileTap={allSelected ? { scale: 0.98 } : undefined}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg ${
              allSelected
                ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-500/15 cursor-pointer"
                : "bg-white/[0.03] text-white/12 pointer-events-none border border-white/[0.03]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {allSelected ? "Agendar via WhatsApp" : "Selecione todas as opções"}
          </motion.a>

          <p className="text-center text-[9px] text-white/10">
            Agendamento via WhatsApp • Powered by Brandify
          </p>
        </motion.div>
      </main>
    </div>
  );
}

export default function ToolsAgendador() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" /></div>;
  }

  return (
    <PlanGate minPlan="pro" featureName="Agendador de Consultas" featureDescription="Monte uma página de agendamento profissional que envia direto para o WhatsApp.">
      <AgendadorContent />
    </PlanGate>
  );
}
