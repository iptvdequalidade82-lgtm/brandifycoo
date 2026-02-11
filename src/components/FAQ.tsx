import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Qual o prazo de entrega de um site?",
    a: "O prazo médio é de 7 a 15 dias úteis, dependendo da complexidade do projeto. Sites mais simples podem ficar prontos em até 5 dias.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Trabalhamos com pagamento via Pix ou cartão de crédito. Para projetos acima de R$ 2.000, oferecemos parcelamento em até 3x sem juros.",
  },
  {
    q: "O site fica responsivo para celular?",
    a: "Sim! Todos os nossos sites são 100% responsivos e otimizados para qualquer dispositivo — celular, tablet e desktop.",
  },
  {
    q: "Preciso fornecer o conteúdo do site?",
    a: "Idealmente sim, mas se precisar de ajuda, nossa equipe de copywriting pode criar textos persuasivos para o seu negócio.",
  },
  {
    q: "O que está incluso na hospedagem?",
    a: "A hospedagem inclui certificado SSL, domínio .com.br, suporte técnico e 1 ajuste mensal no site. O valor é a partir de R$ 120/ano.",
  },
  {
    q: "Vocês fazem manutenção após a entrega?",
    a: "Sim! Oferecemos 1 ajuste mensal incluso. Para demandas extras, temos planos de manutenção sob medida.",
  },
];

export default function FAQ() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="faq" className="py-14 md:py-20 px-6">
      <div ref={ref} className="container mx-auto max-w-3xl">
        <h2
          className={`font-display text-3xl md:text-4xl font-bold text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Perguntas frequentes
        </h2>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className={`rounded-2xl border border-border/60 bg-card/40 px-6 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: isVisible ? `${i * 80}ms` : "0ms" }}
            >
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
