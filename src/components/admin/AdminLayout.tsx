import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut, FileText, FolderKanban, CalendarDays, History, RefreshCw, Calculator, Eye, Instagram, Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Propostas", icon: FileText, path: "/admin" },
  { label: "Projetos", icon: FolderKanban, path: "/admin/projetos" },
  { label: "Prévias", icon: Eye, path: "/admin/previas" },
  { label: "Conteúdo", icon: Instagram, path: "/admin/conteudo" },
  { label: "IAs", icon: Bot, path: "/admin/ias" },
  { label: "Contabilidade", icon: Calculator, path: "/admin/contabilidade" },
  { label: "Agenda", icon: CalendarDays, path: "/admin/agenda" },
  { label: "Logs", icon: History, path: "/admin/logs" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverVerified, setServerVerified] = useState<boolean | null>(null);

  // Server-side admin verification via RPC — independent of client context
  useEffect(() => {
    if (!user) {
      setServerVerified(null);
      return;
    }
    const verify = async () => {
      try {
        const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" as const });
        setServerVerified(!!data);
        if (!data) navigate("/admin/login");
      } catch {
        setServerVerified(false);
        navigate("/admin/login");
      }
    };
    verify();
  }, [user, navigate]);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading || serverVerified === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-brand-accent animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin || !serverVerified) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{
      // Override CSS variables for dark admin context
      '--background': '0 0% 4%',
      '--foreground': '0 0% 100%',
      '--card': '0 0% 7%',
      '--card-foreground': '0 0% 100%',
      '--popover': '0 0% 8%',
      '--popover-foreground': '0 0% 100%',
      '--primary': '0 0% 100%',
      '--primary-foreground': '0 0% 0%',
      '--secondary': '0 0% 12%',
      '--secondary-foreground': '0 0% 90%',
      '--muted': '0 0% 12%',
      '--muted-foreground': '0 0% 55%',
      '--accent': '0 0% 14%',
      '--accent-foreground': '0 0% 100%',
      '--border': '0 0% 18%',
      '--input': '0 0% 18%',
      '--ring': '224 76% 48%',
    } as React.CSSProperties}>
      {/* Top header */}
      <header className="border-b border-white/[0.06] px-6 py-3 flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Brandify</h1>
            <p className="text-[11px] text-white/30">{user.email}</p>
          </div>
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="text-white/40 hover:text-white hover:bg-white/[0.06]"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </Button>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden border-b border-white/[0.06] px-4 py-2 flex gap-1 overflow-x-auto bg-[#0a0a0a]">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                active
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      <main className="max-w-6xl mx-auto p-3 md:p-6">
        {children}
      </main>
    </div>
  );
}
