import { ArrowUpRight } from "lucide-react";
import "./BrandifyWaveHero.css";

const contact = "https://wa.me/5543991065129?text=" + encodeURIComponent(
  "Olá! Conheci o site da Brandify e gostaria de conversar sobre um site para minha empresa."
);

const waves = Array.from({ length: 34 }, (_, i) => {
  const y = 128 + i * 15.5;
  const rise = Math.sin(i * .26) * 48;
  const sway = i * 3.6;
  return {
    key: i,
    opacity: .11 + Math.cos(i * .22) * .055,
    d: "M -260 " + (y + 240).toFixed(1) +
      " C 170 " + (y - 290 + rise).toFixed(1) +
      " 410 " + (y + 310 - sway).toFixed(1) +
      " 800 " + (y - 45 + rise).toFixed(1) +
      " S 1420 " + (y + 120 - sway).toFixed(1) +
      " 1760 " + (y - 170).toFixed(1),
  };
});

/**
 * A single quiet, full-bleed hero. The low-contrast wave illustration is
 * deliberately abstract: it is not a fabricated customer project.
 */
export default function BrandifyWaveHero() {
  return (
    <section id="inicio" className="bw-hero" aria-labelledby="bw-heading">
      <div className="bw-ambient" aria-hidden="true">
        <svg className="bw-waves" viewBox="0 0 1500 920" preserveAspectRatio="xMidYMid slice" fill="none">
          <defs>
            <linearGradient id="bw-wave-stroke" x1="0" y1=".2" x2="1" y2=".85">
              <stop offset="0%" stopColor="#51555b" stopOpacity="0" />
              <stop offset="36%" stopColor="#8b9197" stopOpacity=".45" />
              <stop offset="68%" stopColor="#4c545e" stopOpacity=".58" />
              <stop offset="100%" stopColor="#535b65" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="bw-soft-shade" cx="53%" cy="54%" r="57%">
              <stop offset="0%" stopColor="#535c68" stopOpacity=".26" />
              <stop offset="100%" stopColor="#090a0b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="800" cy="530" rx="780" ry="490" fill="url(#bw-soft-shade)" />
          <g className="bw-wave-lines" transform="rotate(-8 750 460)">
            {waves.map(w => (
              <path key={w.key} d={w.d} stroke="url(#bw-wave-stroke)" strokeWidth="1.1" opacity={w.opacity} />
            ))}
          </g>
        </svg>
      </div>
      <div className="bw-hero-shade" aria-hidden="true" />
      <div className="bw-container">
        <h1 id="bw-heading">UM SITE À ALTURA<br />DO SEU <span>NEGÓCIO.</span></h1>
        <div className="bw-hero-details">
          <p>Criamos sites institucionais, landing pages e lojas virtuais para apresentar melhor sua empresa e facilitar o contato com novos clientes.</p>
          <a href={contact} className="bw-hero-cta" target="_blank" rel="noopener noreferrer">
            <span>CONVERSAR SOBRE MEU SITE</span>
            <span className="bw-cta-icon"><ArrowUpRight size={19} aria-hidden="true" /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
