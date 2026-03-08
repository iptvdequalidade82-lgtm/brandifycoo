import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User as UserIcon, Crown, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserMenu() {
  const { user, signOut, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) {
    return (
      <Link to="/login">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-white text-xs font-medium transition-all">
          <UserIcon className="w-3.5 h-3.5" />
          Entrar
        </button>
      </Link>
    );
  }

  const initials = (user.user_metadata?.full_name || user.email || "U")
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s: string) => s[0].toUpperCase())
    .join("");

  const avatarUrl = user.user_metadata?.avatar_url;
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";
  const email = user.email || "";

  const handleSignOut = async () => {
    setOpen(false);
    try {
      // Try normal signout with timeout
      const signOutPromise = supabase.auth.signOut();
      const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
      await Promise.race([signOutPromise, timeout]);
    } catch {
      // Ignore errors
    }
    // Always force local cleanup and reload
    localStorage.removeItem('sb-oqkdeoxevxuizynifjjj-auth-token');
    window.location.href = "/";
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full ring-2 ring-white/10 hover:ring-white/30 transition-all overflow-hidden flex items-center justify-center bg-gradient-to-br from-violet-600/60 to-blue-600/60 text-white text-xs font-bold"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-64 rounded-xl bg-[#0a0a10]/95 backdrop-blur-xl border border-white/[0.1] shadow-2xl shadow-black/50 overflow-hidden z-[100]"
          >
            {/* User info */}
            <div className="px-4 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-violet-600/60 to-blue-600/60 text-white text-sm font-bold shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{displayName}</p>
                  <p className="text-white/30 text-xs truncate">{email}</p>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="py-1.5">
              <button
                onClick={() => { setOpen(false); navigate("/planos-pro"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-all text-left"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                Planos
              </button>

              {isAdmin && (
                <button
                  onClick={() => { setOpen(false); navigate("/admin"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-all text-left"
                >
                  <Settings className="w-4 h-4" />
                  Dashboard
                </button>
              )}
            </div>

            {/* Logout */}
            <div className="border-t border-white/[0.06] py-1.5">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.05] transition-all text-left"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
