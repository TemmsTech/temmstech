"use client";

import { useEffect, type RefObject } from "react";

const TYPE_MS = 32; // per character while "writing"
const HOLD_MS = 2400; // how long a finished message stays readable
const ERASE_MS = 18; // per step while clearing
const ERASE_STEP = 4; // characters cleared per step
const GAP_MS = 400; // empty beat before the next message
const CARET = "▍";

/**
 * Writes the given messages into a text box's placeholder, one after another,
 * as if someone were typing. It works on the element directly (no React state),
 * so the form never re-renders while it plays.
 *
 * It stops for good the moment the visitor clicks into the box or types or
 * pastes something, leaving the message they were looking at in place. Merely
 * having the box focused does not stop it: the contact form focuses the box
 * itself when it opens. It also pauses while the box is off screen or the tab
 * is hidden, and does nothing for reduced motion.
 */
export function useTypingPlaceholder(
  ref: RefObject<HTMLTextAreaElement | null>,
  messages: readonly string[],
) {
  useEffect(() => {
    const field = ref.current;
    if (!field || messages.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let index = 0;
    let length = 0;
    let timer = 0;
    let onScreen = false;
    let stopped = false;

    const show = (text: string) => {
      field.placeholder = text;
    };
    const clear = () => window.clearTimeout(timer);
    const later = (step: () => void, ms: number) => {
      timer = window.setTimeout(step, ms);
    };

    function erase() {
      length = Math.max(0, length - ERASE_STEP);
      show(messages[index].slice(0, length));
      if (length > 0) {
        later(erase, ERASE_MS);
        return;
      }
      index = (index + 1) % messages.length;
      later(type, GAP_MS);
    }

    function type() {
      const message = messages[index];
      length += 1;
      const done = length >= message.length;
      show(done ? message : message.slice(0, length) + CARET);
      later(done ? erase : type, done ? HOLD_MS : TYPE_MS);
    }

    // Start (or restart) the current message from an empty box.
    function play() {
      clear();
      if (stopped || !onScreen || document.hidden) return;
      length = 0;
      show("");
      later(type, GAP_MS);
    }

    function stop() {
      stopped = true;
      clear();
      show(messages[index]);
      cleanup();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) play();
        else clear();
      },
      { threshold: 0.3 },
    );
    const onVisibility = () => (document.hidden ? clear() : play());

    function cleanup() {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      field?.removeEventListener("input", stop);
      field?.removeEventListener("pointerdown", stop);
    }

    observer.observe(field);
    document.addEventListener("visibilitychange", onVisibility);
    field.addEventListener("input", stop);
    field.addEventListener("pointerdown", stop);

    return () => {
      clear();
      cleanup();
    };
  }, [ref, messages]);
}
