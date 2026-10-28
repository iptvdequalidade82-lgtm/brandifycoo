import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown, Instagram, Mail, Menu, MoveUpRight, X } from "lucide-react";
import { motion } from "framer-motion";
import editorialPhoto from "@/assets/reference/ref-32-designers-website.jpg";
import creativePhoto from "@/assets/reference/ref-12-agency-grid.jpg";
import BrandifyScrollIntro from "@/components/BrandifyScrollIntro";
import "./BrandifyCreative.css";

const contactNumber = "5543991065129";
const wa = (text: string) => "https://wa.me/" + contactNumber + "?text=" + encodeURIComponent(text);
const generalContact = wa("Olá! Vi o site da Brandify e quero entender qual tipo de site faz sentido para minha empresa. Podemos conversar?");
const marqueeMessages = [
  "SEU NEGÓCIO BEM APRESENTADO",
  "UM SITE QUE PASSA CONFIANÇA",
  "SERVIÇOS FÁCEIS DE ENCONTRAR",
  "UM CONTATO MAIS SIMPLES",
  "FEITO PARA FUNCIONAR NO CELULAR",
];

const plans = [
  {
    name: "START",
    audience: "Para começar bem.",
    intro: "Uma página com personalidade para apresentar seu negócio e facilitar novos contatos.",
    features: ["Página de apresentação personalizada", "Design responsivo", "Informações essenciais do negócio", "Contato direto pelo WhatsApp", "Plaquinha NFC"],
  },
  {
    name: "BUSINESS",
    audience: "Para crescer com presença.",
    intro: "Um site institucional com estrutura para valorizar seus serviços e reforçar credibilidade.",
    features: ["Estrutura institucional de múltiplas páginas", "Identidade visual aplicada ao site", "Navegação pensada para seus clientes", "Formulário ou canais de contato", "Plaquinha NFC"],
  },
  {
    name: "STORE",
    audience: "Para vender online.",
    intro: "Uma loja virtual organizada, com uma jornada de compra prática e profissional.",
    features: ["Configuração da loja virtual", "Vitrine e categorias de produtos", "Estrutura para pagamento e envio", "Experiência adaptada ao celular", "Plaquinha NFC"],
  },
];

const faqs = [
  ["Quanto custa um projeto?", "Cada projeto tem necessidades diferentes. A Brandify prepara uma proposta com escopo e investimento após entender seu negócio. Não há valores ocultos ou preços inventados nesta página."],
  ["O domínio e a hospedagem estão incluídos?", "Domínio, hospedagem e possíveis mensalidades de plataformas são discriminados na proposta antes da contratação."],
  ["O site funciona bem no celular?", "Sim. O projeto é desenvolvido com layout responsivo e atenção à experiência em telas menores."],
  ["Quais materiais preciso enviar?", "Informações sobre a empresa, serviços ou produtos, logotipo, textos e fotos disponíveis. Nós explicamos o que é necessário durante o briefing."],
  ["Qual é o prazo de entrega?", "O prazo depende das páginas, integrações e materiais envolvidos. Ele é acordado na proposta antes do início do desenvolvimento."],
  ["Como funciona a manutenção?", "A manutenção e os ajustes após a entrega são definidos no escopo contratado. Podemos avaliar necessidades adicionais em separado."],
];

const Reveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </motion.div>
);

