import { ArrowLeft, ArrowUpRight } from "lucide-react";
import "./BrandifyCreative.css";

export default function Termos() {
  return (
    <div className="bcv3 bcv3-legal">
      <header className="bcv3-header">
        <a href="/" aria-label="Brandify — voltar ao início" className="bcv3-brand"><img className="bcv3-brand-logo" src="/brandify-mark-black.svg" alt="" /><span className="bcv3-brand-word">brandify<span className="bcv3-brand-dot">.</span></span></a>
        <a href="/" className="bcv3-header-cta"><ArrowLeft size={16} /> VOLTAR AO SITE</a>
      </header>
      <main id="conteudo" className="bcv3-legal-main">
        <div className="bcv3-container">
          <p className="bcv3-legal-kicker">INFORMAÇÕES DO SITE</p>
          <h1>TERMOS<br /><em>DE USO.</em></h1>
          <p className="bcv3-legal-updated">Atualização de 7 de novembro de 2026.</p>
          <div className="bcv3-legal-grid">
            <aside>LEIA ANTES DE SOLICITAR UMA PROPOSTA</aside>
            <div>
              <section><h2>Sobre o conteúdo</h2><p>Este site apresenta a Brandify e os serviços de criação de sites, landing pages e lojas virtuais. Os exemplos e descrições são institucionais e não substituem uma proposta com o escopo acordado.</p></section>
              <section><h2>Orçamentos e contratação</h2><p>O contato inicial é um pedido de informações, não uma contratação automática. Valores totais, custos de domínio, hospedagem, plataformas, materiais, condições de pagamento, revisões, garantias legais e prazo devem ser informados de maneira clara na proposta e no contrato aplicável.</p></section>
              <section><h2>Conteúdo e direitos autorais</h2><p>Textos, imagens e elementos de identidade visual estão sujeitos à legislação de direitos autorais e às respectivas licenças. A utilização comercial depende das autorizações pertinentes. Materiais de terceiros são apresentados apenas conforme as permissões cabíveis.</p></section>
              <section><h2>Links externos</h2><p>Links para WhatsApp, Instagram e outros serviços direcionam para plataformas externas com políticas e práticas próprias. A Brandify não controla o funcionamento dessas plataformas.</p></section>
              <section><h2>Disponibilidade e alterações</h2><p>Podemos atualizar conteúdo e informações deste site. Isso não afasta os direitos legais de consumidores nem altera unilateralmente os termos de serviços já contratados.</p></section>
              <section><h2>Contato e privacidade</h2><p>Solicitações podem ser enviadas a <a href="mailto:brandifycoo@gmail.com">brandifycoo@gmail.com</a>. Consulte nossa <a href="/privacidade">Política de Privacidade</a> e as <a href="/cookies">preferências de cookies</a>.</p></section>
              <p className="bcv3-legal-note">Estes termos gerais não substituem o contrato de prestação de serviços nem revisão jurídica dos documentos comerciais da agência.</p>
            </div>
          </div>
          <div className="bcv3-legal-back"><a href="/">VOLTAR À BRANDIFY <ArrowUpRight size={20} /></a></div>
        </div>
      </main>
    </div>
  );
}
