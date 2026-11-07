import HalftoneWordmarkFooter, { type FooterColumn } from "@/components/ui/halftone-wordmark-footer";

const contact = "https://wa.me/5543991065129?text=" + encodeURIComponent(
  "Olá! Conheci a Brandify pelo site e gostaria de conversar sobre a criação de um site."
);

export const brandifyFooterColumns: FooterColumn[] = [
  {
    title: "Explorar",
    links: [
      { label: "Estúdio", href: "/#sobre" },
      { label: "Serviços", href: "/#servicos" },
      { label: "Pacotes", href: "/#pacotes" },
    ],
  },
  {
    title: "Contato",
    links: [
      { label: "WhatsApp", href: contact },
      { label: "E-mail", href: "mailto:brandifycoo@gmail.com" },
      { label: "Instagram", href: "https://www.instagram.com/brandifycoo" },
    ],
  },
  {
    title: "Informações",
    links: [
      { label: "Privacidade", href: "/privacidade" },
      { label: "Termos de uso", href: "/termos" },
      { label: "Cookies e preferências", href: "/cookies" },
    ],
  },
];

export const brandifyFooterOptions = {
  wordmark: "brandify",
  label: "BRANDIFY",
  meta: "JACAREZINHO · PARANÁ · ©" + new Date().getFullYear(),
  columns: brandifyFooterColumns,
  backToTop: true,
  backToTopLabel: "VOLTAR AO TOPO ↑",
  palette: {
    background: "#08090D",
    ink: "#F4F4F1",
    warm: "#155DFC",
  },
  dotGap: 6,
  radius: 88,
  crop: 0.18,
  grain: 0.24,
  interactive: true,
  fontFamily: '"DM Sans", "Arial Black", Helvetica, Arial, sans-serif',
  fontWeight: 800,
  monoFamily: '"DM Sans", Arial, sans-serif',
  height: "clamp(520px, 70svh, 700px)",
} as const;

export default function BrandifyHalftoneFooter() {
  return <HalftoneWordmarkFooter {...brandifyFooterOptions} />;
}
