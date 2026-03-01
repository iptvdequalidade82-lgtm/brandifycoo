import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, Clock, Plus, Trash2, Copy, Check, Eye, Edit3,
  Sparkles, ChevronRight, MapPin, Phone, MessageSquare, Zap, Globe, Users,
  CheckCircle2, ArrowRight
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
}

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const DAYS_SHORT: Record<string, string> = {
  Segunda: "Seg", Terça: "Ter", Quarta: "Qua", Quinta: "Qui", Sexta: "Sex", Sábado: "Sáb", Domingo: "Dom",
};

const STEP_LABELS = [
  { label: "Dados", icon: Edit3 },
  { label: "Serviços", icon: Zap },
  { label: "Horários", icon: Clock },
  { label: "Mensagem", icon: MessageSquare },
];

export function AgendadorContent() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<SchedulerConfig>({
    businessName: "",
    whatsapp: "",
    services: [""],
    slots: [{ id: crypto.randomUUID(), day: "Segunda", start: "09:00", end: "18:00" }],
    message: "Olá! Gostaria de agendar um horário para {servico} no dia {dia} às {hora}. Pode confirmar?",
  });
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const addService = () => setConfig(p => ({ ...p, services: [...p.services, ""] }));
  const removeService = (i: number) => setConfig(p => ({ ...p, services: p.services.filter((_, idx) => idx !== i) }));
  const updateService = (i: number, val: string) => setConfig(p => ({ ...p, services: p.services.map((s, idx) => idx === i ? val : s) }));

  const addSlot = () => setConfig(p => ({
    ...p,
    slots: [...p.slots, { id: crypto.randomUUID(), day: "Segunda", start: "09:00", end: "18:00" }],
  }));
  const removeSlot = (id: string) => setConfig(p => ({ ...p, slots: p.slots.filter(s => s.id !== id) }));
  const updateSlot = (id: string, field: keyof TimeSlot, val: string) => setConfig(p => ({
    ...p,
    slots: p.slots.map(s => s.id === id ? { ...s, [field]: val } : s),
  }));

  const generateWhatsAppLink = () => {
    const msg = config.message
      .replace("{servico}", selectedService || "consulta")
      .replace("{dia}", selectedDay || "a combinar")
      .replace("{hora}", selectedTime || "a combinar");
    const phone = config.whatsapp.replace(/\D/g, "");
    return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generateWhatsAppLink());
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

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
    return c;
  }, [config]);

  // Editor mode
  if (!showPreview) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/[0.04]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm hidden sm:inline">Voltar</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <span className="font-['Playfair_Display'] font-bold text-sm">Agendador de Consultas</span>
                <p className="text-[10px] text-white/30">Monte sua página de agendamento</p>
              </div>
            </div>
            <div className="w-20" />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            
            {/* Sidebar - Steps Navigation */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3 lg:sticky lg:top-24 lg:self-start"
            >
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 space-y-1.5">
                {STEP_LABELS.map((s, i) => {
                  const active = step === i;
                  const completed = completedSteps.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
                        active
                          ? "bg-gradient-to-r from-pink-500/10 to-rose-500/5 text-white border border-pink-500/20"
                          : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                      }`}
                    >
                      {active && (
                        <motion.div 
                          layoutId="step-glow"
                          className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent rounded-xl"
                        />
                      )}
                      <div className={`relative z-10 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        active ? "bg-pink-500/20" : completed ? "bg-emerald-500/10" : "bg-white/[0.04]"
                      }`}>
                        {completed && !active ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <s.icon className={`w-3.5 h-3.5 ${active ? "text-pink-400" : "text-white/30"}`} />
                        )}
                      </div>
                      <span className="relative z-10">{s.label}</span>
                      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-pink-400/50 relative z-10" />}
                    </button>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">Progresso</span>
                  <span className="text-xs text-pink-400 font-bold">{completedSteps.size}/4</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedSteps.size / 4) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Preview CTA */}
              <motion.button
                onClick={() => setShowPreview(true)}
                disabled={completedSteps.size < 2}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-500/10"
              >
                <Eye className="w-4 h-4" />
                Ver Preview
              </motion.button>
            </motion.div>

            {/* Main Content Area */}
            <div className="min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step 0: Business Info */}
                  {step === 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 flex items-center justify-center">
                          <Edit3 className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <h2 className="font-['Playfair_Display'] font-bold text-lg">Dados do Negócio</h2>
                          <p className="text-white/30 text-xs">Informações básicas para a página</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-4">
                          <div>
                            <label className="text-[11px] uppercase tracking-wider text-white/30 font-semibold mb-2 block">
                              Nome do negócio
                            </label>
                            <div className="relative">
                              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                              <input
                                value={config.businessName}
                                onChange={e => setConfig(p => ({ ...p, businessName: e.target.value }))}
                                placeholder="Ex: Studio Hair, Clínica Bella..."
                                className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-pink-500/40 focus:bg-white/[0.05] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/15 outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] uppercase tracking-wider text-white/30 font-semibold mb-2 block">
                              WhatsApp
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                              <input
                                value={config.whatsapp}
                                onChange={e => setConfig(p => ({ ...p, whatsapp: e.target.value }))}
                                placeholder="Ex: 11999998888 (com DDD)"
                                className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-pink-500/40 focus:bg-white/[0.05] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/15 outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Tip card */}
                        <div className="rounded-xl bg-gradient-to-r from-pink-500/[0.04] to-transparent border border-pink-500/10 p-4 flex gap-3">
                          <Sparkles className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-white/40 leading-relaxed">
                            O nome do negócio aparecerá como título principal da página de agendamento. Use algo curto e memorável.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Services */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h2 className="font-['Playfair_Display'] font-bold text-lg">Serviços Oferecidos</h2>
                          <p className="text-white/30 text-xs">Adicione os serviços disponíveis para agendamento</p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-3">
                        {config.services.map((s, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex gap-2 group"
                          >
                            <div className="w-8 h-[46px] rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0 text-white/15 text-xs font-bold">
                              {i + 1}
                            </div>
                            <input
                              value={s}
                              onChange={e => updateService(i, e.target.value)}
                              placeholder={`Ex: Corte de cabelo, Consulta, Massagem...`}
                              className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-amber-500/30 focus:bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/15 outline-none transition-all"
                            />
                            {config.services.length > 1 && (
                              <button
                                onClick={() => removeService(i)}
                                className="text-white/10 hover:text-red-400 transition-colors px-2 opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </motion.div>
                        ))}
                        <button
                          onClick={addService}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/[0.08] hover:border-amber-500/20 hover:bg-amber-500/[0.02] text-white/30 hover:text-amber-400 text-xs font-medium transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar serviço
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Time Slots */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h2 className="font-['Playfair_Display'] font-bold text-lg">Horários Disponíveis</h2>
                          <p className="text-white/30 text-xs">Defina os dias e horários de atendimento</p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-3">
                        {config.slots.map((slot, i) => (
                          <motion.div
                            key={slot.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 group hover:border-blue-500/15 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                              <select
                                value={slot.day}
                                onChange={e => updateSlot(slot.id, "day", e.target.value)}
                                className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white outline-none appearance-none min-w-[120px] cursor-pointer"
                              >
                                {DAYS.map(d => <option key={d} value={d} className="bg-[#111]">{d}</option>)}
                              </select>

                              <div className="flex items-center gap-2 flex-1">
                                <div className="relative">
                                  <input
                                    type="time"
                                    value={slot.start}
                                    onChange={e => updateSlot(slot.id, "start", e.target.value)}
                                    className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white outline-none"
                                  />
                                </div>
                                <div className="w-6 h-px bg-white/10" />
                                <div className="relative">
                                  <input
                                    type="time"
                                    value={slot.end}
                                    onChange={e => updateSlot(slot.id, "end", e.target.value)}
                                    className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white outline-none"
                                  />
                                </div>
                              </div>

                              {config.slots.length > 1 && (
                                <button
                                  onClick={() => removeSlot(slot.id)}
                                  className="text-white/10 hover:text-red-400 transition-colors p-2 sm:opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                        <button
                          onClick={addSlot}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/[0.08] hover:border-blue-500/20 hover:bg-blue-500/[0.02] text-white/30 hover:text-blue-400 text-xs font-medium transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar horário
                        </button>
                      </div>

                      {/* Weekly overview */}
                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
                        <span className="text-[10px] uppercase tracking-wider text-white/20 font-semibold mb-3 block">Resumo Semanal</span>
                        <div className="flex gap-1.5">
                          {DAYS.map(d => {
                            const has = config.slots.some(s => s.day === d);
                            return (
                              <div
                                key={d}
                                className={`flex-1 rounded-lg py-2.5 text-center text-[10px] font-bold transition-all ${
                                  has
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    : "bg-white/[0.02] text-white/15 border border-white/[0.04]"
                                }`}
                              >
                                {DAYS_SHORT[d]}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Message */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h2 className="font-['Playfair_Display'] font-bold text-lg">Mensagem Automática</h2>
                          <p className="text-white/30 text-xs">Personalize a mensagem enviada ao WhatsApp</p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-4">
                        <textarea
                          value={config.message}
                          onChange={e => setConfig(p => ({ ...p, message: e.target.value }))}
                          rows={4}
                          className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-emerald-500/30 focus:bg-white/[0.05] px-4 py-3.5 text-sm text-white placeholder:text-white/15 resize-none outline-none transition-all leading-relaxed"
                        />
                        <div className="flex flex-wrap gap-2">
                          {["{servico}", "{dia}", "{hora}"].map(v => (
                            <span
                              key={v}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/15 text-[11px] text-emerald-400 font-mono font-medium"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Live preview of message */}
                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
                        <span className="text-[10px] uppercase tracking-wider text-white/20 font-semibold mb-3 block">Pré-visualização</span>
                        <div className="rounded-xl bg-[#075e54]/20 border border-[#075e54]/30 p-4">
                          <p className="text-sm text-white/70 leading-relaxed">
                            {config.message
                              .replace("{servico}", config.services.find(s => s.trim()) || "consulta")
                              .replace("{dia}", "Segunda")
                              .replace("{hora}", "10:00")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.04]">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white disabled:opacity-20 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Anterior
                </button>
                {step < 3 ? (
                  <motion.button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-sm text-white font-medium disabled:opacity-20 transition-all"
                  >
                    Próximo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => setShowPreview(true)}
                    disabled={completedSteps.size < 2}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-sm text-white font-bold disabled:opacity-30 transition-all shadow-lg shadow-pink-500/10"
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

  // Preview mode
  const availableDays = [...new Set(config.slots.map(s => s.day))];
  const previewSteps = [
    { num: 1, label: "Serviço", done: !!selectedService },
    { num: 2, label: "Dia", done: !!selectedDay },
    { num: 3, label: "Horário", done: !!selectedTime },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Editar</span>
          </button>
          <span className="text-[10px] text-white/20 uppercase tracking-widest font-medium">Preview</span>
          <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-white/50 hover:text-white transition-all">
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Brand header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-pink-500/15 to-rose-500/10 border border-pink-500/15 flex items-center justify-center"
            >
              <Calendar className="w-9 h-9 text-pink-400" />
            </motion.div>
            <div>
              <h1 className="font-['Playfair_Display'] font-bold text-2xl mb-2">{config.businessName}</h1>
              <p className="text-white/30 text-sm">Agende seu horário em poucos passos</p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-3">
            {previewSteps.map((ps, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  ps.done
                    ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                    : "bg-white/[0.02] text-white/20 border border-white/[0.04]"
                }`}>
                  {ps.done ? <Check className="w-3 h-3" /> : <span className="w-4 text-center">{ps.num}</span>}
                  {ps.label}
                </div>
                {i < previewSteps.length - 1 && <div className="w-4 h-px bg-white/[0.06]" />}
              </div>
            ))}
          </div>

          {/* Service selection */}
          <div className="space-y-3">
            <label className="text-[11px] uppercase tracking-wider text-white/25 font-semibold">Escolha o serviço</label>
            <div className="space-y-2">
              {config.services.filter(Boolean).map(s => (
                <motion.button
                  key={s}
                  onClick={() => setSelectedService(s)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between group ${
                    selectedService === s
                      ? "border-pink-500/30 bg-pink-500/[0.06] text-white"
                      : "border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.04] hover:border-white/[0.1]"
                  }`}
                >
                  <span>{s}</span>
                  {selectedService === s && <CheckCircle2 className="w-4 h-4 text-pink-400" />}
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
                <label className="text-[11px] uppercase tracking-wider text-white/25 font-semibold">Escolha o dia</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableDays.map(d => (
                    <motion.button
                      key={d}
                      onClick={() => { setSelectedDay(d); setSelectedTime(""); }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`p-3 rounded-xl border text-center text-xs font-medium transition-all ${
                        selectedDay === d
                          ? "border-pink-500/30 bg-pink-500/[0.06] text-white"
                          : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:bg-white/[0.04]"
                      }`}
                    >
                      {d}
                    </motion.button>
                  ))}
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
                <label className="text-[11px] uppercase tracking-wider text-white/25 font-semibold">Escolha o horário</label>
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
                      whileTap={{ scale: 0.95 }}
                      className={`py-2.5 rounded-lg border text-xs font-medium transition-all ${
                        selectedTime === t
                          ? "border-pink-500/30 bg-pink-500/[0.06] text-white"
                          : "border-white/[0.04] bg-white/[0.02] text-white/35 hover:bg-white/[0.04]"
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg ${
              selectedService && selectedDay && selectedTime
                ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-500/15"
                : "bg-white/[0.04] text-white/20 pointer-events-none"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Agendar via WhatsApp
          </motion.a>

          {/* Footer */}
          <p className="text-center text-[10px] text-white/15">
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
