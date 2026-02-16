import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CursorGlow() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only on desktop
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const hide = () => setVisible(false);
    const show = () => setVisible(true);

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] mix-blend-screen"
      animate={{ x: pos.x - 150, y: pos.y - 150 }}
      transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.5 }}
    >
      <div
        className="w-[300px] h-[300px] rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, hsl(var(--brand-accent)) 0%, transparent 70%)",
        }}
      />
    </motion.div>
  );
}
