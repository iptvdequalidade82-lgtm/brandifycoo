import React from "react";
import { SiteBlock, BLOCK_DEFINITIONS } from "./types";
import { Eye, EyeOff, Trash2, GripVertical, Plus, Send, Loader2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface EditorSidebarProps {
  blocks: SiteBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onAddBlock: (type: string) => void;
  onRemoveBlock: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onSubmit: () => void;
  saving: boolean;
  siteStatus: string;
  siteName: string;
  onUpdateName: (name: string) => void;
}

function SortableBlockItem({
  block,
  isSelected,
  onSelect,
  onRemove,
  onToggleVisibility,
}: {
  block: SiteBlock;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const def = BLOCK_DEFINITIONS.find((d) => d.type === block.block_type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
        isSelected ? "bg-violet-500/20 border border-violet-500/40" : "hover:bg-white/[0.04] border border-transparent"
      }`}
      onClick={onSelect}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-white/20 hover:text-white/50 touch-none">
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="text-sm mr-1">{def?.icon || "📦"}</span>
      <span className={`text-sm flex-1 truncate ${isSelected ? "text-white" : "text-white/60"}`}>
        {def?.label || block.block_type}
      </span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }} className="p-1 text-white/30 hover:text-white/70">
          {block.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 text-white/30 hover:text-red-400">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onAddBlock,
  onRemoveBlock,
  onToggleVisibility,
  onSubmit,
  saving,
  siteStatus,
  siteName,
  onUpdateName,
}) => {
  const [showAddMenu, setShowAddMenu] = React.useState(false);
  const usedTypes = blocks.map((b) => b.block_type);

  return (
    <div className="w-72 bg-black/60 backdrop-blur-xl border-r border-white/[0.06] flex flex-col h-full">
      {/* Site name */}
      <div className="p-4 border-b border-white/[0.06]">
        <input
          value={siteName}
          onChange={(e) => onUpdateName(e.target.value)}
          className="w-full bg-transparent text-white font-semibold text-lg outline-none placeholder:text-white/30"
          placeholder="Nome do site"
        />
        <div className="flex items-center gap-2 mt-2">
          {saving ? (
            <span className="text-xs text-white/30 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Salvando...</span>
          ) : (
            <span className="text-xs text-emerald-400/70">✓ Salvo</span>
          )}
        </div>
      </div>

      {/* Blocks list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="text-xs text-white/30 uppercase tracking-wider px-2 mb-2">Seções</p>
        {blocks.map((block) => (
          <SortableBlockItem
            key={block.id}
            block={block}
            isSelected={selectedBlockId === block.id}
            onSelect={() => onSelectBlock(block.id)}
            onRemove={() => onRemoveBlock(block.id)}
            onToggleVisibility={() => onToggleVisibility(block.id)}
          />
        ))}
      </div>

      {/* Add block button */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/10 text-white/40 hover:text-white/70 hover:border-white/30 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Adicionar Seção
          </button>

          {showAddMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl p-2 z-50 max-h-64 overflow-y-auto">
              {BLOCK_DEFINITIONS.filter((d) => !usedTypes.includes(d.type) || ["products", "gallery", "testimonials", "faq"].includes(d.type)).map((def) => (
                <button
                  key={def.type}
                  onClick={() => { onAddBlock(def.type); setShowAddMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/[0.06] hover:text-white transition-all"
                >
                  <span>{def.icon}</span> {def.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit button */}
      {siteStatus === "draft" && (
        <div className="p-4 border-t border-white/[0.06]">
          <button
            onClick={onSubmit}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:from-violet-500 hover:to-blue-500 transition-all"
          >
            <Send className="w-4 h-4" /> Enviar pra Agência
          </button>
        </div>
      )}

      {siteStatus === "submitted" && (
        <div className="p-4 border-t border-white/[0.06]">
          <div className="py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-sm font-medium">
            ✓ Enviado para a agência
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorSidebar;
