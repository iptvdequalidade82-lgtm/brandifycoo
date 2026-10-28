import { ArrowLeft, ArrowUpRight } from "lucide-react";
import "./BrandifyCreative.css";

export default function Termos() {
  return (
    <div className="bcv3 bcv3-legal">
      <header className="bcv3-header">
        <a href="/" className="bcv3-brand" aria-label="Brandify — voltar ao início">
          <img className="bcv3-brand-logo" src="/brandify-mark-black.svg" alt="" />
          <span className="bcv3-brand-word">brandify<span className="bcv3-brand-dot">.</span></span>
        </a>
        <a href="/" className="bcv3-header-cta"><ArrowLeft size={16} /> VOLTAR AO SITE</a>
      </header>
      <main className="bcv3-legal-main">
        <div className="bcv3-container">
          <p className="bcv3-legal-kicker">INFORMAÇÕES / TERMOS DE USO</p>
          <h1>TERMOS<br /><em>DE USO.</em></h1>
          <p className="bcv3-legal-updated">Informações gerais sobre o uso do site da Brandify.</p>
          <div className="bcv3-legal-grid">
            <aside>INFORMAÇÕES PARA VISITANTES DO SITE</aside>
            <div>
              <section><h2>01 / Sobre este site</h2><p>Este site apresenta o trabalho da Brandify e oferece canais de contato para conversar sobre projetos digitais. As descrições de serviços são informações gerais, não uma oferta com preço ou prazo definido.</p></section>
              <section><h2>02 / Propostas comerciais</h2><p>Valores, escopo, condições de pagamento, materiais necessários, prazos, revisões, suporte e custos de terceiros devem ser detalhados em proposta e, quando aplicável, contrato próprio. O envio de uma mensagem não significa contratação automática.</p></section>
              <section><h2>03 / Conteúdo e direitos autorais</h2><p>Textos, elementos da identidade visual e demais materiais da Brandify não devem ser utilizados comercialmente sem autorização. Projetos de terceiros são apresentados apenas quando houver permissão para divulgação.</p></section>
              <section><h2>04 / Links de terceiros</h2><p>Alguns links direcionam para WhatsApp, Instagram ou sites de projetos. Ao acessar esses serviços, você estará sujeito às condições e políticas das respectivas plataformas.</p></section>
              <section><h2>05 / Disponibilidade e atualizações</h2><p>Podemos atualizar o conteúdo institucional deste site, corrigir informações ou modificar recursos. Antes de contratar, confirme os detalhes do serviço na proposta enviada pela Brandify.</p></section>
              <section><h2>06 / Fale conosco</h2><p>Para informações sobre o site ou uma proposta, escreva para <a href="mailto:brandifycoo@gmail.com">brandifycoo@gmail.com</a>.</p></section>
              <p className="bcv3-legal-note">Os termos comerciais de cada serviço precisam ser apresentados separadamente antes da contratação. Este texto informativo não substitui a revisão jurídica dos documentos contratuais.</p>
            </div>
          </div>
          <div className="bcv3-legal-back"><a href="/">VOLTAR AO SITE <ArrowUpRight size={20}/></a></div>
        </div>
      </main>
    </div>
  );
}
