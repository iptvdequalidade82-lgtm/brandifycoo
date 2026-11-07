import { ArrowLeft, ArrowUpRight } from "lucide-react";
import "./BrandifyCreative.css";

export default function Privacidade() {
  return (
    <div className="bcv3 bcv3-legal">
      <header className="bcv3-header">
        <a href="/" className="bcv3-brand" aria-label="Voltar ao site da Brandify"><img className="bcv3-brand-logo" src="/brandify-mark-black.svg" alt="" /><span className="bcv3-brand-word">brandify<span className="bcv3-brand-dot">.</span></span></a>
        <a href="/" className="bcv3-header-cta"><ArrowLeft size={16} /> VOLTAR AO SITE</a>
      </header>
      <main className="bcv3-legal-main" id="conteudo">
        <div className="bcv3-container">
          <p className="bcv3-legal-kicker">PRIVACIDADE</p>
          <h1>SEUS DADOS.<br /><em>SEUS DIREITOS.</em></h1>
          <p className="bcv3-legal-updated">Política de Privacidade — atualização de 7 de novembro de 2026.</p>
          <div className="bcv3-legal-grid">
            <aside>COMO TRATAMOS INFORMAÇÕES NA BRANDIFY</aside>
            <div>
              <section>
                <h2>Quem trata seus dados</h2>
                <p>A Brandify, estúdio de criação de sites com atuação em Jacarezinho, Paraná, é o ponto de contato para informações sobre os dados recebidos neste site e nas conversas comerciais. Para exercer seus direitos ou conhecer os dados cadastrais do responsável pela operação, escreva para <a href="mailto:brandifycoo@gmail.com">brandifycoo@gmail.com</a>.</p>
              </section>
              <section>
                <h2>Quais dados recebemos</h2>
                <p>Ao entrar em contato por WhatsApp ou e-mail, podemos receber nome, telefone, endereço eletrônico, empresa, necessidade do projeto e demais informações que você decidir compartilhar. Também há dados técnicos necessários ao funcionamento da página, incluindo registros de acesso que podem ser processados pela infraestrutura de hospedagem.</p>
                <p>O site guarda sua preferência de cookies no armazenamento local do navegador. Se você autorizar a categoria de publicidade, o Meta Pixel pode receber informações técnicas da visita, como páginas acessadas e identificadores usados na medição de campanhas.</p>
              </section>
              <section>
                <h2>Para que utilizamos e quais as bases legais</h2>
                <p>Tratamos mensagens para responder pedidos, discutir propostas e, se houver contratação, executar o serviço. Conforme a operação, as bases podem envolver procedimentos preliminares a contrato, execução de contrato, obrigação legal e legítimo interesse sujeito aos requisitos da LGPD. Para ativação de cookies publicitários, adotamos sua escolha de consentimento.</p>
              </section>
              <section>
                <h2>Com quem os dados podem ser compartilhados</h2>
                <p>Prestadores de hospedagem, infraestrutura e comunicação podem tratar dados necessários à operação do serviço. Links para WhatsApp e Instagram levam a plataformas com políticas próprias. Se você autorizar a medição publicitária, informações de navegação podem ser transmitidas à Meta. Alguns fornecedores podem processar dados fora do Brasil, conforme suas próprias operações e garantias contratuais aplicáveis.</p>
              </section>
              <section>
                <h2>Por quanto tempo guardamos</h2>
                <p>Informações comerciais e contratuais são mantidas enquanto necessárias para atendimento, execução contratual, obrigações legais ou exercício regular de direitos. O período depende da natureza do dado e da finalidade. A preferência de cookies é lembrada por até 180 dias, ou até que você a altere no navegador ou nesta página.</p>
              </section>
              <section>
                <h2>Seus direitos</h2>
                <p>Você pode solicitar confirmação de tratamento, acesso, correção de dados incompletos ou desatualizados, informações sobre compartilhamento, oposição quando aplicável, revogação de consentimento e eliminação ou anonimização nos casos previstos na LGPD. Envie sua solicitação ao e-mail abaixo; poderemos pedir informações proporcionais para confirmar sua identidade antes de responder.</p>
              </section>
              <section>
                <h2>Cookies e alterações de preferência</h2>
                <p>O Meta Pixel não deve ser carregado antes da sua autorização para publicidade. Você pode aceitar, recusar ou alterar a escolha a qualquer momento na página <a href="/cookies">Cookies e preferências</a>. A recusa não bloqueia o acesso ao conteúdo.</p>
              </section>
              <section>
                <h2>Segurança, crianças e atualizações</h2>
                <p>Adotamos medidas técnicas e organizacionais proporcionais para proteger informações, sem prometer ausência absoluta de riscos. Nosso site institucional não é destinado especificamente a crianças. Podemos atualizar esta política para refletir mudanças técnicas e operacionais, publicando a nova versão aqui.</p>
              </section>
              <section>
                <h2>Contato de privacidade</h2>
                <p>Para pedidos e dúvidas sobre proteção de dados: <a href="mailto:brandifycoo@gmail.com">brandifycoo@gmail.com</a>.</p>
              </section>
              <p className="bcv3-legal-note">Os dados cadastrais completos do responsável, contratos com fornecedores e os prazos internos por categoria de informação precisam ser conferidos antes da publicação definitiva desta política.</p>
            </div>
          </div>
          <div className="bcv3-legal-back"><a href="/">VOLTAR À BRANDIFY <ArrowUpRight size={20} /></a></div>
        </div>
      </main>
    </div>
  );
}
