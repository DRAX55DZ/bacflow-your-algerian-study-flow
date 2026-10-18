import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/AppShell";
import { ThemeGrid } from "@/components/ThemePicker";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — BacFlow" },
      { name: "description", content: "Choose your BacFlow theme and preferences." },
      { property: "og:title", content: "Settings — BacFlow" },
      { property: "og:description", content: "Personalize BacFlow with aesthetic themes." },
    ],
  }),
  component: () => (
    <Card>
      <h1 className="text-lg font-bold mb-1">Theme</h1>
      <p className="text-sm text-muted-foreground mb-4">Saved to your account and synced across devices.</p>
      <ThemeGrid />
    </Card>
  ),
});
