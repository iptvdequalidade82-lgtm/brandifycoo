import { motion } from "framer-motion";

const techs = [
  "React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js",
  "WordPress", "Nuvemshop", "Figma", "SEO", "UI/UX Design",
  "Performance", "Responsivo", "SSL", "Analytics", "E-commerce",
];

export default function TechMarquee() {
  const doubled = [...techs, ...techs];

  return (
    <section className="relative py-12 overflow-hidden bg-black border-y border-white/[0.06]">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {doubled.map((tech, i) => (
          <span
            key={`${tech}-${i}`}
            className="flex items-center gap-3 text-sm font-medium tracking-wide text-white/25 hover:text-white/60 transition-colors duration-500 select-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/40" />
            {tech}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
