import { useRef, useState } from "react";
import { FileCheck2, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { extractResumeText } from "@/lib/parse-resume";

type Props = {
  file: { name: string; text: string } | null;
  onFile: (file: { name: string; text: string } | null) => void;
};

export function ResumeDropzone({ file, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);

  async function handleFiles(files: FileList | null) {
    const selected = files?.[0];
    if (!selected) return;
    setParsing(true);
    try {
      const text = await extractResumeText(selected);
      if (text.replace(/\s/g, "").length < 30) {
        throw new Error("Could not read enough text from this file. Try a text-based PDF or TXT.");
      }
      onFile({ name: selected.name, text });
      toast.success(`Parsed ${selected.name}`);
    } catch (error) {
      onFile(null);
      toast.error(error instanceof Error ? error.message : "Could not parse this file");
    } finally {
      setParsing(false);
    }
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        void handleFiles(event.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
      }}
      className={cn(
        "flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-input bg-background/40 px-6 py-8 text-center transition-colors",
        dragging && "border-primary bg-primary/5",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {parsing ? (
        <>
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Extracting resume text…</p>
        </>
      ) : file ? (
        <>
          <FileCheck2 className="size-6 text-primary" />
          <p className="mt-3 text-sm font-medium">{file.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {file.text.length.toLocaleString()} characters parsed · click to replace
          </p>
        </>
      ) : (
        <>
          <UploadCloud className="size-6 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Drop a resume here</p>
          <p className="mt-1 text-xs text-muted-foreground">PDF or TXT, up to a few hundred pages</p>
        </>
      )}
    </div>
  );
}
