import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, Image, Mic, Paperclip, Send } from "lucide-react";
import { Card } from "@/components/AppShell";
import { setState, useAppState, type ChatMsg } from "@/lib/store";
import { FRIENDS } from "@/lib/friends";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Study Chat — BacFlow" },
      { name: "description", content: "Group and direct chats with classmates, share units, PDFs, images and voice notes." },
      { property: "og:title", content: "Study Chat — BacFlow" },
      { property: "og:description", content: "Study groups and direct messages for Bac students." },
    ],
  }),
  component: Chat,
});

const ROOMS = [{ id: "group-bac", name: "Bac 2027 Squad", ar: "مجموعة البكالوريا" }, ...FRIENDS.slice(0, 3).map((f) => ({ id: `dm-${f.id}`, name: f.name, ar: "" }))];
const SEED: ChatMsg[] = [
  { id: "s1", room: "group-bac", from: "Amine B.", text: "Who's doing the **Integrals** past papers tonight?", at: 0 },
  { id: "s2", room: "group-bac", from: "Yasmine K.", text: "أنا! سأبدأ بموضوع 2022", at: 0, attach: { kind: "pdf", label: "Bac_2022_Math_Sci.pdf" } },
];

function fmt(t: string) {
  return t.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((p, i) =>
    p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith("_") && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em> : p);
}

function Chat() {
  const s = useAppState();
  const [room, setRoom] = useState("group-bac");
  const [text, setText] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const msgs = [...SEED, ...s.messages].filter((m) => m.room === room);
  const send = (attach?: ChatMsg["attach"], body = text) => {
    if (!body.trim() && !attach) return;
    setState((x) => ({ ...x, messages: [...x.messages, { id: crypto.randomUUID(), room, from: x.name, text: body, at: Date.now(), attach }] }));
    setText("");
  };
  const icon = { pdf: FileText, image: Image, voice: Mic, unit: BookOpen };

  return (
    <div className="grid gap-4 md:grid-cols-[16rem_1fr] h-[calc(100vh-11rem)]">
      <Card className="p-2 overflow-auto">
        {ROOMS.map((r) => (
          <button key={r.id} onClick={() => setRoom(r.id)} className={`w-full rounded-xl p-3 text-left text-sm ${room === r.id ? "bg-accent" : "hover:bg-muted"}`}>
            <div className="font-medium">{r.name}</div>{r.ar && <div className="ar text-xs text-muted-foreground">{r.ar}</div>}
          </button>
        ))}
      </Card>
      <Card className="flex flex-col p-0 min-h-[24rem]">
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {msgs.map((m) => {
            const mine = m.from === s.name; const I = m.attach ? icon[m.attach.kind] : null;
            return (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={`flex ${mine ? "justify-end" : ""}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-gradient-brand text-primary-foreground" : "bg-muted"}`}>
                  {!mine && <div className="text-xs font-bold text-cyan mb-0.5">{m.from}</div>}
                  {m.text && <div dir="auto">{fmt(m.text)}</div>}
                  {m.attach && I && <div className="mt-2 flex items-center gap-2 rounded-xl bg-background/30 p-2 text-xs"><I className="size-4" />{m.attach.label}</div>}
                </div>
              </motion.div>
            );
          })}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 border-t p-3">
          <input ref={file} type="file" accept="application/pdf,image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) send({ kind: f.type.includes("pdf") ? "pdf" : "image", label: f.name }, ""); e.target.value = ""; }} />
          <button type="button" onClick={() => file.current?.click()} className="size-9 flex items-center justify-center rounded-lg hover:bg-muted"><Paperclip className="size-4" /></button>
          <button type="button" onClick={() => send({ kind: "voice", label: "Voice note · 0:12" }, "")} className="size-9 flex items-center justify-center rounded-lg hover:bg-muted"><Mic className="size-4" /></button>
          <input dir="auto" value={text} onChange={(e) => setText(e.target.value)} placeholder="Message… (**bold**, _italic_)" className="flex-1 rounded-xl bg-muted px-3 py-2 text-sm outline-none" />
          <button className="size-9 flex items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground"><Send className="size-4" /></button>
        </form>
      </Card>
    </div>
  );
}
