import logo from "@/assets/logo.jpg";
import { Instagram, MessageCircle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background pt-14 pb-8 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Brandify" className="h-10 w-10 rounded-full ring-1 ring-border" width={40} height={40} />
              <span className="font-display text-lg font-extrabold text-foreground">Brandify</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Agência especializada em criação de sites profissionais, identidade visual e presença digital.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold mb-4 text-foreground">Navegação</h4>
            <ul className="space-y-2.5">
              <li><a href="#servicos" className="text-sm text-muted-foreground hover:text-foreground gentle-animation">Serviços</a></li>
              <li><a href="#portfolio" className="text-sm text-muted-foreground hover:text-foreground gentle-animation">Segmentos</a></li>
              <li><a href="#investimento" className="text-sm text-muted-foreground hover:text-foreground gentle-animation">Investimento</a></li>
              <li><a href="#faq" className="text-sm text-muted-foreground hover:text-foreground gentle-animation">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold mb-4 text-foreground">Páginas</h4>
            <ul className="space-y-2.5">
              <li><Link to="/curso" className="text-sm text-muted-foreground hover:text-foreground gentle-animation">Cursos</Link></li>
              <li><Link to="/trabalhe-conosco" className="text-sm text-muted-foreground hover:text-foreground gentle-animation">Trabalhe Conosco</Link></li>
              <li><Link to="/privacidade" className="text-sm text-muted-foreground hover:text-foreground gentle-animation">Política de Privacidade</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold mb-4 text-foreground">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://wa.me/5543991065129" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground gentle-animation">
                  <MessageCircle size={15} /> (43) 99106-5129
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/brandifycoo" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground gentle-animation">
                  <Instagram size={15} /> @brandifycoo
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={15} /> Jacarezinho, PR
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground/50">
              © {new Date().getFullYear()} Brandify. Todos os direitos reservados.
            </span>
            <Link to="/admin/login" className="text-xs text-muted-foreground/20 hover:text-muted-foreground/40 gentle-animation">·</Link>
          </div>
          <div className="flex gap-3">
            <a href="https://www.instagram.com/brandifycoo" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/20 gentle-animation" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href="https://wa.me/5543991065129" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/20 gentle-animation" aria-label="WhatsApp">
              <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
