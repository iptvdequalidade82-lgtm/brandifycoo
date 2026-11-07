import { useRef } from "react";
import { useScroll } from "framer-motion";
import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel";
import "./BrandifyCreativeWheel.css";

/** Original interface concepts created for the Brandify visual presentation. */
const directions: WorksWheelItem[] = [
  { title: "Institucional", image: "/brandify-concept-institucional.svg", alt: "Conceito de site institucional com apresentação empresarial e contato" },
  { title: "Landing Page", image: "/brandify-concept-landing.svg", alt: "Conceito de landing page com oferta e botão de ação" },
  { title: "Loja Virtual", image: "/brandify-concept-loja.svg", alt: "Conceito de loja virtual com produtos e navegação de catálogo" },
  { title: "Saúde", image: "/brandify-concept-clinica.svg", alt: "Conceito de site de clínica com informações de atendimento" },
  { title: "Imóveis", image: "/brandify-concept-imoveis.svg", alt: "Conceito de site imobiliário com apresentação de imóveis" },
  { title: "Gastronomia", image: "/brandify-concept-restaurante.svg", alt: "Conceito de página para restaurante com chamada de reserva" },
  { title: "Tecnologia", image: "/brandify-concept-tecnologia.svg", alt: "Conceito de página de tecnologia com uma interface digital" },
  { title: "Moda", image: "/brandify-concept-moda.svg", alt: "Conceito de e-commerce de moda com apresentação de produtos" },
];

export default function BrandifyCreativeWheel() {
  const sceneRef = useRef<HTMLElement>(null);
  useScroll({ target: sceneRef, offset: ["start start", "end end"] });

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
          aria-label="Exemplos de oito conceitos visuais de sites que avançam conforme a rolagem"
        />
        <div className="bcw-overlay-heading">
          <h2 id="bcw-heading">IDEIAS QUE<br /><em>GANHAM FORMA.</em></h2>
        </div>
      </div>
    </section>
  );
}
