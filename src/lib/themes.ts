export type ThemeId = "cyber" | "velvet" | "emerald" | "light" | "sunset" | "ocean" | "sakura" | "sand";
export const THEMES: { id: ThemeId; emoji: string; name: string; colors: string[] }[] = [
  { id: "cyber", emoji: "🌌", name: "Midnight Cyberpunk", colors: ["#0B0F17", "#22D3EE", "#A855F7", "#FB923C"] },
  { id: "velvet", emoji: "🔮", name: "Deep Velvet Violet", colors: ["#0F0C20", "#8B5CF6", "#34D399", "#F472B6"] },
  { id: "emerald", emoji: "🌿", name: "OLED Emerald", colors: ["#090A0F", "#10B981", "#7DD3FC", "#F59E0B"] },
  { id: "light", emoji: "☀️", name: "Minimalist Light", colors: ["#F8FAFC", "#2563EB", "#0EA5E9", "#F97316"] },
  { id: "sunset", emoji: "🌇", name: "Sunset Amber", colors: ["#140B10", "#FB923C", "#F43F5E", "#FBBF24"] },
  { id: "ocean", emoji: "🌊", name: "Ocean Deep", colors: ["#081018", "#38BDF8", "#2DD4BF", "#818CF8"] },
  { id: "sakura", emoji: "🌸", name: "Sakura Rose", colors: ["#17090F", "#F472B6", "#FB7185", "#C4B5FD"] },
  { id: "sand", emoji: "🏜️", name: "Solar Sand", colors: ["#FAF6EF", "#D97706", "#0D9488", "#B45309"] },
];
/** Old saved values ("dark"/"light") map onto the new themes. */
export const normalizeTheme = (t: string | null | undefined): ThemeId =>
  THEMES.some((x) => x.id === t) ? (t as ThemeId) : t === "light" ? "light" : "cyber";
export function applyTheme(t: ThemeId) {
  const el = document.documentElement;
  el.dataset["theme"] = t;
  el.classList.toggle("dark", t !== "light");
}
