import logo from "@/assets/logo.jpg";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import UserMenu from "@/components/UserMenu";

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Projetos", href: "/projetos" },
  { label: "Cursos", href: "/curso" },
  { label: "Investimento", href: "#investimento" },
  { label: "Trabalhe Conosco", href: "/trabalhe-conosco" },
  { label: "Quem Somos", href: "/quem-somos" },
  { label: "IAs", href: "/ias", highlight: true },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  // On non-home pages, always use scrolled (solid) style
  const useTransparent = isHome && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
    if (href.startsWith("/")) {
      navigate(href);
    } else if (href.startsWith("#")) {
      // If not on homepage, navigate there first
      if (location.pathname !== "/") {
        navigate("/" + href);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        useTransparent
          ? "bg-transparent backdrop-blur-none border-none shadow-none"
          : "bg-black/90 backdrop-blur-xl border-b border-white/10"
      }`}
    >
      <div className="container mx-auto flex items-center justify-center h-16 px-6 lg:px-12 relative">
        <a href="#inicio" onClick={(e) => { e.preventDefault(); handleNav("#inicio"); }} className="absolute left-6 lg:left-12 flex items-center gap-3">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={logo}
            alt="Brandify - Criação de Sites Profissionais"
            className={`h-10 w-10 rounded-full ring-1 ${useTransparent ? 'ring-white/30' : 'ring-white/20'}`}
            width={40}
            height={40}
          />
        </a>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l.href)}
              className={`text-sm bg-transparent border-none cursor-pointer gentle-animation hover:scale-105 font-medium ${
                (l as any).highlight
                  ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-transparent bg-clip-text font-semibold hover:from-blue-400 hover:to-violet-400'
                  : useTransparent ? 'text-white/80 hover:text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              {(l as any).highlight && <span className="mr-1">✨</span>}
              {l.label}
            </button>
          ))}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-semibold px-5 py-2.5 rounded-lg gentle-animation ${
              useTransparent ? 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30' : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            Contratar
          </motion.a>
          <UserMenu />
        </nav>

        {/* Mobile: avatar + toggle */}
        <div className="md:hidden absolute right-6 flex items-center gap-2">
          <UserMenu />
          <button
            className={`p-2 ${useTransparent ? 'text-white' : 'text-white'}`}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 px-6 pb-6 pt-4 flex flex-col gap-4 animate-fade-in">
          {navLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l.href)}
              className="text-white/70 hover:text-white gentle-animation bg-transparent border-none cursor-pointer text-left font-medium text-lg px-4 py-3 hover:bg-white/10 rounded-lg"
            >
              {l.label}
            </button>
          ))}
          <a
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="font-semibold px-5 py-3 rounded-lg bg-white text-black text-center gentle-animation mt-4"
          >
            Contratar
          </a>
        </nav>
      )}
    </motion.header>
  );
}
