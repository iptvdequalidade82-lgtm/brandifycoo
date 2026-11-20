import { ArrowUpRight } from "lucide-react";
import BrandifyHalftoneFooter from "@/components/BrandifyHalftoneFooter";
import "./BrandifyCreative.css";
import "./ServicePages.css";

type ServiceKey = "institucionais" | "landing" | "lojas";
type ServiceContent = {
  label: string;
  heading: string;
  lead: string;
  summary: string;
  valueTitle: string;
  value: string;
  deliverables: string[];
  scopeTitle: string;
  scope: string;
  steps: [string, string][];
  faqs: [string, string][];
  message: string;
};

const services: Record<ServiceKey, ServiceContent> = {
  institucionais: {
    label: "SITES INSTITUCIONAIS",
    heading: "UM SITE QUE APRESENTA SUA EMPRESA DE VERDADE.",
    lead: "Um site institucional deve ajudar o visitante a entender quem você é, o que faz e como entrar em contato. Sem distrações.",
    summary: "Criamos sites institucionais com identidade visual, organização de informações e navegação pensada para quem conhece sua empresa pela primeira vez.",
    valueTitle: "SUA EMPRESA, EXPLICADA COM CLAREZA.",
    value: "O site reúne o que um cliente precisa saber antes de conversar com você: serviços, diferenciais que você realmente oferece, informações da empresa e canais de contato. O conteúdo é organizado em uma estrutura fácil de acompanhar no computador e no celular.",
    deliverables: [
      "Estrutura de páginas institucionais conforme o escopo combinado.",
      "Aplicação da identidade visual da empresa ao layout.",
      "Navegação responsiva para computador e celular.",
      "Seções para apresentar serviços, informações e contato.",
    ],
    scopeTitle: "O QUE DEFINIMOS ANTES DE COMEÇAR",
    scope: "O número de páginas, os materiais necessários, formulários, integrações e revisões são definidos na proposta. Domínio, hospedagem e plataformas são custos à parte, quando aplicáveis. Não prometemos posicionamento ou quantidade de clientes sem dados para isso.",
    steps: [
      ["Conversa", "Entendemos o negócio, o público e a finalidade do site."],
      ["Organização", "Definimos as páginas, o conteúdo e os caminhos de navegação."],
      ["Design e desenvolvimento", "Criamos a aparência e implementamos o projeto aprovado."],
      ["Revisão", "Conferimos os detalhes e alinhamos a publicação."],
    ],
    faqs: [
      ["Meu site pode ter várias páginas?", "Sim. A quantidade e a estrutura são definidas na proposta conforme o projeto."],
      ["Preciso enviar textos e imagens?", "Precisamos das informações da empresa e dos materiais disponíveis. Durante o briefing indicamos o que será necessário."],
      ["O site funciona no celular?", "O layout é desenvolvido para se adaptar a diferentes tamanhos de tela."],
    ],
    message: "Olá! Gostaria de uma proposta para criação de site institucional com a Brandify.",
  },
  landing: {
    label: "LANDING PAGES",
    heading: "SUA OFERTA MERECE UMA PÁGINA CLARA.",
    lead: "Uma landing page reúne a mensagem principal, os argumentos e o próximo passo do visitante em uma experiência objetiva.",
    summary: "Desenvolvemos páginas de apresentação de ofertas, serviços ou campanhas com design próprio e caminhos de contato visíveis.",
    valueTitle: "MENOS DISPERSÃO. MAIS CLAREZA.",
    value: "Em vez de distribuir uma oferta em várias telas desconectadas, organizamos o conteúdo para que o visitante compreenda a proposta e encontre facilmente a ação desejada. A mensagem, os materiais e os objetivos são discutidos antes do design.",
    deliverables: [
      "Estrutura de conteúdo para apresentar uma oferta ou serviço.",
      "Design personalizado alinhado à identidade da marca.",
      "Layout responsivo e chamada de ação destacada.",
      "Botões e canais de contato definidos no projeto.",
    ],
    scopeTitle: "SOBRE RESULTADOS E INTEGRAÇÕES",
    scope: "Uma página bem construída pode facilitar a compreensão e o contato, mas não garante vendas nem número de leads. Formulários, integrações, hospedagem e ferramentas de terceiros precisam constar da proposta para serem incluídos.",
    steps: [
      ["Objetivo", "Entendemos a oferta e o público que deve acessá-la."],
      ["Mensagem", "Organizamos informações e chamada de ação."],
      ["Construção", "Desenhamos e desenvolvemos a landing page."],
      ["Publicação", "Revisamos o material e alinhamos a entrega."],
    ],
    faqs: [
      ["Landing page e site institucional são a mesma coisa?", "Não. A landing page costuma ter um foco principal, enquanto o site institucional apresenta a empresa de forma mais ampla."],
      ["Posso usar em anúncios?", "A página pode fazer parte de uma campanha, desde que o conteúdo e os recursos estejam adequados ao objetivo. Gestão de anúncios não está incluída automaticamente."],
      ["Vocês garantem conversões?", "Não. O resultado depende da oferta, do público, do tráfego e de outros fatores além da página."],
    ],
    message: "Olá! Quero conversar sobre a criação de uma landing page para minha oferta.",
  },
  lojas: {
    label: "DESIGN DE LOJAS VIRTUAIS",
    heading: "A APARÊNCIA DA SUA LOJA TEM QUE TER A SUA CARA.",
    lead: "Criamos o visual da sua loja virtual: vitrine, páginas e navegação. Você fica responsável pelo cadastro dos produtos e pela operação.",
    summary: "O Brandify Store é um serviço de design de loja virtual, com foco na apresentação visual e na experiência de navegação, não na administração do catálogo.",
    valueTitle: "UMA VITRINE QUE COMBINA COM A SUA MARCA.",
    value: "Trabalhamos na organização visual da vitrine, na apresentação de categorias, no estilo das páginas e na adaptação do layout ao celular. A estrutura precisa ajudar seus clientes a encontrar o que procuram, respeitando as possibilidades da plataforma definida para o projeto.",
    deliverables: [
      "Design e personalização visual das páginas da loja.",
      "Layout da vitrine e apresentação de categorias.",
      "Aplicação de identidade visual em cores, tipografia e componentes.",
      "Aparência responsiva para diferentes telas.",
    ],
    scopeTitle: "O QUE NÃO ESTÁ INCLUÍDO NO STORE",
    scope: "O cliente é responsável por cadastrar e atualizar produtos, fotos, descrições, preços e estoque, além de configurar e administrar pagamentos, frete e demais recursos operacionais da plataforma. Domínio, hospedagem, assinaturas e integrações não estão incluídos automaticamente. O escopo exato fica registrado na proposta.",
    steps: [
      ["Briefing", "Entendemos sua marca, os produtos e a referência visual desejada."],
      ["Direção", "Definimos o estilo das páginas e a estrutura da vitrine."],
      ["Design", "Desenvolvemos a parte visual prevista no projeto."],
      ["Entrega", "Revisamos a aparência e orientamos sobre o que fica sob sua responsabilidade."],
    ],
    faqs: [
      ["Vocês cadastram meus produtos?", "Não. O cadastro e as atualizações de produtos ficam por conta do cliente."],
      ["Vocês configuram meios de pagamento e frete?", "Não no escopo padrão de design do Brandify Store. A configuração e a operação desses recursos são responsabilidade do cliente."],
      ["A loja já vem com domínio e hospedagem?", "Domínio, hospedagem, plataforma e eventuais mensalidades são tratados separadamente na proposta."],
    ],
    message: "Olá! Quero conhecer o serviço de design de loja virtual da Brandify. Entendi que o cadastro e a operação dos produtos ficam comigo.",
  },
};

