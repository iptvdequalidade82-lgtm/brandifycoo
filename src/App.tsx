import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";


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
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/tools/copy" element={<Navigate to="/" replace />} />
            <Route path="/tools/landing" element={<Navigate to="/" replace />} />
            <Route path="/tools/atendedor" element={<Navigate to="/" replace />} />
            <Route path="/tools/agendador" element={<Navigate to="/" replace />} />
            <Route path="/tools/diagnostico-ig" element={<Navigate to="/" replace />} />
            <Route path="/tools/planejamento" element={<Navigate to="/" replace />} />
            <Route path="/tools/simulador" element={<Navigate to="/" replace />} />
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
