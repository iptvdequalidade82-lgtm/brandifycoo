import { useState } from "react";
import { ArrowUpRight, ArrowRight, MousePointer2 } from "lucide-react";
import BrandifyHalftoneFooter from "@/components/BrandifyHalftoneFooter";
import "./BrandifyCreative.css";
import "./InteractiveSites.css";

type Experience = "two-d" | "three-d" | "motion";

const contact = (topic: string) =>
  "https://wa.me/5543991065129?text=" + encodeURIComponent(
    "Olá! Vi a página de Sites Interativos da Brandify. Gostaria de uma proposta para um site com " + topic + "."
  );

const modes: { key: Experience; title: string; subtitle: string; description: string }[] = [
  {
    key: "two-d",
    title: "DESIGN 2D",
    subtitle: "COMPOSIÇÃO QUE RESPONDE.",
    description: "Tipografia cinética, movimentos de entrada, transições de interface e pequenos detalhes que acompanham a navegação.",
  },
  {
    key: "three-d",
    title: "ELEMENTOS 3D",
    subtitle: "PROFUNDIDADE COM PROPÓSITO.",
    description: "Objetos, camadas e perspectivas que dão presença ao projeto sem deixar o conteúdo em segundo plano.",
  },
  {
    key: "motion",
    title: "MOTION & SCROLL",
    subtitle: "UMA HISTÓRIA A CADA MOVIMENTO.",
    description: "Seções que se conectam, elementos que respondem à rolagem e transições pensadas para conduzir o visitante.",
  },
];

const services = [
  {
    title: "ANIMAÇÕES 2D.",
    detail: "Texto em movimento, máscaras, cards, ilustrações vetoriais e transições que deixam a interface mais expressiva.",
    number: "01",
  },
  {
    title: "EXPERIÊNCIAS 3D.",
    detail: "Profundidade, composição espacial e modelos tridimensionais quando fizerem sentido para o produto e para o desempenho.",
    number: "02",
  },
  {
    title: "SCROLL NARRATIVO.",
    detail: "Uma sequência visual que acompanha a descida da página, revela conteúdos e cria continuidade entre as seções.",
    number: "03",
  },
  {
    title: "MICROINTERAÇÕES.",
    detail: "Hover, botões, menus e feedback visual. Detalhes que tornam a navegação mais clara e agradável.",
    number: "04",
  },
];

const questions = [
  {
    question: "Todo projeto pode ter 3D?",
    answer: "Nem sempre vale a pena. Avaliamos o objetivo, a complexidade, o prazo e o desempenho esperado. Em alguns casos, profundidade em CSS ou motion 2D gera uma experiência melhor e mais leve.",
  },
  {
    question: "Essas animações funcionam no celular?",
    answer: "O design é pensado de forma responsiva. Efeitos mais pesados podem ser simplificados ou desativados em determinadas telas para preservar a navegação, a acessibilidade e o carregamento.",
  },
  {
    question: "O site interativo substitui uma landing page?",
    answer: "Não necessariamente. O motion pode complementar um site institucional, uma landing page ou uma apresentação digital. A estrutura depende do objetivo comercial.",
  },
  {
    question: "Qual é o valor e o prazo?",
    answer: "São definidos após o briefing. Animações 2D, modelos 3D, integrações e quantidade de páginas variam de projeto para projeto. A proposta detalha o que está incluído.",
  },
  {
    question: "Preciso contratar animação em todas as seções?",
    answer: "Não. Priorizamos os pontos em que a interação melhora a compreensão do conteúdo. O excesso de movimento pode atrapalhar, por isso a direção de arte define onde ele realmente agrega valor.",
  },
];

