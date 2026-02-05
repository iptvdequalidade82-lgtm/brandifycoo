import post1 from "@/assets/post-1.jpg";
import post2 from "@/assets/post-2.jpg";
import post3 from "@/assets/post-3.jpg";
import post4 from "@/assets/post-4.jpg";
import post5 from "@/assets/post-5.jpg";
import { Instagram } from "lucide-react";

const posts = [
  { src: post1, alt: "Vale a pena investir em um site institucional?" },
  { src: post2, alt: "Atrair clientes sem site profissional é sabor faturamento" },
  { src: post3, alt: "Seu negócio precisa de um site" },
  { src: post4, alt: "Pronto para decolar? Toda grande empresa possui um site" },
  { src: post5, alt: "Marketing digital não é sorte, é estratégia" },
];

export default function Gallery() {
  return (
    <section id="galeria" className="section-padding">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">
            @brandifycoo
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Nosso conteúdo
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Acompanhe nossas dicas e insights sobre presença digital no Instagram.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {posts.map((post, i) => (
            <a
              key={i}
              href="https://www.instagram.com/brandifycoo"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-[4/5] rounded-xl overflow-hidden glass border border-border/50"
            >
              <img
                src={post.src}
                alt={post.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Instagram className="text-primary" size={32} />
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="https://www.instagram.com/brandifycoo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition"
          >
            <Instagram size={20} />
            Siga no Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
