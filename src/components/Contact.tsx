import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const whatsappUrl =
  "https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site.";

const contacts = [
  {
    icon: Phone,
    title: "WhatsApp",
    value: "(43) 99106-5129",
    href: whatsappUrl,
  },
  {
    icon: Mail,
    title: "E-mail",
    value: "brandifycoo@gmail.com",
    href: "mailto:brandifycoo@gmail.com",
  },
  {
    icon: MapPin,
    title: "Localização",
    value: "Atendimento 100% Online",
    href: undefined,
  },
];

export default function Contact() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="contato" className="section-padding">
      <div ref={ref} className="container mx-auto max-w-4xl">
        <div
          className={`rounded-2xl overflow-hidden border border-border/60 bg-card/30 backdrop-blur-sm transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="grid md:grid-cols-5">
            {/* Left — CTA */}
            <div className="md:col-span-2 p-8 md:p-10 bg-primary/5 border-b md:border-b-0 md:border-r border-border/40 flex flex-col justify-center">
              <MessageCircle className="text-primary mb-4" size={32} />
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                Vamos criar o seu site?
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Entre em contato e receba um orçamento sem compromisso. Respondemos em até 24h.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:shadow-[0_0_30px_hsl(210_100%_60%/0.3)] transition-all duration-300 text-sm"
              >
                <Phone size={16} />
                Falar no WhatsApp
              </a>
            </div>

            {/* Right — Info cards */}
            <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center gap-4">
              {contacts.map((c, i) => {
                const Icon = c.icon;
                const Wrapper = c.href ? "a" : "div";
                const linkProps = c.href
                  ? { href: c.href, target: "_blank" as const, rel: "noopener noreferrer" }
                  : {};

                return (
                  <Wrapper
                    key={c.title}
                    {...linkProps}
                    className={`flex items-center gap-4 p-4 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-all duration-500 ${
                      c.href ? "cursor-pointer" : ""
                    } ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                    style={{ transitionDelay: isVisible ? `${300 + i * 120}ms` : "0ms" }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="text-primary" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.value}</p>
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
