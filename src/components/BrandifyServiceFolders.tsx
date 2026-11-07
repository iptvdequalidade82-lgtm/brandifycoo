import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, LayoutTemplate, MousePointerClick, ShoppingBag } from "lucide-react";
import editorial from "@/assets/reference/ref-32-designers-website.jpg";
import art from "@/assets/reference/ref-12-agency-grid.jpg";
import collections from "@/assets/reference/ref-10-nike-editorial.jpg";
import "./BrandifyServiceFolders.css";

const number = "5543991065129";
const services = [
  {
    id: "institucional", number: "01", name: "SITE INSTITUCIONAL", short: "Sua empresa, bem apresentada.",
    icon: LayoutTemplate, color: "blue", visual: editorial, doc: ["Sua história", "Serviços", "Contato"],
    description: "Mostre quem é sua empresa, o que ela faz e como o cliente pode falar com você.",
    details: ["Páginas organizadas por assunto", "Visual alinhado ao seu negócio", "Boa navegação no celular"],
    cta: "QUERO UM SITE INSTITUCIONAL",
    message: "Olá! Vi a apresentação de sites institucionais na Brandify e quero conversar sobre o meu projeto.",
  },
  {
    id: "landing", number: "02", name: "LANDING PAGE", short: "Sua oferta, sem distrações.",
    icon: MousePointerClick, color: "light", visual: art, doc: ["Oferta", "Benefícios", "Próximo passo"],
    description: "Uma página para explicar a sua oferta e facilitar que o visitante peça informações ou compre.",
    details: ["Mensagem principal fácil de entender", "Conteúdo focado na oferta", "Chamada clara para ação"],
    cta: "QUERO UMA LANDING PAGE",
    message: "Olá! Vi as landing pages da Brandify e gostaria de uma proposta para minha oferta.",
  },
  {
    id: "loja", number: "03", name: "LOJA VIRTUAL", short: "Seus produtos à vista.",
    icon: ShoppingBag, color: "dark", visual: collections, doc: ["Catálogo", "Produtos", "Compra"],
    description: "Apresente produtos e categorias em uma loja preparada para receber visitantes de diferentes telas.",
    details: ["Catálogo organizado", "Informações de pagamento e envio", "Experiência adaptada ao celular"],
    cta: "QUERO UMA LOJA VIRTUAL",
    message: "Olá! Vi a opção de loja virtual da Brandify e gostaria de conversar sobre meu e-commerce.",
  },
] as const;

export default function BrandifyServiceFolders() {
  const [selected, setSelected] = useState<number>(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const visible = hovered ?? selected;
  const item = services[visible];
  const href = "https://wa.me/" + number + "?text=" + encodeURIComponent(item.message);

  return (
    <div className="bsf-root">
      <div className="bsf-shelf" aria-label="Escolha o tipo de site para ver mais detalhes">
        {services.map((service, index) => {
          const Icon = service.icon;
          const open = visible === index;
          return (
            <div className={"bsf-item bsf-" + service.color + (open ? " is-open" : "")} key={service.id}>
              <button
                type="button"
                className="bsf-folder-button"
                aria-label={"Explorar: " + service.name}
                aria-expanded={selected === index}
                aria-controls="bsf-selected-service"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                onClick={() => { setSelected(index); setHovered(null); }}
              >
                <span className="bsf-backdrop" aria-hidden="true" />
                <span className="bsf-sheet bsf-sheet-back" aria-hidden="true">
                  <span className="bsf-sheet-visual" style={{ backgroundImage: "url(" + service.visual + ")" }} />
                  <span>{service.doc[0]}</span>
                </span>
                <span className="bsf-sheet bsf-sheet-middle" aria-hidden="true">
                  <span className="bsf-sheet-kicker">BRANDIFY / DIGITAL</span>
                  <strong>{service.doc[1]}</strong>
                  <i />
                  <i />
                </span>
                <span className="bsf-sheet bsf-sheet-front" aria-hidden="true">
                  <span className="bsf-sheet-kicker">ESTRUTURA E CONTEÚDO</span>
                  <strong>{service.doc[2]}</strong>
                  <i />
                  <i />
                </span>
                <span className="bsf-folder-back" aria-hidden="true" />
                <span className="bsf-folder-cover">
                  <span className="bsf-folder-inner">
                    <span className="bsf-folder-top"><span>BRANDIFY / {service.number}</span><Icon size={21} strokeWidth={1.6} /></span>
                    <span className="bsf-folder-title">{service.name}</span>
                    <span className="bsf-folder-bottom"><span>{service.short}</span><span className="bsf-folder-round"><ArrowUpRight size={23} aria-hidden="true" /></span></span>
                  </span>
                </span>
              </button>
              <p className="bsf-name">{service.number} / {service.name}</p>
            </div>
          );
        })}
      </div>

      <p className="bsf-instruction">PASSE O MOUSE PARA ABRIR · CLIQUE PARA ESCOLHER · NO CELULAR, TOQUE NA PASTA</p>

      <div id="bsf-selected-service" className="bsf-detail" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={item.id}
            className="bsf-detail-inner"
            initial={reduced ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduced ? 0 : .22, ease: "easeOut" }}
          >
            <div className="bsf-detail-heading">
              <span className="bsf-detail-overline">ABRINDO PASTA / {item.number}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
            <div className="bsf-detail-benefits">
              {item.details.map(detail => (
                <div key={detail}><Check size={17} aria-hidden="true" /><span>{detail}</span></div>
              ))}
            </div>
            <a className="bsf-detail-cta" href={href} target="_blank" rel="noopener noreferrer">
              <span>{item.cta}</span><ArrowUpRight size={21} aria-hidden="true" />
            </a>
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="bsf-footnote">As imagens dentro das pastas são ilustrativas. Cada site recebe um projeto visual próprio.</p>
    </div>
  );
}
