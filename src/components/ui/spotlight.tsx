import React from "react";
import { motion } from "framer-motion";

type SpotlightProps = {
  gradientFirst?: string;
  gradientSecond?: string;
  gradientThird?: string;
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
  xOffset?: number;
};

export const Spotlight = ({
  gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(224, 76%, 48%, .15) 0, hsla(224, 76%, 33%, .04) 50%, hsla(224, 76%, 33%, 0) 80%)",
  gradientSecond = "radial-gradient(50% 50% at 50% 50%, hsla(224, 76%, 48%, .08) 0, hsla(224, 76%, 33%, .03) 80%, transparent 100%)",
  gradientThird = "radial-gradient(50% 50% at 50% 50%, hsla(217, 91%, 53%, .06) 0, hsla(217, 91%, 53%, .02) 80%, transparent 100%)",
  translateY = -350,
  width = 560,
  height = 1380,
  smallWidth = 240,
  duration = 7,
  xOffset = 100,
}: SpotlightProps = {}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.2 }}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Left spotlight */}
      <div
        className="absolute top-0 left-0 z-40"
        style={{ transform: `translateY(${translateY}px)` }}
      >
        <motion.div
          animate={{ x: [0, xOffset, 0] }}
          transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
            transformOrigin: "top center",
            transform: "rotate(-45deg)",
          }}
        />
        <motion.div
          animate={{ x: [0, xOffset * 0.8, 0] }}
          transition={{ duration: duration * 0.9, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          style={{
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
            transformOrigin: "top center",
            transform: "rotate(-45deg) translateX(5px)",
          }}
          className="absolute top-0 left-[80px]"
        />
        <motion.div
          animate={{ x: [0, xOffset * 0.6, 0] }}
          transition={{ duration: duration * 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
            transformOrigin: "top center",
            transform: "rotate(-45deg) translateX(10px)",
          }}
          className="absolute top-0 left-[160px]"
        />
      </div>

      {/* Right spotlight */}
      <div
        className="absolute top-0 right-0 z-40"
        style={{ transform: `translateY(${translateY}px) scaleX(-1)` }}
      >
        <motion.div
          animate={{ x: [0, -xOffset, 0] }}
          transition={{ duration: duration * 1.1, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
            transformOrigin: "top center",
            transform: "rotate(-45deg)",
          }}
        />
        <motion.div
          animate={{ x: [0, -xOffset * 0.7, 0] }}
          transition={{ duration, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
          style={{
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
            transformOrigin: "top center",
            transform: "rotate(-45deg) translateX(5px)",
          }}
          className="absolute top-0 left-[80px]"
        />
      </div>
    </motion.div>
  );
};
