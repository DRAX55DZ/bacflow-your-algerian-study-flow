import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { loadUser, updateProfile, useAppState } from "@/lib/store";
import { STREAM_LABEL, type Stream } from "@/lib/syllabus";

export function AuthGate({ children }: { children: ReactNode }) {
  const s = useAppState();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => loadUser(data.user?.id ?? null));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") loadUser(session?.user.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", s.theme === "dark"); }, [s.theme]);

  if (!s.ready) return <div className="flex min-h-screen items-center justify-center text-gradient text-2xl font-bold">BacFlow</div>;
  if (!s.userId) return <AuthScreen />;
  if (!s.onboarded) return <Onboarding />;
  return <>{children}</>;
}

const input = "w-full rounded-xl bg-muted px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-sm p-6">
        <div className="text-2xl font-bold text-gradient">BacFlow</div>
        <div className="ar text-sm text-muted-foreground mb-5">بكالوريا الجزائر</div>
        {children}
      </motion.div>
    </div>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg("");
    const r = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password: pw })
      : await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (r.error) return setMsg(r.error.message);
    if (mode === "up" && !r.data.session) setMsg("Check your email to confirm your account.");
  };
  const oauth = async (p: "google" | "lovable") => {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin });
    if (r && "error" in r && r.error) setMsg(String((r.error as Error).message ?? r.error));
  };
  return (
    <Shell>
      <h1 className="font-bold text-lg">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
      <div className="mt-4 grid gap-2">
        <button onClick={() => oauth("google")} className="rounded-xl border px-3 py-2.5 text-sm font-medium hover:bg-muted">Continue with Google</button>
        <button onClick={() => oauth("lovable")} className="rounded-xl border px-3 py-2.5 text-sm font-medium hover:bg-muted">Continue with Lovable</button>
      </div>
      <div className="my-4 text-center text-xs text-muted-foreground">or with email</div>
      <form onSubmit={submit} className="grid gap-2">
        <input className={input} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={input} type="password" required minLength={6} placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button disabled={busy} className="rounded-xl bg-gradient-brand py-2.5 text-sm font-bold text-primary-foreground glow-violet disabled:opacity-60">{mode === "in" ? "Sign in" : "Sign up"}</button>
      </form>
      {msg && <p className="mt-3 text-sm text-flame">{msg}</p>}
      <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }} className="mt-4 text-sm text-muted-foreground hover:text-foreground">
        {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </Shell>
  );
}

function Onboarding() {
  const s = useAppState();
  const [name, setName] = useState(s.name);
  const [stream, setStream] = useState<Stream>(s.stream);
  return (
    <Shell>
      <h1 className="font-bold text-lg">Let's set you up</h1>
      <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (name.trim()) updateProfile({ name: name.trim(), stream, onboarded: true }); }}>
        <input dir="auto" className={input} required placeholder="Nickname" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid gap-2">
          {(["sci", "math"] as Stream[]).map((k) => (
            <button type="button" key={k} onClick={() => setStream(k)} className={`rounded-xl border-2 p-3 text-left text-sm ${stream === k ? "border-primary bg-accent" : "border-transparent bg-muted"}`}>
              <div className="font-medium">{STREAM_LABEL[k].en}</div><div className="ar text-xs text-muted-foreground">{STREAM_LABEL[k].ar}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Your invite code: <span className="font-mono font-bold text-foreground">{s.inviteCode}</span></p>
        <button className="rounded-xl bg-gradient-brand py-2.5 text-sm font-bold text-primary-foreground glow-violet">Start studying</button>
      </form>
    </Shell>
  );
}
