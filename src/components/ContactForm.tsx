import { useState } from "react";
import { Send } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ContactForm() {
  const { ref, isVisible } = useScrollReveal();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Olá! Meu nome é ${form.name}. E-mail: ${form.email}. Mensagem: ${form.message}`;
    window.open(
      `https://wa.me/5543991065129?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div
      ref={ref}
      className={`mt-8 p-6 md:p-8 rounded-2xl border border-border/50 bg-card/30 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <h3 className="font-display text-lg font-bold text-foreground mb-1">Envie uma mensagem</h3>
      <p className="text-xs text-muted-foreground mb-5">Preencha o formulário e responderemos pelo WhatsApp.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Seu nome"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <textarea
          placeholder="Conte sobre seu projeto..."
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:shadow-[0_0_30px_hsl(210_100%_60%/0.3)] transition-all duration-300"
        >
          <Send size={16} />
          {sent ? "Enviado!" : "Enviar pelo WhatsApp"}
        </button>
      </form>
    </div>
  );
}
