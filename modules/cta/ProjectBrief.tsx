"use client";

import { useRef, useState } from "react";
import { briefSamples } from "@/data/brief";
import { useTypingPlaceholder } from "@/hooks";
import { Button, buttonVariants } from "@/components/ui/button";
import { Arrow } from "@/components/arrow";
import { cn } from "@/lib/utils";
import { isValidContact, submitBrief } from "./submit-brief";

const workKinds = ["Website", "App", "Hardware", "AI", "Not sure yet"] as const;
const timings = [
  "As soon as possible",
  "In 1–3 months",
  "Just exploring",
] as const;

export function BriefForm({
  className,
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const briefField = useRef<HTMLTextAreaElement>(null);
  const [brief, setBrief] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState("");
  const [kinds, setKinds] = useState<string[]>([]);
  const [timing, setTiming] = useState("");
  const [status, setStatus] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [sending, setSending] = useState(false);

  useTypingPlaceholder(briefField, briefSamples);

  function edit(update: () => void) {
    update();
    setStatus("");
    setInvalid(false);
  }

  async function send() {
    setInvalid(!isValidContact(contact));
    setSending(true);
    const result = await submitBrief({
      message: brief.trim(),
      contact: contact.trim(),
      kinds,
      timing,
      website,
    });
    setSending(false);
    if (!result.ok) {
      setStatus(result.error);
      return;
    }
    setBrief("");
    setContact("");
    setKinds([]);
    setTiming("");
    setStatus("Thank you. Your brief is in, and we’ll be in touch.");
  }

  return (
    <div className={cn(
        "glass-panel dark-surface glass-lift p-6 text-left sm:p-8",
        className,
      )}>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close form"
          className={cn(
            buttonVariants({ variant: "destructive", size: "icon" }),
            "glass-close",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-4"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
      <label
        htmlFor="project-brief"
        className="block pr-12 text-xl font-semibold tracking-tight"
      >
        What would you like to solve?
      </label>
      <p id="brief-help" className="glass-muted mt-2 text-sm leading-6">
        Tell us what you’d like built and roughly when. Not sure yet? A quick hello is enough.
      </p>
      <textarea
        id="project-brief"
        ref={briefField}
        aria-describedby="brief-help"
        value={brief}
        onChange={(event) => edit(() => setBrief(event.target.value))}
        rows={5}
        className="glass-field mt-4 resize-none"
        placeholder={briefSamples[0]}
      />

      <div className="mt-6">
        <label htmlFor="project-contact" className="block text-sm font-medium">
          How can we reach you?
        </label>
        <input
          id="project-contact"
          type="text"
          inputMode="email"
          autoComplete="email"
          required
          aria-invalid={invalid}
          value={contact}
          onChange={(event) => edit(() => setContact(event.target.value))}
          className="glass-field mt-2"
          placeholder="Email or Phone Number"
        />
        {/* Honeypot: hidden from people, tempting to bots. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          className="absolute -left-[9999px] size-px opacity-0"
        />
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium">
          What kind of work?{" "}
          <span className="glass-muted font-normal">(optional)</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {workKinds.map((kind) => (
            <label key={kind} className="glass-chip btn btn-outline">
              <input
                type="checkbox"
                className="sr-only"
                checked={kinds.includes(kind)}
                onChange={() =>
                  edit(() =>
                    setKinds((current) =>
                      current.includes(kind)
                        ? current.filter((item) => item !== kind)
                        : [...current, kind],
                    ),
                  )
                }
              />
              {kind}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium">
          When would you like to start?{" "}
          <span className="glass-muted font-normal">(optional)</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {timings.map((option) => (
            <label key={option} className="glass-chip btn btn-outline">
              <input
                type="radio"
                name="project-timing"
                className="sr-only"
                checked={timing === option}
                onChange={() => edit(() => setTiming(option))}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-8 flex justify-center">
        <Button
          type="button"
          size="lg"
          variant="default"
          disabled={!brief.trim() || sending}
          onClick={send}
          className="w-full sm:w-auto"
        >
          {sending ? "Sending…" : "Send project brief"} <Arrow />
        </Button>
      </div>
      {/* Fixed-height line so messages never change the panel height. */}
      <p role="status" className="mt-3 min-h-5 text-center text-sm">
        {status}
      </p>
    </div>
  );
}

export function ProjectBrief({
  initiallyOpen = false,
}: {
  initiallyOpen?: boolean;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  function close() {
    if (details.current) details.current.open = false;
    summary.current?.focus();
  }
  return (
    <details
      ref={details}
      open={initiallyOpen}
      className="group mx-auto mt-8 max-w-xl"
    >
      <summary
        ref={summary}
        className={cn(
          buttonVariants({ variant: "ink", size: "lg" }),
          "mx-auto flex w-fit list-none gap-8 px-6",
        )}
      >
        Start a conversation <Arrow />
      </summary>
      <BriefForm className="mt-6" onClose={close} />
    </details>
  );
}
