import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Privacidade() {
  return (
    <div className="b26 b26-legal-page">
      <Header />
      <main className="b26-legal-main">
        <article className="b26-shell b26-legal-article">
          <h1 className="b26-legal-title">Política de <span className="b26-legal-highlight">Privacidade</span></h1>
          <p className="text-white/40 text-sm mb-2">Última atualização: Fevereiro de 2026</p>

          <section className="mt-8 space-y-6 text-sm text-white/60 leading-relaxed">
            <div>
              <h2 className="font-display text-lg font-bold text-white mb-2">1. Informações que Coletamos</h2>
              <p>Coletamos as informações que você nos fornece diretamente através do formulário de contato do nosso site, incluindo: nome, endereço de e-mail e mensagem. Também podemos coletar dados de navegação automaticamente, como endereço IP, tipo de navegador e páginas visitadas.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-white mb-2">2. Como Usamos Suas Informações</h2>
              <p>Utilizamos as informações coletadas para:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Responder às suas solicitações de contato e orçamento;</li>
                <li>Enviar comunicações relacionadas aos nossos serviços;</li>
                <li>Melhorar nosso site e a experiência do usuário;</li>
                <li>Cumprir obrigações legais.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-white mb-2">3. Compartilhamento de Dados</h2>
              <p>Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto quando necessário para prestação dos nossos serviços (como processadores de pagamento) ou quando exigido por lei.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-white mb-2">4. Segurança dos Dados</h2>
              <p>Adotamos medidas técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, perda ou destruição. Utilizamos criptografia SSL em todo o nosso site.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-white mb-2">5. Seus Direitos (LGPD)</h2>
              <p>De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Solicitar acesso aos seus dados pessoais;</li>
                <li>Corrigir dados incompletos ou desatualizados;</li>
                <li>Solicitar a exclusão dos seus dados;</li>
                <li>Revogar seu consentimento a qualquer momento.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-white mb-2">6. Cookies</h2>
              <p>Nosso site pode utilizar cookies para melhorar a experiência de navegação. Você pode configurar seu navegador para recusar cookies, embora isso possa afetar algumas funcionalidades do site.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-white mb-2">7. Contato</h2>
              <p>Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato conosco:</p>
              <ul className="list-none mt-2 space-y-1">
                <li><strong className="text-white">E-mail:</strong> brandifycoo@gmail.com</li>
                <li><strong className="text-white">WhatsApp:</strong> (43) 99106-5129</li>
                <li><strong className="text-white">Localização:</strong> Jacarezinho, PR</li>
              </ul>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
