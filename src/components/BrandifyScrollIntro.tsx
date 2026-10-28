import { useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Dumbbell, UtensilsCrossed } from "lucide-react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import heroPhoto from "@/assets/reference/ref-11-underwater-laptop.jpg";
import "./BrandifyScrollIntro.css";

const contactNumber = "5543991065129";
const projectContact = "https://wa.me/" + contactNumber + "?text=" + encodeURIComponent("Olá! Conheci a Brandify e quero tirar meu projeto do papel.");
const forgeFitUrl = "https://foorgefit.life/";
const forgeFitSnapshot = "https://image.thum.io/get/width/1200/crop/850/noanimate/https://foorgefit.life/";

function PrimaryAction({ className = "", tabIndex }: { className?: string; tabIndex?: number }) {
  return (
    <a className={"bsi-primary-action " + className} href={projectContact} target="_blank" rel="noopener noreferrer" tabIndex={tabIndex}>
      <span>TIRAR MEU PROJETO DO PAPEL</span>
      <span className="bsi-primary-icon"><ArrowUpRight size={22} aria-hidden="true" /></span>
    </a>
  );
}

function DesktopPreview() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="bsi-desktop" aria-label="Notebook apresentando o site do Forge Fit">
      <div className="bsi-desktop-frame">
        <div className="bsi-camera" aria-hidden="true" />
        <div className="bsi-desktop-display">
          <div className="bsi-desktop-fallback">
            <div className="bsi-fallback-header"><strong>FORGE<span>FIT</span></strong><small>UMA ROTINA MAIS ORGANIZADA</small></div>
            <div className="bsi-fallback-content">
              <span>SEU TREINO.<br />DO SEU JEITO.</span>
              <small>EXERCÍCIOS, CRONOGRAMAS E CONTEÚDOS PARA SUA ROTINA.</small>
              <span className="bsi-fallback-pill">CONHEÇA A PLATAFORMA <ArrowRight size={12} /></span>
            </div>
            <div className="bsi-fallback-panels"><i/><i/><i/></div>
          </div>
          {!failed && <img src={forgeFitSnapshot} alt="Captura da página pública do Forge Fit" loading="eager" decoding="async" onError={() => setFailed(true)} />}
        </div>
      </div>
      <div className="bsi-desktop-chassis" aria-hidden="true"><span /></div>
    </div>
  );
}

function PhonePreview({ progress01, progress12 }: { progress01: MotionValue<number>; progress12: ReturnType<typeof useTransform<number, number>> }) {
  return (
    <div className="bsi-phone" aria-label="Conceito visual ilustrativo do Forge Fit em celular">
      <div className="bsi-phone-glass">
        <div className="bsi-phone-status"><span>9:41</span><span className="bsi-phone-island" /><span>▂ ▄ ▆</span></div>
        <div className="bsi-phone-nav"><strong>FORGE<span>FIT.</span></strong><small>PLATAFORMA FITNESS</small></div>
        <div className="bsi-phone-content">
          <motion.div className="bsi-phone-slide" style={{ opacity: progress01 }}>
            <span className="bsi-phone-kicker">TREINE COM ORGANIZAÇÃO</span>
            <h4>Seu treino.<br /><em>Seu ritmo.</em></h4>
            <p>Escolha os dias e organize sua semana.</p>
            <div className="bsi-phone-week">
              <div><span>SEG</span><strong>Peito e tríceps</strong><i/></div>
              <div><span>TER</span><strong>Costas e bíceps</strong><i/></div>
              <div><span>QUA</span><strong>Pernas</strong><i/></div>
              <div><span>QUI</span><strong>Ombros</strong><i/></div>
            </div>
            <span className="bsi-phone-ui-button">ORGANIZAR TREINOS <ArrowRight size={12}/></span>
          </motion.div>
          <motion.div className="bsi-phone-slide" style={{ opacity: progress12 }}>
            <span className="bsi-phone-kicker">BIBLIOTECA DE EXERCÍCIOS</span>
            <h4>Aprenda cada<br /><em>movimento.</em></h4>
            <p>Descubra opções e acompanhe a execução.</p>
            <div className="bsi-phone-exercises">
              <div><span><Dumbbell size={17}/></span><strong>Peito e tríceps</strong><ArrowUpRight size={12}/></div>
              <div><span><Dumbbell size={17}/></span><strong>Pernas</strong><ArrowUpRight size={12}/></div>
              <div><span><UtensilsCrossed size={17}/></span><strong>Receitas e rotina</strong><ArrowUpRight size={12}/></div>
            </div>
            <span className="bsi-phone-ui-button">EXPLORAR O CONTEÚDO <ArrowRight size={12}/></span>
          </motion.div>
        </div>
        <div className="bsi-phone-bottom-nav">
          <span><CalendarDays size={15}/> TREINOS</span>
          <span><Dumbbell size={15}/> EXERCÍCIOS</span>
          <span><UtensilsCrossed size={15}/> RECEITAS</span>
        </div>
        <div className="bsi-phone-indicator"/>
      </div>
    </div>
  );
}

