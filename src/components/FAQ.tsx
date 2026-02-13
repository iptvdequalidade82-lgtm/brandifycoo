import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Qual o prazo de entrega de um site?", a: "O prazo médio é de 7 a 15 dias úteis, dependendo da complexidade do projeto. Sites mais simples podem ficar prontos em até 5 dias." },
  { q: "Como funciona o pagamento?", a: "Trabalhamos com pagamento via Pix ou cartão de crédito. Para projetos acima de R$ 2.000, oferecemos parcelamento em até 3x sem juros." },
  { q: "O site fica responsivo para celular?", a: "Sim! Todos os nossos sites são 100% responsivos e otimizados para qualquer dispositivo — celular, tablet e desktop." },
  { q: "Preciso fornecer o conteúdo do site?", a: "Sim, mas se precisar de ajuda, nossa equipe de copywriting pode criar textos profissionais e persuasivos para o seu negócio. Cuidamos de tudo para você!" },
  { q: "A hospedagem e o domínio estão inclusos?", a: "Hospedagem e domínio são cobrados separadamente. A hospedagem custa R$ 240,00/ano (valor fixo) e o domínio a partir de R$ 49,90/ano, variando conforme a extensão escolhida." },
  { q: "Vocês fazem manutenção após a entrega?", a: "Sim! Todos os planos incluem 1 ajuste mensal. Para demandas extras, temos planos de manutenção sob medida." },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function FAQ() {
  return (
    <section id="faq" className="py-14 md:py-20 px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.03),transparent_60%)] pointer-events-none" />
      <div className="container mx-auto max-w-3xl relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl md:text-4xl font-bold text-center mb-12"
        >
          Perguntas frequentes
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={item}>
                <AccordionItem
                  value={`faq-${i}`}
                  className="rounded-2xl border border-border/60 bg-card/40 px-6"
                >
                  <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
