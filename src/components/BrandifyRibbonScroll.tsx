import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import heroPhoto from "@/assets/reference/ref-11-underwater-laptop.jpg";
import "./BrandifyRibbonScroll.css";

const wa = "https://wa.me/5543991065129?text=" + encodeURIComponent(
  "Olá! Vi a Brandify e quero conversar sobre um site para minha empresa."
);
const cards = [
  { name: "Institucional", image: "/brandify-concept-institucional.svg" },
  { name: "Landing Page", image: "/brandify-concept-landing.svg" },
  { name: "Loja Virtual", image: "/brandify-concept-loja.svg" },
  { name: "Saúde", image: "/brandify-concept-clinica.svg" },
  { name: "Imóveis", image: "/brandify-concept-imoveis.svg" },
  { name: "Gastronomia", image: "/brandify-concept-restaurante.svg" },
  { name: "Tecnologia", image: "/brandify-concept-tecnologia.svg" },
  { name: "Moda", image: "/brandify-concept-moda.svg" },
];

function Action({ className = "", tabIndex }: { className?: string; tabIndex?: number }) {
  return (
    <a href={wa} target="_blank" rel="noopener noreferrer" className={"bvr-action " + className} tabIndex={tabIndex}>
      <span>PEDIR PROPOSTA DO MEU SITE</span>
      <span className="bvr-action-icon"><ArrowUpRight size={20} aria-hidden="true" /></span>
    </a>
  );
}

function RibbonCard({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const item = cards[index];
  const transform = useTransform(progress, (p) => {
    const t = Math.max(0, Math.min(1, (p - .27) / .53));
    const relative = index - (-.5 + t * 8.15);
    const x = relative * 31;
    const y = Math.sin(relative * .72) * 48;
    const z = -Math.min(Math.abs(relative) * 92, 480);
    const rotateY = Math.max(-68, Math.min(68, relative * -13));
    const rotateZ = Math.sin(relative * .48) * -9;
    return "translate3d(calc(-50% + " + x.toFixed(2) + "vw), calc(-50% + " + y.toFixed(1) + "px), " + z.toFixed(1) + "px) rotateY(" + rotateY.toFixed(2) + "deg) rotateZ(" + rotateZ.toFixed(2) + "deg)";
  });
  const opacity = useTransform(progress, [0,.24,.31,.80,.9,1], [0,0,1,1,0,0]);
  const zIndex = useTransform(progress, (p) => {
    const t = Math.max(0, Math.min(1, (p - .27) / .53));
    return 60 - Math.round(Math.abs(index + .5 - t * 8.15) * 4);
  });
  return (
    <motion.div className="bvr-card" style={{ transform, opacity, zIndex }} aria-hidden="true">
      <div className="bvr-card-image" style={{ backgroundImage: "url(" + item.image + ")" }} role="img" aria-label={"Conceito visual de " + item.name} />
    </motion.div>
  );
}

export default function BrandifyRibbonScroll() {
  const section = useRef<HTMLElement>(null);
  const [heroActive, setHeroActive] = useState(true);
  const [closingActive, setClosingActive] = useState(false);
  const { scrollYProgress } = useScroll({ target:section, offset:["start start","end end"] });
  const heroOpacity = useTransform(scrollYProgress, [0,.13,.28], [1,1,0]);
  const heroY = useTransform(scrollYProgress, [0,.28], [0,-110]);
  const photoOpacity = useTransform(scrollYProgress, [0,.19,.43], [1,.6,0]);
  const titleOpacity = useTransform(scrollYProgress, [.23,.34,.73,.85], [0,1,1,0]);
  const titleX = useTransform(scrollYProgress, [.3,.83], ["-7vw","5vw"]);
  const topTitleX = useTransform(scrollYProgress, [.31,.82], ["6vw","-7vw"]);
  const closeOpacity = useTransform(scrollYProgress, [.82,.92,1], [0,1,1]);
  const closeY = useTransform(scrollYProgress, [.84,1], [55,0]);
  useMotionValueEvent(scrollYProgress, "change", v => {
    setHeroActive(v < .23);
    setClosingActive(v > .9);
  });

  return (
    <section id="inicio" ref={section} className="bvr-story" aria-label="Apresentação da Brandify com referências visuais em movimento">
      <div className="bvr-stage">
        <motion.div className="bvr-photo" style={{ backgroundImage:"url(" + heroPhoto + ")", opacity:photoOpacity }} aria-hidden="true" />
        <div className="bvr-vignette" aria-hidden="true" />
        <motion.div className="bvr-hero" aria-hidden={!heroActive} style={{ opacity:heroOpacity,y:heroY,pointerEvents:heroActive?"auto":"none" }}>
          <div className="bvr-hero-inner">
            <h1>SEU NEGÓCIO<br />MERECE UM SITE<br />À <em>ALTURA.</em></h1>
            <div className="bvr-hero-bottom">
              <p>Criamos sites, landing pages e lojas virtuais para apresentar melhor sua empresa e facilitar o contato com clientes.</p>
              <div><Action tabIndex={heroActive?undefined:-1} /><small>Primeiro, uma conversa para entender seu projeto. Sem compromisso.</small></div>
            </div>
          </div>
        </motion.div>

        <motion.div className="bvr-title" style={{ opacity:titleOpacity }} aria-hidden="true">
          <motion.span style={{ x:topTitleX }}>IDEIAS QUE</motion.span>
          <motion.span className="bvr-title-alt" style={{ x:titleX }}>SAEM DA TELA.</motion.span>
        </motion.div>
        <div className="bvr-card-space" aria-hidden="true">
          {cards.map((_,i) => <RibbonCard key={i} index={i} progress={scrollYProgress} />)}
        </div>
        <motion.div className="bvr-close" aria-hidden={!closingActive} style={{opacity:closeOpacity,y:closeY,pointerEvents:closingActive?"auto":"none"}}>
          <h2>AGORA, A SUA<br /><em>MARCA EM DESTAQUE.</em></h2>
          <p>Seu site deve ter a identidade da sua empresa, não a cara de qualquer outra.</p>
          <Action tabIndex={closingActive?undefined:-1} />
        </motion.div>
        <a className="bvr-skip-accessible" href="#sobre">Pular apresentação e ir ao conteúdo do site</a>
      </div>
    </section>
  );
}