function ReducedMotionIntro() {
  return (
    <section id="inicio" className="bsi-static" aria-label="Apresentação da Brandify">
      <div className="bsi-static-bg" style={{ backgroundImage: "url(" + heroPhoto + ")" }} aria-hidden="true" />
      <div className="bsi-static-hero">
        <h1>SUA MARCA<br/>NÃO NASCEU<br/>PRA SER <em>COMUM.</em></h1>
        <p>Criamos sites, landing pages e lojas virtuais com design de verdade — para negócios que querem ser percebidos.</p>
        <PrimaryAction/>
      </div>
    </section>
  );
}

export default function BrandifyScrollIntro() {
  const storyRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [heroInteractive, setHeroInteractive] = useState(true);
  const [conclusionInteractive, setConclusionInteractive] = useState(false);
  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });

  const heroOpacity = useTransform(scrollYProgress, [0, .13, .30], [1, 1, 0]);
  const heroLift = useTransform(scrollYProgress, [0, .3], [0, -105]);
  const photoOpacity = useTransform(scrollYProgress, [0, .25, .46], [1, .55, .08]);
  const photoZoom = useTransform(scrollYProgress, [0, .5], [1.01, 1.25]);
  const desktopOpacity = useTransform(scrollYProgress, [.17, .34, .76, .95], [0, 1, 1, .12]);
  const desktopY = useTransform(scrollYProgress, [.17, .39, .7, 1], [170, 0, -18, -72]);
  const desktopScale = useTransform(scrollYProgress, [.16, .43, .7, .97], [.69, 1.02, .95, .77]);
  const desktopRotate = useTransform(scrollYProgress, [.18, .43, .9], [7, 0, -3]);
  const phoneOpacity = useTransform(scrollYProgress, [.37, .54, .83, .96], [0, 1, 1, .12]);
  const phoneY = useTransform(scrollYProgress, [.36, .56, .82, .97], [200, -6, -13, -70]);
  const phoneX = useTransform(scrollYProgress, [.34, .57, .85], [110, 0, -10]);
  const phoneRotate = useTransform(scrollYProgress, [.35, .58, .84], [18, -7, -3]);
  const phoneScale = useTransform(scrollYProgress, [.35, .58, .86, 1], [.72, 1, 1.04, .75]);
  const messageOne = useTransform(scrollYProgress, [.25, .37, .48, .56], [0, 1, 1, 0]);
  const messageTwo = useTransform(scrollYProgress, [.51, .62, .74, .81], [0, 1, 1, 0]);
  const closeOpacity = useTransform(scrollYProgress, [.81, .91, 1], [0, 1, 1]);
  const closeY = useTransform(scrollYProgress, [.82, .97], [36, 0]);
  const phoneA = useTransform(scrollYProgress, [.59, .68, .70], [1, 1, 0]);
  const phoneB = useTransform(scrollYProgress, [.63, .73, .85], [0, 1, 1]);
  const progressFill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  useMotionValueEvent(scrollYProgress, "change", latest => {
    setHeroInteractive(latest < .22);
    setConclusionInteractive(latest > .85);
  });

  if (reducedMotion) return <ReducedMotionIntro />;

  return (
    <section ref={storyRef} id="inicio" className="bsi-story" aria-label="Experiência visual da Brandify controlada pela rolagem">
      <div className="bsi-sticky-scene">
        <motion.div className="bsi-scene-photo" style={{ backgroundImage: "url(" + heroPhoto + ")", opacity: photoOpacity, scale: photoZoom }} aria-hidden="true" />
        <div className="bsi-scene-wash" aria-hidden="true"/>
        <div className="bsi-scene-light" aria-hidden="true"/>

        <motion.div className="bsi-opening" aria-hidden={!heroInteractive} style={{ opacity: heroOpacity, y: heroLift, pointerEvents: heroInteractive ? "auto" : "none" }}>
          <div className="bsi-opening-body">
            <h1>SUA MARCA<br />NÃO NASCEU<br />PRA SER <em>COMUM.</em></h1>
            <div className="bsi-opening-foot">
              <p>Criamos sites, landing pages e lojas virtuais com design de verdade — para negócios que querem ser percebidos.</p>
              <PrimaryAction tabIndex={heroInteractive ? undefined : -1} />
            </div>
          </div>
        </motion.div>

        <div className="bsi-device-scene" aria-label="A apresentação mostra a experiência desktop e mobile de um projeto digital">
          <motion.div className="bsi-desktop-motion" style={{ opacity: desktopOpacity, y: desktopY, scale: desktopScale, rotate: desktopRotate }}>
            <DesktopPreview />
          </motion.div>
          <motion.div className="bsi-phone-motion" style={{ opacity: phoneOpacity, y: phoneY, x: phoneX, rotate: phoneRotate, scale: phoneScale }}>
            <PhonePreview progress01={phoneA} progress12={phoneB}/>
          </motion.div>
        </div>

        <motion.div className="bsi-caption bsi-caption-desktop" style={{ opacity: messageOne }}>
          <span className="bsi-caption-tag">DESIGN + DESENVOLVIMENTO</span>
          <h2>PRIMEIRO,<br /><em>IMPRESSÃO.</em></h2>
          <p>Um site profissional começa com uma presença que faz as pessoas prestarem atenção.</p>
        </motion.div>
        <motion.div className="bsi-caption bsi-caption-mobile" style={{ opacity: messageTwo }}>
          <span className="bsi-caption-tag">DO DESKTOP AO CELULAR</span>
          <h2>DEPOIS,<br /><em>EXPERIÊNCIA.</em></h2>
          <p>A mesma atenção aos detalhes em cada tamanho de tela.</p>
        </motion.div>

        <motion.div className="bsi-conclusion" aria-hidden={!conclusionInteractive} style={{ opacity: closeOpacity, y: closeY, pointerEvents: conclusionInteractive ? "auto" : "none" }}>
          <span>DESIGN QUE FUNCIONA EM CADA TELA</span>
          <h2>AGORA, IMAGINE<br /><em>O SEU NEGÓCIO AQUI.</em></h2>
          <div className="bsi-conclusion-links">
            <PrimaryAction tabIndex={conclusionInteractive ? undefined : -1} />
            <a tabIndex={conclusionInteractive ? undefined : -1} href={forgeFitUrl} target="_blank" rel="noopener noreferrer">VER O PROJETO REAL <ArrowUpRight size={19} aria-hidden="true" /></a>
          </div>
        </motion.div>

        <div className="bsi-scroll-hint" aria-hidden="true"><ArrowDown size={18}/><span>ROLE PARA EXPLORAR</span></div>
        <a href="#sobre" className="bsi-skip-story">PULAR APRESENTAÇÃO <ArrowUpRight size={14}/></a>
        <div className="bsi-progress" aria-hidden="true"><motion.span style={{ height: progressFill }}/></div>
        <div className="bsi-screen-note" aria-hidden="true">TELAS ILUSTRATIVAS · PROJETO FORGE FIT</div>
      </div>
    </section>
  );
}
