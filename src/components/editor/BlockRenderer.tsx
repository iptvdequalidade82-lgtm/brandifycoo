import React, { useRef } from "react";
import { SiteBlock } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Image as ImageIcon } from "lucide-react";

interface BlockRendererProps {
  block: SiteBlock;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateContent: (content: Record<string, any>) => void;
  userId: string;
}

function ImageUpload({
  value,
  onUpload,
  userId,
  className = "",
  placeholder = "Clique para adicionar imagem",
}: {
  value: string;
  onUpload: (url: string) => void;
  userId: string;
  className?: string;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("site-editor-assets").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("site-editor-assets").getPublicUrl(path);
      onUpload(data.publicUrl);
    }
  };

  return (
    <div
      className={`relative cursor-pointer group ${className}`}
      onClick={() => inputRef.current?.click()}
    >
      {value ? (
        <img src={value} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.03] border-2 border-dashed border-white/10 rounded-xl text-white/30 hover:border-white/30 hover:text-white/50 transition-all">
          <Upload className="w-8 h-8 mb-2" />
          <span className="text-sm">{placeholder}</span>
        </div>
      )}
      {value && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
          <ImageIcon className="w-8 h-8 text-white" />
          <span className="text-white text-sm ml-2">Trocar imagem</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}

function EditableText({
  value,
  onChange,
  tag = "p",
  className = "",
  placeholder = "Clique para editar",
}: {
  value: string;
  onChange: (v: string) => void;
  tag?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  placeholder?: string;
}) {
  const Tag = tag;
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      className={`outline-none focus:ring-2 focus:ring-violet-500/50 rounded px-1 -mx-1 ${className}`}
      onBlur={(e) => onChange(e.currentTarget.textContent || "")}
      dangerouslySetInnerHTML={{ __html: value || `<span class="opacity-30">${placeholder}</span>` }}
    />
  );
}

// ═══════════════ BLOCK RENDERERS ═══════════════

