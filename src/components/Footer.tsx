import logo from "@/assets/logo.jpg";
import { Instagram, Mail, MessageCircle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 pt-14 pb-8 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Brandify" className="h-10 w-10 rounded-full" />
              <span className="font-display text-lg font-bold text-foreground">Brandify</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Agência especializada em criação de sites profissionais, identidade visual e presença digital.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-4">Navegação</h4>
            <ul className="space-y-2.5">
              <li><a href="#servicos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Serviços</a></li>
              <li><a href="#portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Segmentos</a></li>
              <li><a href="#investimento" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Investimento</a></li>
              <li><a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Pages */}
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-4">Páginas</h4>
            <ul className="space-y-2.5">
              <li><Link to="/curso" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cursos</Link></li>
              <li><Link to="/trabalhe-conosco" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Trabalhe Conosco</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-4">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/5543991065129"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle size={15} />
                  (43) 99106-5129
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/brandifycoo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Instagram size={15} />
                  @brandifycoo
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={15} />
                Londrina, PR
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Brandify. Todos os direitos reservados.
          </span>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/brandifycoo"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg border border-border/60 bg-card/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href="https://wa.me/5543991065129"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg border border-border/60 bg-card/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              aria-label="WhatsApp"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
