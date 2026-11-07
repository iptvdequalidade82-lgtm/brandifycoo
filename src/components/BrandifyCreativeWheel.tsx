import { ArrowDownRight, ArrowUpRight } from "lucide-react";
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
  return (
    <section id="direcoes" className="bcw-section" aria-labelledby="bcw-heading">
      <div className="bcw-header">
        <div>
          <p className="bcw-kicker">VISUAL, INTERAÇÃO E IDENTIDADE</p>
          <h2 id="bcw-heading">UMA IDEIA<br /><em>NUNCA É SÓ UMA IDEIA.</em></h2>
        </div>
        <p>Tipografia, cor, movimento e composição mudam como uma marca é percebida. Explore algumas direções visuais que inspiram nosso olhar.</p>
      </div>
      <div className="bcw-wheel-frame">
        <WorksWheel items={directions} theme="dark" action="" label="EXPLORAR" aria-label="Roda interativa de oito referências visuais" />
        <div className="bcw-gesture" aria-hidden="true"><ArrowDownRight size={16} /> ROLE, ARRASTE OU USE AS SETAS</div>
      </div>
      <div className="bcw-footer">
        <p>Imagens de referência visual. Não representam projetos entregues pela Brandify.</p>
        <a href="#servicos">CONHECER NOSSOS SERVIÇOS <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
