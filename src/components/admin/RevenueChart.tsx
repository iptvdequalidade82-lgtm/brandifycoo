import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  proposals: Array<{
    status: string;
    amount_cents: number;
    created_at: string;
  }>;
  projects: Array<{
    total_amount_cents: number;
    amount_received_cents: number;
    payment_status: string;
    created_at: string;
  }>;
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function RevenueChart({ proposals, projects }: Props) {
  const data = useMemo(() => {
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

  const hasData = data.some(d => d.recebido > 0 || d.aberto > 0);

  if (!hasData) {
    return (
      <div className="glass rounded-xl p-5 glow-border mb-8">
        <h3 className="text-sm font-semibold text-foreground mb-3">📊 Faturamento Mensal</h3>
        <p className="text-xs text-muted-foreground text-center py-6">Nenhum faturamento registrado ainda</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5 glow-border mb-8">
      <h3 className="text-sm font-semibold text-foreground mb-4">📊 Faturamento Mensal (últimos 6 meses)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
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
    </div>
  );
}