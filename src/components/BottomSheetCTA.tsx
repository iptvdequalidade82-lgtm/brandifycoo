import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function BottomSheetCTA() {
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isMobile || dismissed) return;

    const handleScroll = () => {
      const scrolled = window.scrollY > window.innerHeight * 0.6;
      setVisible(scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile, dismissed]);

  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[9998] p-4 pb-6 bg-black/95 backdrop-blur-xl border-t border-white/10 safe-area-pb"
        >
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 text-white/60"
            aria-label="Fechar"
          >
            <X size={14} />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">Pronto para começar?</p>
              <p className="text-white/50 text-xs">Solicite seu orçamento agora</p>
            </div>
            <motion.a
              whileTap={{ scale: 0.95 }}
              href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--brand-gradient-from))] to-[hsl(var(--brand-gradient-to))] text-white font-bold text-sm whitespace-nowrap shadow-lg shadow-brand-accent/30"
            >
              Orçamento
              <ArrowRight size={16} />
            </motion.a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
