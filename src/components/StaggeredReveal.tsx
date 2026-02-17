import { motion } from "framer-motion";

interface StaggeredRevealProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  highlightClassName?: string;
  delay?: number;
}

export default function StaggeredReveal({
  text,
  className = "",
  highlightWords = [],
  highlightClassName = "italic bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-accent-deep",
  delay = 0,
}: StaggeredRevealProps) {
  const words = text.split(" ");

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {words.map((word, i) => {
        const isHighlight = highlightWords.includes(word.replace(/[^a-zA-ZÀ-ú]/g, ""));
        return (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.4, delay: delay + i * 0.04 },
              },
            }}
            className={`inline-block mr-[0.3em] ${isHighlight ? highlightClassName : ""}`}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.span>
  );
}
