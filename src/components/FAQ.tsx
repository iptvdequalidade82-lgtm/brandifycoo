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
  { q: "Preciso fornecer o conteúdo do site?", a: "Sim, o cliente precisa fornecer o conteúdo do site (textos, imagens, etc.). Caso precise de ajuda, indicamos parceiros especializados em criação de textos, banners e outros materiais." },
  { q: "A hospedagem e o domínio estão inclusos?", a: "Hospedagem e domínio são cobrados separadamente. A hospedagem custa R$ 240,00 no 1º ano (inclui instalação) e R$ 120,00/ano a partir do 2º ano. O domínio a partir de R$ 40,00/ano." },
  { q: "Vocês fazem manutenção após a entrega?", a: "Sim! Todos os planos incluem 1 hora de manutenção mensal gratuita, em qualquer dia que conseguir agendar. Caso exceda 1 hora, é cobrado R$ 200,00 por hora adicional." },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function FAQ() {
  return (
    <section id="faq" className="section-padding relative overflow-visible bg-black text-white">
      <div className="container mx-auto max-w-3xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
           <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white">
            Perguntas{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-accent-deep">frequentes</span>
          </h2>
        </motion.div>

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
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-6"
                >
                  <AccordionTrigger className="text-sm font-bold text-white hover:no-underline py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-white/50 leading-relaxed pb-5">
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
