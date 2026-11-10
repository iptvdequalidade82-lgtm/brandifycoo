import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown, Instagram, Mail, Menu, MoveUpRight, X } from "lucide-react";
import { motion } from "framer-motion";
import editorialPhoto from "@/assets/reference/ref-32-designers-website.jpg";
import creativePhoto from "@/assets/reference/ref-12-agency-grid.jpg";
import BrandifyHalftoneFooter from "@/components/BrandifyHalftoneFooter";
import "./BrandifyCreative.css";
import "./BrandifyRefinements.css";

const contactNumber = "5543991065129";
const wa = (text: string) => "https://wa.me/" + contactNumber + "?text=" + encodeURIComponent(text);
const generalContact = wa("Olá! Conheci a Brandify pelo site e gostaria de conversar sobre um projeto.");
const marqueeMessages = [
  "PRESENÇA COM PERSONALIDADE",
  "DESIGN COM INTENÇÃO",
  "SITES FEITOS PARA SE DESTACAR",
  "CRIATIVIDADE QUE SE VÊ",
  "DO CONCEITO À PUBLICAÇÃO",
];

const plans = [
  {
    name: "START",
    audience: "Para começar bem.",
    intro: "Uma página com personalidade para apresentar seu negócio e facilitar novos contatos.",
    features: ["Página de apresentação personalizada", "Design responsivo", "Informações essenciais do negócio", "Contato direto pelo WhatsApp"],
  },
  {
    name: "BUSINESS",
    audience: "Para crescer com presença.",
    intro: "Um site institucional com estrutura para valorizar seus serviços e reforçar credibilidade.",
    features: ["Estrutura institucional de múltiplas páginas", "Identidade visual aplicada ao site", "Navegação pensada para seus clientes", "Formulário ou canais de contato"],
  },
  {
    name: "STORE",
    audience: "Para quem quer uma loja com identidade própria.",
    intro: "Criamos o design e a aparência da sua loja virtual: layout, vitrine e navegação. O cadastro e a gestão dos produtos ficam por sua conta.",
    features: ["Design e personalização visual da loja", "Layout da vitrine e apresentação das categorias", "Identidade visual aplicada às páginas", "Aparência adaptada ao celular"],
  },
];

