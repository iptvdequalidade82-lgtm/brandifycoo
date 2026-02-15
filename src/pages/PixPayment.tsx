import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logoImg from "@/assets/logo.jpg";

const PixPayment = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const step = searchParams.get("step"); // "init" | "final" | null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pixData, setPixData] = useState<{
    pix_payload: string;
    amount_cents: number;
    title: string;
    client_name: string;
    description: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("generate-pix", {
          body: { proposal_id: id, step: step || undefined },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        setPixData(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar pagamento");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, step]);

  const handleCopy = () => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.pix_payload);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 3000);
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (error || !pixData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Pagamento não encontrado</h1>
          <p className="text-muted-foreground">{error || "Este link de pagamento é inválido."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 glow-border text-center space-y-6">
          {/* Logo */}
          <img src={logoImg} alt="Brandify" className="w-16 h-16 rounded-full mx-auto object-cover" />

          {/* Title */}
          <div>
            <h1 className="text-xl font-bold text-foreground">{pixData.title}</h1>
            {pixData.description && (
              <p className="text-sm text-muted-foreground mt-1">{pixData.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">Para: {pixData.client_name}</p>
          </div>

          {/* Amount */}
          <div className="bg-primary/10 rounded-xl py-4 px-6">
            <p className="text-sm text-muted-foreground mb-1">Valor</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(pixData.amount_cents)}</p>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-xl p-6 inline-block mx-auto">
            <QRCodeSVG
              value={pixData.pix_payload}
              size={240}
              level="M"
              includeMargin={false}
            />
          </div>

          {/* Copy button */}
          <Button onClick={handleCopy} className="w-full" size="lg">
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" /> Copiar código PIX
              </>
            )}
          </Button>

          {/* Instructions */}
          <div className="text-left space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Como pagar:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra o app do seu banco</li>
              <li>Escaneie o QR Code ou use "PIX Copia e Cola"</li>
              <li>Confirme o pagamento</li>
            </ol>
          </div>

          <p className="text-xs text-muted-foreground">
            Pagamento processado via PIX · Brandify
          </p>
        </div>
      </div>
    </div>
  );
};

export default PixPayment;
