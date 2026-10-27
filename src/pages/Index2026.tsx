import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Instagram, Mail, MapPin, Menu, MessageCircle, X } from "lucide-react";
import "../styles/brandify2026.css";

const whatsapp = (message: string) =>
  "https://wa.me/5543991065129?text=" + encodeURIComponent(message);

const consultLink = whatsapp("Olá! Conheci a Brandify pelo site e gostaria de conversar sobre um projeto.");
const services = [
  { num: "01", kicker: "PRESENÇA & CREDIBILIDADE", name: "Sites institucionais", desc: "Uma presença digital à altura do seu negócio. Design marcante, navegação intuitiva e conteúdo organizado para apresentar sua empresa com clareza.", className: "institutional", tag: "PARA EMPRESAS" },
  { num: "02", kicker: "AÇÃO & CONVERSÃO", name: "Landing pages", desc: "Páginas objetivas para apresentar ofertas, captar contatos e conduzir visitantes até a ação que importa.", className: "landing", tag: "PARA CAMPANHAS" },
  { num: "03", kicker: "COMÉRCIO DIGITAL", name: "Lojas virtuais", desc: "Sua vitrine online com produtos, categorias, pagamentos e uma experiência de compra pensada para o cliente.", className: "commerce", tag: "PARA LOJAS" },
];

const projects = [
  { name: "Forge Fit", category: "FITNESS / PLATAFORMA DIGITAL", url: "https://foorgefit.lovable.app/", image: "https://image.thum.io/get/width/1000/crop/700/https://foorgefit.lovable.app/", className: "project-forge", label: "Treino e rotina em uma experiência digital." },
  { name: "Eric Pimentel", category: "SITE INSTITUCIONAL", url: "https://ericpimentel.lovable.app/", image: "https://image.thum.io/get/width/1000/crop/700/https://ericpimentel.lovable.app/", className: "project-eric", label: "Presença profissional com identidade própria." },
  { name: "Barber 043", category: "BARBEARIA / SITE", url: "https://barber043.lovable.app/", image: "https://image.thum.io/get/width/1000/crop/700/https://barber043.lovable.app/", className: "project-barber", label: "Um espaço digital para a marca e seus serviços." },
];

const plans = [
  {
    code: "01 / START",
    name: "Brandify Start",
    description: "Para quem precisa ser encontrado e causar uma primeira impressão profissional.",
    bestFor: "NEGÓCIOS QUE ESTÃO COMEÇANDO",
    features: ["Landing page ou página institucional de uma seção", "Layout personalizado para sua marca", "Versão adaptada para celular", "Botão de contato pelo WhatsApp", "Configuração básica de SEO", "Plaquinha NFC da Brandify"],
    message: "Olá! Tenho interesse no pacote Brandify Start. Gostaria de um orçamento.",
  },
  {
    code: "02 / BUSINESS",
    name: "Brandify Business",
    description: "Para empresas que querem apresentar melhor seus serviços e fortalecer a credibilidade.",
    bestFor: "EMPRESAS EM CRESCIMENTO",
    features: ["Site institucional com até cinco páginas", "Estrutura personalizada de navegação", "Versão adaptada para celular", "Formulário e contato pelo WhatsApp", "Configuração básica de SEO", "Plaquinha NFC da Brandify"],
    message: "Olá! Tenho interesse no pacote Brandify Business. Gostaria de um orçamento.",
  },
  {
    code: "03 / STORE",
    name: "Brandify Store",
    description: "Para comércios que querem organizar seu catálogo e começar a vender online.",
    bestFor: "LOJAS E COMÉRCIOS",
    features: ["Configuração de loja virtual", "Vitrine, categorias e páginas essenciais", "Cadastro inicial de até 20 produtos", "Configuração dos meios de pagamento e envio disponíveis na plataforma", "Versão adaptada para celular", "Plaquinha NFC da Brandify"],
    message: "Olá! Tenho interesse no pacote Brandify Store. Gostaria de um orçamento.",
  },
];

const faqs = [
  { q: "Quanto custa criar um site?", a: "O investimento depende do tipo de projeto, quantidade de páginas, funcionalidades e materiais disponíveis. Enviamos uma proposta com escopo, valor e prazo antes de começar." },
  { q: "O domínio e a hospedagem estão incluídos?", a: "Domínio, hospedagem e eventuais mensalidades de plataformas terceirizadas são informados separadamente na proposta, para você saber exatamente o custo de manter o site no ar." },
  { q: "O site funciona no celular?", a: "Sim. Criamos layouts responsivos, preparados para navegação em celular, tablet e computador." },
  { q: "O que preciso enviar para começar?", a: "Normalmente precisamos entender o negócio, o objetivo do site, sua identidade visual e os materiais disponíveis, como textos, fotos e informações dos produtos ou serviços." },
  { q: "Qual é o prazo de entrega?", a: "O prazo depende do escopo e da disponibilidade dos materiais. Definimos as etapas e a previsão de entrega na proposta, antes do início do projeto." },
  { q: "Vocês oferecem manutenção?", a: "Sim, podemos avaliar suporte e manutenção conforme a necessidade. O que está incluído após a entrega é especificado no contrato de cada projeto." },
];

