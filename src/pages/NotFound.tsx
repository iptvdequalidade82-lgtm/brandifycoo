import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.warn("Página não encontrada:", location.pathname);
  }, [location.pathname]);

  return (
    <main lang="pt-BR" style={{ minHeight: "100vh", background: "#0b0c0f", color: "#f5f6f7", display: "grid", placeItems: "center", padding: "32px", fontFamily: "'DM Sans', Arial, sans-serif" }}>
      <div style={{ maxWidth: "590px" }}>
        <p style={{ color: "#b3b7c1", fontSize: "14px", marginBottom: "16px" }}>ERRO 404</p>
        <h1 style={{ fontSize: "clamp(44px, 8vw, 90px)", lineHeight: "1.05", letterSpacing: "-.05em", margin: "0 0 22px" }}>NÃO ENCONTRAMOS ESSA PÁGINA.</h1>
        <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#c8cbd2", marginBottom: "33px" }}>O endereço pode ter mudado. Você pode voltar para a Brandify e conhecer nossos serviços.</p>
        <a href="/" style={{ display: "inline-block", background: "#155dfc", color: "#fff", textDecoration: "none", padding: "17px 24px", fontSize: "13px", fontWeight: "700" }}>VOLTAR AO INÍCIO</a>
      </div>
    </main>
  );
}
