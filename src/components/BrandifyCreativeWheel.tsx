import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel";
import editorial from "@/assets/reference/ref-32-designers-website.jpg";
import contrast from "@/assets/reference/ref-10-nike-editorial.jpg";
import detail from "@/assets/reference/ref-21-blue-metallic.jpg";
import image from "@/assets/reference/ref-12-agency-grid.jpg";
import color from "@/assets/reference/ref-23-cores-verde.jpg";
import motion from "@/assets/reference/ref-20-basketball-sports.jpg";
import composition from "@/assets/reference/ref-15-retro-beach.jpg";
import character from "@/assets/reference/ref-33-rabbit-color-inspiration.jpg";
import "./BrandifyCreativeWheel.css";

/** Visual directions, not client work or a list of delivered projects. */
const directions: WorksWheelItem[] = [
  { title: "Tipografia", image: editorial, alt: "Composição editorial com diferentes elementos de design" },
  { title: "Contraste", image: contrast, alt: "Referência visual de alto contraste" },
  { title: "Detalhe", image: detail, alt: "Composição metálica azul com profundidade" },
  { title: "Imagem", image, alt: "Mosaico de referências para direção de arte" },
  { title: "Cor", image: color, alt: "Estudo de cores e composição visual" },
  { title: "Movimento", image: motion, alt: "Referência de ação esportiva e composição dinâmica" },
  { title: "Composição", image: composition, alt: "Referência de estética retrô e organização de elementos" },
  { title: "Personalidade", image: character, alt: "Referência de criação visual com personalidade" },
];

export default function BrandifyCreativeWheel() {
  const sceneRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="direcoes"
      ref={sceneRef}
      data-ww-scroll-scene
      className="bcw-scroll-scene"
      aria-labelledby="bcw-heading"
    >
      <div className="bcw-viewport">
        <WorksWheel
          items={directions}
          scrollDriven
          theme="dark"
          action=""
          label="IDEIAS"
          aria-label="Oito referências visuais avançam conforme você rola a página"
        />

        <div className="bcw-overlay-heading">
          <p className="bcw-kicker">VISUAL. INTERAÇÃO. IDENTIDADE.</p>
          <h2 id="bcw-heading">IDEIAS QUE<br /><em>GANHAM FORMA.</em></h2>
          <p className="bcw-overlay-description">
            O detalhe certo muda como uma marca é percebida.
          </p>
        </div>

        <div className="bcw-overlay-bottom" aria-hidden="true">
          <div className="bcw-scroll-hint">
            <ArrowDown size={17} strokeWidth={1.6} />
            <span>CONTINUE DESCENDO PARA EXPLORAR</span>
          </div>
          <span className="bcw-reference-note">
            REFERÊNCIAS VISUAIS, NÃO PROJETOS DA BRANDIFY
          </span>
        </div>

        <div className="bcw-progress" aria-hidden="true">
          <motion.div className="bcw-progress-fill" style={{ scaleY: scrollYProgress }} />
        </div>
      </div>
    </section>
  );
}
