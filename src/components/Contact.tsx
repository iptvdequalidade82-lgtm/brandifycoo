import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import ContactForm from "@/components/ContactForm";

const whatsappUrl =
  "https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site.";

const contacts = [
  { icon: Phone, title: "WhatsApp", value: "(43) 99106-5129", href: whatsappUrl },
  { icon: Mail, title: "E-mail", value: "brandifycoo@gmail.com", href: "mailto:brandifycoo@gmail.com" },
  { icon: MapPin, title: "Localização", value: "Jacarezinho, PR — Atendemos todo o Brasil", href: undefined },
];

export default function Contact() {
  return (
    <section id="contato" className="relative py-28 md:py-36 px-6 overflow-hidden bg-[hsl(220,15%,8%)] text-white">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-[hsl(220,80%,55%/0.08)] blur-[140px] pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-sm shadow-2xl"
        >
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 p-8 md:p-10 bg-gradient-to-br from-[hsl(220,80%,55%)] to-[hsl(260,70%,50%)] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-center">
              <MessageCircle className="text-white/70 mb-4" size={32} />
              <h2 className="font-display text-2xl md:text-3xl font-black mb-3">
                Vamos criar o seu site?
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Entre em contato e receba um orçamento sem compromisso. Respondemos em até 24h.
              </p>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[hsl(230,70%,45%)] font-bold gentle-animation text-sm shadow-lg"
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
                      className={`flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 gentle-animation ${
                        c.href ? "cursor-pointer" : ""
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/[0.08] flex items-center justify-center shrink-0">
                        <Icon className="text-white/60" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{c.title}</p>
                        <p className="text-xs text-white/40">{c.value}</p>
                      </div>
                    </Wrapper>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <ContactForm />
      </div>
    </section>
  );
}
