import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  proposals: Array<{
    status: string;
    amount_cents: number;
    created_at: string;
  }>;
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function RevenueChart({ proposals }: Props) {
  const data = useMemo(() => {
    const paid = proposals.filter(p => p.status === "paid");
    const now = new Date();
    const months: { name: string; value: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const total = paid
        .filter(p => {
          const pd = new Date(p.created_at);
          return pd.getMonth() === month && pd.getFullYear() === year;
        })
        .reduce((s, p) => s + p.amount_cents, 0);
      months.push({ name: `${MONTHS[month]}/${String(year).slice(2)}`, value: total / 100 });
    }
    return months;
  }, [proposals]);

  const hasData = data.some(d => d.value > 0);

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
            formatter={(value: number) => [
              new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value),
              "Faturado",
            ]}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
