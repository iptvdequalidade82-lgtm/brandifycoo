import { ArrowLeft, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function TrabalheConosco() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-lg">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          Trabalhe conosco
        </h1>
        <p className="text-muted-foreground text-lg mb-3">
          Estamos sempre em busca de pessoas criativas e comprometidas para somar
          ao nosso time.
        </p>
        <p className="text-muted-foreground mb-10">
          Se você tem interesse em fazer parte da Brandify, entre em contato pelo
          WhatsApp e nos conte um pouco sobre você.
        </p>

        <a
          href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Gostaria%20de%20saber%20como%20fa%C3%A7o%20para%20trabalhar%20com%20voc%C3%AAs%20e%20agregar%20na%20empresa."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
        >
          <MessageCircle size={20} />
          Falar no WhatsApp
        </a>

        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
