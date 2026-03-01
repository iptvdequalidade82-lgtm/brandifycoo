import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Headphones, Send, Loader2, Settings, Bot, User as UserIcon, Trash2,
  Globe, ExternalLink, Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PlanGate from "@/components/PlanGate";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/atendedor-chat`;

interface Msg { role: "user" | "assistant"; content: string }
interface BusinessCtx {
  name: string;
  segment: string;
  services: string;
  hours: string;
  extra: string;
}

export function AtendedorContent() {
  const { toast } = useToast();
  const [showConfig, setShowConfig] = useState(true);
  const [ctx, setCtx] = useState<BusinessCtx>({ name: "", segment: "", services: "", hours: "", extra: "" });
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const startChat = () => {
    if (!ctx.name.trim()) {
      toast({ title: "Preencha o nome do negócio", variant: "destructive" });
      return;
    }
    setShowConfig(false);
    setMessages([{ role: "assistant", content: `Olá! 👋 Sou o assistente virtual da **${ctx.name}**. Como posso ajudar você hoje?` }]);
  };

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMsgs = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMsgs, businessContext: ctx }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Erro no atendedor");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Config screen
  if (showConfig) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-blue-400" />
              <span className="font-['Playfair_Display'] font-bold text-sm">Atendedor IA</span>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="font-['Playfair_Display'] font-bold text-xl">Configure o Atendedor</h2>
                <p className="text-white/40 text-sm">Informe os dados do negócio para personalizar o atendimento.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block font-medium">Nome do negócio *</label>
                <input value={ctx.name} onChange={e => setCtx(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Studio Ana Hair" className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block font-medium">Segmento</label>
                <input value={ctx.segment} onChange={e => setCtx(p => ({ ...p, segment: e.target.value }))} placeholder="Ex: Salão de beleza" className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block font-medium">Serviços / Produtos</label>
                <textarea value={ctx.services} onChange={e => setCtx(p => ({ ...p, services: e.target.value }))} placeholder="Ex: Corte feminino R$80, Mechas R$250, Hidratação R$60..." rows={3} className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block font-medium">Horário de funcionamento</label>
                <input value={ctx.hours} onChange={e => setCtx(p => ({ ...p, hours: e.target.value }))} placeholder="Ex: Seg-Sex 9h às 19h, Sáb 9h às 14h" className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block font-medium">Informações extras</label>
                <textarea value={ctx.extra} onChange={e => setCtx(p => ({ ...p, extra: e.target.value }))} placeholder="Ex: Aceitamos PIX e cartão, estacionamento gratuito, atendimento com hora marcada..." rows={2} className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none outline-none transition-colors" />
              </div>
            </div>

            <button onClick={startChat} className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500 text-white text-sm font-semibold hover:scale-[1.01] transition-all">
              <Headphones className="w-4 h-4" /> Iniciar Atendedor
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Chat screen
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-blue-400" />
            <span className="font-['Playfair_Display'] font-bold text-sm">{ctx.name}</span>
          </div>
          <button onClick={() => { setShowConfig(true); setMessages([]); }} className="text-white/30 hover:text-white/60 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div ref={chatRef} className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-blue-500/20 border border-blue-500/20 text-white/90"
                : "bg-white/[0.04] border border-white/[0.08] text-white/70"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 mt-1">
                <UserIcon className="w-4 h-4 text-white/40" />
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            </div>
          </div>
        )}
      </div>

      {/* CTA: Faça seu site */}
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="rounded-xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 border border-blue-500/15 p-4 flex items-start sm:items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-sm font-semibold leading-snug">
              Integre o Atendedor no seu site!
            </p>
            <p className="text-white/40 text-xs mt-0.5 leading-relaxed">
              Com o plano Pro + um site Brandify, o atendedor IA fica disponível direto no seu site para atender seus clientes 24h.
            </p>
          </div>
          <a
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Tenho%20o%20plano%20Pro%20e%20quero%20integrar%20o%20Atendedor%20IA%20no%20meu%20site.%20Podem%20me%20ajudar%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-cyan-500 text-white text-xs font-semibold hover:scale-[1.02] transition-all whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3" />
            Quero meu site
          </a>
        </motion.div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-black/80 backdrop-blur-xl border-t border-white/[0.06] p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Simule uma pergunta de cliente..."
            className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors"
          />
          <button
            onClick={send}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500 text-white disabled:opacity-40 hover:scale-[1.02] transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ToolsAtendedor() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" /></div>;
  }

  return (
    <PlanGate minPlan="pro" featureName="Atendedor IA" featureDescription="Simule um atendente virtual inteligente treinado para o seu negócio.">
      <AtendedorContent />
    </PlanGate>
  );
}
