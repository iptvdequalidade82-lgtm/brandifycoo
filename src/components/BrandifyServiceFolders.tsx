import { ArrowUpRight } from "lucide-react";
import "./BrandifyServiceFolders.css";

const services = [
  {
    id: "institucional",
    title: "SITES",
    subtitle: "Sua empresa bem apresentada.",
    image: "/brandify-concept-institucional.svg",
    tone: "blue",
    message: "Olá! Vi os sites institucionais no site da Brandify e gostaria de conversar sobre um projeto para minha empresa.",
  },
  {
    id: "landing",
    title: "LANDING",
    subtitle: "Sua oferta em destaque.",
    image: "/brandify-concept-landing.svg",
    tone: "light",
    message: "Olá! Vi as landing pages no site da Brandify e gostaria de uma proposta para minha oferta.",
  },
  {
    id: "loja",
    title: "LOJAS",
    subtitle: "Seus produtos no lugar certo.",
    image: "/brandify-concept-loja.svg",
    tone: "dark",
    message: "Olá! Vi a opção de lojas virtuais no site da Brandify e gostaria de conversar sobre meu e-commerce.",
  },
] as const;

export default function BrandifyServiceFolders() {
  return (
    <div className="bsf-root">
      <div className="bsf-shelf">
        {services.map((service) => {
          const href = "https://wa.me/5543991065129?text=" + encodeURIComponent(service.message);
          return (
            <article className={"bsf-item bsf-" + service.tone} key={service.id}>
              <div className="bsf-folder">
                <div className="bsf-folder-shadow" aria-hidden="true" />
                <div className="bsf-folder-back" aria-hidden="true" />

                <div className="bsf-paper bsf-paper-left" aria-hidden="true">
                  <div className="bsf-paper-line" />
                  <div className="bsf-paper-line shorter" />
                  <div className="bsf-paper-box" />
                </div>
                <div className="bsf-paper bsf-paper-right" aria-hidden="true">
                  <div className="bsf-paper-square" />
                  <div className="bsf-paper-line" />
                  <div className="bsf-paper-line shorter" />
                </div>
                <div className="bsf-paper bsf-paper-preview" aria-hidden="true">
                  <img src={service.image} alt="" loading="lazy" />
                </div>

                <div className="bsf-folder-cover">
                  <div className="bsf-folder-content">
                    <h3>{service.title}</h3>
                    <div className="bsf-folder-bottom">
                      <p>{service.subtitle}</p>
                      <a
                        className="bsf-folder-arrow"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={"Conversar pelo WhatsApp sobre " + (service.id === "institucional" ? "site institucional" : service.id === "landing" ? "landing page" : "loja virtual")}
                        title={"Solicitar proposta de " + service.title.toLowerCase()}
                      >
                        <ArrowUpRight size={24} strokeWidth={1.7} aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
