import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { THEMES } from "@/lib/themes";
import { updateProfile, useAppState } from "@/lib/store";

export function ThemeGrid() {
  const s = useAppState();
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {THEMES.map((t) => (
        <button key={t.id} onClick={() => updateProfile({ theme: t.id })}
          className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${s.theme === t.id ? "border-primary bg-accent" : "hover:bg-muted"}`}>
          <span className="text-lg">{t.emoji}</span>
          <span className="flex-1 font-medium">{t.name}</span>
          <span className="flex">{t.colors.map((c) => <span key={c} className="size-3.5 -ml-1 rounded-full border border-border" style={{ background: c }} />)}</span>
          {s.theme === t.id && <Check className="size-4 text-primary" />}
        </button>
      ))}
    </div>
  );
}

export function ThemeMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} title="Theme" className="size-9 flex items-center justify-center rounded-full hover:bg-muted"><Palette className="size-4" /></button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="glass absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-2rem))] p-2 bg-popover" onClick={() => setOpen(false)}>
              <div className="[&>div]:grid-cols-1"><ThemeGrid /></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
