import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Gauge, LayoutDashboard, LogOut, ScanSearch, Sparkles, Users } from "lucide-react";

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
  component: Dashboard;
});

function Dashboard() {
  return null;
}
