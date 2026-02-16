import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import ContactForm from "@/components/ContactForm";

const whatsappBase = "https://wa.me/5543991065129?text=";

const quickMessages = [
  { label: "Quero fazer um orçamento", message: "Olá! Gostaria de fazer um orçamento para criação de site." },
  { label: "Como funciona?", message: "Olá! Gostaria de saber como funciona o processo de criação de site com vocês." },
  { label: "O que preciso enviar?", message: "Olá! Gostaria de saber o que preciso enviar para vocês começarem a fazer meu site." },
  { label: "Como é o contrato?", message: "Olá! Gostaria de entender como funciona o contrato de vocês." },
];

const whatsappUrl = `${whatsappBase}${encodeURIComponent("Olá! Fiquei interessado nos serviços da Brandify e gostaria de solicitar um orçamento para criação de site.")}`;

const contacts = [
  { icon: Phone, title: "WhatsApp", value: "(43) 99106-5129", href: whatsappUrl },
  { icon: Mail, title: "E-mail", value: "brandifycoo@gmail.com", href: "mailto:brandifycoo@gmail.com" },
  { icon: MapPin, title: "Localização", value: "Jacarezinho, PR — Atendemos todo o Brasil", href: undefined },
];

export default function Contact() {
  return (
    <section id="contato" className="relative py-28 md:py-36 px-6 overflow-hidden">
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[140px] pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl overflow-hidden border border-border bg-card shadow-2xl"
        >
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 p-8 md:p-10 bg-gradient-to-br from-[hsl(185_45%_20%)] to-[hsl(200_40%_12%)] border-b md:border-b-0 md:border-r border-border flex flex-col justify-center">
              <MessageCircle className="text-primary/70 mb-4" size={32} />
              <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-3 text-foreground">
                Vamos criar o seu site?
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Entre em contato e receba um orçamento sem compromisso. Respondemos em até 24h.
              </p>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold gentle-animation text-sm btn-glow shadow-[0_0_20px_hsl(var(--primary)/0.25)]"
              >
                <Phone size={16} />
                Falar no WhatsApp
              </motion.a>
            </div>

            <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center gap-4">
              {contacts.map((c, i) => {
                const Icon = c.icon;
                const Wrapper = c.href ? "a" : "div";
                const linkProps = c.href
                  ? { href: c.href, target: "_blank" as const, rel: "noopener noreferrer" }
                  : {};

                return (
                  <motion.div
                    key={c.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  >
                    <Wrapper
                      {...linkProps}
                      className={`flex items-center gap-4 p-4 rounded-xl bg-accent hover:bg-accent/80 border border-border hover:border-primary/20 gentle-animation ${
                        c.href ? "cursor-pointer" : ""
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                        <Icon className="text-muted-foreground" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.value}</p>
                      </div>
                    </Wrapper>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Quick message options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <p className="text-xs text-muted-foreground mb-3 text-center">Ou envie uma mensagem rápida:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {quickMessages.map((qm, i) => (
              <motion.a
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={`${whatsappBase}${encodeURIComponent(qm.message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/25 hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-medium gentle-animation"
              >
                {qm.label}
              </motion.a>
            ))}
          </div>
        </motion.div>

        <ContactForm />
      </div>
    </section>
  );
}
