import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { startMarketingPixel, stopMarketingPixel } from "@/lib/marketingPixel";
import "./CookieConsent.css";

const STORAGE_KEY = "brandify-consent-2026-v1";
const POLICY_VERSION = 1;
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
type Choice = "accepted" | "rejected";
type SavedChoice = { version: number; choice: Choice; at: number };

function readChoice(): Choice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedChoice;
    if (saved.version !== POLICY_VERSION || Date.now() - saved.at > MAX_AGE) return null;
    return saved.choice === "accepted" || saved.choice === "rejected" ? saved.choice : null;
  } catch {
    return null;
  }
}
function saveChoice(choice: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: POLICY_VERSION, choice, at: Date.now(),
    } satisfies SavedChoice));
  } catch {
    // The choice still applies to this page session if storage is disabled.
  }
}

export default function CookieConsent() {
  const location = useLocation();
  const [choice, setChoice] = useState<Choice | null>(readChoice);
  const [visible, setVisible] = useState(() => readChoice() === null);
  const [detailed, setDetailed] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const isPublicPage = ["/", "/privacidade", "/termos", "/cookies"].includes(location.pathname);

  useEffect(() => {
    if (choice === "accepted" && location.pathname === "/") startMarketingPixel();
  }, [choice, location.pathname]);

  useEffect(() => {
    const open = () => {
      setMarketing(choice === "accepted");
      setDetailed(true);
      setVisible(true);
    };
    window.addEventListener("brandify:cookie-preferences", open);
    return () => window.removeEventListener("brandify:cookie-preferences", open);
  }, [choice]);

  function apply(next: Choice) {
    const revoked = choice === "accepted" && next === "rejected";
    saveChoice(next);
    setChoice(next);
    setVisible(false);
    setDetailed(false);
    if (revoked) stopMarketingPixel();
  }

  if (!isPublicPage || !visible) return null;

  return (
    <aside className="bck-panel" aria-label="Preferências de privacidade e cookies">
      <div className="bck-heading">
        <h2>Sua privacidade importa.</h2>
        <p>Utilizamos armazenamento necessário para lembrar suas escolhas. Com sua autorização, também podemos ativar o Meta Pixel para medir visitas e campanhas. Você pode recusar sem prejudicar a navegação.</p>
      </div>
      {detailed && <div className="bck-categories">
        <div className="bck-category">
          <div><strong>Necessários</strong><span>Preferências e funções essenciais do site.</span></div>
          <span className="bck-fixed">Sempre ativos</span>
        </div>
        <label className="bck-category bck-toggle-row">
          <div><strong>Publicidade e medição</strong><span>Meta Pixel e tecnologias relacionadas. Desativado por padrão.</span></div>
          <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} />
          <span className="bck-switch" aria-hidden="true" />
        </label>
      </div>}
      <div className="bck-actions">
        <button type="button" className="bck-reject" onClick={() => apply("rejected")}>Recusar opcionais</button>
        {!detailed && <button type="button" className="bck-settings" onClick={() => {setMarketing(choice === "accepted");setDetailed(true);}}>Configurar</button>}
        {detailed
          ? <button type="button" className="bck-accept" onClick={() => apply(marketing ? "accepted" : "rejected")}>Salvar escolhas</button>
          : <button type="button" className="bck-accept" onClick={() => apply("accepted")}>Aceitar opcionais</button>}
      </div>
      <div className="bck-legal"><a href="/privacidade">Privacidade</a><a href="/cookies">Cookies</a></div>
    </aside>
  );
}
