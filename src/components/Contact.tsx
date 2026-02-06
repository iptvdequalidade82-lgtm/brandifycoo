import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <section id="contato" className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <div className="glass rounded-2xl p-8 md:p-12 glow-border">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Vamos criar o seu site?
            </h2>
            <p className="text-muted-foreground mt-4">
              Entre em contato e solicite um orçamento sem compromisso.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <a
              href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary/50 hover:bg-secondary transition text-center"
            >
              <Phone className="text-primary" size={24} />
              <span className="text-sm font-medium">WhatsApp</span>
              <span className="text-muted-foreground text-xs">(43) 99106-5129</span>
            </a>
            <a
              href="mailto:brandifycoo@gmail.com"
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary/50 hover:bg-secondary transition text-center"
            >
              <Mail className="text-primary" size={24} />
              <span className="text-sm font-medium">E-mail</span>
              <span className="text-muted-foreground text-xs">brandifycoo@gmail.com</span>
            </a>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary/50 text-center">
              <MapPin className="text-primary" size={24} />
              <span className="text-sm font-medium">Localização</span>
              <span className="text-muted-foreground text-xs">Atendimento Online</span>
            </div>
          </div>

          <div className="text-center">
            <a
              href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
