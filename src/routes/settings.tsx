import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/AppShell";
import { ThemeGrid } from "@/components/ThemePicker";
import { updateProfile } from "@/lib/store";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — BacFlow" },
      { name: "description", content: "Choose your BacFlow theme and language." },
      { property: "og:title", content: "Settings — BacFlow" },
      { property: "og:description", content: "Personalize BacFlow with themes and Arabic or English." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, lang } = useT();
  return (
    <div className="grid gap-4">
      <Card>
        <h1 className="text-lg font-bold mb-1">{t("Language")}</h1>
        <p className="text-sm text-muted-foreground mb-4">{t("Choose the language of the whole app.")}</p>
        <div className="flex gap-2">
          {([["en", "English"], ["ar", "العربية"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => updateProfile({ lang: k })} className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${lang === k ? "bg-gradient-brand text-primary-foreground glow-violet" : "bg-muted hover:bg-muted/70"}`}>
              <span className={k === "ar" ? "ar" : ""}>{l}</span>
            </button>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-bold mb-1">{t("Theme")}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t("Saved to your account and synced across devices.")}</p>
        <ThemeGrid />
      </Card>
    </div>
  );
}
