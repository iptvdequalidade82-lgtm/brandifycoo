import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

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

const PLAN_COLORS: Record<string, string> = {
  essencial: "hsl(var(--primary))",
  profissional: "hsl(200 80% 55%)",
  premium: "hsl(45 100% 60%)",
};

const PLAN_LABELS: Record<string, string> = {
  essencial: "Essencial",
  profissional: "Profissional",
  premium: "Premium",
};

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "text-muted-foreground" },
  partial: { label: "Parcial (50%)", color: "text-amber-400" },
  full: { label: "Quitado", color: "text-green-400" },
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
        name: `${MONTHS[month]}/${String(year).slice(2)}`,
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
      <div className="glass rounded-xl p-5 glow-border mb-8">
        <h3 className="text-sm font-semibold text-foreground mb-3">📊 Faturamento</h3>
        <p className="text-xs text-muted-foreground text-center py-6">Nenhum faturamento registrado ainda</p>
      </div>
    );
  }

  const tabs: { key: ViewMode; label: string }[] = [
    { key: "chart", label: "📈 Mensal" },
    { key: "plano", label: "📦 Por Plano" },
    { key: "projetos", label: "📋 Por Projeto" },
  ];

  return (
    <div className="glass rounded-xl p-5 glow-border mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">📊 Faturamento</h3>
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "chart" && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(v) => `R$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value),
                name === "recebido" ? "Recebido" : "Em Aberto",
              ]}
            />
            <Legend
              formatter={(value: string) => value === "recebido" ? "Recebido" : "Em Aberto"}
              wrapperStyle={{ fontSize: "11px" }}
            />
            <Bar dataKey="recebido" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} stackId="a" />
            <Bar dataKey="aberto" fill="hsl(45 100% 60%)" radius={[4, 4, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      )}

      {viewMode === "plano" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planData.length === 0 ? (
            <p className="text-xs text-muted-foreground col-span-3 text-center py-6">Nenhum projeto ainda</p>
          ) : (
            planData.map(p => (
              <div key={p.plan} className="rounded-lg border border-border/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.count} projeto{p.count !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-foreground font-medium">{formatCurrency(p.total)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400">Recebido</span>
                    <span className="text-green-400 font-medium">{formatCurrency(p.recebido)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-400">Em Aberto</span>
                    <span className="text-amber-400 font-medium">{formatCurrency(p.aberto)}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
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
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-2 text-muted-foreground font-medium">Projeto</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-medium">Cliente</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-medium">Plano</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Total</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Recebido</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Pendente</th>
                <th className="text-center py-2 px-2 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-muted-foreground">Nenhum projeto</td>
                </tr>
              ) : (
                projects.map((p, i) => {
                  const pending = p.total_amount_cents - p.amount_received_cents;
                  const statusInfo = PAYMENT_STATUS_LABELS[p.payment_status] || PAYMENT_STATUS_LABELS.pending;
                  return (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-2 text-foreground font-medium max-w-[140px] truncate">{p.title}</td>
                      <td className="py-2.5 px-2 text-muted-foreground max-w-[120px] truncate">{p.client_name}</td>
                      <td className="py-2.5 px-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{
                          backgroundColor: `${PLAN_COLORS[p.plan]}20`,
                          color: PLAN_COLORS[p.plan],
                        }}>
                          {PLAN_LABELS[p.plan] || p.plan}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right text-foreground">{formatCurrency(p.total_amount_cents)}</td>
                      <td className="py-2.5 px-2 text-right text-green-400">{formatCurrency(p.amount_received_cents)}</td>
                      <td className="py-2.5 px-2 text-right text-amber-400">{pending > 0 ? formatCurrency(pending) : "—"}</td>
                      <td className="py-2.5 px-2 text-center">
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
