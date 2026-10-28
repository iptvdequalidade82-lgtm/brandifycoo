import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Dashboard = lazy(() => import("./pages/Dashboard"));

const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" /></div>}>
    {children}
  </Suspense>
);

import Privacidade from "./pages/Privacidade";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProjects from "./pages/AdminProjects";
import AdminAgenda from "./pages/AdminAgenda";
import AdminLogs from "./pages/AdminLogs";
import AdminLeads from "./pages/AdminLeads";
import PaymentSuccess from "./pages/PaymentSuccess";
import PixPayment from "./pages/PixPayment";
import AdminContabilidade from "./pages/AdminContabilidade";
import AdminPreviews from "./pages/AdminPreviews";
import AdminConteudo from "./pages/AdminConteudo";
import AdminIAs from "./pages/AdminIAs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/cadastro" element={<Navigate to="/" replace />} />
            <Route path="/ias" element={<Navigate to="/" replace />} />
            <Route path="/planos-pro" element={<Navigate to="/" replace />} />
            <Route path="/editor" element={<Navigate to="/" replace />} />
            <Route path="/dashboard" element={<LazyPage><Dashboard /></LazyPage>} />
            <Route path="/tools/copy" element={<LazyPage><ToolsCopy /></LazyPage>} />
            <Route path="/tools/landing" element={<LazyPage><ToolsLanding /></LazyPage>} />
            <Route path="/tools/atendedor" element={<LazyPage><ToolsAtendedor /></LazyPage>} />
            <Route path="/tools/agendador" element={<LazyPage><ToolsAgendador /></LazyPage>} />
            <Route path="/tools/diagnostico-ig" element={<LazyPage><ToolsDiagnosticoIG /></LazyPage>} />
            <Route path="/tools/planejamento" element={<LazyPage><ToolsPlanejamento /></LazyPage>} />
            <Route path="/tools/simulador" element={<LazyPage><ToolsSimulador /></LazyPage>} />
            <Route path="/projetos" element={<Navigate to="/#trabalhos" replace />} />
            
            <Route path="/curso" element={<Navigate to="/#servicos" replace />} />
            <Route path="/planos" element={<Navigate to="/#pacotes" replace />} />
            
            <Route path="/trabalhe-conosco" element={<Navigate to="/#contato" replace />} />
            <Route path="/quem-somos" element={<Navigate to="/#sobre" replace />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/projetos" element={<AdminProjects />} />
            <Route path="/admin/agenda" element={<AdminAgenda />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin/contabilidade" element={<AdminContabilidade />} />
            <Route path="/admin/previas" element={<AdminPreviews />} />
            <Route path="/admin/conteudo" element={<AdminConteudo />} />
            <Route path="/admin/ias" element={<AdminIAs />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/pagamento-sucesso" element={<PaymentSuccess />} />
            <Route path="/pix/:id" element={<PixPayment />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
