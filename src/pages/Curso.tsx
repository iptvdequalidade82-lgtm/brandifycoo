import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, CheckCircle2 } from "lucide-react";
import cursoBanner from "@/assets/curso-banner.jpg";
import cursoLogo from "@/assets/curso-logo.png";

const benefits = [
  "Criação de SaaS na prática em 30 dias",
  "Suporte especializado por WhatsApp",
  "Aulas ao vivo via Zoom para tirar dúvidas",
  "Comunidade engajada para fazer networking",
  "Acesso imediato",
  "Garantia de 15 dias",
];

export default function Curso() {
  const checkoutUrl =
    "https://pay.cakto.com.br/j3nfmrj_323782?affiliate=QfzSc7Xx";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft size={16} />
          Voltar ao início
        </Link>
      </div>

      {/* Banner */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="rounded-2xl overflow-hidden mb-10">
          <img
            src={cursoBanner}
            alt="SaaS na Prática em 30 dias"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row gap-10 pb-20">
          {/* Left - Info */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={cursoLogo}
                alt="IA Coding Club"
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  SaaS na Prática em 30 dias
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  por Matheus da IA
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {benefits.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-foreground/80 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - CTA */}
          <div className="md:w-72 shrink-0">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 sticky top-6">
              <p className="text-3xl font-bold text-foreground">
                R$ 197<span className="text-lg font-normal text-muted-foreground">,00</span>
              </p>
              <p className="text-sm text-muted-foreground">à vista</p>

              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 transition"
              >
                Quero me inscrever
                <ExternalLink size={16} />
              </a>

              <p className="text-xs text-muted-foreground text-center">
                Pagamento seguro via Cakto
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
