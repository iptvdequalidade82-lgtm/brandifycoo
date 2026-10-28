import { ArrowLeft, ArrowUpRight } from "lucide-react";
import "./BrandifyCreative.css";

export default function Privacidade() {
  return (
    <div className="bcv3 bcv3-legal">
      <header className="bcv3-header">
        <a href="/" className="bcv3-brand"><span aria-hidden="true" className="bcv3-brand-mark">✳</span>brandify<span className="bcv3-brand-dot">.</span></a>
        <a href="/" className="bcv3-header-cta"><ArrowLeft size={16}/> VOLTAR AO SITE</a>
      </header>
      <main className="bcv3-legal-main">
        <div className="bcv3-container">
          <p className="bcv3-legal-kicker">TRANSPARÊNCIA / PRIVACIDADE</p>
          <h1>SEUS DADOS.<br/><em>SUA PRIVACIDADE.</em></h1>
          <p className="bcv3-legal-updated">Política de privacidade — versão de outubro de 2026.</p>
          <div className="bcv3-legal-grid">
            <aside>BRANDIFY® / INFORMAÇÕES SOBRE O TRATAMENTO DE DADOS</aside>
            <div>
              <section><h2>01 / Informações que podem ser coletadas</h2><p>Quando você entra em contato por WhatsApp ou e-mail, recebemos as informações fornecidas na conversa. Também podem ser coletados dados técnicos de navegação e eventos por ferramentas de medição presentes no site.</p></section>
              <section><h2>02 / Finalidades</h2><p>Utilizamos as informações para responder solicitações, elaborar propostas, prestar nossos serviços, cumprir obrigações legais e entender o uso do site. Não divulgamos informações comerciais de clientes sem autorização.</p></section>
              <section><h2>03 / Serviços de terceiros</h2><p>O site pode usar o Meta Pixel para mensuração de visitas e campanhas e links externos para WhatsApp e Instagram. Esses provedores podem tratar dados de acordo com suas próprias políticas. Quando aplicável, o uso de cookies não essenciais deve observar as escolhas e direitos do visitante.</p></section>
              <section><h2>04 / Compartilhamento e retenção</h2><p>Dados podem ser tratados por prestadores necessários à operação e execução dos serviços, sempre conforme a finalidade aplicável. Mantemos informações pelo período necessário ao atendimento, ao contrato ou às obrigações legais.</p></section>
              <section><h2>05 / Direitos dos titulares</h2><p>Nos termos da Lei Geral de Proteção de Dados, você pode solicitar informações sobre o tratamento, acesso, correção ou eliminação de dados quando cabível, entre outros direitos. Solicitações serão avaliadas conforme as disposições legais.</p></section>
              <section><h2>06 / Contato</h2><p>Para dúvidas relacionadas à privacidade, escreva para <a href="mailto:brandifycoo@gmail.com">brandifycoo@gmail.com</a>. Atendemos em Jacarezinho, Paraná, e remotamente em todo o Brasil.</p></section>
              <p className="bcv3-legal-note">Este texto descreve as práticas previstas na experiência pública atual e deve ser revisado antes de publicação definitiva, especialmente em relação a cookies e ferramentas de publicidade.</p>
            </div>
          </div>
          <div className="bcv3-legal-back"><a href="/">VOLTAR À BRANDIFY <ArrowUpRight size={20}/></a></div>
        </div>
      </main>
    </div>
  );
}
