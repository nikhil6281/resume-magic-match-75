import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, FileSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type Candidate = {
  id: string;
  full_name: string;
  skills: string[];
  years_experience: number;
  education: string;
  match_score: number;
  justification: string;
  file_name: string;
  created_at: string;
};

type SortKey = "full_name" | "years_experience" | "match_score" | "created_at";

export function scoreTier(score: number): "high" | "mid" | "low" {
  if (score >= 8) return "high";
  if (score >= 5) return "mid";
  return "low";
}

export function ScoreBadge({ score }: { score: number }) {
  const tier = scoreTier(score);
  return (
    <span
      className={cn(
        "inline-flex min-w-14 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tier === "high" && "bg-score-high text-score-high-foreground",
        tier === "mid" && "bg-score-mid text-score-mid-foreground",
        tier === "low" && "bg-score-low text-score-low-foreground",
      )}
    >
      {score}/10
    </span>
  );
}

export function CandidateTable({ candidates }: { candidates: Candidate[] }) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<"all" | "high" | "mid" | "low">("all");
  const [sortKey, setSortKey] = useState<SortKey>("match_score");
  const [ascending, setAscending] = useState(false);
  const [active, setActive] = useState<Candidate | null>(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = candidates.filter((candidate) => {
      const matchesTier = tier === "all" || scoreTier(candidate.match_score) === tier;
      const matchesQuery =
        !needle ||
        candidate.full_name.toLowerCase().includes(needle) ||
        candidate.education.toLowerCase().includes(needle) ||
        candidate.skills.some((skill) => skill.toLowerCase().includes(needle));
      return matchesTier && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      const compared =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      return ascending ? compared : -compared;
    });
  }, [candidates, query, tier, sortKey, ascending]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAscending((value) => !value);
      return;
    }
    setSortKey(key);
    setAscending(key === "full_name");
  }

  const SortHeader = ({ label, sortBy }: { label: string; sortBy: SortKey }) => (
    <button
      type="button"
      onClick={() => toggleSort(sortBy)}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
      {sortKey === sortBy ? (
        ascending ? (
          <ArrowUp className="size-3" />
        ) : (
          <ArrowDown className="size-3" />
        )
      ) : null}
    </button>
  );

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Candidate pipeline</h2>
          <p className="text-xs text-muted-foreground">
            {rows.length} of {candidates.length} candidates shown
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, skill, education"
            className="w-56"
          />
          <Select value={tier} onValueChange={(value) => setTier(value as typeof tier)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All scores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All scores</SelectItem>
              <SelectItem value="high">High (8-10)</SelectItem>
              <SelectItem value="mid">Medium (5-7)</SelectItem>
              <SelectItem value="low">Low (1-4)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortHeader label="Candidate" sortBy="full_name" />
              </TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>
                <SortHeader label="Experience" sortBy="years_experience" />
              </TableHead>
              <TableHead>Education</TableHead>
              <TableHead>
                <SortHeader label="Match" sortBy="match_score" />
              </TableHead>
              <TableHead className="text-right">Report</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No candidates yet. Screen a resume to populate the pipeline.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <span className="font-medium">{candidate.full_name}</span>
                    <span className="block text-xs text-muted-foreground">{candidate.file_name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-xs flex-wrap gap-1">
                      {candidate.skills.slice(0, 6).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 6 ? (
                        <span className="px-1 text-xs text-muted-foreground">
                          +{candidate.skills.length - 6}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{candidate.years_experience} yrs</TableCell>
                  <TableCell className="max-w-[220px] text-sm text-muted-foreground">
                    {candidate.education || "—"}
                  </TableCell>
                  <TableCell>
                    <ScoreBadge score={candidate.match_score} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="secondary" size="sm" onClick={() => setActive(candidate)}>
                      <FileSearch className="mr-1 size-3.5" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {active?.full_name}
              {active ? <ScoreBadge score={active.match_score} /> : null}
            </DialogTitle>
            <DialogDescription>
              {active?.years_experience} years experience · {active?.education || "Education not found"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Extracted skills
              </h3>
              <div className="mt-2 flex flex-wrap gap-1">
                {active?.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Match justification
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {active?.justification}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
