import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import {
  QUESTION_SETS,
  questionAt,
  type OnboardingRole,
} from "@/lib/onboarding-questions";

const ROLES = ["freelancer", "founder", "company", "investor"] as const;

function assertRole(value: unknown): OnboardingRole {
  const parsed = z.enum(ROLES).parse(value);
  return parsed;
}

async function aiModel() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const { createLovableAiGatewayProvider, INTERVIEW_MODEL } = await import("@/lib/ai-gateway.server");
  return createLovableAiGatewayProvider(key)(INTERVIEW_MODEL);
}

/** Current interview state for the signed-in user. */
export const getInterview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: interview, error } = await supabase
      .from("onboarding_interviews")
      .select("role, status, current_step, completed_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    const { data: answers, error: answersError } = await supabase
      .from("onboarding_answers")
      .select("field_key, question, answer, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (answersError) throw new Error(answersError.message);

    return {
      role: (interview?.role ?? null) as OnboardingRole | null,
      status: interview?.status ?? "in_progress",
      currentStep: interview?.current_step ?? 1,
      answers: answers ?? [],
    };
  });

/** Step 1: record the chosen role and move to the question set. */
export const setInterviewRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { role: string }) => ({ role: assertRole(input.role) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("onboarding_interviews")
      .upsert(
        { user_id: userId, role: data.role, status: "in_progress", current_step: 2 },
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Phrase the next question conversationally (falls back to the written question). */
export const askQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { role: string; index: number; firstName?: string }) => ({
    role: assertRole(input.role),
    index: z.number().int().min(0).parse(input.index),
    firstName: typeof input.firstName === "string" ? input.firstName : undefined,
  }))
  .handler(async ({ data }) => {
    const question = questionAt(data.role, data.index);
    if (!question) return { question: null, done: true as const };

    try {
      const model = await aiModel();
      const result = await generateText({
        model,
        system:
          "You are Bunju's onboarding interviewer. You sound like a warm, efficient human, never corporate. Ask exactly one short question (max 22 words), no preamble, no bullet points, no emoji.",
        prompt: [
          `The person's role on Bunju is: ${data.role}.`,
          data.index === 0 ? "This is the first question after they picked their role." : "",
          `Ask this in your own natural words: "${question.question}"`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      const text = result.text.trim();
      return { question: text || question.question, fieldKey: question.fieldKey, done: false as const };
    } catch (error) {
      console.error("askQuestion failed", error);
      return { question: question.question, fieldKey: question.fieldKey, done: false as const };
    }
  });

/**
 * Judge one answer. Vague answers get a natural follow-up; specific ones are
 * saved immediately so a dropped-out interview keeps its progress.
 */
export const submitAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { role: string; index: number; answer: string; followUpCount?: number }) => ({
    role: assertRole(input.role),
    index: z.number().int().min(0).parse(input.index),
    answer: z.string().min(1).max(2000).parse(input.answer),
    followUpCount: z.number().int().min(0).max(3).catch(0).parse(input.followUpCount ?? 0),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const question = questionAt(data.role, data.index);
    if (!question) throw new Error("No question at that position");

    let specific = true;
    let followUp: string | null = null;

    if (data.followUpCount < 1) {
      try {
        const model = await aiModel();
        const { output } = await generateText({
          model,
          output: Output.object({
            schema: z.object({
              specific: z.boolean(),
              followUp: z.string(),
            }),
          }),
          system:
            "You review onboarding answers for Bunju. Decide whether the answer is specific enough to be useful. If it is not, write one short, friendly follow-up question (max 20 words) that offers concrete options, e.g. for \"developer\" ask \"What kind — web, mobile, backend, data?\". If it is specific, set followUp to an empty string.",
          prompt: [
            `Question: ${question.question}`,
            `What counts as specific: ${question.hint}`,
            `Answer: ${data.answer}`,
          ].join("\n"),
        });
        specific = output.specific;
        followUp = output.followUp?.trim() || null;
      } catch (error) {
        if (!NoObjectGeneratedError.isInstance(error)) console.error("submitAnswer review failed", error);
        specific = true;
      }
    }

    if (!specific && followUp) {
      return { status: "followup" as const, followUp };
    }

    // Upsert-by-hand: this table has no unique key on (user_id, field_key).
    await supabase
      .from("onboarding_answers")
      .delete()
      .eq("user_id", userId)
      .eq("field_key", question.fieldKey);

    const { error } = await supabase.from("onboarding_answers").insert({
      user_id: userId,
      role: data.role,
      field_key: question.fieldKey,
      question: question.question,
      answer: data.answer,
    });
    if (error) throw new Error(error.message);

    const nextIndex = data.index + 1;
    const total = QUESTION_SETS[data.role].length;
    const nextQuestion = questionAt(data.role, nextIndex);
    const done = nextIndex >= total;

    const { error: interviewError } = await supabase
      .from("onboarding_interviews")
      .upsert(
        {
          user_id: userId,
          role: data.role,
          current_step: done ? 3 : nextQuestion?.step ?? 3,
          status: done ? "completed" : "in_progress",
          ...(done ? { completed_at: new Date().toISOString() } : {}),
        },
        { onConflict: "user_id" },
      );
    if (interviewError) throw new Error(interviewError.message);

    return { status: "saved" as const, done, nextIndex };
  });
