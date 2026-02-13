import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center glass rounded-2xl p-10 glow-border max-w-md">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold font-heading text-foreground mb-2">
          Pagamento Confirmado!
        </h1>
        <p className="text-muted-foreground mb-6">
          Seu pagamento foi processado com sucesso. Em breve entraremos em contato para iniciar o seu projeto.
        </p>
        <Button asChild>
          <a href="/">Voltar ao site</a>
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
