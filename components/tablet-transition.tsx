"use client";
import { useRef } from "react";
import { useDeviceKind, useTabletTransition } from "@/hooks";
import type { DeviceKind } from "@/lib/device-kind";
import type { TransitionDevice } from "@/lib/tablet-scene";

type TransitionProps = {
  fromId: string;
  toId: string;
  /** Which device rises and zooms into the next section. */
  device?: TransitionDevice;
  /** The kinds of visitor's device this transition plays for. */
  forKinds: readonly DeviceKind[];
};

export function TabletTransition({
  forKinds,
  ...props
}: TransitionProps) {
  const kind = useDeviceKind();
  if (!forKinds.includes(kind)) return null;
  return <Runway {...props} />;
}

function Runway({
  fromId,
  toId,
  device = "tablet",
}: Omit<TransitionProps, "forKinds">) {
  const runway = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const status = useTabletTransition(runway, host, fromId, toId, device);
  return (
    <div
      ref={runway}
      className="tablet-transition"
      data-renderer={status}
      data-device={device}
      aria-hidden="true"
    >
      <noscript>
        <style>{".tablet-transition { display: none; }"}</style>
      </noscript>
      <div ref={host} className="tablet-transition-stage" hidden />
    </div>
  );
}