function HeroBlock({ block, onUpdate, userId }: { block: SiteBlock; onUpdate: (c: Record<string, any>) => void; userId: string }) {
  const { title, subtitle, buttonText, backgroundImage, overlayOpacity } = block.content;
  return (
    <div className="relative min-h-[400px] flex items-center justify-center overflow-hidden rounded-2xl">
      {backgroundImage ? (
        <img src={backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-blue-600 to-indigo-800" />
      )}
      <div className="absolute inset-0 bg-black" style={{ opacity: (overlayOpacity || 50) / 100 }} />
      <div className="relative z-10 text-center p-8 max-w-3xl">
        <EditableText value={title} onChange={(v) => onUpdate({ title: v })} tag="h1" className="text-4xl md:text-6xl font-bold text-white mb-4 font-['Playfair_Display']" />
        <EditableText value={subtitle} onChange={(v) => onUpdate({ subtitle: v })} tag="p" className="text-lg md:text-xl text-white/80 mb-8" />
        <EditableText value={buttonText} onChange={(v) => onUpdate({ buttonText: v })} tag="span" className="inline-block bg-white text-black px-8 py-3 rounded-full font-semibold text-lg" />
      </div>
      <div className="absolute bottom-4 right-4 z-20">
        <ImageUpload
          value=""
          onUpload={(url) => onUpdate({ backgroundImage: url })}
          userId={userId}
          className="w-10 h-10 rounded-lg overflow-hidden"
          placeholder=""
        />
      </div>
    </div>
  );
}

function AboutBlock({ block, onUpdate, userId }: { block: SiteBlock; onUpdate: (c: Record<string, any>) => void; userId: string }) {
  const { title, description, image, features } = block.content;
  return (
    <div className="grid md:grid-cols-2 gap-8 p-8 rounded-2xl bg-white/[0.02]">
      <div>
        <EditableText value={title} onChange={(v) => onUpdate({ title: v })} tag="h2" className="text-3xl font-bold text-white mb-4 font-['Playfair_Display']" />
        <EditableText value={description} onChange={(v) => onUpdate({ description: v })} tag="p" className="text-white/70 mb-6 leading-relaxed" />
        <div className="space-y-2">
          {(features || []).map((f: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-violet-400">✓</span>
              <EditableText
                value={f}
                onChange={(v) => {
                  const updated = [...features];
                  updated[i] = v;
                  onUpdate({ features: updated });
                }}
                tag="span"
                className="text-white/80"
              />
            </div>
          ))}
        </div>
      </div>
      <ImageUpload
        value={image}
        onUpload={(url) => onUpdate({ image: url })}
        userId={userId}
        className="min-h-[250px] rounded-2xl overflow-hidden"
      />
    </div>
  );
}

function ProductsBlock({ block, onUpdate, userId }: { block: SiteBlock; onUpdate: (c: Record<string, any>) => void; userId: string }) {
  const { title, subtitle, items } = block.content;
  return (
    <div className="p-8 rounded-2xl bg-white/[0.02]">
      <EditableText value={title} onChange={(v) => onUpdate({ title: v })} tag="h2" className="text-3xl font-bold text-white mb-2 text-center font-['Playfair_Display']" />
      <EditableText value={subtitle} onChange={(v) => onUpdate({ subtitle: v })} tag="p" className="text-white/60 mb-8 text-center" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(items || []).map((item: any, i: number) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
            <ImageUpload
              value={item.image}
              onUpload={(url) => {
                const updated = [...items];
                updated[i] = { ...updated[i], image: url };
                onUpdate({ items: updated });
              }}
              userId={userId}
              className="h-48"
              placeholder="Foto do produto"
            />
            <div className="p-4">
              <EditableText
                value={item.name}
                onChange={(v) => {
                  const updated = [...items];
                  updated[i] = { ...updated[i], name: v };
                  onUpdate({ items: updated });
                }}
                tag="h3"
                className="font-semibold text-white mb-1"
              />
              <EditableText
                value={item.description}
                onChange={(v) => {
                  const updated = [...items];
                  updated[i] = { ...updated[i], description: v };
                  onUpdate({ items: updated });
                }}
                tag="p"
                className="text-white/50 text-sm mb-2"
              />
              <EditableText
                value={item.price}
                onChange={(v) => {
                  const updated = [...items];
                  updated[i] = { ...updated[i], price: v };
                  onUpdate({ items: updated });
                }}
                tag="span"
                className="text-violet-400 font-bold"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onUpdate({ items: [...items, { name: "Novo Produto", description: "Descrição", price: "R$ 0,00", image: "" }] })}
        className="mt-4 w-full py-2 border border-dashed border-white/10 rounded-xl text-white/30 hover:text-white/60 hover:border-white/30 transition-all text-sm"
      >
        + Adicionar produto
      </button>
    </div>
  );
}

function GalleryBlock({ block, onUpdate, userId }: { block: SiteBlock; onUpdate: (c: Record<string, any>) => void; userId: string }) {
  const { title, images } = block.content;
  return (
    <div className="p-8 rounded-2xl bg-white/[0.02]">
      <EditableText value={title} onChange={(v) => onUpdate({ title: v })} tag="h2" className="text-3xl font-bold text-white mb-6 text-center font-['Playfair_Display']" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(images || []).map((img: string, i: number) => (
          <ImageUpload
            key={i}
            value={img}
            onUpload={(url) => {
              const updated = [...images];
              updated[i] = url;
              onUpdate({ images: updated });
            }}
            userId={userId}
            className="aspect-square rounded-xl overflow-hidden"
          />
        ))}
        <div
          onClick={() => onUpdate({ images: [...(images || []), ""] })}
          className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/30 hover:border-white/30 hover:text-white/50 cursor-pointer transition-all"
        >
          <span className="text-3xl">+</span>
        </div>
      </div>
    </div>
  );
}

