import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const ScreenInput = z.object({
  fileName: z.string().min(1).max(300),
  resumeText: z.string().min(30, "Resume text is too short to analyze").max(60000),
  jobTitle: z.string().min(1).max(200),
  jobDescription: z.string().min(20, "Add a longer job description").max(30000),
  jobId: z.string().uuid().nullable().optional(),
});

const AnalysisSchema = z.object({
  full_name: z.string().describe("Candidate full name, or 'Unknown candidate'"),
  skills: z.array(z.string()).describe("Concrete technical and professional skills"),
  years_experience: z.number().describe("Total years of professional experience"),
  education: z.string().describe("Highest degree, field and institution in one line"),
  match_score: z.number().int().min(1).max(10).describe("Fit for the job, 1 (poor) to 10 (excellent)"),
  justification: z
    .string()
    .describe(
      "Markdown-free written breakdown covering skills overlap, experience relevance, education fit, gaps and a hiring recommendation.",
    ),
});

export const screenResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ScreenInput.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");

    const gateway = createLovableAiGatewayProvider(apiKey);

    let analysis;
    try {
      const result = await generateText({
        model: gateway("google/gemini-3.7-flash"),
        output: Output.object({ schema: AnalysisSchema }),
        system:
          "You are a rigorous technical recruiter. Extract candidate facts from the resume and evaluate semantic fit against the job description. Be honest and specific; never invent experience that is not in the resume.",
        prompt: [
          `JOB TITLE: ${data.jobTitle}`,
          `JOB DESCRIPTION:\n${data.jobDescription}`,
          `RESUME (${data.fileName}):\n${data.resumeText}`,
          "Return the extracted candidate details, a 1-10 match score and a detailed justification of 4-8 sentences that explains the score.",
        ].join("\n\n"),
      });
      analysis = result.output;
    } catch (error) {
      const status = (error as { statusCode?: number; status?: number })?.statusCode ??
        (error as { status?: number })?.status;
      const message = error instanceof Error ? error.message : "AI evaluation failed";
      if (status === 429) throw new Error("AI rate limit reached. Please retry in a moment.");
      if (status === 402)
        throw new Error("AI credits exhausted. Add credits in Lovable to keep screening resumes.");
      throw new Error(message);
    }

    const { supabase, userId } = context;

    let jobId = data.jobId ?? null;
    if (!jobId) {
      const { data: job, error: jobError } = await supabase
        .from("job_descriptions")
        .insert({ user_id: userId, title: data.jobTitle, content: data.jobDescription })
        .select("id")
        .single();
      if (jobError) throw new Error(jobError.message);
      jobId = job.id;
    }

    const { data: candidate, error } = await supabase
      .from("candidates")
      .insert({
        user_id: userId,
        job_id: jobId,
        full_name: analysis.full_name || "Unknown candidate",
        skills: analysis.skills.slice(0, 40),
        years_experience: analysis.years_experience,
        education: analysis.education,
        match_score: Math.min(10, Math.max(1, Math.round(analysis.match_score))),
        justification: analysis.justification,
        resume_text: data.resumeText.slice(0, 60000),
        file_name: data.fileName,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return { candidate, jobId };
  });
