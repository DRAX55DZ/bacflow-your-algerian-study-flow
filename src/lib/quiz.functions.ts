import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface QuizQuestion { q: string; options: string[]; answer: number; why: string }

const Input = z.object({ subject: z.string().max(100), unit: z.string().max(200), unitAr: z.string().max(200), stream: z.string().max(40) });

export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }): Promise<{ questions: QuizQuestion[]; error: string | null }> => {
    const { streamText, Output } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { questions: [], error: "Quizzes aren't configured yet." };
    const openai = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const schema = z.object({
      questions: z.array(z.object({ q: z.string(), options: z.array(z.string()), answer: z.number(), why: z.string() })),
    });
    try {
      const result = streamText({
        model: openai.responses("openai/gpt-6-astra"),
        output: Output.object({ schema }),
        providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", store: false } },
        prompt: `Write 5 multiple-choice questions testing real understanding of the Algerian Baccalaureate (${data.stream} stream) unit "${data.unit}" (${data.unitAr}) in ${data.subject}, at official Bac level. Mix concept and application questions. Each has exactly 4 options, "answer" is the 0-based index of the single correct option, "why" is a one-sentence explanation. Write in the language normally used for this subject in Algerian schools (French/Arabic for sciences is fine, English for English).`,
      });
      const out = await result.output;
      const questions = out.questions.filter((x) => x.options.length === 4 && x.answer >= 0 && x.answer < 4).slice(0, 5);
      return questions.length ? { questions, error: null } : { questions: [], error: "Couldn't build a quiz, try again." };
    } catch (e) {
      console.error(e);
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 429) return { questions: [], error: "Too many quizzes right now — wait a minute." };
      if (status === 402) return { questions: [], error: "AI credits are used up for this month." };
      return { questions: [], error: "Couldn't build a quiz, try again." };
    }
  });
