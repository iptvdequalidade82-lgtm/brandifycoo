import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon, Download, Plus, Trash2, TrendingUp, TrendingDown, DollarSign, ArrowUpDown, Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const EXPENSE_CATEGORIES = [
  { value: "dominio", label: "Domínio" },
  { value: "hospedagem", label: "Hospedagem" },
  { value: "software", label: "Software / Ferramenta" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "transporte", label: "Transporte" },
  { value: "marketing", label: "Marketing" },
  { value: "equipamento", label: "Equipamento" },
  { value: "servico_terceiro", label: "Serviço de Terceiro" },
  { value: "imposto", label: "Imposto / Taxa" },
  { value: "reembolso", label: "Reembolso" },
  { value: "outros", label: "Outros" },
];

function getCategoryLabel(value: string) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

type LedgerEntry = {
  id: string;
  date: string;
  type: "receita" | "despesa";
  description: string;
  category: string;
  amount_cents: number;
  source: string;
  projectId?: string;
};

export default function AdminContabilidade() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // New expense form
  const [open, setOpen] = useState(false);
  const [expDesc, setExpDesc] = useState("");
  const [expCategory, setExpCategory] = useState("outros");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState<Date | undefined>(new Date());

  // New revenue form
  const [revOpen, setRevOpen] = useState(false);
  const [revDesc, setRevDesc] = useState("");
  const [revAmount, setRevAmount] = useState("");
  const [revDate, setRevDate] = useState<Date | undefined>(new Date());

  // Refund dialog
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundEntry, setRefundEntry] = useState<LedgerEntry | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundType, setRefundType] = useState<"total" | "parcial">("total");

  // Fetch projects - only fully paid (payment_status = "paid")
  const { data: projects } = useQuery({
    queryKey: ["accounting-projects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title, client_name, total_amount_cents, amount_received_cents, created_at, status, payment_status")
        .eq("payment_status", "full")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Fetch expenses
  const { data: expenses } = useQuery({
    queryKey: ["accounting-expenses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false });
      return (data ?? []) as {
        id: string;
        description: string;
        category: string;
        amount_cents: number;
        expense_date: string;
        created_at: string;
        created_by: string;
      }[];
    },
  });

  // Fetch extra revenue
  const { data: extraRevenue } = useQuery({
    queryKey: ["accounting-extra-revenue"],
    queryFn: async () => {
      const { data } = await supabase
        .from("extra_revenue")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as {
        id: string;
        description: string;
        amount_cents: number;
        created_at: string;
        created_by: string;
      }[];
    },
  });

  // Add extra revenue
  const addRevenue = useMutation({
    mutationFn: async () => {
      const amountCents = Math.round(parseFloat(revAmount.replace(",", ".")) * 100);
      if (isNaN(amountCents) || amountCents <= 0) throw new Error("Valor inválido");
      if (!revDesc.trim()) throw new Error("Descrição obrigatória");

      const { error } = await supabase.from("extra_revenue").insert({
        description: revDesc.trim(),
        amount_cents: amountCents,
        created_by: user!.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting-extra-revenue"] });
      setRevDesc("");
      setRevAmount("");
      setRevDate(new Date());
      setRevOpen(false);
      toast({ title: "Receita registrada!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // Delete extra revenue
  const deleteRevenue = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("extra_revenue").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting-extra-revenue"] });
      toast({ title: "Receita removida" });
    },
  });

  // Add expense
  const addExpense = useMutation({
    mutationFn: async (params?: { desc: string; cat: string; amount: number; date: string }) => {
      const amountCents = params?.amount ?? Math.round(parseFloat(expAmount.replace(",", ".")) * 100);
      const description = params?.desc ?? expDesc.trim();
      const category = params?.cat ?? expCategory;
      const date = params?.date ?? (expDate ? format(expDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));

      if (isNaN(amountCents) || amountCents <= 0) throw new Error("Valor inválido");
      if (!description) throw new Error("Descrição obrigatória");

      const { error } = await supabase.from("expenses").insert({
        description,
        category,
        amount_cents: amountCents,
        expense_date: date,
        created_by: user!.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting-expenses"] });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // Delete expense
  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting-expenses"] });
      toast({ title: "Despesa removida" });
    },
  });

  // Handle add expense from form
  const handleAddExpense = async () => {
    const amountCents = Math.round(parseFloat(expAmount.replace(",", ".")) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      toast({ title: "Valor inválido", variant: "destructive" });
      return;
    }
    if (!expDesc.trim()) {
      toast({ title: "Descrição obrigatória", variant: "destructive" });
      return;
    }
    await addExpense.mutateAsync({
      desc: expDesc.trim(),
      cat: expCategory,
      amount: amountCents,
      date: expDate ? format(expDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    });
    setExpDesc("");
    setExpAmount("");
    setExpCategory("outros");
    setExpDate(new Date());
    setOpen(false);
    toast({ title: "Despesa registrada!" });
  };

  // Handle refund
  const handleRefund = async () => {
    if (!refundEntry) return;
    const amountCents = refundType === "total"
      ? refundEntry.amount_cents
      : Math.round(parseFloat(refundAmount.replace(",", ".")) * 100);

    if (isNaN(amountCents) || amountCents <= 0) {
      toast({ title: "Valor inválido", variant: "destructive" });
      return;
    }
    if (amountCents > refundEntry.amount_cents) {
      toast({ title: "Valor do reembolso não pode ser maior que a receita", variant: "destructive" });
      return;
    }

    await addExpense.mutateAsync({
      desc: `Reembolso — ${refundEntry.description}`,
      cat: "reembolso",
      amount: amountCents,
      date: format(new Date(), "yyyy-MM-dd"),
    });

    setRefundOpen(false);
    setRefundEntry(null);
    setRefundAmount("");
    setRefundType("total");
    toast({ title: "Reembolso registrado com sucesso!" });
  };

  // Build unified ledger
  const ledger = useMemo<LedgerEntry[]>(() => {
    const entries: LedgerEntry[] = [];

    // Revenue only from fully paid projects
    (projects ?? []).forEach((p) => {
      const received = p.total_amount_cents ?? 0;
      if (received > 0) {
        entries.push({
          id: `proj-${p.id}`,
          date: p.created_at,
          type: "receita",
          description: `${p.title} — ${p.client_name}`,
          category: "Projeto (Quitado)",
          amount_cents: received,
          source: "projeto",
          projectId: p.id,
        });
      }
    });

    // Extra revenue (manual entries like Pix, transfers, etc.)
    (extraRevenue ?? []).forEach((r) => {
      entries.push({
        id: `rev-${r.id}`,
        date: r.created_at,
        type: "receita",
        description: r.description,
        category: "Receita Manual",
        amount_cents: r.amount_cents,
        source: "manual-revenue",
      });
    });

    // Expenses (including refunds)
    (expenses ?? []).forEach((e) => {
      entries.push({
        id: `exp-${e.id}`,
        date: e.expense_date,
        type: "despesa",
        description: e.description,
        category: getCategoryLabel(e.category),
        amount_cents: e.amount_cents,
        source: "manual",
      });
    });

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [projects, expenses, extraRevenue]);

  // Filter by date range
  const filtered = useMemo(() => {
    if (!startDate && !endDate) return ledger;
    return ledger.filter((e) => {
      const d = startOfDay(new Date(e.date));
      const s = startDate ? startOfDay(startDate) : new Date(0);
      const en = endDate ? endOfDay(endDate) : new Date(9999, 11, 31);
      return d >= s && d <= en;
    });
  }, [ledger, startDate, endDate]);

  // Totals
  const totalReceita = filtered.filter((e) => e.type === "receita").reduce((s, e) => s + e.amount_cents, 0);
  const totalDespesa = filtered.filter((e) => e.type === "despesa").reduce((s, e) => s + e.amount_cents, 0);
  const saldo = totalReceita - totalDespesa;

  // Export CSV
  const exportCSV = () => {
    const header = "Data;Tipo;Descrição;Categoria;Valor (R$)\n";
    const rows = filtered.map((e) =>
      `${format(new Date(e.date), "dd/MM/yyyy")};${e.type === "receita" ? "Receita" : "Despesa"};${e.description.replace(/;/g, ",")};${e.category};${(e.amount_cents / 100).toFixed(2).replace(".", ",")}`
    ).join("\n");

    const totalsRow = `\n\nResumo do Período\nTotal Receitas:;${(totalReceita / 100).toFixed(2).replace(".", ",")}\nTotal Despesas:;${(totalDespesa / 100).toFixed(2).replace(".", ",")}\nSaldo:;${(saldo / 100).toFixed(2).replace(".", ",")}`;

    const periodLabel = startDate && endDate
      ? `Período: ${format(startDate, "dd/MM/yyyy")} a ${format(endDate, "dd/MM/yyyy")}`
      : "Período completo";

    const csv = `${periodLabel}\n\n${header}${rows}${totalsRow}`;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contabilidade_${format(startDate ?? new Date(), "yyyy-MM-dd")}_${format(endDate ?? new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Tabela exportada com sucesso!" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Contabilidade</h2>
            <p className="text-sm text-white/40">Apenas projetos 100% quitados · Despesas e reembolsos</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("text-xs gap-1.5", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {startDate ? format(startDate, "dd/MM/yy") : "Início"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} locale={ptBR} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>

            <span className="text-white/30 text-xs">até</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("text-xs gap-1.5", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {endDate ? format(endDate, "dd/MM/yy") : "Fim"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} locale={ptBR} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>

            <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Nova Despesa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Despesa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Descrição</label>
                    <Input placeholder="Ex: Almoço reunião cliente" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Categoria</label>
                      <Select value={expCategory} onValueChange={setExpCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.filter(c => c.value !== "reembolso").map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Valor (R$)</label>
                      <Input placeholder="0,00" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Data</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left", !expDate && "text-muted-foreground")}>
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {expDate ? format(expDate, "dd/MM/yyyy") : "Selecionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={expDate} onSelect={setExpDate} locale={ptBR} className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button className="w-full" onClick={handleAddExpense} disabled={addExpense.isPending}>
                    {addExpense.isPending ? "Salvando..." : "Salvar Despesa"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={revOpen} onOpenChange={setRevOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-3.5 h-3.5" /> Nova Receita
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Receita Manual</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Descrição</label>
                    <Input placeholder="Ex: Pix do cliente João" value={revDesc} onChange={(e) => setRevDesc(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Valor (R$)</label>
                    <Input placeholder="0,00" value={revAmount} onChange={(e) => setRevAmount(e.target.value)} />
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => addRevenue.mutate()} disabled={addRevenue.isPending}>
                    {addRevenue.isPending ? "Salvando..." : "Salvar Receita"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#111] border-white/[0.06]">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Receitas</p>
                <p className="text-lg font-bold text-emerald-400">{formatCurrency(totalReceita)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/[0.06]">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Despesas</p>
                <p className="text-lg font-bold text-red-400">{formatCurrency(totalDespesa)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/[0.06]">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Saldo</p>
                <p className={cn("text-lg font-bold", saldo >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {formatCurrency(saldo)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ledger table */}
        <Card className="bg-[#111] border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Movimentações ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-white/40 text-xs">Data</TableHead>
                  <TableHead className="text-white/40 text-xs">Tipo</TableHead>
                  <TableHead className="text-white/40 text-xs">Descrição</TableHead>
                  <TableHead className="text-white/40 text-xs">Categoria</TableHead>
                  <TableHead className="text-white/40 text-xs text-right">Valor</TableHead>
                  <TableHead className="text-white/40 text-xs w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-white/30 py-10">
                      Nenhuma movimentação no período selecionado
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((entry) => (
                  <TableRow key={entry.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                    <TableCell className="text-xs text-white/60">
                      {format(new Date(entry.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        entry.type === "receita"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : entry.category === "Reembolso"
                            ? "bg-orange-500/10 text-orange-400"
                            : "bg-red-500/10 text-red-400"
                      )}>
                        {entry.type === "receita" ? "Receita" : entry.category === "Reembolso" ? "Reembolso" : "Despesa"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-white/80 max-w-[250px] truncate">
                      {entry.description}
                    </TableCell>
                    <TableCell className="text-xs text-white/50">{entry.category}</TableCell>
                    <TableCell className={cn(
                      "text-sm font-medium text-right",
                      entry.type === "receita" ? "text-emerald-400" : "text-red-400"
                    )}>
                      {entry.type === "despesa" ? "- " : ""}{formatCurrency(entry.amount_cents)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* Refund button for revenue entries */}
                        {entry.type === "receita" && (
                          <button
                            onClick={() => {
                              setRefundEntry(entry);
                              setRefundType("total");
                              setRefundAmount((entry.amount_cents / 100).toFixed(2).replace(".", ","));
                              setRefundOpen(true);
                            }}
                            className="text-white/20 hover:text-orange-400 transition-colors"
                            title="Registrar reembolso"
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Delete button for manual expenses */}
                        {entry.source === "manual" && (
                          <button
                            onClick={() => deleteExpense.mutate(entry.id.replace("exp-", ""))}
                            className="text-white/20 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Delete button for manual revenue */}
                        {entry.source === "manual-revenue" && (
                          <button
                            onClick={() => deleteRevenue.mutate(entry.id.replace("rev-", ""))}
                            className="text-white/20 hover:text-red-400 transition-colors"
                            title="Remover receita"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Refund Dialog */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Reembolso</DialogTitle>
          </DialogHeader>
          {refundEntry && (
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                <p className="text-sm text-white/80 font-medium">{refundEntry.description}</p>
                <p className="text-xs text-white/40 mt-1">Valor total: {formatCurrency(refundEntry.amount_cents)}</p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tipo de reembolso</label>
                <div className="flex gap-2">
                  <Button
                    variant={refundType === "total" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setRefundType("total");
                      setRefundAmount((refundEntry.amount_cents / 100).toFixed(2).replace(".", ","));
                    }}
                  >
                    Total
                  </Button>
                  <Button
                    variant={refundType === "parcial" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setRefundType("parcial");
                      setRefundAmount("");
                    }}
                  >
                    Parcial
                  </Button>
                </div>
              </div>

              {refundType === "parcial" && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Valor do reembolso (R$)</label>
                  <Input
                    placeholder="0,00"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setRefundOpen(false)}>Cancelar</Button>
                <Button
                  onClick={handleRefund}
                  disabled={addExpense.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {addExpense.isPending ? "Processando..." : "Confirmar Reembolso"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
