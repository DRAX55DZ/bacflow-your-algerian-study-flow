export type ThemeId = "cyber" | "velvet" | "emerald" | "light";
export const THEMES: { id: ThemeId; emoji: string; name: string; colors: string[] }[] = [
  { id: "cyber", emoji: "🌌", name: "Midnight Cyberpunk", colors: ["#0B0F17", "#22D3EE", "#A855F7", "#FB923C"] },
  { id: "velvet", emoji: "🔮", name: "Deep Velvet Violet", colors: ["#0F0C20", "#8B5CF6", "#34D399", "#F472B6"] },
  { id: "emerald", emoji: "🌿", name: "OLED Emerald", colors: ["#090A0F", "#10B981", "#7DD3FC", "#F59E0B"] },
  { id: "light", emoji: "☀️", name: "Minimalist Light", colors: ["#F8FAFC", "#2563EB", "#0EA5E9", "#F97316"] },
];
/** Old saved values ("dark"/"light") map onto the new themes. */
export const normalizeTheme = (t: string | null | undefined): ThemeId =>
  THEMES.some((x) => x.id === t) ? (t as ThemeId) : t === "light" ? "light" : "cyber";
export function applyTheme(t: ThemeId) {
  const el = document.documentElement;
  el.dataset["theme"] = t;
  el.classList.toggle("dark", t !== "light");
}