const crossLinks: { key: ServiceKey; label: string; href: string }[] = [
  { key: "institucionais", label: "Sites institucionais", href: "/sites-institucionais" },
  { key: "landing", label: "Landing pages", href: "/landing-pages" },
  { key: "lojas", label: "Design de lojas virtuais", href: "/lojas-virtuais" },
];

export default function ServicePage({ service }: { service: ServiceKey }) {
  const data = services[service];
  const contact = "https://wa.me/5543991065129?text=" + encodeURIComponent(data.message);
  return (
    <div className="bcv3 bseo-page">
      <a className="bcv3-skip" href="#conteudo">Ir para o conteúdo</a>
      <header className="bcv3-header">
        <a href="/" aria-label="Brandify — página inicial" className="bcv3-brand">
          <img className="bcv3-brand-logo" src="/brandify-mark-black.svg" alt="" />
          <span className="bcv3-brand-word">brandify<span className="bcv3-brand-dot">.</span></span>
        </a>
        <nav className="bseo-nav" aria-label="Navegação de serviços">
          <a href="/#servicos">Serviços</a>
          <a href="/#pacotes">Pacotes</a>
          <a href="/#contato">Contato</a>
        </nav>
        <a className="bcv3-header-cta" href={contact} target="_blank" rel="noopener noreferrer">
          PEDIR PROPOSTA <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </header>

      <main id="conteudo">
        <section className="bseo-hero">
          <div className="bseo-inner">
            <nav aria-label="Caminho de navegação" className="bseo-breadcrumb">
              <a href="/">Início</a><span aria-hidden="true">/</span><span>{data.label}</span>
            </nav>
            <p className="bseo-kicker">{data.label}</p>
            <h1>{data.heading}</h1>
            <div className="bseo-hero-bottom">
              <p>{data.lead}</p>
              <a href={contact} target="_blank" rel="noopener noreferrer" className="bseo-button">CONVERSAR SOBRE MEU PROJETO <ArrowUpRight size={20} aria-hidden="true" /></a>
            </div>
          </div>
        </section>

        <section className="bseo-about">
          <div className="bseo-inner bseo-two-columns">
            <div><p className="bseo-kicker">COMO PODEMOS AJUDAR</p><h2>{data.valueTitle}</h2></div>
            <div className="bseo-prose"><p>{data.summary}</p><p>{data.value}</p></div>
          </div>
        </section>

        <section className="bseo-delivery">
          <div className="bseo-inner bseo-two-columns">
            <div><p className="bseo-kicker">ESCOPO DO SERVIÇO</p><h2>O QUE ESTÁ INCLUÍDO.</h2></div>
            <ul className="bseo-list">{data.deliverables.map(item => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="bseo-inner bseo-scope"><h3>{data.scopeTitle}</h3><p>{data.scope}</p></div>
        </section>

        <section className="bseo-process">
          <div className="bseo-inner">
            <p className="bseo-kicker">NOSSO PROCESSO</p>
            <h2>DO PRIMEIRO CONTATO À ENTREGA.</h2>
            <ol>{data.steps.map(([title, description], i) => <li key={title}>
              <span className="bseo-number">{String(i + 1).padStart(2, "0")}</span>
              <h3>{title}</h3><p>{description}</p>
            </li>)}</ol>
          </div>
        </section>

        <section className="bseo-faq">
          <div className="bseo-inner bseo-two-columns">
            <h2>DÚVIDAS FREQUENTES.</h2>
            <div>{data.faqs.map(([question, answer]) => <div className="bseo-qa" key={question}>
              <h3>{question}</h3><p>{answer}</p>
            </div>)}</div>
          </div>
        </section>

        <section className="bseo-contact">
          <div className="bseo-inner">
            <h2>VAMOS CONVERSAR SOBRE SEU SITE?</h2>
            <a href={contact} target="_blank" rel="noopener noreferrer" className="bseo-button">PEDIR UMA PROPOSTA <ArrowUpRight size={20} aria-hidden="true" /></a>
            <nav className="bseo-other" aria-label="Conheça outros serviços">
              {crossLinks.filter(link => link.key !== service).map(link => <a key={link.key} href={link.href}>{link.label} <ArrowUpRight size={15} aria-hidden="true" /></a>)}
              <a href="/sites-interativos">Sites interativos <ArrowUpRight size={15} aria-hidden="true" /></a>
            </nav>
          </div>
        </section>
      </main>
      <BrandifyHalftoneFooter />
    </div>
  );
}
