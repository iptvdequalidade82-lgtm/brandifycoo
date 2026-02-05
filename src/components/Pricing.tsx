import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <section id="investimento" className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">
            Investimento
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Transparência desde o início
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Sem surpresas. Veja o que está incluso no seu projeto.
          </p>
        </div>

        <div className="glass rounded-2xl glow-border overflow-hidden">
          <div className="p-8 md:p-10 text-center border-b border-border">
            <p className="text-muted-foreground text-sm mb-2">A partir de</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-display text-5xl md:text-6xl font-bold text-gradient">R$ 1.200</span>
            </div>
            <p className="text-muted-foreground text-sm mt-2">Valor final definido conforme o escopo do projeto</p>
          </div>

          <div className="p-8 md:p-10">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                "Site profissional e responsivo",
                "Design personalizado para sua marca",
                "Otimização para Google (SEO)",
                "Certificado de segurança SSL",
                "Hospedagem a partir de R$ 120/ano",
                "Domínio próprio (.com.br)",
                "Publicação e configuração completa",
                "1 ajuste mensal incluso no suporte",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check className="text-primary mt-0.5 flex-shrink-0" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-8 pb-8 md:px-10 md:pb-10 text-center">
            <a
              href="https://wa.me/5543991065129"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto px-10 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Solicitar Orçamento
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
