import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (scope.current) {
      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration: duration,
          delay: stagger(0.2),
        }
      );
    }
  }, [scope.current]);

  return (
    <div className={cn("font-light", className)}>
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => (
          <motion.span
            key={word + idx}
            className="text-white/70 opacity-0 inline-block mr-[0.3em]"
            style={{
              filter: filter ? "blur(8px)" : "none",
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};
