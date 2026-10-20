import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  key: z.string().max(80), subject: z.string().max(100), unit: z.string().max(200), unitAr: z.string().max(200),
  stream: z.string().max(40), lang: z.enum(["en", "ar"]),
});

export const getLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data, context }): Promise<{ content: string; error: string | null }> => {
    const { data: cached } = await context.supabase.from("lessons").select("content").eq("unit_key", data.key).eq("lang", data.lang).maybeSingle();
    if (cached?.content) return { content: cached.content, error: null };
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { content: "", error: "Lessons aren't configured yet." };
    const { streamText } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");
    const openai = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1", apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: openai.responses("openai/gpt-6-astra"),
        providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", store: false } },
        prompt: `Write the complete lesson for the unit "${data.unit}" (${data.unitAr}) of ${data.subject}, exactly following the official Algerian Ministry of Education Baccalaureate program for the ${data.stream} stream (3AS). Write it ${data.lang === "ar" ? "in Modern Standard Arabic" : "in English"}. Use Markdown: ## section headings following the official program order, key definitions, laws/formulas (plain text, no LaTeX), one worked example per section in Bac style, common mistakes, and a short "What the Bac usually asks" section at the end. Be accurate and concise (about 900-1400 words). No preamble.`,
      });
      const content = (await result.text).trim();
      if (content.length < 200) return { content: "", error: "Couldn't write the lesson, try again." };
      await context.supabase.from("lessons").insert({ unit_key: data.key, lang: data.lang, content });
      return { content, error: null };
    } catch (e) {
      console.error(e);
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 429) return { content: "", error: "Too many requests right now — wait a minute." };
      if (status === 402) return { content: "", error: "AI credits are used up for this month." };
      return { content: "", error: "Couldn't write the lesson, try again." };
    }
  });
