import { useState } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await supabase.from("leads").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        source: "contact_form",
      } as any);
    } catch {
      // Silently fail
    }

    const text = `Olá! Meu nome é ${form.name}. E-mail: ${form.email}. Mensagem: ${form.message}`;
    window.open(
      `https://wa.me/5543991065129?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    setSaving(false);
    setSent(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-8 p-6 md:p-8 rounded-2xl bg-card border border-border"
    >
      <h3 className="font-display text-lg font-extrabold text-foreground mb-1">Envie uma mensagem</h3>
      <p className="text-xs text-muted-foreground mb-5">Preencha o formulário e responderemos pelo WhatsApp.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Seu nome"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-accent/80 gentle-animation"
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            required
            maxLength={255}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-accent/80 gentle-animation"
          />
        </div>
        <textarea
          placeholder="Conte sobre seu projeto..."
          required
          rows={4}
          maxLength={1000}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-accent/80 gentle-animation resize-none"
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm gentle-animation btn-glow shadow-[0_0_15px_hsl(var(--primary)/0.2)] disabled:opacity-50"
        >
          <Send size={16} />
          {sent ? "Enviado!" : saving ? "Enviando..." : "Enviar pelo WhatsApp"}
        </motion.button>
      </form>
    </motion.div>
  );
}
