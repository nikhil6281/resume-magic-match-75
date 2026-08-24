import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Gauge, ListChecks, ScanSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-screening.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Resume Screener — AI Candidate Matching" },
      {
        name: "description",
        content:
          "Upload resumes, paste a job description, and get AI match scores from 1 to 10 with a detailed justification for every candidate.",
      },
      { property: "og:title", content: "Smart Resume Screener — AI Candidate Matching" },
      {
        property: "og:description",
        content:
          "Upload resumes, paste a job description, and get AI match scores with detailed justification reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: FileText,
    title: "Parse any resume",
    body: "Drop PDF or TXT files and extract name, skills, years of experience and education automatically.",
  },
  {
    icon: Gauge,
    title: "Semantic match score",
    body: "Every resume is scored 1-10 against your job description, not keyword-matched.",
  },
  {
    icon: ListChecks,
    title: "Justification reports",
    body: "Read exactly why a candidate scored what they scored before you open your inbox.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <ScanSearch className="size-5 text-primary" />
          <span className="font-display text-base font-semibold">Smart Resume Screener</span>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="bg-hero-glow">
        <section className="mx-auto max-w-6xl px-6 pt-10 pb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            AI screening workspace
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
            Screen every resume in seconds, with the reasoning attached.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground">
            Upload a resume, paste the role criteria, and get structured candidate data plus a
            defensible 1-10 match score you can share with the hiring team.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">
                Start screening <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          <div className="panel mt-14 overflow-hidden p-2">
            <img
              src={heroImage}
              alt="Resume cards connected by match-score data lines in a dark screening dashboard"
              width={1600}
              height={1008}
              className="w-full rounded-lg"
            />
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="panel p-5">
                <feature.icon className="size-5 text-primary" />
                <h2 className="mt-4 text-base font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        Smart Resume Screener — AI-assisted candidate evaluation.
      </footer>
    </div>
  );
}
