import { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ProjectData {
  title: string;
  client_name: string;
  plan: string;
  total_amount_cents: number;
  amount_received_cents: number;
  payment_status: string;
  created_at: string;
}

interface Props {
  proposals: Array<{
    status: string;
    amount_cents: number;
    created_at: string;
  }>;
  projects: ProjectData[];
  extraRevenue?: number;
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const PLAN_LABELS: Record<string, string> = {
  essencial: "Essencial",
  profissional: "Profissional",
  premium: "Premium",
};

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Em Aberto", color: "text-amber-400" },
  partial: { label: "Parcial (50%)", color: "text-amber-400" },
  full: { label: "Quitado", color: "text-emerald-400" },
};

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

type ViewMode = "chart" | "plano" | "projetos";

export default function RevenueChart({ proposals, projects, extraRevenue = 0 }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("chart");

  const chartData = useMemo(() => {
    const now = new Date();
    const months: { name: string; recebido: number; aberto: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthProjects = projects.filter(p => {
        const pd = new Date(p.created_at);
        return pd.getMonth() === month && pd.getFullYear() === year;
      });
      const recebido = monthProjects.reduce((s, p) => s + p.amount_received_cents, 0);
      const aberto = monthProjects.reduce((s, p) => s + (p.total_amount_cents - p.amount_received_cents), 0);
      months.push({
        name: `${MONTHS[month]}`,
        recebido: recebido / 100,
        aberto: aberto / 100,
      });
    }
    return months;
  }, [projects]);

  const planData = useMemo(() => {
    const plans = ["essencial", "profissional", "premium"];
    return plans.map(plan => {
      const planProjects = projects.filter(p => p.plan === plan);
      const total = planProjects.reduce((s, p) => s + p.total_amount_cents, 0);
      const recebido = planProjects.reduce((s, p) => s + p.amount_received_cents, 0);
      const aberto = total - recebido;
      return {
        name: PLAN_LABELS[plan],
        plan,
        total,
        recebido,
        aberto,
        count: planProjects.length,
      };
    }).filter(p => p.count > 0);
  }, [projects]);

  const hasData = projects.length > 0;

  if (!hasData) {
    return (
      <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] mb-8">
        <h3 className="text-sm font-semibold text-white mb-3">Faturamento</h3>
        <p className="text-xs text-white/30 text-center py-6">Nenhum faturamento registrado ainda</p>
      </div>
    );
  }

  const tabs: { key: ViewMode; label: string }[] = [
    { key: "chart", label: "Mensal" },
    { key: "plano", label: "Por Plano" },
    { key: "projetos", label: "Por Projeto" },
  ];

  return (
    <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-white">Faturamento</h3>
        <div className="flex gap-1 p-0.5 rounded-lg bg-white/[0.04]">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                viewMode === tab.key
                  ? "bg-brand-accent text-white shadow-sm"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "chart" && (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradientRecebido" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(224, 76%, 33%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(224, 76%, 33%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientAberto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(45, 100%, 60%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(45, 100%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15,15,15,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#fff",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
              formatter={(value: number, name: string) => [
                new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value),
                name === "recebido" ? "Recebido" : "Em Aberto",
              ]}
            />
            <Legend
              formatter={(value: string) => <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{value === "recebido" ? "Recebido" : "Em Aberto"}</span>}
            />
            <Area
              type="monotone"
              dataKey="recebido"
              stroke="hsl(224, 76%, 33%)"
              strokeWidth={2}
              fill="url(#gradientRecebido)"
            />
            <Area
              type="monotone"
              dataKey="aberto"
              stroke="hsl(45, 100%, 60%)"
              strokeWidth={2}
              fill="url(#gradientAberto)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {viewMode === "plano" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planData.length === 0 ? (
            <p className="text-xs text-white/30 col-span-3 text-center py-6">Nenhum projeto ainda</p>
          ) : (
            planData.map(p => (
              <div key={p.plan} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{p.name}</span>
                  <span className="text-xs text-white/30">{p.count} projeto{p.count !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Total</span>
                    <span className="text-white font-medium">{formatCurrency(p.total)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400">Recebido</span>
                    <span className="text-emerald-400 font-medium">{formatCurrency(p.recebido)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-400">Em Aberto</span>
                    <span className="text-amber-400 font-medium">{formatCurrency(p.aberto)}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all bg-gradient-to-r from-brand-accent to-brand-accent-deep"
                    style={{ width: p.total > 0 ? `${(p.recebido / p.total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {viewMode === "projetos" && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-2.5 px-2 text-white/30 font-medium">Projeto</th>
                <th className="text-left py-2.5 px-2 text-white/30 font-medium">Cliente</th>
                <th className="text-left py-2.5 px-2 text-white/30 font-medium">Plano</th>
                <th className="text-right py-2.5 px-2 text-white/30 font-medium">Total</th>
                <th className="text-right py-2.5 px-2 text-white/30 font-medium">Recebido</th>
                <th className="text-right py-2.5 px-2 text-white/30 font-medium">Pendente</th>
                <th className="text-center py-2.5 px-2 text-white/30 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-white/30">Nenhum projeto</td>
                </tr>
              ) : (
                projects.map((p, i) => {
                  const pending = p.total_amount_cents - p.amount_received_cents;
                  const statusInfo = PAYMENT_STATUS_LABELS[p.payment_status] || PAYMENT_STATUS_LABELS.pending;
                  return (
                    <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-2 text-white font-medium max-w-[140px] truncate">{p.title}</td>
                      <td className="py-3 px-2 text-white/50 max-w-[120px] truncate">{p.client_name}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.06] text-white/60">
                          {PLAN_LABELS[p.plan] || p.plan}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-white">{formatCurrency(p.total_amount_cents)}</td>
                      <td className="py-3 px-2 text-right text-emerald-400">{formatCurrency(p.amount_received_cents)}</td>
                      <td className="py-3 px-2 text-right text-amber-400">{pending > 0 ? formatCurrency(pending) : "—"}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`text-[10px] font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
