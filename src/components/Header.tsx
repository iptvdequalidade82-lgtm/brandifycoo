import { ArrowUpRight } from "lucide-react";
import "../styles/brandify2026.css";
const contact = "https://wa.me/5543991065129?text=" + encodeURIComponent("Olá! Quero conversar sobre um projeto com a Brandify.");
export default function Header() {
  return (
    <header className="b26-header">
      <div className="b26-shell b26-header-inner">
        <a href="/" className="b26-logo" aria-label="Brandify — início"><span className="b26-logo-sign" aria-hidden="true">✳</span><span>brandify<span className="b26-logo-point">.</span></span></a>
        <nav className="b26-nav" aria-label="Navegação principal"><a href="/#servicos">Serviços</a><a href="/#projetos">Projetos</a><a href="/#planos">Pacotes</a></nav>
        <a className="b26-header-cta" href={contact} target="_blank" rel="noopener noreferrer">Iniciar projeto <ArrowUpRight size={16}/></a>
      </div>
    </header>
  );
}
