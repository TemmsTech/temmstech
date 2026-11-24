/** Minimise / maximise / restore / close glyphs shared by the screen's browser and video player. */
export const WINDOW_ICONS = {
  minimise:
    '<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path d="M3 9h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  maximise:
    '<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><rect x="3.5" y="3.5" width="11" height="11" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
  restore:
    '<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><rect x="3.5" y="6.5" width="8" height="8" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6.5 6.5V5.1a1.6 1.6 0 0 1 1.6-1.6h5.3a1.6 1.6 0 0 1 1.6 1.6v5.3a1.6 1.6 0 0 1-1.6 1.6h-1.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  close:
    '<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path d="m3.5 3.5 11 11m0-11-11 11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
} as const;
