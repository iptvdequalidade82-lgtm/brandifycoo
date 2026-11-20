import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
const NotFound = lazy(() => import("./pages/NotFound"));


const Privacidade = lazy(() => import("./pages/Privacidade"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Termos = lazy(() => import("./pages/Termos"));
import CookieConsent from "@/components/CookieConsent";
import SeoHead from "@/components/SeoHead";
const ServicePage = lazy(() => import("./pages/ServicePage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProjects = lazy(() => import("./pages/AdminProjects"));
const AdminAgenda = lazy(() => import("./pages/AdminAgenda"));
const AdminLogs = lazy(() => import("./pages/AdminLogs"));
const AdminLeads = lazy(() => import("./pages/AdminLeads"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PixPayment = lazy(() => import("./pages/PixPayment"));
const AdminContabilidade = lazy(() => import("./pages/AdminContabilidade"));
const AdminPreviews = lazy(() => import("./pages/AdminPreviews"));
const AdminConteudo = lazy(() => import("./pages/AdminConteudo"));
const AdminIAs = lazy(() => import("./pages/AdminIAs"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SeoHead />
          <CookieConsent />
          <Suspense fallback={<div role="status" aria-live="polite" className="sr-only">Carregando página…</div>}>
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
            <Route path="/sites-institucionais" element={<ServicePage service="institucionais" />} />
            <Route path="/landing-pages" element={<ServicePage service="landing" />} />
            <Route path="/lojas-virtuais" element={<ServicePage service="lojas" />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/termos" element={<Termos />} />
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
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
