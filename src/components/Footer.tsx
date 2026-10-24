import logo from "@/assets/logo.jpg";
import { Instagram, MessageCircle, MapPin, Mail, ShieldCheck, Lock, ArrowRight, Globe, Zap, Code2, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const techBadges = [
  { icon: Code2, label: "React" },
  { icon: Zap, label: "Vite" },
  { icon: Globe, label: "SEO" },
  { icon: Palette, label: "Design UI/UX" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      {/* Mini CTA */}
      <div className="border-b border-white/10">
        <div className="container mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-xl md:text-2xl font-black tracking-tight">
              Pronto para começar seu{" "}
              <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--brand-gradient-from))] to-[hsl(var(--brand-gradient-to))]">projeto?</span>
            </h3>
            <p className="text-sm text-white/40 mt-1">Fale conosco e receba um orçamento em até 24 horas.</p>
          </div>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="group shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[hsl(var(--brand-gradient-from))] to-[hsl(var(--brand-gradient-to))] text-white font-bold text-sm gentle-animation shadow-lg shadow-[hsl(var(--brand-gradient-from))/0.2]"
          >
            Solicitar Orçamento
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto max-w-6xl px-6 pt-14 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Brandify" className="h-10 w-10 rounded-full ring-1 ring-white/15" width={40} height={40} />
              <span className="font-display text-lg font-black">Brandify</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed mb-5">
              Agência especializada em criação de sites profissionais, identidade visual e presença digital.
            </p>
            {/* Tech badges */}
            <div className="flex flex-wrap gap-2">
              {techBadges.map((tech) => {
                const Icon = tech.icon;
                return (
                  <span
                    key={tech.label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[10px] text-white/50 font-medium"
                  >
                    <Icon size={11} />
                    {tech.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="font-display text-sm font-bold mb-4">Navegação</h4>
            <ul className="space-y-2.5">
              <li><a href="#processo" className="text-sm text-white/40 hover:text-white gentle-animation">Como Trabalhamos</a></li>
              <li><a href="#investimento" className="text-sm text-white/40 hover:text-white gentle-animation">Investimento</a></li>
              <li><a href="#galeria" className="text-sm text-white/40 hover:text-white gentle-animation">Conteúdo</a></li>
              <li><a href="#faq" className="text-sm text-white/40 hover:text-white gentle-animation">FAQ</a></li>
              <li><Link to="/projetos" className="text-sm text-white/40 hover:text-white gentle-animation">Projetos</Link></li>
              <li><Link to="/quem-somos" className="text-sm text-white/40 hover:text-white gentle-animation">Quem Somos</Link></li>
            </ul>
          </div>

          {/* Páginas */}
          <div>
            <h4 className="font-display text-sm font-bold mb-4">Páginas</h4>
            <ul className="space-y-2.5">
              <li><Link to="/ias" className="text-sm text-white/40 hover:text-white gentle-animation">IA Studio ✨</Link></li>
              <li><Link to="/curso" className="text-sm text-white/40 hover:text-white gentle-animation">Cursos</Link></li>
              <li><Link to="/trabalhe-conosco" className="text-sm text-white/40 hover:text-white gentle-animation">Trabalhe Conosco</Link></li>
              <li><Link to="/privacidade" className="text-sm text-white/40 hover:text-white gentle-animation">Política de Privacidade</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-display text-sm font-bold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://wa.me/5543991065129" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white gentle-animation">
                  <MessageCircle size={15} /> (43) 99106-5129
                </a>
              </li>
              <li>
                <a href="mailto:brandifycoo@gmail.com" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white gentle-animation">
                  <Mail size={15} /> brandifycoo@gmail.com
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/brandifycoo" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white gentle-animation">
                  <Instagram size={15} /> @brandifycoo
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-sm text-white/40">
                <MapPin size={15} /> Jacarezinho, PR — Brasil
              </li>
            </ul>
          </div>
        </div>

        {/* Trust badges / Security seals */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2 text-white/30">
              <ShieldCheck size={18} className="text-emerald-500/70" />
              <span className="text-xs font-medium">Site Seguro SSL</span>
            </div>
            <div className="flex items-center gap-2 text-white/30">
              <Lock size={18} className="text-emerald-500/70" />
              <span className="text-xs font-medium">Dados Protegidos</span>
            </div>
            <div className="flex items-center gap-2 text-white/30">
              <ShieldCheck size={18} className="text-emerald-500/70" />
              <span className="text-xs font-medium">LGPD Compliance</span>
            </div>
            <div className="flex items-center gap-2 text-white/30">
              <Zap size={18} className="text-amber-500/70" />
              <span className="text-xs font-medium">Hospedagem Premium</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span className="text-xs text-white/30">
              © {new Date().getFullYear()} Brandify. Todos os direitos reservados.
            </span>
          </div>
          <div className="flex gap-3">
            <a href="https://www.instagram.com/brandifycoo" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.08] gentle-animation" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href="https://wa.me/5543991065129" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.08] gentle-animation" aria-label="WhatsApp">
              <MessageCircle size={16} />
            </a>
            <a href="mailto:brandifycoo@gmail.com" className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.08] gentle-animation" aria-label="Email">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
