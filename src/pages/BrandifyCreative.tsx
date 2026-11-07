import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown, Instagram, Mail, Menu, MoveUpRight, X } from "lucide-react";
import { motion } from "framer-motion";
import editorialPhoto from "@/assets/reference/ref-32-designers-website.jpg";
import BrandifyRibbonScroll from "@/components/BrandifyRibbonScroll";
import BrandifyCreativeWheel from "@/components/BrandifyCreativeWheel";
import BrandifyServiceFolders from "@/components/BrandifyServiceFolders";
import BrandifyHalftoneFooter from "@/components/BrandifyHalftoneFooter";
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
    audience: "Para quem precisa de um primeiro site profissional.",
    intro: "Uma página para mostrar o que você faz, apresentar seu negócio e facilitar o primeiro contato.",
    features: ["Página com a identidade do seu negócio", "Layout preparado para celular", "Serviços e informações principais em destaque", "Contato direto pelo WhatsApp", "Plaquinha NFC para acesso ao site"],
    cta: "PEDIR ORÇAMENTO START",
  },
  {
    name: "BUSINESS",
    audience: "Para apresentar sua empresa com mais detalhes.",
    intro: "Um site institucional para explicar melhor sua empresa, organizar os serviços e ajudar o cliente a encontrar o que procura.",
    features: ["Páginas para apresentar diferentes informações", "Visual alinhado à identidade da empresa", "Navegação organizada por assunto", "Formulário ou canal de contato", "Plaquinha NFC para acesso ao site"],
    cta: "PEDIR PROPOSTA BUSINESS",
  },
  {
    name: "STORE",
    audience: "Para quem quer apresentar e vender produtos pela internet.",
    intro: "Uma loja com catálogo organizado e informações de compra mais fáceis de encontrar.",
    features: ["Estrutura de loja virtual", "Produtos e categorias organizados", "Configuração de opções de pagamento e envio", "Navegação adaptada ao celular", "Plaquinha NFC para acesso à loja"],
    cta: "ORÇAR MINHA LOJA",
  },
];

