"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Arrow } from "@/components/arrow";
import { cn } from "@/lib/utils";

export function BriefForm({
  email,
  className,
}: {
  email: string | null;
  className?: string;
}) {
  const [brief, setBrief] = useState("");
  const [status, setStatus] = useState("");

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief);
      setStatus(
        "Brief copied. Save it to share when our contact channel is available.",
      );
    } catch {
      setStatus(
        "Your browser could not copy the text. Select your brief and copy it manually.",
      );
    }
  }

  return (
    <div className={cn("rounded-lg border border-ink/25 p-5 text-left", className)}>
      <label htmlFor="project-brief" className="block text-sm font-semibold">
        What would you like to solve?
      </label>
      <p id="brief-help" className="mt-2 text-sm leading-6">
        {email
          ? "A few lines about the problem and who it affects are a good start. Your email app will open with your brief."
          : "Our contact channel is being finalised. Draft and copy your brief for now; nothing is sent or stored."}
      </p>
      <textarea
        id="project-brief"
        aria-describedby="brief-help"
        value={brief}
        onChange={(event) => {
          setBrief(event.target.value);
          setStatus("");
        }}
        rows={4}
        className="mt-4 w-full resize-y rounded-md border border-ink/40 bg-background p-3 text-sm text-foreground"
        placeholder="The problem, the people, and what a better outcome could look like…"
      />
      {email ? (
        <Button asChild className="mt-3 bg-ink text-brand hover:bg-ink/90">
          <a
            href={`mailto:${email}?subject=${encodeURIComponent("A project for TemmsTech")}&body=${encodeURIComponent(brief)}`}
          >
            Open email draft <Arrow />
          </a>
        </Button>
      ) : (
        <Button
          type="button"
          disabled={!brief.trim()}
          onClick={copyBrief}
          className="mt-3 bg-ink text-brand hover:bg-ink/90"
        >
          Copy project brief <Arrow />
        </Button>
      )}
      <p role="status" className="mt-3 text-sm">
        {status}
      </p>
    </div>
  );
}

export function ProjectBrief({
  email,
  initiallyOpen = false,
}: {
  email: string | null;
  initiallyOpen?: boolean;
}) {
  return (
    <details open={initiallyOpen} className="group mx-auto mt-8 max-w-xl">
      <summary className="mx-auto flex min-h-12 w-fit cursor-pointer list-none items-center gap-8 rounded-md bg-ink px-6 py-3 text-sm font-medium text-brand hover:bg-ink/90">
        Start a conversation <Arrow />
      </summary>
      <BriefForm email={email} className="mt-6" />
    </details>
  );
}
