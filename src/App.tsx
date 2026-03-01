import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ToolsCopy = lazy(() => import("./pages/ToolsCopy"));

const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" /></div>}>
    {children}
  </Suspense>
);

import TrabalheConosco from "./pages/TrabalheConosco";
import QuemSomos from "./pages/QuemSomos";
import Privacidade from "./pages/Privacidade";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProjects from "./pages/AdminProjects";
import AdminAgenda from "./pages/AdminAgenda";
import AdminLogs from "./pages/AdminLogs";
import AdminLeads from "./pages/AdminLeads";
import PaymentSuccess from "./pages/PaymentSuccess";
import PixPayment from "./pages/PixPayment";
import Projetos from "./pages/Projetos";
import Curso from "./pages/Curso";
import Planos from "./pages/Planos";
import AdminContabilidade from "./pages/AdminContabilidade";
import AdminPreviews from "./pages/AdminPreviews";
import AdminConteudo from "./pages/AdminConteudo";
import PreviewSite from "./pages/PreviewSite";
import PreviewLoja from "./pages/PreviewLoja";
import AdminIAs from "./pages/AdminIAs";
import AuthLogin from "./pages/AuthLogin";
import AuthSignup from "./pages/AuthSignup";
import IAs from "./pages/IAs";
import PlanosPro from "./pages/PlanosPro";
import Editor from "./pages/Editor";

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
            <Route path="/login" element={<AuthLogin />} />
            <Route path="/cadastro" element={<AuthSignup />} />
            <Route path="/ias" element={<IAs />} />
            <Route path="/planos-pro" element={<PlanosPro />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/dashboard" element={<LazyPage><Dashboard /></LazyPage>} />
            <Route path="/tools/copy" element={<LazyPage><ToolsCopy /></LazyPage>} />
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/preview-site" element={<PreviewSite />} />
            <Route path="/preview-loja" element={<PreviewLoja />} />
            
            <Route path="/curso" element={<Curso />} />
            <Route path="/planos" element={<Planos />} />
            
            <Route path="/trabalhe-conosco" element={<TrabalheConosco />} />
            <Route path="/quem-somos" element={<QuemSomos />} />
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