function ContactButton({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <a className={dark ? "b26-button b26-button-dark" : "b26-button b26-button-light"} href={consultLink} target="_blank" rel="noopener noreferrer">
      {text}<ArrowUpRight aria-hidden="true" size={18} />
    </a>
  );
}

export default function Index2026() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  useEffect(() => {
    document.title = "Brandify | Sites que fazem sua marca se destacar";
    const goToHash = () => {
      const id = window.location.hash.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };
    const timer = window.setTimeout(goToHash, 120);
    window.addEventListener("hashchange", goToHash);
    return () => { window.clearTimeout(timer); window.removeEventListener("hashchange", goToHash); };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="b26" id="inicio">
      <a className="b26-skip" href="#conteudo">Pular para o conteúdo</a>
      <header className="b26-header">
        <div className="b26-shell b26-header-inner">
          <a href="/#inicio" className="b26-logo" onClick={closeMenu} aria-label="Brandify — página inicial">
            <span className="b26-logo-sign" aria-hidden="true">✳</span>
            <span>brandify<span className="b26-logo-point">.</span></span>
          </a>
          <nav className={menuOpen ? "b26-nav is-open" : "b26-nav"} aria-label="Navegação principal">
            <a onClick={closeMenu} href="#servicos">Serviços</a>
            <a onClick={closeMenu} href="#projetos">Projetos</a>
            <a onClick={closeMenu} href="#processo">Processo</a>
            <a onClick={closeMenu} href="#planos">Pacotes</a>
            <a onClick={closeMenu} href="#sobre">Sobre</a>
            <a onClick={closeMenu} className="b26-mobile-cta" href={consultLink} target="_blank" rel="noopener noreferrer">Solicitar orçamento <ArrowUpRight size={16}/></a>
          </nav>
          <a className="b26-header-cta" href={consultLink} target="_blank" rel="noopener noreferrer">Iniciar projeto <ArrowUpRight size={16} /></a>
          <button type="button" className="b26-menu-button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <main id="conteudo">
        <section className="b26-hero b26-shell" aria-labelledby="b26-hero-title">
          <div className="b26-hero-copy">
            <div className="b26-overline"><span className="b26-small-spark">✳</span> ESTÚDIO DIGITAL INDEPENDENTE <span className="b26-overline-end">JACAREZINHO / BRASIL</span></div>
            <h1 id="b26-hero-title">SITES QUE <span className="b26-outline-word">MARCAM.</span><br/><em>MARCAS</em> QUE CRESCEM<span className="b26-dot">.</span></h1>
            <div className="b26-hero-bottom">
              <p>Design com personalidade. Experiências digitais que apresentam sua empresa, valorizam sua marca e aproximam você de novos clientes.</p>
              <div className="b26-hero-actions"><ContactButton text="Vamos criar seu site?" dark /><a className="b26-text-link" href="#projetos">Explorar projetos <ArrowDown size={16}/></a></div>
            </div>
          </div>
          <div className="b26-hero-art" aria-label="Composição visual de design digital da Brandify">
            <div className="b26-art-caption">DESIGN / DESENVOLVIMENTO / EXPERIÊNCIA</div>
            <div className="b26-art-frame">
              <div className="b26-art-tiny">B/</div>
              <div className="b26-art-giant">B<span>°</span></div>
              <div className="b26-art-frame-footer"><span>MAIS QUE UM SITE.</span><span>UMA PRESENÇA.</span></div>
              <div className="b26-art-orbit b26-art-orbit-one"/>
              <div className="b26-art-orbit b26-art-orbit-two"/>
            </div>
            <div className="b26-art-stamp">CONCEITO<br/>↓<br/>EXECUÇÃO</div>
            <div className="b26-art-index">BRANDIFY® / 2026 — WEB STUDIO</div>
          </div>
        </section>

        <div className="b26-ticker" aria-label="Especialidades"><div className="b26-ticker-inner" aria-hidden="true">ESTRATÉGIA <span>✳</span> DESIGN <span>✳</span> DESENVOLVIMENTO <span>✳</span> EXPERIÊNCIA DIGITAL <span>✳</span> ESTRATÉGIA <span>✳</span> DESIGN <span>✳</span> DESENVOLVIMENTO <span>✳</span> EXPERIÊNCIA DIGITAL <span>✳</span></div></div>

        <section className="b26-services b26-block" id="servicos">
          <div className="b26-shell">
            <div className="b26-section-kicker"><span>01 / O QUE FAZEMOS</span><span>DO PRIMEIRO CONTATO À EXPERIÊNCIA COMPLETA</span></div>
            <div className="b26-section-intro">
              <h2>O digital da sua marca,<br/><em>do jeito certo.</em></h2>
              <p>Não criamos apenas páginas bonitas. Construímos soluções web adequadas ao momento e ao objetivo de cada negócio.</p>
            </div>
            <div className="b26-service-grid">
              {services.map((s) => (
                <article key={s.num} className={"b26-service-card b26-service-" + s.className}>
                  <div className="b26-service-top"><span>{s.num} / {s.kicker}</span><ArrowUpRight size={21} aria-hidden="true"/></div>
                  <div className="b26-service-art" aria-hidden="true">
                    <div className="b26-service-graphic"><span>{s.className === "commerce" ? "STORE" : s.className === "landing" ? "CLICK." : "WEB"}</span><i>{s.className === "commerce" ? "E-COMMERCE" : s.className === "landing" ? "CONVERSION DESIGN" : "DIGITAL PRESENCE"}</i></div>
                  </div>
                  <div className="b26-service-detail"><span className="b26-service-tag">{s.tag}</span><h3>{s.name}</h3><p>{s.desc}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="b26-work b26-block" id="projetos">
          <div className="b26-shell">
            <div className="b26-section-kicker b26-kicker-dark"><span>02 / TRABALHOS SELECIONADOS</span><span>PROJETOS QUE GANHARAM VIDA</span></div>
            <div className="b26-work-intro"><h2>IDEIAS REAIS.<br/><span>PROJETOS REAIS.</span></h2><p>Algumas experiências digitais que desenvolvemos. Cada projeto começa com uma necessidade diferente — e merece uma solução própria.</p></div>
            <div className="b26-work-grid">
              {projects.map((p, i) => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className={"b26-project b26-project-" + i + " " + p.className} aria-label={"Visitar projeto " + p.name + " (abre em nova aba)"}>
                  <div className="b26-project-visual">
                    <div className="b26-browser"><span className="b26-browser-dots">● ● ●</span><span>{p.url.replace("https://", "")}</span><ArrowUpRight size={14}/></div>
                    <img src={p.image} alt={"Prévia do site " + p.name} loading="lazy" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.style.display = "none"; }}/>
                    <span className="b26-project-watermark" aria-hidden="true">{p.name}</span>
                    <span className="b26-project-visit"><ArrowUpRight size={22}/></span>
                  </div>
                  <div className="b26-project-info"><div><span>{p.category}</span><h3>{p.name}</h3><p>{p.label}</p></div><ArrowUpRight size={24}/></div>
                </a>
              ))}
            </div>
            <div className="b26-work-note"><span>SEU PROJETO PODE SER O PRÓXIMO.</span><a href={consultLink} target="_blank" rel="noopener noreferrer">Conversar sobre uma ideia <ArrowUpRight size={18}/></a></div>
          </div>
        </section>

        <section className="b26-manifesto" id="sobre">
          <div className="b26-shell b26-manifesto-inner">
            <div className="b26-manifesto-eyebrow">UM BOM SITE NÃO É UM DETALHE.</div>
            <h2>O PRIMEIRO CONTATO<br/>JÁ DIZ <span>MUITO</span> SOBRE<br/>A SUA MARCA<span className="b26-dot">.</span></h2>
            <div className="b26-manifesto-bottom"><div className="b26-manifesto-sign">✳</div><p>A Brandify é um estúdio digital de Jacarezinho, PR. Unimos direção visual, clareza e desenvolvimento para transformar negócios em experiências online mais profissionais.</p></div>
          </div>
        </section>

        <section className="b26-process b26-block" id="processo">
          <div className="b26-shell">
            <div className="b26-section-kicker"><span>03 / NOSSO PROCESSO</span><span>CLAREZA EM CADA ETAPA</span></div>
            <div className="b26-section-intro"><h2>BOAS IDEIAS<br/><em>PRECISAM DE MÉTODO.</em></h2><p>Um processo simples, organizado e transparente para tirar seu projeto do papel com direção.</p></div>
            <div className="b26-steps">
              {[
                ["01", "Conversa inicial", "Entendemos seu negócio, o público e o resultado que você espera do site."],
                ["02", "Direção visual", "Organizamos a estrutura, os conteúdos e a identidade do projeto."],
                ["03", "Desenvolvimento", "Construímos a experiência, adaptamos para diferentes telas e revisamos detalhes."],
                ["04", "Publicação", "Validamos o resultado e orientamos a colocação do site no ar."],
              ].map((step) => (
                <div className="b26-step" key={step[0]}><span className="b26-step-number">{step[0]}</span><h3>{step[1]}</h3><p>{step[2]}</p><ArrowUpRight className="b26-step-arrow" size={22}/></div>
              ))}
            </div>
          </div>
        </section>

        <section className="b26-pricing b26-block" id="planos">
          <div className="b26-shell">
            <div className="b26-section-kicker b26-kicker-dark"><span>04 / FORMATOS DE PROJETO</span><span>UMA SOLUÇÃO PARA CADA FASE</span></div>
            <div className="b26-pricing-intro"><h2>ESCOLHA O SEU<br/><em>PRÓXIMO PASSO.</em></h2><p>Três pontos de partida. O escopo final e o investimento são definidos em proposta, sem surpresas ou promessas vagas.</p></div>
            <div className="b26-plans">
              {plans.map((p, i) => (
                <article key={p.name} className={i === 1 ? "b26-plan b26-plan-featured" : "b26-plan"}>
                  <div className="b26-plan-head"><span>{p.code}</span><span>{i === 1 ? "PARA CRESCER" : "SOLUÇÃO WEB"}</span></div>
                  <div className="b26-plan-main"><span className="b26-plan-for">{p.bestFor}</span><h3>{p.name}</h3><p>{p.description}</p></div>
                  <div className="b26-plan-offer"><span>INVESTIMENTO</span><strong>Sob consulta</strong></div>
                  <ul>{p.features.map((f) => <li key={f}><Check size={16} aria-hidden="true"/><span>{f}</span></li>)}</ul>
                  <a className="b26-plan-button" href={whatsapp(p.message)} target="_blank" rel="noopener noreferrer">Solicitar proposta <ArrowUpRight size={18}/></a>
                </article>
              ))}
            </div>
            <p className="b26-plan-footnote">Domínio, hospedagem, mensalidades de plataformas e demandas fora do escopo são apresentados separadamente. Recursos e condições finais dependem da proposta aprovada.</p>
          </div>
        </section>

        <section className="b26-faq b26-block" id="duvidas">
          <div className="b26-shell b26-faq-layout">
            <div><div className="b26-section-kicker"><span>05 / TUDO MAIS CLARO</span></div><h2>AINDA TEM<br/><em>DÚVIDAS?</em></h2><p>As respostas mais importantes antes de começar um projeto com a Brandify.</p></div>
            <div className="b26-faq-items">
              {faqs.map((faq, i) => (
                <div className="b26-faq-item" key={faq.q}>
                  <button type="button" aria-expanded={activeFaq === i} aria-controls={"faq-answer-" + i} onClick={() => setActiveFaq(activeFaq === i ? null : i)}><span>{faq.q}</span><ChevronDown size={19} className={activeFaq === i ? "is-rotated" : ""}/></button>
                  {activeFaq === i && <p id={"faq-answer-" + i}>{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="b26-last-cta" id="contato">
          <div className="b26-shell">
            <div className="b26-section-kicker b26-kicker-dark"><span>06 / VAMOS COMEÇAR?</span><span>SEU PRÓXIMO PROJETO COMEÇA AQUI</span></div>
            <h2>VAMOS CRIAR<br/><em>ALGO QUE</em><br/>SE DESTACA<span>.</span></h2>
            <div className="b26-last-bottom"><p>Conte o que você tem em mente. A gente conversa sobre a melhor solução para o seu negócio, sem compromisso.</p><ContactButton text="Falar com a Brandify" /></div>
          </div>
        </section>
      </main>
      <footer className="b26-footer">
        <div className="b26-shell">
          <div className="b26-footer-top"><a href="#inicio" className="b26-footer-logo">brandify<span>.</span></a><div className="b26-footer-links"><a href="#servicos">Serviços</a><a href="#projetos">Projetos</a><a href="#planos">Pacotes</a><a href="#contato">Contato</a></div></div>
          <div className="b26-footer-details"><p>Design e desenvolvimento digital<br/>com personalidade e propósito.</p><div><a href="mailto:brandifycoo@gmail.com"><Mail size={15}/> brandifycoo@gmail.com</a><a href={consultLink} target="_blank" rel="noopener noreferrer"><MessageCircle size={15}/> (43) 99106-5129</a><span><MapPin size={15}/> Jacarezinho, PR · Brasil</span></div><div><a href="https://www.instagram.com/brandifycoo" target="_blank" rel="noopener noreferrer"><Instagram size={15}/> Instagram</a><a href="/privacidade">Política de privacidade</a></div></div>
          <div className="b26-footer-bottom"><span>© {new Date().getFullYear()} Brandify. Todos os direitos reservados.</span><span>FEITO COM INTENÇÃO. ✳</span></div>
        </div>
      </footer>
      <a className="b26-whatsapp" href={consultLink} target="_blank" rel="noopener noreferrer" aria-label="Fale com a Brandify pelo WhatsApp"><MessageCircle size={22}/></a>
    </div>
  );
}
