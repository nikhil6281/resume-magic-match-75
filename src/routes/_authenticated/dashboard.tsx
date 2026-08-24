import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  Gauge,
  LayoutDashboard,
  Loader2,
  LogOut,
  ScanSearch,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CandidateTable, type Candidate } from "@/components/CandidateTable";
import { ResumeDropzone } from "@/components/ResumeDropzone";
import { screenResume } from "@/lib/screening.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Screening dashboard — Smart Resume Screener" },
      {
        name: "description",
        content:
          "Upload resumes, evaluate them against your job description and review AI match scores per candidate.",
      },
      { property: "og:title", content: "Screening dashboard — Smart Resume Screener" },
      {
        property: "og:description",
        content: "Upload resumes and review AI match scores per candidate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const runScreening = useServerFn(screenResume);

  const [resume, setResume] = useState<{ name: string; text: string } | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [screening, setScreening] = useState(false);

  const candidatesQuery = useQuery({
    queryKey: ["candidates"],
    queryFn: async (): Promise<Candidate[]> => {
      const { data, error } = await supabase
        .from("candidates")
        .select(
          "id, full_name, skills, years_experience, education, match_score, justification, file_name, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Candidate[];
    },
  });

  const candidates = candidatesQuery.data ?? [];
  const averageScore = candidates.length
    ? (candidates.reduce((sum, item) => sum + item.match_score, 0) / candidates.length).toFixed(1)
    : "—";
  const strongMatches = candidates.filter((item) => item.match_score >= 8).length;

  async function handleScreen() {
    if (!resume) {
      toast.error("Upload a resume first");
      return;
    }
    if (jobDescription.trim().length < 20) {
      toast.error("Add a job description with at least a few requirements");
      return;
    }

    setScreening(true);
    try {
      const result = await runScreening({
        data: {
          fileName: resume.name,
          resumeText: resume.text,
          jobTitle: jobTitle.trim() || "Untitled role",
          jobDescription: jobDescription.trim(),
        },
      });
      toast.success(
        `${result.candidate.full_name} scored ${result.candidate.match_score}/10 for this role`,
      );
      setResume(null);
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Screening failed");
    } finally {
      setScreening(false);
    }
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const metrics = [
    { label: "Candidates screened", value: String(candidates.length), icon: Users },
    { label: "Average match score", value: averageScore, icon: Gauge },
    { label: "Strong matches (8+)", value: String(strongMatches), icon: Trophy },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <div className="flex items-center gap-2 px-2 text-sidebar-foreground">
          <ScanSearch className="size-5 text-primary" />
          <span className="font-display text-sm font-semibold">Resume Screener</span>
        </div>

        <nav className="mt-8 space-y-1">
          <span className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-accent-foreground">
            <LayoutDashboard className="size-4" /> Screening
          </span>
        </nav>

        <div className="mt-auto">
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="mr-2 size-4" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 bg-hero-glow">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold">Screening dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Score resumes against a role and keep the reasoning on file.
            </p>
          </div>
          <Button variant="ghost" className="lg:hidden" onClick={handleSignOut}>
            <LogOut className="mr-2 size-4" /> Sign out
          </Button>
        </header>

        <div className="space-y-6 px-6 py-6">
          <section className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="panel p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {metric.label}
                  </span>
                  <metric.icon className="size-4 text-primary" />
                </div>
                <p className="mt-3 font-display text-3xl font-semibold">{metric.value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-5">
              <h2 className="text-base font-semibold">1. Resume</h2>
              <p className="mt-1 text-xs text-muted-foreground">PDF or TXT, parsed in your browser.</p>
              <div className="mt-4">
                <ResumeDropzone file={resume} onFile={setResume} />
              </div>
            </div>

            <div className="panel flex flex-col p-5">
              <h2 className="text-base font-semibold">2. Job description</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Include required skills, seniority and role criteria.
              </p>
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Role title</Label>
                  <Input
                    id="job-title"
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                    placeholder="Senior Backend Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-description">Description &amp; requirements</Label>
                  <Textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    placeholder="Responsibilities, must-have skills, years of experience, education…"
                    className="min-h-[170px] resize-y"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={handleScreen} disabled={screening}>
              {screening ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Evaluating resume…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" /> Screen candidate
                </>
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              Extracts name, skills, experience and education, then scores fit 1-10.
            </span>
          </div>

          {candidatesQuery.isError ? (
            <p className="text-sm text-destructive">
              Could not load candidates: {(candidatesQuery.error as Error).message}
            </p>
          ) : (
            <CandidateTable candidates={candidates} />
          )}
        </div>
      </main>
    </div>
  );
}
