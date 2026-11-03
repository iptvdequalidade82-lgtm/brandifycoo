import { useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import referenceSprite from "./brandifyReferenceSprite";
import heroPhoto from "@/assets/reference/ref-11-underwater-laptop.jpg";
import "./BrandifyRibbonScroll.css";

const wa = "https://wa.me/5543991065129?text=" + encodeURIComponent(
  "Olá! Vi a Brandify e quero conversar sobre um site para minha empresa."
);
const cards = [
  { name: "Editorial", position: "0% 0%", source: "Referência: interface de móveis" },
  { name: "Tipografia", position: "100% 0%", source: "Referência: moda editorial" },
  { name: "Composição", position: "0% 100%", source: "Referência: design esportivo" },
  { name: "Movimento", position: "100% 100%", source: "Referência: experiência esportiva" },
  { name: "Design", position: "100% 0%", source: "Referência: moda editorial" },
  { name: "Identidade", position: "0% 0%", source: "Referência: interface de móveis" },
  { name: "Experiência", position: "100% 100%", source: "Referência: experiência esportiva" },
  { name: "Presença", position: "0% 100%", source: "Referência: design esportivo" },
];

function Action({ className = "" }: { className?: string }) {
  return (
    <a href={wa} target="_blank" rel="noopener noreferrer" className={"bvr-action " + className}>
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
      <div className="bvr-card-image" style={{ backgroundImage: "url(" + referenceSprite + ")", backgroundPosition: item.position }} />
      <div className="bvr-card-meta"><span>{item.name}</span><span>↗</span></div>
    </motion.div>
  );
}

function StaticIntro() {
  return (
    <section id="inicio" className="bvr-static">
      <div className="bvr-static-hero" style={{ backgroundImage: "linear-gradient(95deg,#05060de8,#1014238f),url(" + heroPhoto + ")" }}>
        <h1>SEU NEGÓCIO<br />MERECE UM SITE<br />À <em>ALTURA.</em></h1>
        <p>Criamos sites, landing pages e lojas virtuais para apresentar melhor sua empresa e facilitar o contato com clientes.</p>
        <Action />
      </div>
      <div className="bvr-static-reference">
        <h2>IDEIAS QUE<br /><em>SAEM DA TELA.</em></h2>
        <div className="bvr-static-gallery">
          {cards.slice(0,4).map((item, i) => (
            <div className="bvr-static-card" key={item.name}>
              <div style={{ backgroundImage:"url(" + referenceSprite + ")", backgroundPosition:item.position }} />
              <span>{String(i+1).padStart(2,"0")} — {item.name}</span>
            </div>
          ))}
        </div>
        <p>Referências visuais de terceiros, utilizadas como inspiração. Os projetos reais da Brandify são apresentados no portfólio.</p>
      </div>
    </section>
  );
}

export default function BrandifyRibbonScroll() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target:section, offset:["start start","end end"] });
  const heroOpacity = useTransform(scrollYProgress, [0,.13,.28], [1,1,0]);
  const heroY = useTransform(scrollYProgress, [0,.28], [0,-110]);
  const photoOpacity = useTransform(scrollYProgress, [0,.19,.43], [1,.6,0]);
  const titleOpacity = useTransform(scrollYProgress, [.23,.34,.73,.85], [0,1,1,0]);
  const titleX = useTransform(scrollYProgress, [.3,.83], ["-7vw","5vw"]);
  const topTitleX = useTransform(scrollYProgress, [.31,.82], ["6vw","-7vw"]);
  const closeOpacity = useTransform(scrollYProgress, [.82,.92,1], [0,1,1]);
  const closeY = useTransform(scrollYProgress, [.84,1], [55,0]);
  const progress = useTransform(scrollYProgress, [0,1], ["0%","100%"]);
  if (reduced) return <StaticIntro />;

  return (
    <section id="inicio" ref={section} className="bvr-story" aria-label="Apresentação da Brandify com referências visuais em movimento">
      <div className="bvr-stage">
        <motion.div className="bvr-photo" style={{ backgroundImage:"url(" + heroPhoto + ")", opacity:photoOpacity }} aria-hidden="true" />
        <div className="bvr-vignette" aria-hidden="true" />
        <motion.div className="bvr-hero" style={{ opacity:heroOpacity,y:heroY }}>
          <div className="bvr-hero-inner">
            <h1>SEU NEGÓCIO<br />MERECE UM SITE<br />À <em>ALTURA.</em></h1>
            <div className="bvr-hero-bottom">
              <p>Criamos sites, landing pages e lojas virtuais para apresentar melhor sua empresa e facilitar o contato com clientes.</p>
              <div><Action /><small>Primeiro, uma conversa para entender seu projeto. Sem compromisso.</small></div>
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
        <motion.div className="bvr-close" style={{opacity:closeOpacity,y:closeY}}>
          <span className="bvr-close-kicker">DO CONCEITO AO SEU PRÓPRIO SITE</span>
          <h2>AGORA, A SUA<br /><em>MARCA EM DESTAQUE.</em></h2>
          <p>As referências inspiram. O projeto precisa ter a identidade do seu negócio.</p>
          <Action />
        </motion.div>
        <div className="bvr-bottom">
          <span className="bvr-scroll-tip"><ArrowDown size={16} /> ROLE PARA EXPLORAR</span>
          <span>REFERÊNCIAS VISUAIS DE TERCEIROS — NÃO SÃO PROJETOS DA BRANDIFY</span>
          <a href="#sobre">PULAR APRESENTAÇÃO <ArrowUpRight size={14}/></a>
        </div>
        <div className="bvr-progress" aria-hidden="true"><motion.span style={{height:progress}} /></div>
      </div>
    </section>
  );
}
