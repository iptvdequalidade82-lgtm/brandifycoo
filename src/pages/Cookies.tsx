import { ArrowLeft, ArrowUpRight } from "lucide-react";
import "./BrandifyCreative.css";

export default function Cookies() {
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
          <p className="bcv3-legal-kicker">PRIVACIDADE / TECNOLOGIAS DE RASTREAMENTO</p>
          <h1>COOKIES<br /><em>E DADOS.</em></h1>
          <p className="bcv3-legal-updated">Informações sobre cookies e tecnologias utilizadas no site.</p>
          <div className="bcv3-legal-grid">
            <aside>ENTENDA O USO DE COOKIES E FERRAMENTAS DE MEDIÇÃO</aside>
            <div>
              <section><h2>01 / O que são cookies?</h2><p>Cookies são pequenos arquivos que um site ou serviço associado pode armazenar no navegador para registrar informações e preferências. Outras tecnologias, como pixels de medição, também podem coletar dados sobre visitas.</p></section>
              <section><h2>02 / Medição e publicidade</h2><p>O código deste site inclui o Meta Pixel, utilizado para mensurar visitas e eventos de navegação. Essa ferramenta pode envolver cookies e o tratamento de informações técnicas por um fornecedor externo.</p></section>
              <section><h2>03 / Controle de cookies</h2><p>Você pode consultar, bloquear ou limpar cookies nas configurações do navegador. Algumas ferramentas de terceiros também possuem controles próprios. A aplicação de mecanismos adicionais de preferência e consentimento depende da configuração técnica efetiva do site.</p></section>
              <section><h2>04 / Serviços externos</h2><p>Ao abrir links para WhatsApp, Instagram ou sites de projetos, você passa a utilizar serviços com políticas próprias de privacidade e cookies.</p></section>
              <section><h2>05 / Dúvidas e solicitações</h2><p>Para saber mais sobre o uso de dados pela Brandify, consulte a <a href="/privacidade">Política de Privacidade</a> ou escreva para <a href="mailto:brandifycoo@gmail.com">brandifycoo@gmail.com</a>.</p></section>
              <p className="bcv3-legal-note">Esta página deve ser revisada em conjunto com as configurações reais de rastreamento e consentimento antes da publicação definitiva.</p>
            </div>
          </div>
          <div className="bcv3-legal-back"><a href="/">VOLTAR AO SITE <ArrowUpRight size={20}/></a></div>
        </div>
      </main>
    </div>
  );
}
