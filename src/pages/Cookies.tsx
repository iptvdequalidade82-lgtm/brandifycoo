import { ArrowLeft, ArrowUpRight } from "lucide-react";
import "./BrandifyCreative.css";

export default function Cookies() {
  return (
    <div className="bcv3 bcv3-legal">
      <header className="bcv3-header">
        <a href="/" aria-label="Brandify — voltar ao início" className="bcv3-brand"><img className="bcv3-brand-logo" src="/brandify-mark-black.svg" alt="" /><span className="bcv3-brand-word">brandify<span className="bcv3-brand-dot">.</span></span></a>
        <a href="/" className="bcv3-header-cta"><ArrowLeft size={16} /> VOLTAR AO SITE</a>
      </header>
      <main className="bcv3-legal-main" id="conteudo">
        <div className="bcv3-container">
          <p className="bcv3-legal-kicker">CONTROLE E TRANSPARÊNCIA</p>
          <h1>COOKIES<br /><em>E PREFERÊNCIAS.</em></h1>
          <p className="bcv3-legal-updated">Informações sobre cookies e medição publicitária — 7 de novembro de 2026.</p>
          <div className="bcv3-legal-grid">
            <aside>VOCÊ ESCOLHE COMO USAMOS COOKIES OPCIONAIS</aside>
            <div>
              <section id="preferencias">
                <h2>Gerencie sua escolha</h2>
                <p>Você pode recusar ou autorizar cookies de publicidade. A navegação no site continua disponível mesmo se recusar. A escolha será lembrada no seu navegador por até 180 dias.</p>
                <button
                  type="button"
                  className="bcv3-cookie-settings-button"
                  onClick={() => window.dispatchEvent(new Event("brandify:cookie-preferences"))}
                >
                  ALTERAR PREFERÊNCIAS <ArrowUpRight size={18} aria-hidden="true" />
                </button>
              </section>
              <section>
                <h2>Armazenamento necessário</h2>
                <p>Utilizamos armazenamento local para registrar sua preferência de privacidade. Ele é necessário para lembrar se você aceitou ou recusou os cookies opcionais. Alguns provedores de infraestrutura também podem usar mecanismos técnicos essenciais à segurança e ao funcionamento do site.</p>
              </section>
              <section>
                <h2>Publicidade e medição — opcionais</h2>
                <p>O Meta Pixel é uma ferramenta de mensuração publicitária usada para compreender visitas e avaliar campanhas. Ele pode definir identificadores como <code>_fbp</code> e <code>_fbc</code> e compartilhar dados técnicos de navegação com a Meta. O Pixel é carregado somente depois de sua escolha positiva.</p>
                <p>Se você revogar a autorização, novas inicializações são bloqueadas; o site limpa identificadores acessíveis e recarrega a página para interromper a biblioteca já aberta. Cookies de terceiros ou informações já enviadas à Meta podem exigir solicitações diretamente à plataforma.</p>
              </section>
              <section>
                <h2>Como mudar as preferências novamente</h2>
                <p>Use o botão acima a qualquer momento. Também é possível limpar dados do site ou cookies nas configurações do navegador. Se limpar as preferências, apresentaremos as opções novamente.</p>
              </section>
              <section>
                <h2>Outros serviços e contato</h2>
                <p>Links para WhatsApp ou Instagram levam a plataformas externas, sujeitas às políticas próprias. Para dúvidas, escreva para <a href="mailto:brandifycoo@gmail.com">brandifycoo@gmail.com</a> ou consulte nossa <a href="/privacidade">Política de Privacidade</a>.</p>
              </section>
            </div>
          </div>
          <div className="bcv3-legal-back"><a href="/">VOLTAR À BRANDIFY <ArrowUpRight size={20} /></a></div>
        </div>
      </main>
    </div>
  );
}
