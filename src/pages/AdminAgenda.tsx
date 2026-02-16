import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Crown, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  client_name: string;
  title: string;
  plan: "essencial" | "profissional" | "premium";
  status: "briefing" | "design" | "desenvolvimento" | "revisao" | "entregue";
  start_date: string | null;
  due_date: string | null;
  created_at: string;
}

const planConfig = {
  essencial: { label: "Essencial", icon: Star, color: "text-blue-400", bg: "bg-blue-500", dot: "bg-blue-400" },
  profissional: { label: "Profissional", icon: Award, color: "text-purple-400", bg: "bg-purple-500", dot: "bg-purple-400" },
  premium: { label: "Premium", icon: Crown, color: "text-amber-400", bg: "bg-amber-500", dot: "bg-amber-400" },
};

const statusLabels: Record<string, string> = {
  briefing: "Briefing", design: "Design", desenvolvimento: "Dev",
  revisao: "Revisão", entregue: "Entregue",
};

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isInRange(date: Date, start: Date | null, end: Date | null) {
  if (start && end) return date >= start && date <= end;
  if (start) return isSameDay(date, start);
  if (end) return isSameDay(date, end);
  return false;
}

export default function AdminAgenda() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("start_date", { ascending: true, nullsFirst: false });
      if (data) setProjects(data as unknown as Project[]);
      setLoading(false);
    })();
  }, []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = new Date();

  // Map days to projects
  const dayProjects = useMemo(() => {
    const map: Record<string, Project[]> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const key = date.toISOString().split("T")[0];
      map[key] = projects.filter(p => {
        const start = p.start_date ? new Date(p.start_date) : null;
        const end = p.due_date ? new Date(p.due_date) : null;
        return isInRange(date, start, end);
      });
    }
    return map;
  }, [projects, currentMonth, currentYear, daysInMonth]);

  const selectedDayKey = selectedDay?.toISOString().split("T")[0];
  const selectedProjects = selectedDayKey ? dayProjects[selectedDayKey] || [] : [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  // Active (non-delivered) projects summary
  const activeProjects = projects.filter(p => p.status !== "entregue");
  const overdue = activeProjects.filter(p => p.due_date && new Date(p.due_date) < today);

  return (
    <AdminLayout>
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="rounded-2xl p-4 border border-white/[0.06] bg-white/[0.02]">
              <p className="text-2xl font-bold text-white">{activeProjects.length}</p>
              <p className="text-xs text-white/40">Em andamento</p>
            </div>
            <div className="rounded-2xl p-4 border border-white/[0.06] bg-white/[0.02]">
              <p className="text-2xl font-bold text-red-400">{overdue.length}</p>
              <p className="text-xs text-white/40">Atrasados</p>
            </div>
            <div className="rounded-2xl p-4 border border-white/[0.06] bg-white/[0.02]">
              <p className="text-2xl font-bold text-white">{projects.filter(p => p.status === "entregue").length}</p>
              <p className="text-xs text-white/40">Entregues</p>
            </div>
            <div className="rounded-2xl p-4 border border-white/[0.06] bg-white/[0.02]">
              <p className="text-2xl font-bold text-white">{projects.length}</p>
              <p className="text-xs text-white/40">Total</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="md:col-span-2 rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="font-semibold text-foreground">
                  {MONTHS[currentMonth]} {currentYear}
                </h3>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for offset */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(currentYear, currentMonth, day);
                  const key = date.toISOString().split("T")[0];
                  const dayP = dayProjects[key] || [];
                  const isToday = isSameDay(date, today);
                  const isSelected = selectedDay && isSameDay(date, selectedDay);
                  const hasOverdue = dayP.some(p => p.due_date && isSameDay(new Date(p.due_date), date) && date < today && p.status !== "entregue");

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(date)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative ${
                        isSelected
                          ? "bg-primary text-primary-foreground ring-2 ring-primary"
                          : isToday
                          ? "bg-muted font-bold text-foreground"
                          : "hover:bg-muted/50 text-foreground"
                      } ${hasOverdue ? "ring-1 ring-destructive" : ""}`}
                    >
                      <span className="text-xs">{day}</span>
                      {dayP.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayP.slice(0, 3).map((p, idx) => (
                            <div key={idx} className={`w-1.5 h-1.5 rounded-full ${planConfig[p.plan].dot}`} />
                          ))}
                          {dayP.length > 3 && <span className="text-[8px] text-muted-foreground">+{dayP.length - 3}</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-4 pt-3 border-t border-border">
                {Object.entries(planConfig).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className="text-xs text-muted-foreground">{cfg.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day detail panel */}
            <div className="rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02]">
              {selectedDay ? (
                <>
                  <h3 className="font-semibold text-foreground mb-1">
                    {selectedDay.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                  </h3>
                  {selectedProjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-4">Nenhum projeto neste dia</p>
                  ) : (
                    <div className="space-y-3 mt-4">
                      {selectedProjects.map(p => {
                        const cfg = planConfig[p.plan];
                        const Icon = cfg.icon;
                        const isStart = p.start_date && isSameDay(new Date(p.start_date), selectedDay);
                        const isDue = p.due_date && isSameDay(new Date(p.due_date), selectedDay);
                        return (
                          <div key={p.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {statusLabels[p.status]}
                              </span>
                            </div>
                            <p className="font-medium text-sm text-foreground">{p.title}</p>
                            <p className="text-xs text-muted-foreground">{p.client_name}</p>
                            <div className="flex gap-2 mt-2">
                              {isStart && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-400/10 text-green-400 font-medium">
                                  🚀 Início
                                </span>
                              )}
                              {isDue && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  new Date(p.due_date!) < today && p.status !== "entregue"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-amber-400/10 text-amber-400"
                                }`}>
                                  📦 Entrega
                                </span>
                              )}
                              {!isStart && !isDue && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                                  Em progresso
                                </span>
                              )}
                            </div>
                            {p.start_date && p.due_date && (
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {new Date(p.start_date).toLocaleDateString("pt-BR")} → {new Date(p.due_date).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <CalendarDays className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Selecione um dia no calendário para ver os projetos</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline — upcoming deadlines */}
          {activeProjects.filter(p => p.due_date).length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Próximas Entregas
              </h3>
              <div className="relative border-l-2 border-border ml-3 space-y-4 pl-6">
                {activeProjects
                  .filter(p => p.due_date)
                  .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
                  .map(p => {
                    const dueDate = new Date(p.due_date!);
                    const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
                    const cfg = planConfig[p.plan];
                    const Icon = cfg.icon;
                    return (
                      <div key={p.id} className="relative">
                        <div className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-background ${cfg.dot}`} />
                        <div className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                              <span className="font-medium text-foreground text-sm">{p.title}</span>
                            </div>
                            <span className={`text-xs font-bold ${
                              daysLeft < 0 ? "text-destructive" : daysLeft <= 3 ? "text-amber-400" : "text-muted-foreground"
                            }`}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)}d atrasado` : daysLeft === 0 ? "Hoje!" : `${daysLeft}d restantes`}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {p.client_name} · {statusLabels[p.status]} · {dueDate.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