export default function BrandifyCreative() {
  const [open, setOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  useEffect(() => {
    document.title = "Criação de Sites para Empresas | Brandify";
    const jump = () => {
      const hash = location.hash.slice(1);
      if (hash) document.getElementById(hash)?.scrollIntoView();
    };
    const timer = window.setTimeout(jump, 100);
    window.addEventListener("hashchange", jump);
    return () => { window.clearTimeout(timer); window.removeEventListener("hashchange", jump); };
  }, []);

  return (
    <div className="bcv3">
      <a href="#conteudo" className="bcv3-skip">Ir para o conteúdo</a>
      <header className="bcv3-header">
        <a href="/#inicio" aria-label="Brandify — início" className="bcv3-brand">
          <img className="bcv3-brand-logo" src="/brandify-mark-black.svg" alt="" />
          <span className="bcv3-brand-word">brandify<span className="bcv3-brand-dot">.</span></span>
        </a>
        <nav aria-label="Menu principal" className={open ? "bcv3-nav active" : "bcv3-nav"}>
          <a href="#sobre" onClick={() => setOpen(false)}>Estúdio</a>
          <a href="#servicos" onClick={() => setOpen(false)}>Serviços</a>
          <a href="#trabalhos" onClick={() => setOpen(false)}>Projetos</a>
          <a href="#pacotes" onClick={() => setOpen(false)}>Pacotes</a>
        </nav>
        <a href={generalContact} className="bcv3-header-cta" target="_blank" rel="noopener noreferrer">
          PEDIR UMA PROPOSTA <ArrowUpRight size={17} strokeWidth={1.8} />
        </a>
        <button aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} type="button" className="bcv3-mobile-toggle" onClick={() => setOpen(!open)}>
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
      </header>

      <main id="conteudo">
        <BrandifyScrollIntro />

        <div className="bcv3-marquee" aria-label="Presença com personalidade, design com intenção, sites feitos para se destacar e projetos com propósito">
          <div className="bcv3-marquee-track" aria-hidden="true">
            {[0, 1].map((cycle) => (
              <div className="bcv3-marquee-loop" key={cycle}>
                {marqueeMessages.map((message, idx) => (
                  <span className={idx % 2 === 1 ? "bcv3-marquee-message is-accent" : "bcv3-marquee-message"} key={message}>
                    {message}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section id="sobre" className="bcv3-intro bcv3-pad">
          <div className="bcv3-container">

            <div className="bcv3-intro-grid">
              <Reveal className="bcv3-intro-heading">
                <h2>ANTES DE<br />LIGAR, <span className="bcv3-intro-blue">PESQUISAM.</span></h2>
                <p>Se as informações estão confusas ou o visual parece improvisado, o visitante pode sair antes mesmo de conversar com você.</p>
              </Reveal>
              <Reveal className="bcv3-intro-editorial" delay={0.12}>
                <div className="bcv3-intro-image"><img src={editorialPhoto} alt="Composição editorial usada para ilustrar a criação de sites profissionais" loading="lazy" /></div>
                
              </Reveal>
            </div>
            <Reveal className="bcv3-intro-manifesto">
              
              <p>Você cuida da qualidade do seu trabalho.<br /><strong>Seu site precisa deixar isso claro para quem chega.</strong></p>
            </Reveal>
          </div>
        </section>

        <section id="servicos" className="bcv3-services bcv3-pad">
          <div className="bcv3-container">

            <Reveal className="bcv3-services-heading">
              <h2>QUAL SITE FAZ<br /><em>SENTIDO PARA VOCÊ?</em></h2>
              <p>Nem toda empresa precisa da mesma estrutura. O ponto de partida é entender o que seu cliente precisa encontrar.</p>
            </Reveal>
            <div className="bcv3-service-grid">
              <Reveal className="bcv3-service-item bcv3-service-one">
                <div className="bcv3-service-photo" style={{ backgroundImage: "url(" + creativePhoto + ")" }} />
                
                <div className="bcv3-service-copy"><span>SITES INSTITUCIONAIS</span><h3>MOSTRE<br />O VALOR<br /><em>DO SEU NEGÓCIO.</em></h3><p>Apresente seus serviços, explique como sua empresa trabalha e mostre ao cliente como entrar em contato.</p></div>
              </Reveal>
              <div className="bcv3-service-right">
                <Reveal className="bcv3-service-item bcv3-service-two" delay={0.12}>
                  
                  <div className="bcv3-service-copy"><span>LANDING PAGES</span><h3>SUA OFERTA.<br /><em>SEM DISTRAÇÕES.</em></h3><p>Uma página focada em explicar sua oferta e conduzir o visitante ao próximo passo: pedir informações ou comprar.</p></div>
                  <div className="bcv3-service-type" aria-hidden="true">CLICK<span>↗</span></div>
                </Reveal>
                <Reveal className="bcv3-service-item bcv3-service-three" delay={0.16}>
                  
                  <div className="bcv3-service-copy"><span>LOJAS VIRTUAIS</span><h3>SEUS PRODUTOS.<br />SUA LOJA.<br /><em>ONLINE.</em></h3><p>Organize produtos e categorias para o cliente encontrar o que procura e entender como comprar.</p></div>
                  <div className="bcv3-service-horizontal-line" aria-hidden="true"/>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <section id="trabalhos" className="bcv3-work bcv3-pad">
          <div className="bcv3-container">
            <Reveal className="bcv3-work-heading">
              <h2>O PROJETO<br/><em>POR TRÁS DA CENA.</em></h2>
              <p>Uma experiência real da Brandify, apresentada sem distrações.</p>
            </Reveal>
            <Reveal className="bcv3-project bcv3-project-forge">
              <a href="https://foorgefit.life/" className="bcv3-project-media" target="_blank" rel="noopener noreferrer" aria-label="Visitar o projeto Forge Fit">
                <div className="bcv3-project-scene">
                  <div className="bcv3-project-screen">
                    <div className="bcv3-project-screenbar"><span>● ● ●</span><small>foorgefit.life</small><ArrowUpRight size={13}/></div>
                    <img loading="lazy" src="https://image.thum.io/get/width/1440/crop/900/noanimate/https://foorgefit.life/" alt="Captura da página pública do Forge Fit" />
                  </div>
                  <div className="bcv3-project-label" aria-hidden="true">FORGE FIT</div>
                </div>
                <span className="bcv3-project-arrow" aria-hidden="true"><ArrowUpRight size={24}/></span>
              </a>
              <div className="bcv3-project-text">
                <div><span>EXPERIÊNCIA DIGITAL · FITNESS</span><h3>Forge Fit</h3><p>Organização de treinos, exercícios e conteúdos para acompanhar a rotina fitness.</p></div>
                <ArrowUpRight size={25}/>
              </div>
            </Reveal>
            <Reveal className="bcv3-case-editorial">
              <h4>DO CONCEITO<br/><em>À EXPERIÊNCIA.</em></h4>
              <p>Uma plataforma construída para tornar os treinos mais organizados, com biblioteca de exercícios e conteúdos complementares. A sequência imersiva no início desta página ilustra como experiências digitais podem se adaptar a diferentes telas.</p>
            </Reveal>
            <Reveal className="bcv3-project-closer"><p>SEU PROJETO TAMBÉM PODE GANHAR FORMA.</p><a href={generalContact} target="_blank" rel="noopener noreferrer">VAMOS CRIAR ALGO JUNTOS <ArrowUpRight size={18}/></a></Reveal>
          </div>
        </section>

        <section className="bcv3-statement">
          <div className="bcv3-container">

            <Reveal><h2>UM BOM SITE<br />NÃO É SÓ<br /><span>BONITO.</span><br />ELE TEM<br />PROPÓSITO<span className="bcv3-period">.</span></h2></Reveal>
            <div className="bcv3-statement-bottom"><p>A gente une direção visual, estrutura e desenvolvimento para transformar a presença da sua empresa em algo que faz sentido para quem visita.</p></div>
          </div>
        </section>

        <section id="processo" className="bcv3-process bcv3-pad">
          <div className="bcv3-container">

            <Reveal className="bcv3-process-heading"><h2>BOAS IDEIAS<br />PEDEM <em>MÉTODO.</em></h2><p>Um processo objetivo, com decisões claras e acompanhamento em cada fase.</p></Reveal>
            <div className="bcv3-process-rows">
              {[
                ["01", "CONVERSA", "Entendemos o negócio, o público e o objetivo do projeto."],
                ["02", "DIREÇÃO", "Definimos estrutura, referências e linguagem visual."],
                ["03", "CRIAÇÃO", "Desenvolvemos a experiência com atenção ao desktop e ao celular."],
                ["04", "ENTREGA", "Revisamos, validamos e organizamos a publicação."],
              ].map((step) => <Reveal className="bcv3-process-row" key={step[0]}><span>{step[0]} /</span><h3>{step[1]}</h3><p>{step[2]}</p><MoveUpRight size={28} aria-hidden="true"/></Reveal>)}
            </div>
          </div>
        </section>

        <section id="pacotes" className="bcv3-plans bcv3-pad">
          <div className="bcv3-container">

            <Reveal className="bcv3-plans-heading"><h2>QUAL É O SEU<br /><em>PRÓXIMO PASSO?</em></h2><p>Três formatos de projeto. O escopo e o investimento finais são definidos com você antes do início.</p></Reveal>
            <div className="bcv3-plan-list">
              {plans.map((plan, index) => <Reveal className={"bcv3-plan-row " + (index === 1 ? "bcv3-plan-featured" : "")} key={plan.name}>
                <div className="bcv3-plan-identity"><h3>{plan.name}<span className="bcv3-plan-dot">.</span></h3><p>{plan.audience}</p></div>
                <div className="bcv3-plan-features"><p>{plan.intro}</p><ul>{plan.features.map((f) => <li key={f}><Check size={15} /> {f}</li>)}</ul></div>
                <a href={wa("Olá! Quero receber uma proposta para o pacote Brandify " + plan.name + ".")} target="_blank" rel="noopener noreferrer" className="bcv3-plan-cta">PEDIR PROPOSTA <ArrowUpRight size={21} /></a>
              </Reveal>)}
            </div>
            <p className="bcv3-plan-disclaimer">O escopo detalhado, a plaquinha NFC, os custos de domínio, hospedagem, plataformas e eventuais serviços adicionais serão confirmados formalmente na proposta comercial.</p>
          </div>
        </section>

        <section className="bcv3-faq bcv3-pad" id="duvidas">
          <div className="bcv3-container bcv3-faq-layout">
            <div className="bcv3-faq-heading"><h2>AINDA<br />TEM <em>DÚVIDAS?</em></h2><p>As respostas que você precisa antes de começar.</p></div>
            <div className="bcv3-faq-list">{faqs.map(([q, a], i) => <div className="bcv3-faq-item" key={q}>
              <button type="button" aria-expanded={activeFaq === i} aria-controls={"faq-bcv3-" + i} onClick={() => setActiveFaq(activeFaq === i ? null : i)}><span>{q}</span><ChevronDown size={18} className={activeFaq === i ? "rotated" : ""}/></button>
              {activeFaq === i && <p id={"faq-bcv3-" + i}>{a}</p>}
            </div>)}</div>
          </div>
        </section>

        <section id="contato" className="bcv3-close">
          <div className="bcv3-container">

            <Reveal><h2>PRONTO PARA<br /><em>SAIR DO</em><br />COMUM<span>?</span></h2></Reveal>
            <div className="bcv3-close-bottom"><p>A sua próxima grande impressão pode começar com uma conversa.</p><a href={generalContact} target="_blank" rel="noopener noreferrer">COMEÇAR MEU PROJETO <ArrowUpRight size={25}/></a></div>
          </div>
        </section>
      </main>

      <footer className="bcv3-footer">
        <div className="bcv3-container">
          <div className="bcv3-footer-top"><a href="#inicio" className="bcv3-footer-logo"><img className="bcv3-footer-mark" src="/brandify-mark-black.svg" alt="" />brandify<span>.</span></a><p>DESIGN, DESENVOLVIMENTO<br />E PRESENÇA DIGITAL.</p></div>
          <div className="bcv3-footer-grid">
            <div><span>NAVEGAÇÃO</span><a href="#sobre">Estúdio</a><a href="#servicos">Serviços</a><a href="#trabalhos">Projetos</a><a href="#pacotes">Pacotes</a></div>
            <div><span>CONTATO</span><a href={generalContact} target="_blank" rel="noopener noreferrer">WhatsApp: (43) 99106-5129 <ArrowUpRight size={14}/></a><a href="mailto:brandifycoo@gmail.com">brandifycoo@gmail.com <Mail size={14}/></a><a href="https://www.instagram.com/brandifycoo" target="_blank" rel="noopener noreferrer">Instagram <Instagram size={14}/></a></div>
            <div><span>LOCALIZAÇÃO</span><p>Jacarezinho — Paraná<br />Brasil</p><a href="/privacidade">Política de privacidade</a></div>
          </div>
          <div className="bcv3-footer-base"><span>© {new Date().getFullYear()} BRANDIFY. TODOS OS DIREITOS RESERVADOS.</span><span>IDEIAS COM INTENÇÃO.</span></div>
        </div>
      </footer>
      <a className="bcv3-floating-contact" aria-label="Conversar com a Brandify pelo WhatsApp" href={generalContact} target="_blank" rel="noopener noreferrer">VAMOS CONVERSAR <ArrowUpRight size={17}/></a>
    </div>
  );
}
