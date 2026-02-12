import logo from "@/assets/logo.jpg";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Serviços", href: "#servicos" },
  { label: "Curso", href: "/curso" },
  { label: "Trabalhe Conosco", href: "/trabalhe-conosco" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNav = (href: string) => {
    setOpen(false);
    if (href.startsWith("/")) {
      navigate(href);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/40">
      <div className="container mx-auto flex items-center justify-center h-16 px-6 gap-8">
        <a href="#inicio" className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-10 rounded-full" />
        </a>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l.href)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
            >
              {l.label}
            </button>
          ))}
          <a
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Contratar
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden glass border-t border-border px-6 pb-6 pt-4 flex flex-col gap-4 animate-fade-in">
          {navLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l.href)}
              className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer text-left"
            >
              {l.label}
            </button>
          ))}
          <a
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="font-semibold px-5 py-2 rounded-lg bg-primary text-primary-foreground text-center"
          >
            Contratar
          </a>
        </nav>
      )}
    </header>
  );
}
