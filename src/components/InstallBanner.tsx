import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallBanner() {
  const [evt, setEvt] = useState<BIP | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
    const mobile = matchMedia("(max-width: 768px)").matches;
    if (standalone || !mobile || localStorage.getItem("bacflow-install-dismissed")) return;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) { setIos(true); setShow(true); }
    const h = (e: Event) => { e.preventDefault(); setEvt(e as BIP); setShow(true); };
    addEventListener("beforeinstallprompt", h);
    return () => removeEventListener("beforeinstallprompt", h);
  }, []);
  const close = () => { setShow(false); localStorage.setItem("bacflow-install-dismissed", "1"); };
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
          className="glass fixed z-50 bottom-20 left-3 right-3 flex items-center gap-3 p-3 bg-popover">
          <img src="/apple-touch-icon.png" alt="" width={40} height={40} className="size-10 rounded-xl" />
          <div className="flex-1 text-sm">
            <div className="font-bold">Install BacFlow</div>
            <div className="text-xs text-muted-foreground">{ios ? "Tap Share, then “Add to Home Screen”." : "Study offline, right from your home screen."}</div>
          </div>
          {evt && <button onClick={async () => { await evt.prompt(); close(); }} className="flex items-center gap-1 rounded-xl bg-gradient-brand px-3 py-2 text-xs font-bold text-primary-foreground"><Download className="size-3.5" />Install</button>}
          <button onClick={close} title="Dismiss"><X className="size-4 text-muted-foreground" /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
