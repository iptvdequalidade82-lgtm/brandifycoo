const segments = [
  "Lojas & Comércios",
  "Clínicas & Saúde",
  "Advocacias",
  "Empresas",
  "Restaurantes",
  "Educação",
  "Academias",
  "Beleza & Estética",
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-14 md:py-20 px-6">
      <div className="container mx-auto max-w-3xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10">
          Atendemos diversos ramos
        </h2>

        <p className="text-muted-foreground text-center leading-relaxed">
          {segments.slice(0, -1).join(", ")} e {segments[segments.length - 1]} —
          criamos sites sob medida para o seu segmento.
        </p>
      </div>
    </section>
  );
}
