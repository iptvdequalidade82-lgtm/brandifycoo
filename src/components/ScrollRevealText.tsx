import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollRevealTextProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  highlightClassName?: string;
}

export default function ScrollRevealText({
  text,
  className = "",
  highlightWords = [],
  highlightClassName = "italic bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-accent-deep",
}: ScrollRevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.3"],
  });

  const words = text.split(" ");

  return (
    <div ref={ref} className={className}>
      <span className="flex flex-wrap justify-center gap-x-[0.3em] gap-y-1">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return (
            <Word
              key={`${word}-${i}`}
              word={word}
              range={[start, end]}
              progress={scrollYProgress}
              isHighlight={highlightWords.includes(word)}
              highlightClassName={highlightClassName}
            />
          );
        })}
      </span>
    </div>
  );
}

function Word({
  word,
  range,
  progress,
  isHighlight,
  highlightClassName,
}: {
  word: string;
  range: [number, number];
  progress: any;
  isHighlight: boolean;
  highlightClassName: string;
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [8, 0]);

  return (
    <motion.span
      style={{ opacity, y }}
      className={isHighlight ? highlightClassName : ""}
    >
      {word}
    </motion.span>
  );
}
