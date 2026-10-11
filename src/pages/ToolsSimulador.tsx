import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calculator, TrendingUp, DollarSign, Users, ShoppingCart, BarChart3,
  Download, Share2, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PlanGate from "@/components/PlanGate";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import html2canvas from "html2canvas";

export function SimuladorContent() {
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [clients, setClients] = useState(20);
  const [ticket, setTicket] = useState(200);
  const [conversion, setConversion] = useState(5);
  const [leads, setLeads] = useState(400);
  const [retention, setRetention] = useState(70);
  const [costs, setCosts] = useState(30);

  const metrics = useMemo(() => {
    const newClients = Math.round((leads * conversion) / 100);
    const returningClients = Math.round((clients * retention) / 100);
    const totalClients = newClients + returningClients;
    const monthlyRevenue = totalClients * ticket;

    const profit = monthlyRevenue * (1 - costs / 100);


    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const growthFactor = 1 + (i * 0.03);
      const rev = Math.round(monthlyRevenue * growthFactor);
      const prof = Math.round(profit * growthFactor);
      return {
        month: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][i],
        receita: rev,
        lucro: prof,
      };
    });

    const annualRevenue = monthlyData.reduce((sum, month) => sum + month.receita, 0);
    const annualProfit = monthlyData.reduce((sum, month) => sum + month.lucro, 0);
    return { newClients, returningClients, totalClients, monthlyRevenue, annualRevenue, profit, annualProfit, monthlyData };
  }, [clients, ticket, conversion, leads, retention, costs]);

  const fmt = (v: number) => v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v}`;
  const fmtFull = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

  const captureImage = useCallback(async (): Promise<Blob | null> => {
    if (!resultsRef.current) return null;
    const canvas = await html2canvas(resultsRef.current, {
      backgroundColor: "#000",
      scale: 2,
      useCORS: true,
    });
    return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  }, []);

  const handleDownload = useCallback(async () => {
    setExporting(true);
    try {
      const blob = await captureImage();
      if (!blob) throw new Error("Erro ao gerar imagem");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `simulador-faturamento-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Imagem salva!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }, [captureImage, toast]);

  const handleShare = useCallback(async () => {
    setExporting(true);
    try {
      const blob = await captureImage();
      if (!blob) throw new Error("Erro ao gerar imagem");
      if (navigator.share && navigator.canShare?.({ files: [new File([blob], "simulacao.png", { type: "image/png" })] })) {
        await navigator.share({
          title: "Simulação de Faturamento",
          text: `Receita: ${fmtFull(metrics.monthlyRevenue)}/mês | Lucro: ${fmtFull(Math.round(metrics.profit))}/mês`,
          files: [new File([blob], "simulacao.png", { type: "image/png" })],
        });
      } else {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast({ title: "Imagem copiada!", description: "Cole onde quiser compartilhar." });
      }
    } catch (e: any) {
      if (e.name !== "AbortError") toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }, [captureImage, toast, metrics, fmtFull]);

  const sliderCls = "w-full h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-400/30";

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span className="font-['Playfair_Display'] font-bold text-sm">Simulador</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Simulador de Faturamento</h2>
            <p className="text-white/40 text-sm">Ajuste os parâmetros e veja a projeção em tempo real. O gráfico considera crescimento linear hipotético de 3% da receita inicial por mês; o total anual soma os 12 meses.</p>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Leads/mês", icon: Users, value: leads, set: setLeads, min: 10, max: 5000, step: 10, display: String(leads) },
              { label: "Taxa de conversão", icon: ShoppingCart, value: conversion, set: setConversion, min: 1, max: 30, step: 0.5, display: `${conversion}%` },
              { label: "Ticket médio", icon: DollarSign, value: ticket, set: setTicket, min: 10, max: 5000, step: 10, display: fmtFull(ticket) },
              { label: "Clientes recorrentes", icon: Users, value: clients, set: setClients, min: 0, max: 500, step: 1, display: String(clients) },
              { label: "Taxa de retenção", icon: TrendingUp, value: retention, set: setRetention, min: 0, max: 100, step: 1, display: `${retention}%` },
              { label: "Custos (%)", icon: BarChart3, value: costs, set: setCosts, min: 0, max: 90, step: 1, display: `${costs}%` },
            ].map(({ label, icon: Icon, value, set, min, max, step, display }) => (
              <div key={label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs text-white/40">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{display}</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} className={sliderCls} />
              </div>
            ))}
          </div>

          {/* Exportable area */}
          <div ref={resultsRef} className="space-y-6 bg-black p-1">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Clientes/mês", value: metrics.totalClients, sub: `${metrics.newClients} novos + ${metrics.returningClients} recorrentes`, color: "text-blue-400" },
                { label: "Receita/mês", value: fmtFull(metrics.monthlyRevenue), sub: "", color: "text-emerald-400" },
                { label: "Lucro/mês", value: fmtFull(Math.round(metrics.profit)), sub: `Margem ${100 - costs}%`, color: "text-amber-400" },
                { label: "Receita/ano", value: fmtFull(metrics.annualRevenue), sub: `Lucro: ${fmtFull(Math.round(metrics.annualProfit))}`, color: "text-pink-400" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
                  <div className="text-[10px] text-white/30 uppercase mb-1">{label}</div>
                  <div className={`text-lg font-bold ${color}`}>{value}</div>
                  {sub && <div className="text-[10px] text-white/20 mt-0.5">{sub}</div>}
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <h3 className="text-xs text-white/40 uppercase font-semibold mb-4">Projeção anual (crescimento de 3%/mês)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.monthlyData}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                    <Tooltip
                      contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                      formatter={(v: number) => fmtFull(v)}
                    />
                    <Area type="monotone" dataKey="receita" stroke="#34d399" fillOpacity={1} fill="url(#colorReceita)" name="Receita" />
                    <Area type="monotone" dataKey="lucro" stroke="#60a5fa" fillOpacity={1} fill="url(#colorLucro)" name="Lucro" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex gap-3">
            <button onClick={handleDownload} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/60 text-sm hover:text-white hover:border-emerald-500/30 transition-all disabled:opacity-40">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Salvar imagem
            </button>
            <button onClick={handleShare} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/60 text-sm hover:text-white hover:border-emerald-500/30 transition-all disabled:opacity-40">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              Compartilhar
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function ToolsSimulador() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [isLoading, user, navigate]);

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" /></div>;

  return (
    <PlanGate minPlan="premium" featureName="Simulador de Faturamento" featureDescription="Calculadora interativa de projeção de receita com gráficos em tempo real.">
      <SimuladorContent />
    </PlanGate>
  );
}
