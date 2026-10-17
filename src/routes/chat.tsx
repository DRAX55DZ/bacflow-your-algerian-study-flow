import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, Image, Paperclip, Send } from "lucide-react";
import { Card } from "@/components/AppShell";
import { useAppState } from "@/lib/store";
import { fetchFriends, type Friend } from "@/lib/friends";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Study Chat — BacFlow" },
      { name: "description", content: "Group and direct chats with classmates, share units, PDFs and images." },
      { property: "og:title", content: "Study Chat — BacFlow" },
      { property: "og:description", content: "Study groups and direct messages for Bac students." },
    ],
  }),
  component: Chat,
});

interface Msg { id: string; room: string; sender_id: string; sender_name: string; text: string; attach_kind: string | null; attach_label: string | null; attach_path: string | null }
const MAX = 20 * 1024 * 1024;
const dmRoom = (a: string, b: string) => `dm-${[a, b].sort().join("_")}`;

function fmt(t: string) {
  return t.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((p, i) =>
    p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith("_") && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em> : p);
}

function Chat() {
  const s = useAppState();
  const uid = s.userId!;
  const [friends, setFriends] = useState<Friend[]>([]);
  const [room, setRoom] = useState("group");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchFriends(uid).then(setFriends); }, [uid]);
  useEffect(() => {
    let alive = true;
    supabase.from("messages").select("*").eq("room", room).order("created_at").limit(200).then(({ data }) => { if (alive) setMsgs((data ?? []) as Msg[]); });
    const ch = supabase.channel(`room-${room}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room=eq.${room}` },
      (p) => setMsgs((m) => (m.some((x) => x.id === (p.new as Msg).id) ? m : [...m, p.new as Msg]))).subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, [room]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async (extra: Partial<Msg> = {}, body = text) => {
    if (!body.trim() && !extra.attach_kind) return;
    setText(""); setErr("");
    const { data, error } = await supabase.from("messages").insert({ room, sender_name: s.name, text: body, ...extra }).select().single();
    if (error) return setErr(error.message);
    setMsgs((m) => (m.some((x) => x.id === data.id) ? m : [...m, data as Msg]));
  };
  const upload = async (f: File) => {
    if (f.size > MAX) return setErr("Files must be 20 MB or smaller");
    const path = `${uid}/${crypto.randomUUID()}-${f.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("chat-files").upload(path, f);
    if (error) return setErr(error.message);
    send({ attach_kind: f.type.includes("pdf") ? "pdf" : "image", attach_label: f.name, attach_path: path }, "");
  };
  const open = async (path: string) => {
    const { data } = await supabase.storage.from("chat-files").createSignedUrl(path, 600);
    if (data) window.open(data.signedUrl, "_blank");
  };
  const icon: Record<string, typeof FileText> = { pdf: FileText, image: Image, unit: BookOpen };
  const rooms = [{ id: "group", name: "Bac Squad", ar: "مجموعة البكالوريا" }, ...friends.map((f) => ({ id: dmRoom(uid, f.id), name: f.name, ar: "" }))];

  return (
    <div className="grid gap-4 md:grid-cols-[16rem_1fr] md:h-[calc(100vh-11rem)]">
      <Card className="p-2 overflow-auto flex md:block gap-1">
        {rooms.map((r) => (
          <button key={r.id} onClick={() => setRoom(r.id)} className={`shrink-0 md:w-full rounded-xl p-3 text-left text-sm ${room === r.id ? "bg-accent" : "hover:bg-muted"}`}>
            <div className="font-medium">{r.name}</div>{r.ar && <div className="ar text-xs text-muted-foreground">{r.ar}</div>}
          </button>
        ))}
        {friends.length === 0 && <p className="p-3 text-xs text-muted-foreground">Add friends to see their messages.</p>}
      </Card>
      <Card className="flex flex-col p-0 h-[60vh] md:h-auto">
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {msgs.length === 0 && <p className="text-sm text-muted-foreground">No messages yet — say hi 👋</p>}
          {msgs.map((m) => {
            const mine = m.sender_id === uid; const I = m.attach_kind ? icon[m.attach_kind] ?? FileText : null;
            return (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={`flex ${mine ? "justify-end" : ""}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-gradient-brand text-primary-foreground" : "bg-muted"}`}>
                  {!mine && <div className="text-xs font-bold text-cyan mb-0.5">{m.sender_name}</div>}
                  {m.text && <div dir="auto">{fmt(m.text)}</div>}
                  {I && (
                    <button disabled={!m.attach_path} onClick={() => m.attach_path && open(m.attach_path)} className="mt-2 flex items-center gap-2 rounded-xl bg-background/30 p-2 text-xs text-left">
                      <I className="size-4 shrink-0" />{m.attach_label}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
          <div ref={end} />
        </div>
        {err && <p className="px-4 text-xs text-flame">{err}</p>}
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 border-t p-3">
          <input ref={file} type="file" accept="application/pdf,image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
          <button type="button" title="Attach PDF or image (max 20 MB)" onClick={() => file.current?.click()} className="size-9 flex items-center justify-center rounded-lg hover:bg-muted"><Paperclip className="size-4" /></button>
          <input dir="auto" value={text} onChange={(e) => setText(e.target.value)} placeholder="Message… (**bold**, _italic_)" className="flex-1 min-w-0 rounded-xl bg-muted px-3 py-2 text-sm outline-none" />
          <button className="size-9 flex items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground"><Send className="size-4" /></button>
        </form>
      </Card>
    </div>
  );
}
