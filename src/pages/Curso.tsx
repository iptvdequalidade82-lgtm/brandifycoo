import { Construction } from "lucide-react";
import { Link } from "react-router-dom";

export default function Curso() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <Construction className="text-primary mb-6" size={56} strokeWidth={1.5} />
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
        Em desenvolvimento
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Estamos preparando algo incrível para você. Em breve nosso curso estará disponível!
      </p>
      <Link
        to="/"
        className="text-sm font-semibold px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
