import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import cursoBanner from "@/assets/curso-banner.jpg";
import novaProfissaoCover from "@/assets/nova-profissao-cover.webp";
import dropMilionarioCover from "@/assets/drop-milionario-cover.webp";

const products = [
  {
    title: "SaaS na Prática em 30 dias",
    description: "Aprenda a criar um SaaS do zero em apenas 30 dias com suporte e aulas ao vivo.",
    price: "R$ 197,00",
    installments: "",
    image: cursoBanner,
    checkoutUrl: "https://pay.cakto.com.br/j3nfmrj_323782?affiliate=QfzSc7Xx",
    platform: "Cakto",
  },
  {
    title: "Nova Profissão",
    description: "O treinamento ideal para quem sonha em se tornar um profissional completo no digital.",
    price: "R$ 699,00",
    installments: "ou 12x de R$ 71,64",
    image: novaProfissaoCover,
    checkoutUrl: "https://pay.kirvano.com/9ee0e4df-b093-4975-b0a8-48d863543762?aff=681f54e8-2253-45ed-a04a-523963130dea",
    platform: "Kirvano",
  },
  {
    title: "Drop Milionário",
    description: "Aprenda as estratégias de dropshipping para construir um negócio lucrativo do zero.",
    price: "R$ 197,90",
    installments: "ou 12x de R$ 20,28",
    image: dropMilionarioCover,
    checkoutUrl: "https://pay.kirvano.com/80931f40-cdd6-42b7-91d2-a9aeb57aa495?aff=cc8503b8-058d-4285-910b-b0fc9746420d",
    platform: "Kirvano",
  },
];

export default function Curso() {
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

      <div className="max-w-5xl mx-auto px-6 pb-20">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Cursos</h1>
        <p className="text-muted-foreground mb-10">Invista no seu futuro com nossos cursos selecionados.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.title}
              className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-display text-xl font-bold mb-1">{product.title}</h2>
                <p className="text-muted-foreground text-sm mb-4 flex-1">{product.description}</p>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-foreground">{product.price}</p>
                  {product.installments && (
                    <p className="text-xs text-muted-foreground">{product.installments}</p>
                  )}
                </div>
                <a
                  href={product.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 transition"
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
  );
}
