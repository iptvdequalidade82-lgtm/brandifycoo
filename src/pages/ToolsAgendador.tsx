import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calendar, Clock, Plus, Trash2, Copy, Check, Eye, Edit3
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

function AgendadorContent() {
  const { toast } = useToast();
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

  // Editor mode
  if (!showPreview) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-400" />
              <span className="font-['Playfair_Display'] font-bold text-sm">Agendador</span>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Configure seu Agendador</h2>
              <p className="text-white/40 text-sm">Monte uma página de agendamento que envia direto pro WhatsApp.</p>
            </div>

            {/* Business Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Edit3 className="w-4 h-4 text-pink-400" />
                <span className="text-xs uppercase tracking-wider text-white/40 font-semibold">Dados do negócio</span>
              </div>
              <input value={config.businessName} onChange={e => setConfig(p => ({ ...p, businessName: e.target.value }))} placeholder="Nome do negócio" className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-pink-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors" />
              <input value={config.whatsapp} onChange={e => setConfig(p => ({ ...p, whatsapp: e.target.value }))} placeholder="WhatsApp (com DDD, ex: 11999998888)" className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-pink-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors" />
            </div>

            {/* Services */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-pink-400" />
                  <span className="text-xs uppercase tracking-wider text-white/40 font-semibold">Serviços</span>
                </div>
                <button onClick={addService} className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 transition-colors">
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>
              {config.services.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input value={s} onChange={e => updateService(i, e.target.value)} placeholder={`Serviço ${i + 1}`} className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-pink-500/30 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors" />
                  {config.services.length > 1 && (
                    <button onClick={() => removeService(i)} className="text-white/20 hover:text-red-400 transition-colors px-2">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-400" />
                  <span className="text-xs uppercase tracking-wider text-white/40 font-semibold">Horários</span>
                </div>
                <button onClick={addSlot} className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 transition-colors">
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>
              {config.slots.map((slot) => (
                <div key={slot.id} className="flex gap-2 items-center">
                  <select value={slot.day} onChange={e => updateSlot(slot.id, "day", e.target.value)} className="rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white outline-none appearance-none flex-1">
                    {DAYS.map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
                  </select>
                  <input type="time" value={slot.start} onChange={e => updateSlot(slot.id, "start", e.target.value)} className="rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white outline-none" />
                  <span className="text-white/20 text-xs">até</span>
                  <input type="time" value={slot.end} onChange={e => updateSlot(slot.id, "end", e.target.value)} className="rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white outline-none" />
                  {config.slots.length > 1 && (
                    <button onClick={() => removeSlot(slot.id)} className="text-white/20 hover:text-red-400 transition-colors px-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Message template */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider text-white/40 font-semibold">Mensagem WhatsApp</span>
              </div>
              <textarea
                value={config.message}
                onChange={e => setConfig(p => ({ ...p, message: e.target.value }))}
                rows={3}
                className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-pink-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none outline-none transition-colors"
              />
              <p className="text-[10px] text-white/20 mt-1.5">Variáveis: {"{servico}"}, {"{dia}"}, {"{hora}"}</p>
            </div>

            {/* Preview Button */}
            <button
              onClick={() => setShowPreview(true)}
              disabled={!config.businessName.trim() || !config.whatsapp.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-400 to-rose-500 text-white text-sm font-semibold disabled:opacity-40 hover:scale-[1.01] transition-all"
            >
              <Eye className="w-4 h-4" /> Ver Preview da Página
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Preview mode
  const availableDays = [...new Set(config.slots.map(s => s.day))];

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Editar</span>
          </button>
          <span className="text-xs text-white/30 uppercase tracking-wider">Preview</span>
          <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs text-white/60 hover:text-white transition-all">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/20 flex items-center justify-center">
            <Calendar className="w-7 h-7 text-pink-400" />
          </div>
          <div>
            <h1 className="font-['Playfair_Display'] font-bold text-2xl mb-2">{config.businessName}</h1>
            <p className="text-white/40 text-sm">Escolha o serviço, dia e horário desejado</p>
          </div>

          {/* Service selection */}
          <div className="text-left space-y-2">
            <label className="text-xs text-white/40 font-medium">Serviço</label>
            <div className="space-y-2">
              {config.services.filter(Boolean).map(s => (
                <button key={s} onClick={() => setSelectedService(s)} className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
                  selectedService === s ? "border-pink-500/40 bg-pink-500/[0.06] text-white" : "border-white/[0.06] bg-white/[0.02] text-white/60 hover:bg-white/[0.04]"
                }`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Day selection */}
          <div className="text-left space-y-2">
            <label className="text-xs text-white/40 font-medium">Dia</label>
            <div className="flex flex-wrap gap-2">
              {availableDays.map(d => (
                <button key={d} onClick={() => setSelectedDay(d)} className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                  selectedDay === d ? "border-pink-500/40 bg-pink-500/[0.06] text-white" : "border-white/[0.06] bg-white/[0.02] text-white/60 hover:bg-white/[0.04]"
                }`}>{d}</button>
              ))}
            </div>
          </div>

          {/* Time selection */}
          {selectedDay && (
            <div className="text-left space-y-2">
              <label className="text-xs text-white/40 font-medium">Horário</label>
              <div className="flex flex-wrap gap-2">
                {config.slots.filter(s => s.day === selectedDay).map(slot => {
                  const startH = parseInt(slot.start.split(":")[0]);
                  const endH = parseInt(slot.end.split(":")[0]);
                  const times: string[] = [];
                  for (let h = startH; h < endH; h++) {
                    times.push(`${String(h).padStart(2, "0")}:00`);
                    times.push(`${String(h).padStart(2, "0")}:30`);
                  }
                  return times.map(t => (
                    <button key={t} onClick={() => setSelectedTime(t)} className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                      selectedTime === t ? "border-pink-500/40 bg-pink-500/[0.06] text-white" : "border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.04]"
                    }`}>{t}</button>
                  ));
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <a
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-semibold hover:scale-[1.01] transition-all mt-4"
          >
            Agendar via WhatsApp
          </a>
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
    <PlanGate minPlan="pro" featureName="Agendador" featureDescription="Crie uma página de agendamento simples que envia direto para o WhatsApp.">
      <AgendadorContent />
    </PlanGate>
  );
}
