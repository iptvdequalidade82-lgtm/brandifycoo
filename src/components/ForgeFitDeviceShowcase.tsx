import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Dumbbell, UtensilsCrossed, CalendarDays } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import "./ForgeFitDeviceShowcase.css";

const LIVE_PROJECT = "https://foorgefit.life/";
const screenshot = "https://image.thum.io/get/width/1200/crop/900/noanimate/https://foorgefit.life/";

const screens = [
  { id: "semana", title: "Sua semana", subtitle: "Organize seus treinos" },
  { id: "exercicios", title: "Exercícios", subtitle: "Explore os movimentos" },
  { id: "receitas", title: "Receitas", subtitle: "Conteúdos para sua rotina" },
] as const;

function PhoneScreen({ page, next }: { page: number; next: () => void }) {
  if (page === 0) {
    const days = [
      { d: "SEG", t: "Peito + tríceps", c: true },
      { d: "TER", t: "Costas + bíceps", c: true },
      { d: "QUA", t: "Pernas", c: true },
      { d: "QUI", t: "Ombros", c: false },
    ];
    return (
      <div className="ff-showcase-app-pane">
        <span className="ff-showcase-mini-kicker">ORGANIZE SEUS TREINOS</span>
        <h4>Seu treino.<br /><em>Do seu jeito.</em></h4>
        <p>Monte sua semana de acordo com sua rotina.</p>
        <div className="ff-showcase-week">
          {days.map((day) => (
            <div className="ff-showcase-week-row" key={day.d}>
              <span>{day.d}</span>
              <strong>{day.t}</strong>
              <span className={day.c ? "ff-showcase-week-dot active" : "ff-showcase-week-dot"} aria-hidden="true" />
            </div>
          ))}
        </div>
        <button className="ff-showcase-app-action" onClick={next} type="button">
          VER EXERCÍCIOS <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    );
  }
  if (page === 1) {
    const activities = [
      { title: "Treino de peito", detail: "Demonstrações e execução", icon: "01" },
      { title: "Treino de pernas", detail: "Escolha seus equipamentos", icon: "02" },
      { title: "Treino de costas", detail: "Monte sua combinação", icon: "03" },
    ];
    return (
      <div className="ff-showcase-app-pane">
        <span className="ff-showcase-mini-kicker">BIBLIOTECA DE TREINOS</span>
        <h4>Aprenda cada<br /><em>movimento.</em></h4>
        <p>Exercícios, equipamentos e demonstrações em um só lugar.</p>
        <div className="ff-showcase-exercise-list">
          {activities.map((item) => (
            <div className="ff-showcase-exercise" key={item.title}>
              <span className="ff-showcase-exercise-number">{item.icon}</span>
              <span><strong>{item.title}</strong><small>{item.detail}</small></span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </div>
          ))}
        </div>
        <button className="ff-showcase-app-action" onClick={next} type="button">
          EXPLORAR RECEITAS <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    );
  }
  return (
    <div className="ff-showcase-app-pane">
      <span className="ff-showcase-mini-kicker">ROTINA COMPLETA</span>
      <h4>Treino e<br /><em>alimentação.</em></h4>
      <p>Conteúdos práticos para complementar seus treinos.</p>
      <div className="ff-showcase-recipe-visual" aria-hidden="true">
        <div className="ff-showcase-recipe-circle"><UtensilsCrossed size={29} strokeWidth={1.5} /></div>
        <span>RECEITAS<br />PARA SUA<br />ROTINA.</span>
      </div>
      <button className="ff-showcase-app-action" onClick={next} type="button">
        VOLTAR AO INÍCIO <ArrowRight size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Interactive concept illustrating real capabilities; not a recording of the paid application. */
export default function ForgeFitDeviceShowcase() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [screenshotFailed, setScreenshotFailed] = useState(false);
  const startX = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start end", "end start"] });
  const laptopY = useTransform(scrollYProgress, [0, 1], [34, -24]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [48, -35]);
  const phoneRotate = useTransform(scrollYProgress, [0, .5, 1], [-5, -2.5, 0]);

  const next = () => setPage(i => (i + 1) % screens.length);
  const prev = () => setPage(i => (i - 1 + screens.length) % screens.length);
  const startSwipe = (x: number) => { startX.current = x; };
  const endSwipe = (x: number) => {
    if (startX.current !== null) {
      const delta = x - startX.current;
      if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
    }
    startX.current = null;
  };

  return (
    <div className="ff-showcase" ref={sceneRef}>
      <div className="ff-showcase-topline">
        <span>FORGE FIT / EXPERIÊNCIA DIGITAL</span>
        <span>DESKTOP + MOBILE</span>
      </div>

      <div className="ff-showcase-heading">
        <div>
          <p>UMA EXPERIÊNCIA. TODAS AS TELAS.</p>
          <h3>O DESIGN<br />NÃO PARA <em>NO DESKTOP.</em></h3>
        </div>
        <p className="ff-showcase-heading-description">
          Uma presença digital precisa funcionar onde seu cliente estiver. Explore uma demonstração inspirada nas funcionalidades do Forge Fit.
        </p>
      </div>

      <div className="ff-showcase-stage">
        <div className="ff-showcase-glow" aria-hidden="true" />
        <span className="ff-showcase-stage-label ff-showcase-stage-label-left" aria-hidden="true">01 / TELA GRANDE</span>
        <span className="ff-showcase-stage-label ff-showcase-stage-label-right" aria-hidden="true">02 / NA PALMA DA MÃO</span>

        <motion.div style={reducedMotion ? undefined : { y: laptopY }} className="ff-showcase-laptop" aria-label="Prévia do site público do Forge Fit em um notebook">
          <div className="ff-showcase-laptop-lid">
            <div className="ff-showcase-camera" aria-hidden="true" />
            <div className="ff-showcase-laptop-screen">
              <div className="ff-showcase-fallback" aria-hidden="true">
                <div className="ff-showcase-fallback-nav"><span>FORGE<span>FIT.</span></span><small>SEU TREINO. DO SEU JEITO.</small></div>
                <div className="ff-showcase-fallback-center">
                  <span>SEU TREINO.<br />DO SEU JEITO.</span>
                  <small>ORGANIZE SUA SEMANA. ESCOLHA SEUS EXERCÍCIOS.</small>
                  <div className="ff-showcase-fallback-button">CONHEÇA O FORGE FIT</div>
                </div>
                <div className="ff-showcase-fallback-grid"><i/><i/><i/></div>
              </div>
              {!screenshotFailed && (
                <img
                  className="ff-showcase-live-snapshot"
                  src={screenshot}
                  alt="Captura da página pública do Forge Fit"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setScreenshotFailed(true)}
                />
              )}
            </div>
          </div>
          <div className="ff-showcase-laptop-base" aria-hidden="true"><div className="ff-showcase-laptop-notch" /></div>
        </motion.div>

        <motion.div
          style={reducedMotion ? undefined : { y: phoneY, rotate: phoneRotate }}
          className="ff-showcase-phone"
          aria-label="Demonstração interativa ilustrativa das funcionalidades do Forge Fit"
          onTouchStart={e => startSwipe(e.touches[0].clientX)}
          onTouchEnd={e => endSwipe(e.changedTouches[0].clientX)}
          onMouseDown={e => startSwipe(e.clientX)}
          onMouseUp={e => endSwipe(e.clientX)}
        >
          <div className="ff-showcase-phone-glass">
            <div className="ff-showcase-phone-status"><span>9:41</span><span className="ff-showcase-phone-camera" aria-hidden="true" /><span>▂ ▄ ▆</span></div>
            <div className="ff-showcase-app-header"><span>FORGE<strong>FIT.</strong></span><small>EXPERIÊNCIA FITNESS</small></div>
            <div className="ff-showcase-phone-page">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={page} className="ff-showcase-slide"
                  initial={reducedMotion ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, x: -24 }}
                  transition={{ duration: reducedMotion ? 0 : .28, ease: "easeOut" }}
                >
                  <PhoneScreen page={page} next={next} />
                </motion.div>
              </AnimatePresence>
            </div>
            <nav className="ff-showcase-phone-tabs" aria-label="Explorar a experiência ilustrativa do Forge Fit">
              {screens.map((item, idx) => (
                <button key={item.id} onClick={() => setPage(idx)} type="button" className={page === idx ? "active" : ""} aria-current={page === idx ? "page" : undefined} aria-label={item.title}>
                  {idx === 0 ? <CalendarDays size={17} aria-hidden="true"/> : idx === 1 ? <Dumbbell size={17} aria-hidden="true"/> : <UtensilsCrossed size={17} aria-hidden="true" />}
                  <span>{item.title}</span>
                </button>
              ))}
            </nav>
            <div className="ff-showcase-phone-indicator" aria-hidden="true" />
          </div>
        </motion.div>

        <div className="ff-showcase-motion-callout">
          <span className="ff-showcase-pulse" aria-hidden="true" />
          <span>TOQUE NAS ABAS DO CELULAR<br />OU DESLIZE PARA EXPLORAR</span>
        </div>
        <div className="ff-showcase-stage-number" aria-hidden="true">02</div>
      </div>

      <div className="ff-showcase-footer">
        <div className="ff-showcase-stepper" aria-label="Trocar demonstração">
          <button onClick={prev} type="button" aria-label="Tela anterior"><ChevronLeft size={22} /></button>
          <span>0{page + 1} <i>/</i> 0{screens.length}</span>
          <button onClick={next} type="button" aria-label="Próxima tela"><ChevronRight size={22} /></button>
        </div>
        <p>* Demonstração ilustrativa das funções. Conheça a experiência original no site do projeto.</p>
        <a href={LIVE_PROJECT} target="_blank" rel="noopener noreferrer">EXPLORAR O FORGE FIT <ArrowUpRight size={19} aria-hidden="true" /></a>
      </div>
    </div>
  );
}
