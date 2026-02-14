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
      className="mt-8 p-6 md:p-8 rounded-2xl glass"
    >
      <h3 className="font-display text-lg font-black text-white mb-1">Envie uma mensagem</h3>
      <p className="text-xs text-white/40 mb-5">Preencha o formulário e responderemos pelo WhatsApp.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Seu nome"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] gentle-animation"
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] gentle-animation"
          />
        </div>
        <textarea
          placeholder="Conte sobre seu projeto..."
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] gentle-animation resize-none"
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold text-sm gentle-animation"
        >
          <Send size={16} />
          {sent ? "Enviado!" : "Enviar pelo WhatsApp"}
        </motion.button>
      </form>
    </motion.div>
  );
}
