import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Curso from "./pages/Curso";
import TrabalheConosco from "./pages/TrabalheConosco";
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
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/curso" element={<Curso />} />
            <Route path="/trabalhe-conosco" element={<TrabalheConosco />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/projetos" element={<AdminProjects />} />
            <Route path="/admin/agenda" element={<AdminAgenda />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
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
