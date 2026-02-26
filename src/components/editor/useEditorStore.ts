import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteBlock, UserSite, BLOCK_DEFINITIONS } from "./types";
import { useToast } from "@/hooks/use-toast";

export function useEditorStore(userId: string | undefined) {
  const [site, setSite] = useState<UserSite | null>(null);
  const [blocks, setBlocks] = useState<SiteBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const { toast } = useToast();
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  const loadOrCreateSite = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Try to load existing draft site
      const { data: existingSites } = await supabase
        .from("user_sites")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "draft")
        .order("updated_at", { ascending: false })
        .limit(1);

      let currentSite: UserSite;

      if (existingSites && existingSites.length > 0) {
        currentSite = existingSites[0] as unknown as UserSite;
      } else {
        // Create new site with default blocks
        const { data: newSite, error } = await supabase
          .from("user_sites")
          .insert({ user_id: userId, name: "Meu Site" })
          .select()
          .single();
        if (error) throw error;
        currentSite = newSite as unknown as UserSite;

        // Insert default blocks
        const defaultBlocks = ["hero", "about", "products", "contact"].map((type, i) => {
          const def = BLOCK_DEFINITIONS.find((d) => d.type === type)!;
          return {
            site_id: currentSite.id,
            block_type: type,
            sort_order: i,
            content: def.defaultContent,
          };
        });
        await supabase.from("site_blocks").insert(defaultBlocks);
      }

      setSite(currentSite);

      // Load blocks
      const { data: siteBlocks } = await supabase
        .from("site_blocks")
        .select("*")
        .eq("site_id", currentSite.id)
        .order("sort_order");

      setBlocks((siteBlocks as unknown as SiteBlock[]) || []);
    } catch (e) {
      console.error("Error loading site:", e);
      toast({ title: "Erro ao carregar site", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  const autoSave = useCallback(
    (updatedBlocks: SiteBlock[]) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        setSaving(true);
        try {
          for (const block of updatedBlocks) {
            await supabase
              .from("site_blocks")
              .update({ content: block.content, sort_order: block.sort_order, visible: block.visible })
              .eq("id", block.id);
          }
        } catch (e) {
          console.error("Auto-save error:", e);
        } finally {
          setSaving(false);
        }
      }, 1500);
    },
    []
  );

  const updateBlockContent = useCallback(
    (blockId: string, content: Record<string, any>) => {
      setBlocks((prev) => {
        const updated = prev.map((b) => (b.id === blockId ? { ...b, content: { ...b.content, ...content } } : b));
        autoSave(updated);
        return updated;
      });
    },
    [autoSave]
  );

  const reorderBlocks = useCallback(
    (newOrder: SiteBlock[]) => {
      const reordered = newOrder.map((b, i) => ({ ...b, sort_order: i }));
      setBlocks(reordered);
      autoSave(reordered);
    },
    [autoSave]
  );

  const addBlock = useCallback(
    async (blockType: string) => {
      if (!site) return;
      const def = BLOCK_DEFINITIONS.find((d) => d.type === blockType);
      if (!def) return;

      const { data, error } = await supabase
        .from("site_blocks")
        .insert({
          site_id: site.id,
          block_type: blockType,
          sort_order: blocks.length,
          content: def.defaultContent,
        })
        .select()
        .single();

      if (!error && data) {
        setBlocks((prev) => [...prev, data as unknown as SiteBlock]);
        toast({ title: `Bloco "${def.label}" adicionado!` });
      }
    },
    [site, blocks.length, toast]
  );

  const removeBlock = useCallback(
    async (blockId: string) => {
      await supabase.from("site_blocks").delete().eq("id", blockId);
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      if (selectedBlockId === blockId) setSelectedBlockId(null);
      toast({ title: "Bloco removido" });
    },
    [selectedBlockId, toast]
  );

  const toggleBlockVisibility = useCallback(
    (blockId: string) => {
      setBlocks((prev) => {
        const updated = prev.map((b) => (b.id === blockId ? { ...b, visible: !b.visible } : b));
        autoSave(updated);
        return updated;
      });
    },
    [autoSave]
  );

  const submitToAgency = useCallback(async () => {
    if (!site) return;
    setSaving(true);
    try {
      await supabase
        .from("user_sites")
        .update({ status: "submitted", submitted_at: new Date().toISOString() })
        .eq("id", site.id);
      
      setSite((prev) => prev ? { ...prev, status: "submitted" } : prev);
      toast({ title: "Site enviado para a agência! 🎉", description: "Entraremos em contato em breve." });
      
      // Open WhatsApp with message
      const msg = encodeURIComponent(
        `Olá! Acabei de criar meu site na plataforma Brandify e gostaria de dar continuidade. ID: ${site.id}`
      );
      window.open(`https://wa.me/5543991065129?text=${msg}`, "_blank");
    } catch (e) {
      toast({ title: "Erro ao enviar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [site, toast]);

  const updateSiteName = useCallback(
    async (name: string) => {
      if (!site) return;
      await supabase.from("user_sites").update({ name }).eq("id", site.id);
      setSite((prev) => (prev ? { ...prev, name } : prev));
    },
    [site]
  );

  return {
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
  };
}
