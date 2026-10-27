import { Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import "../styles/brandify2026.css";
const contact = "https://wa.me/5543991065129?text=" + encodeURIComponent("Olá! Quero conversar sobre um projeto com a Brandify.");
export default function Footer() {
  return (
    <div className="b26">
      <footer className="b26-footer">
        <div className="b26-shell">
          <div className="b26-footer-top"><a href="/" className="b26-footer-logo">brandify<span>.</span></a><div className="b26-footer-links"><a href="/#servicos">Serviços</a><a href="/#projetos">Projetos</a><a href="/#planos">Pacotes</a><a href="/#contato">Contato</a></div></div>
          <div className="b26-footer-details"><p>Design e desenvolvimento digital<br/>com personalidade e propósito.</p><div><a href="mailto:brandifycoo@gmail.com"><Mail size={15}/> brandifycoo@gmail.com</a><a href={contact} target="_blank" rel="noopener noreferrer"><MessageCircle size={15}/> (43) 99106-5129</a><span><MapPin size={15}/> Jacarezinho, PR · Brasil</span></div><div><a href="https://www.instagram.com/brandifycoo" target="_blank" rel="noopener noreferrer"><Instagram size={15}/> Instagram</a><a href="/privacidade">Política de privacidade</a></div></div>
          <div className="b26-footer-bottom"><span>© {new Date().getFullYear()} Brandify. Todos os direitos reservados.</span><span>FEITO COM INTENÇÃO. ✳</span></div>
        </div>
      </footer>
    </div>
  );
}