function TestimonialsBlock({ block, onUpdate }: { block: SiteBlock; onUpdate: (c: Record<string, any>) => void }) {
  const { title, items } = block.content;
  return (
    <div className="p-8 rounded-2xl bg-white/[0.02]">
      <EditableText value={title} onChange={(v) => onUpdate({ title: v })} tag="h2" className="text-3xl font-bold text-white mb-8 text-center font-['Playfair_Display']" />
      <div className="grid md:grid-cols-2 gap-6">
        {(items || []).map((item: any, i: number) => (
          <div key={i} className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <EditableText
              value={item.text}
              onChange={(v) => {
                const updated = [...items];
                updated[i] = { ...updated[i], text: v };
                onUpdate({ items: updated });
              }}
              tag="p"
              className="text-white/70 mb-4 italic"
            />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500" />
              <div>
                <EditableText
                  value={item.name}
                  onChange={(v) => {
                    const updated = [...items];
                    updated[i] = { ...updated[i], name: v };
                    onUpdate({ items: updated });
                  }}
                  tag="span"
                  className="text-white font-semibold text-sm block"
                />
                <EditableText
                  value={item.role}
                  onChange={(v) => {
                    const updated = [...items];
                    updated[i] = { ...updated[i], role: v };
                    onUpdate({ items: updated });
                  }}
                  tag="span"
                  className="text-white/40 text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onUpdate({ items: [...items, { name: "Nome", text: "Depoimento aqui...", role: "Cliente" }] })}
        className="mt-4 w-full py-2 border border-dashed border-white/10 rounded-xl text-white/30 hover:text-white/60 hover:border-white/30 transition-all text-sm"
      >
        + Adicionar depoimento
      </button>
    </div>
  );
}

function FAQBlock({ block, onUpdate }: { block: SiteBlock; onUpdate: (c: Record<string, any>) => void }) {
  const { title, items } = block.content;
  return (
    <div className="p-8 rounded-2xl bg-white/[0.02]">
      <EditableText value={title} onChange={(v) => onUpdate({ title: v })} tag="h2" className="text-3xl font-bold text-white mb-8 text-center font-['Playfair_Display']" />
      <div className="space-y-4 max-w-2xl mx-auto">
        {(items || []).map((item: any, i: number) => (
          <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <EditableText
              value={item.question}
              onChange={(v) => {
                const updated = [...items];
                updated[i] = { ...updated[i], question: v };
                onUpdate({ items: updated });
              }}
              tag="h3"
              className="font-semibold text-white mb-2"
            />
            <EditableText
              value={item.answer}
              onChange={(v) => {
                const updated = [...items];
                updated[i] = { ...updated[i], answer: v };
                onUpdate({ items: updated });
              }}
              tag="p"
              className="text-white/60 text-sm"
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => onUpdate({ items: [...items, { question: "Nova pergunta?", answer: "Resposta aqui..." }] })}
        className="mt-4 w-full py-2 border border-dashed border-white/10 rounded-xl text-white/30 hover:text-white/60 hover:border-white/30 transition-all text-sm"
      >
        + Adicionar pergunta
      </button>
    </div>
  );
}

function ContactBlock({ block, onUpdate }: { block: SiteBlock; onUpdate: (c: Record<string, any>) => void }) {
  const { title, subtitle, phone, email, address, whatsapp } = block.content;
  return (
    <div className="p-8 rounded-2xl bg-white/[0.02]">
      <EditableText value={title} onChange={(v) => onUpdate({ title: v })} tag="h2" className="text-3xl font-bold text-white mb-2 text-center font-['Playfair_Display']" />
      <EditableText value={subtitle} onChange={(v) => onUpdate({ subtitle: v })} tag="p" className="text-white/60 mb-8 text-center" />
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {[
          { label: "Telefone", key: "phone", icon: "📞" },
          { label: "E-mail", key: "email", icon: "✉️" },
          { label: "WhatsApp", key: "whatsapp", icon: "💬" },
          { label: "Endereço", key: "address", icon: "📍" },
        ].map(({ label, key, icon }) => (
          <div key={key} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-sm text-white/40 block mb-1">{icon} {label}</span>
            <EditableText
              value={block.content[key] || ""}
              onChange={(v) => onUpdate({ [key]: v })}
              tag="p"
              className="text-white"
              placeholder={`Seu ${label.toLowerCase()}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CTABlock({ block, onUpdate }: { block: SiteBlock; onUpdate: (c: Record<string, any>) => void }) {
  const { title, subtitle, buttonText } = block.content;
  return (
    <div className="p-12 rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 text-center">
      <EditableText value={title} onChange={(v) => onUpdate({ title: v })} tag="h2" className="text-3xl md:text-4xl font-bold text-white mb-4 font-['Playfair_Display']" />
      <EditableText value={subtitle} onChange={(v) => onUpdate({ subtitle: v })} tag="p" className="text-white/60 mb-8 text-lg" />
      <EditableText value={buttonText} onChange={(v) => onUpdate({ buttonText: v })} tag="span" className="inline-block bg-white text-black px-8 py-3 rounded-full font-semibold" />
    </div>
  );
}

// ═══════════════ MAIN RENDERER ═══════════════

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, isSelected, onSelect, onUpdateContent, userId }) => {
  const renderBlock = () => {
    switch (block.block_type) {
      case "hero": return <HeroBlock block={block} onUpdate={onUpdateContent} userId={userId} />;
      case "about": return <AboutBlock block={block} onUpdate={onUpdateContent} userId={userId} />;
      case "products": return <ProductsBlock block={block} onUpdate={onUpdateContent} userId={userId} />;
      case "gallery": return <GalleryBlock block={block} onUpdate={onUpdateContent} userId={userId} />;
      case "testimonials": return <TestimonialsBlock block={block} onUpdate={onUpdateContent} />;
      case "faq": return <FAQBlock block={block} onUpdate={onUpdateContent} />;
      case "contact": return <ContactBlock block={block} onUpdate={onUpdateContent} />;
      case "cta": return <CTABlock block={block} onUpdate={onUpdateContent} />;
      default: return <div className="p-8 text-white/40">Bloco desconhecido: {block.block_type}</div>;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`relative transition-all ${
        isSelected ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-black rounded-2xl" : ""
      } ${!block.visible ? "opacity-30" : ""}`}
    >
      {renderBlock()}
    </div>
  );
};

export default React.memo(BlockRenderer);