export default function InteractiveSites() {
  const [active, setActive] = useState<Experience>("motion");
  const current = modes.find(mode => mode.key === active)!;

  return (
    <div className="bcv3 bi-page">
      <a className="bcv3-skip" href="#conteudo">Ir para o conteúdo</a>

      <header className="bcv3-header bi-header">
        <a href="/" className="bcv3-brand" aria-label="Brandify — voltar ao início">
          <img className="bcv3-brand-logo" src="/brandify-mark-black.svg" alt="" />
          <span className="bcv3-brand-word">brandify<span className="bcv3-brand-dot">.</span></span>
        </a>
        <nav className="bi-header-nav" aria-label="Navegação da página">
          <a href="#experiencias">Experiências</a>
          <a href="#processo">Processo</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <a href={contact("animações 2D, 3D e motion")} className="bi-header-cta" target="_blank" rel="noopener noreferrer">
          PEDIR UMA PROPOSTA <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </header>

      <main id="conteudo">
        <section className="bi-hero" aria-labelledby="bi-main-title">
          <div className="bi-hero-glow" aria-hidden="true" />
          <div className="bi-wrap bi-hero-content">
            <p className="bi-overline">BRANDIFY / SITES INTERATIVOS</p>
            <h1 id="bi-main-title">SEU SITE<br />NÃO PRECISA<br /><em>FICAR PARADO.</em></h1>
            <div className="bi-hero-bottom">
              <p>Criação de sites com animações 2D, elementos 3D e motion design. Experiências que chamam a atenção sem complicar o que importa: entender sua marca e encontrar o próximo passo.</p>
              <a className="bi-button bi-button-blue" href={contact("um site interativo")} target="_blank" rel="noopener noreferrer">
                QUERO UM SITE ASSIM <ArrowUpRight size={20} aria-hidden="true" />
              </a>
            </div>
            <div className="bi-hero-object" aria-hidden="true">
              <div className="bi-hero-orbit bi-hero-orbit-a" />
              <div className="bi-hero-orbit bi-hero-orbit-b" />
              <div className="bi-hero-pane bi-hero-pane-back">
                <div className="bi-demo-bar"><i /><i /><i /></div>
                <div className="bi-demo-lines"><i /><i /><i /></div>
              </div>
              <div className="bi-hero-pane bi-hero-pane-front">
                <div className="bi-demo-bar"><i /><i /><i /></div>
                <div className="bi-demo-logo">B<span>.</span></div>
                <div className="bi-demo-text"><i /><i /></div>
                <div className="bi-demo-action"><ArrowUpRight size={24} /></div>
              </div>
            </div>
          </div>
        </section>

        <section className="bi-intro bi-section">
          <div className="bi-wrap bi-intro-grid">
            <h2>O MOVIMENTO<br /><em>TEM QUE TER</em><br />UM MOTIVO.</h2>
            <div className="bi-intro-copy">
              <p>Um site interativo não é uma coleção de efeitos. É uma experiência em que design, conteúdo e tecnologia trabalham juntos.</p>
              <p>O objetivo é criar algo marcante, fácil de usar e fiel à identidade do seu negócio.</p>
            </div>
          </div>
        </section>

        <section className="bi-lab bi-section" id="experiencias" aria-labelledby="bi-lab-title">
          <div className="bi-wrap">
            <div className="bi-lab-heading">
              <h2 id="bi-lab-title">VEJA A IDEIA<br /><em>GANHAR FORMA.</em></h2>
              <p>Explore três linguagens visuais que podem fazer parte de um projeto.</p>
            </div>
            <div className="bi-lab-layout">
              <div className="bi-lab-options" role="group" aria-label="Escolha uma demonstração">
                {modes.map((mode, i) => (
                  <button
                    type="button"
                    key={mode.key}
                    className={"bi-lab-option" + (active === mode.key ? " is-active" : "")}
                    aria-pressed={active === mode.key}
                    onClick={() => setActive(mode.key)}
                  >
                    <span className="bi-lab-option-number">0{i + 1}</span>
                    <span>{mode.title}</span>
                    <ArrowUpRight size={19} aria-hidden="true" />
                  </button>
                ))}
                <div className="bi-lab-description" aria-live="polite">
                  <h3>{current.subtitle}</h3>
                  <p>{current.description}</p>
                </div>
              </div>
              <div className={"bi-stage bi-stage-" + active} role="img" aria-label={"Demonstração ilustrativa de " + current.title.toLowerCase()}>
                <div className="bi-stage-grid" aria-hidden="true" />
                <div className="bi-stage-ring bi-stage-ring-a" aria-hidden="true" />
                <div className="bi-stage-ring bi-stage-ring-b" aria-hidden="true" />
                <div className="bi-stage-card bi-stage-card-back" aria-hidden="true">
                  <div className="bi-demo-bar"><i /><i /><i /></div>
                  <span>FRAME / 02</span>
                  <div className="bi-stage-back-lines"><i /><i /><i /></div>
                </div>
                <div className="bi-stage-card bi-stage-card-main" aria-hidden="true">
                  <div className="bi-demo-bar"><i /><i /><i /></div>
                  <div className="bi-stage-card-body">
                    <span className="bi-stage-card-tag">BRANDIFY / CONCEITO</span>
                    <strong>DESIGN<br /><em>EM MOVIMENTO.</em></strong>
                    <div className="bi-stage-card-bottom"><i /><ArrowUpRight size={23} /></div>
                  </div>
                </div>
                <div className="bi-stage-cursor" aria-hidden="true"><MousePointer2 size={24} fill="currentColor" strokeWidth={1.3} /></div>
              </div>
            </div>
          </div>
        </section>

        <section className="bi-features bi-section" aria-labelledby="bi-features-title">
          <div className="bi-wrap">
            <div className="bi-feature-head">
              <h2 id="bi-features-title">O QUE<br /><em>PODEMOS CRIAR.</em></h2>
              <p>O efeito certo depende do que sua empresa precisa comunicar.</p>
            </div>
            <div className="bi-feature-grid">
              {services.map(item => (
                <article className="bi-feature" key={item.number}>
                  <span className="bi-feature-number">{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                  <div className={"bi-feature-art bi-art-" + item.number} aria-hidden="true"><i /><i /><i /></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bi-process bi-section" id="processo" aria-labelledby="bi-process-title">
          <div className="bi-wrap">
            <div className="bi-process-heading">
              <h2 id="bi-process-title">PRIMEIRO,<br /><em>A IDEIA.</em><br />DEPOIS, O EFEITO.</h2>
              <p>A experiência visual começa no objetivo do projeto, não na escolha de uma animação.</p>
            </div>
            <ol className="bi-steps">
              <li><span>01</span><h3>ENTENDER.</h3><p>Conhecemos a empresa, o público e o que o site precisa apresentar.</p></li>
              <li><span>02</span><h3>DESENHAR.</h3><p>Definimos direção visual, páginas, transições e pontos de interação.</p></li>
              <li><span>03</span><h3>CONSTRUIR.</h3><p>Desenvolvemos a experiência e adaptamos os efeitos para diferentes telas.</p></li>
              <li><span>04</span><h3>REVISAR.</h3><p>Conferimos navegação, legibilidade e comportamento antes da entrega.</p></li>
            </ol>
          </div>
        </section>

        <section className="bi-scope bi-section">
          <div className="bi-wrap bi-scope-grid">
            <h2>VISUAL FORTE.<br /><em>NAVEGAÇÃO LEVE.</em></h2>
            <div>
              <p>Motion e 3D são recursos, não obrigações. Selecionamos as interações conforme o projeto para manter o conteúdo legível, a navegação acessível e a experiência consistente no celular.</p>
              <p>Quantidade de páginas, modelos 3D, animações, integrações, domínio, hospedagem e manutenção são definidos na proposta. Recursos complexos podem ter custos e limitações próprias.</p>
            </div>
          </div>
        </section>

        <section className="bi-faq bi-section" id="duvidas">
          <div className="bi-wrap bi-faq-grid">
            <h2>AINDA TEM<br /><em>DÚVIDAS?</em></h2>
            <div className="bi-faq-list">
              {questions.map(({ question, answer }) => (
                <details key={question}>
                  <summary>{question}<span aria-hidden="true">+</span></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bi-end bi-section">
          <div className="bi-wrap">
            <h2>O PRÓXIMO SITE<br />QUE SURPREENDE<br /><em>PODE SER O SEU.</em></h2>
            <div className="bi-end-bottom">
              <p>Conte o que você imagina. A gente avalia a melhor maneira de tornar a ideia possível.</p>
              <a className="bi-button bi-button-dark" href={contact("design 2D, elementos 3D e motion design")} target="_blank" rel="noopener noreferrer">
                CONVERSAR SOBRE MEU PROJETO <ArrowUpRight size={20} aria-hidden="true" />
              </a>
            </div>
            <nav className="bi-related" aria-label="Outros serviços da Brandify">
              <a href="/sites-institucionais">Sites institucionais <ArrowRight size={17} /></a>
              <a href="/landing-pages">Landing pages <ArrowRight size={17} /></a>
              <a href="/lojas-virtuais">Lojas virtuais <ArrowRight size={17} /></a>
            </nav>
          </div>
        </section>
      </main>
      <BrandifyHalftoneFooter />
    </div>
  );
}
