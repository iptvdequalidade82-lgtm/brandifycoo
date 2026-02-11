import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import cursoBanner from "@/assets/curso-banner.jpg";
import novaProfissaoCover from "@/assets/nova-profissao-cover.webp";
import dropMilionarioCover from "@/assets/drop-milionario-cover.webp";
import Header from "@/components/Header";

const products = [
  {
    title: "SaaS na Prática em 30 dias",
    description: "Aprenda a criar um SaaS do zero em apenas 30 dias com suporte e aulas ao vivo.",
    price: "R$ 197,00",
    installments: "",
    image: cursoBanner,
    checkoutUrl: "https://pay.cakto.com.br/j3nfmrj_323782?affiliate=QfzSc7Xx",
  },
  {
    title: "Nova Profissão",
    description: "O treinamento ideal para quem sonha em se tornar um profissional completo no digital.",
    price: "R$ 699,00",
    installments: "ou 12x de R$ 71,64",
    image: novaProfissaoCover,
    checkoutUrl: "https://pay.kirvano.com/9ee0e4df-b093-4975-b0a8-48d863543762?aff=681f54e8-2253-45ed-a04a-523963130dea",
  },
  {
    title: "Drop Milionário",
    description: "Aprenda as estratégias de dropshipping para construir um negócio lucrativo do zero.",
    price: "R$ 197,90",
    installments: "ou 12x de R$ 20,28",
    image: dropMilionarioCover,
    checkoutUrl: "https://pay.kirvano.com/80931f40-cdd6-42b7-91d2-a9aeb57aa495?aff=cc8503b8-058d-4285-910b-b0fc9746420d",
  },
];

export default function Curso() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium tracking-wide mb-6 animate-fade-up">
              <Sparkles size={14} />
              Produtos Digitais
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.1] mb-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Invista no seu <span className="text-gradient">futuro</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Cursos selecionados para você crescer no mercado digital.
            </p>
          </div>

          {/* Products */}
          <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <div
                key={product.title}
                className={`group rounded-2xl border border-border/60 bg-card/40 overflow-hidden flex flex-col hover:border-primary/30 hover:shadow-[0_0_20px_hsl(210_100%_60%/0.08)] transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: isVisible ? `${i * 120}ms` : "0ms" }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="font-display text-lg font-bold mb-1">{product.title}</h2>
                  <p className="text-muted-foreground text-sm mb-4 flex-1">{product.description}</p>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-gradient">{product.price}</p>
                    {product.installments && (
                      <p className="text-xs text-muted-foreground mt-0.5">{product.installments}</p>
                    )}
                  </div>
                  <a
                    href={product.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3 hover:shadow-[0_0_20px_hsl(210_100%_60%/0.3)] transition-all duration-300"
                  >
                    Quero me inscrever
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