const faqs = [
  ["Quanto custa criar um site?", "O valor depende do tipo de site, das páginas e dos recursos necessários. Depois de entender sua ideia, apresentamos uma proposta com o investimento e o que será entregue."],
  ["Como sei se vou gostar do resultado?", "Antes do desenvolvimento, alinhamos o objetivo, as referências e a estrutura do site. Também combinamos como funcionam as revisões. Você pode conhecer um projeto real no nosso portfólio."],
  ["Preciso ter logo, textos e fotos prontos?", "Conte o que você já tem. Na conversa inicial, explicamos quais materiais são necessários e o que ainda precisa ser preparado."],
  ["Domínio, hospedagem e mensalidades estão incluídos?", "Esses custos dependem da solução escolhida. A proposta informa o que está incluído e quais despesas podem ser cobradas separadamente."],
  ["Em quanto tempo meu site fica pronto?", "O prazo varia conforme o escopo e a disponibilidade dos materiais. Você recebe uma previsão de entrega antes de contratar."],
  ["O site funciona no celular?", "Sim. Planejamos a navegação para computador e celular, com conteúdo organizado para diferentes tamanhos de tela."],
  ["E se eu já tiver um site?", "Podemos avaliar o que existe e conversar sobre melhorias ou uma nova estrutura. A indicação depende dos seus objetivos e das condições técnicas do projeto."],
  ["Um site garante mais vendas?", "Não. Um site bem construído facilita a apresentação do negócio e o contato com clientes, mas o resultado depende também da oferta, da divulgação e do atendimento."],
  ["E depois que o site for publicado?", "O suporte, a manutenção e os ajustes posteriores dependem do que for combinado. Essas condições devem aparecer claramente na proposta."],
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
        <BrandifyRibbonScroll />

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
                <h2>ANTES DE<br />CONFIAR,<br /><span className="bcv3-intro-blue">PESQUISAM.</span></h2>
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

        <BrandifyCreativeWheel />

        <section id="servicos" className="bcv3-services bcv3-pad">
          <div className="bcv3-container">
            <Reveal className="bcv3-services-heading">
              <h2>QUAL SITE FAZ<br /><em>SENTIDO PARA VOCÊ?</em></h2>
              <p>Sites institucionais, landing pages e lojas virtuais. Escolha o que sua empresa precisa.</p>
            </Reveal>
            <BrandifyServiceFolders />
          </div>
        </section>


        <section className="bcv3-statement">
          <div className="bcv3-container">

            <Reveal><h2>UM SITE<br />PODE SER<br /><span>BONITO.</span><br />MAS PRECISA<br />SER CLARO<span className="bcv3-period">.</span></h2></Reveal>
            <div className="bcv3-statement-bottom"><p>Fotos, textos e navegação têm uma tarefa: ajudar o visitante a entender seu negócio e encontrar o próximo passo.</p></div>
          </div>
        </section>

        <section id="processo" className="bcv3-process bcv3-pad">
          <div className="bcv3-container">

            <Reveal className="bcv3-process-heading"><h2>COMO SEU SITE<br /><em>SAI DO PAPEL.</em></h2><p>Você sabe o que vamos criar, quais materiais serão necessários e o que está previsto antes de começar.</p></Reveal>
            <div className="bcv3-process-rows">
              {[
                ["01", "ENTENDER", "Você conta sobre a empresa, os serviços e o que espera do site."],
                ["02", "PLANEJAR", "Organizamos páginas, conteúdos e referências para alinhar a proposta."],
                ["03", "CRIAR", "Desenvolvemos o site considerando a navegação no computador e no celular."],
                ["04", "PUBLICAR", "Revisamos o projeto e alinhamos o que é necessário para colocá-lo no ar."],
              ].map((step) => <Reveal className="bcv3-process-row" key={step[0]}><span>{step[0]} /</span><h3>{step[1]}</h3><p>{step[2]}</p><MoveUpRight size={28} aria-hidden="true"/></Reveal>)}
            </div>
          </div>
        </section>

        <section id="pacotes" className="bcv3-plans bcv3-pad">
          <div className="bcv3-container">

            <Reveal className="bcv3-plans-heading"><h2>QUAL SITE<br /><em>FAZ SENTIDO?</em></h2><p>O tipo de site depende do momento do seu negócio. Você recebe uma proposta com as entregas e os custos antes de contratar.</p></Reveal>
            <div className="bcv3-plan-list">
              {plans.map((plan, index) => <Reveal className={"bcv3-plan-row " + (index === 1 ? "bcv3-plan-featured" : "")} key={plan.name}>
                <div className="bcv3-plan-identity"><h3>{plan.name}<span className="bcv3-plan-dot">.</span></h3><p>{plan.audience}</p></div>
                <div className="bcv3-plan-features"><p>{plan.intro}</p><ul>{plan.features.map((f) => <li key={f}><Check size={15} /> {f}</li>)}</ul></div>
                <a href={wa("Olá! Quero receber uma proposta para o pacote Brandify " + plan.name + ".")} target="_blank" rel="noopener noreferrer" className="bcv3-plan-cta">{plan.cta} <ArrowUpRight size={21} /></a>
              </Reveal>)}
            </div>
            <p className="bcv3-plan-disclaimer">O que está incluído, os limites de cada pacote, a plaquinha NFC e eventuais custos de domínio, hospedagem ou plataformas serão detalhados na proposta. Não há contratação nesta página.</p>
          </div>
        </section>

        <section className="bcv3-faq bcv3-pad" id="duvidas">
          <div className="bcv3-container bcv3-faq-layout">
            <div className="bcv3-faq-heading"><h2>VAMOS<br /><em>ESCLARECER?</em></h2><p>Investimento, prazo e suporte: veja o que costuma gerar dúvidas antes da contratação.</p></div>
            <div className="bcv3-faq-list">{faqs.map(([q, a], i) => <div className="bcv3-faq-item" key={q}>
              <button type="button" aria-expanded={activeFaq === i} aria-controls={"faq-bcv3-" + i} onClick={() => setActiveFaq(activeFaq === i ? null : i)}><span>{q}</span><ChevronDown size={18} className={activeFaq === i ? "rotated" : ""}/></button>
              {activeFaq === i && <p id={"faq-bcv3-" + i}>{a}</p>}
            </div>)}</div>
          </div>
        </section>

        <section id="contato" className="bcv3-close">
          <div className="bcv3-container">

            <Reveal><h2>VAMOS FALAR<br /><em>SOBRE O</em><br />SEU SITE<span>?</span></h2></Reveal>
            <div className="bcv3-close-bottom"><p>Conte o que sua empresa faz e o que precisa. A gente conversa sobre o formato mais adequado antes de preparar uma proposta.</p><a href={generalContact} target="_blank" rel="noopener noreferrer">PEDIR UMA PROPOSTA <ArrowUpRight size={25}/></a></div>
          </div>
        </section>
      </main>

      <BrandifyHalftoneFooter />
      <a className="bcv3-floating-contact" aria-label="Pedir proposta à Brandify pelo WhatsApp" href={generalContact} target="_blank" rel="noopener noreferrer">PEDIR PROPOSTA <ArrowUpRight size={17}/></a>
    </div>
  );
}