const faqs = [
  ["Quanto custa um projeto?", "Cada projeto tem necessidades diferentes. A Brandify prepara uma proposta com escopo e investimento após entender seu negócio. Não há valores ocultos ou preços inventados nesta página."],
  ["O domínio e a hospedagem estão incluídos?", "Domínio, hospedagem e possíveis mensalidades de plataformas são discriminados na proposta antes da contratação."],
  ["O site funciona bem no celular?", "Sim. O projeto é desenvolvido com layout responsivo e atenção à experiência em telas menores."],
  ["Quais materiais preciso enviar?", "Informações sobre a empresa, serviços ou produtos, logotipo, textos e fotos disponíveis. Nós explicamos o que é necessário durante o briefing."],
  ["Qual é o prazo de entrega?", "O prazo depende das páginas, integrações e materiais envolvidos. Ele é acordado na proposta antes do início do desenvolvimento."],
  ["Quem cadastra os produtos da loja virtual?", "No Brandify Store, cuidamos somente do design e da aparência da loja. O cliente é responsável por cadastrar e atualizar produtos, fotos, descrições, preços e estoque, além de configurar e administrar pagamentos, frete e demais recursos operacionais da plataforma."],
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
    document.title = "Brandify — Sites com identidade. Presença que marca.";
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

          <a href="#pacotes" onClick={() => setOpen(false)}>Pacotes</a>
        </nav>
        <a href={generalContact} className="bcv3-header-cta" target="_blank" rel="noopener noreferrer">
          VAMOS CONVERSAR <ArrowUpRight size={17} strokeWidth={1.8} />
        </a>
        <button aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} type="button" className="bcv3-mobile-toggle" onClick={() => setOpen(!open)}>
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
      </header>

      <main id="conteudo">
        <section id="inicio" className="bcv3-hero">
          <div className="bcv3-hero-image" style={{ background: "#000" }} aria-hidden="true" />
          <div className="bcv3-hero-scrim" />
          <div className="bcv3-hero-body">
            <motion.h1 initial={{ opacity: 0, y: 68 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 1, ease: [0.2, 0.8, 0.2, 1] }}>
              SUA MARCA<br />
              NÃO NASCEU<br />
              PRA SER <em>COMUM.</em>
            </motion.h1>
            <motion.div className="bcv3-hero-bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}>
              <div className="bcv3-hero-lead">
                
                <p>Criamos sites, landing pages e lojas virtuais com design de verdade — para negócios que querem ser percebidos.</p>
              </div>
              <a className="bcv3-hero-cta" href={generalContact} target="_blank" rel="noopener noreferrer">
                <span>TIRAR MEU PROJETO DO PAPEL</span><span className="bcv3-cta-icon"><ArrowUpRight size={20} /></span>
              </a>
            </motion.div>
          </div>
          <a href="#sobre" className="bcv3-hero-down" aria-label="Descobrir mais"><ArrowDownRight size={30} /></a>
        </section>

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
                <h2>O PRIMEIRO<br />CONTATO <span className="bcv3-intro-blue">IMPORTA.</span></h2>
                <p>Uma boa presença digital não é sobre estar em todos os lugares. É sobre causar a impressão certa onde seu cliente encontra você.</p>
              </Reveal>
              <Reveal className="bcv3-intro-editorial" delay={0.12}>
                <div className="bcv3-intro-image"><img src={editorialPhoto} alt="Referência visual editorial de design digital" loading="lazy" /></div>
                
              </Reveal>
            </div>
            <Reveal className="bcv3-intro-manifesto">
              
              <p>Seu site não deveria apenas existir.<br /><strong>Ele deveria dizer alguma coisa sobre você.</strong></p>
            </Reveal>
          </div>
        </section>

        <section id="servicos" className="bcv3-services bcv3-pad">
          <div className="bcv3-container">

            <Reveal className="bcv3-services-heading">
              <h2>DO PRIMEIRO CLIQUE<br />À <em>ÚLTIMA IMPRESSÃO.</em></h2>
              <p>Cada negócio tem uma necessidade. Nenhum merece uma presença digital genérica.</p>
            </Reveal>
            <div className="bcv3-service-grid">
              <Reveal className="bcv3-service-item bcv3-service-one">
                <div className="bcv3-service-photo" style={{ backgroundImage: "url(" + creativePhoto + ")" }} />
                
                <div className="bcv3-service-copy"><span>SITES INSTITUCIONAIS</span><h3>PARA SER<br />LEVADO A<br /><em>SÉRIO.</em></h3><p>Sites que apresentam sua empresa, seus serviços e sua história de forma clara e memorável.</p></div>
              </Reveal>
              <div className="bcv3-service-right">
                <Reveal className="bcv3-service-item bcv3-service-two" delay={0.12}>
                  
                  <div className="bcv3-service-copy"><span>LANDING PAGES</span><h3>UMA IDEIA.<br /><em>UMA AÇÃO.</em></h3><p>Páginas estratégicas para apresentar ofertas e gerar oportunidades de contato.</p></div>
                  <div className="bcv3-service-type" aria-hidden="true">CLICK<span>↗</span></div>
                </Reveal>
                <Reveal className="bcv3-service-item bcv3-service-three" delay={0.16}>
                  
                  <div className="bcv3-service-copy"><span>LOJAS VIRTUAIS</span><h3>DO SEU<br />NEGÓCIO PARA<br /><em>O MUNDO.</em></h3><p>Design da vitrine e das páginas da sua loja. O cadastro dos produtos fica por conta do cliente.</p></div>
                  <div className="bcv3-service-horizontal-line" aria-hidden="true"/>
                </Reveal>
              </div>
            </div>
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
            <p className="bcv3-plan-disclaimer">O escopo detalhado e os custos de domínio, hospedagem, plataformas e eventuais serviços adicionais serão informados na proposta. No plano Store, entregamos somente a parte visual: cadastro de produtos, fotos, descrições, preços, estoque, meios de pagamento, frete e operação da loja são responsabilidade do cliente.</p>
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

      <BrandifyHalftoneFooter />
      <a className="bcv3-floating-contact" aria-label="Conversar com a Brandify pelo WhatsApp" href={generalContact} target="_blank" rel="noopener noreferrer">VAMOS CONVERSAR <ArrowUpRight size={17}/></a>
    </div>
  );
}
