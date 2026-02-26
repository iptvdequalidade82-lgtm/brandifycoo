import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEditorStore } from "@/components/editor/useEditorStore";
import BlockRenderer from "@/components/editor/BlockRenderer";
import EditorSidebar from "@/components/editor/EditorSidebar";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Loader2, ArrowLeft, Menu, X } from "lucide-react";

const Editor: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const {
    site,
    blocks,
    loading,
    saving,
    selectedBlockId,
    setSelectedBlockId,
    loadOrCreateSite,
    updateBlockContent,
    reorderBlocks,
    addBlock,
    removeBlock,
    toggleBlockVisibility,
    submitToAgency,
    updateSiteName,
  } = useEditorStore(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=/editor");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadOrCreateSite();
  }, [user, loadOrCreateSite]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    reorderBlocks(arrayMove(blocks, oldIndex, newIndex));
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!user) return null;

  const sidebarContent = site && (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <EditorSidebar
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onAddBlock={addBlock}
          onRemoveBlock={removeBlock}
          onToggleVisibility={toggleBlockVisibility}
          onSubmit={submitToAgency}
          saving={saving}
          siteStatus={site.status}
          siteName={site.name}
          onUpdateName={updateSiteName}
        />
      </SortableContext>
    </DndContext>
  );

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="h-14 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-4 gap-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="h-6 w-px bg-white/10" />
        <span className="text-sm text-white/70 font-medium">Editor de Site</span>
        <div className="flex-1" />
        {/* Mobile sidebar toggle */}
        <button onClick={() => setMobileSidebar(!mobileSidebar)} className="md:hidden text-white/50 hover:text-white">
          {mobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        {/* Desktop sidebar toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:block text-white/50 hover:text-white text-sm">
          {sidebarOpen ? "Ocultar painel" : "Mostrar painel"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop sidebar */}
        {sidebarOpen && <div className="hidden md:block">{sidebarContent}</div>}

        {/* Mobile sidebar overlay */}
        {mobileSidebar && (
          <div className="md:hidden absolute inset-0 z-50 flex">
            <div className="w-72">{sidebarContent}</div>
            <div className="flex-1 bg-black/50" onClick={() => setMobileSidebar(false)} />
          </div>
        )}

        {/* Canvas / Preview */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {blocks.filter((b) => b.visible).length === 0 ? (
              <div className="text-center py-32">
                <p className="text-white/30 text-lg mb-4">Nenhuma seção visível</p>
                <p className="text-white/20 text-sm">Adicione seções pelo painel lateral</p>
              </div>
            ) : (
              blocks
                .filter((b) => b.visible)
                .map((block) => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    onSelect={() => setSelectedBlockId(block.id)}
                    onUpdateContent={(content) => updateBlockContent(block.id, content)}
                    userId={user.id}
                  />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
