import { useState } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactForm() {
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-8 p-6 md:p-8 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/40 gradient-border"
    >
      <h3 className="font-display text-lg font-black text-foreground mb-1">Envie uma mensagem</h3>
      <p className="text-xs text-muted-foreground mb-5">Preencha o formulário e responderemos pelo WhatsApp.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Seu nome"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-secondary/40 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_hsl(0_0%_100%/0.06)] transition-all duration-300"
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-secondary/40 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_hsl(0_0%_100%/0.06)] transition-all duration-300"
          />
        </div>
        <textarea
          placeholder="Conte sobre seu projeto..."
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-secondary/40 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_hsl(0_0%_100%/0.06)] transition-all duration-300 resize-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-sm neon-glow-sm hover:scale-[1.03] transition-all duration-300"
        >
          <Send size={16} />
          {sent ? "Enviado!" : "Enviar pelo WhatsApp"}
        </button>
      </form>
    </motion.div>
  );
}
