import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.jpg";

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Only show splash on first visit per session
    const seen = sessionStorage.getItem("splash-seen");
    if (seen) {
      setShow(false);
      return;
    }
    sessionStorage.setItem("splash-seen", "1");
    const t = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] bg-black flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <motion.img
              src={logo}
              alt="Brandify"
              className="w-20 h-20 rounded-full ring-2 ring-white/20"
              animate={{
                boxShadow: [
                  "0 0 0px hsl(224 76% 33% / 0)",
                  "0 0 60px hsl(224 76% 33% / 0.4)",
                  "0 0 0px hsl(224 76% 33% / 0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeInOut" }}
              className="h-[2px] bg-gradient-to-r from-transparent via-brand-accent to-transparent rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
