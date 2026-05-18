"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export interface BlobConfig {
  /** Initial top position (CSS string, e.g. "-20%" or "40px") */
  top?: string;
  /** Bottom position */
  bottom?: string;
  /** Initial left/right: provide one or the other */
  left?: string;
  right?: string;
  /** Blob size — applied to both width and height */
  size?: string | number;
  /** Radial gradient colour (RGBA recommended for transparency) */
  color?: string;
  /** How far the blob drifts on each axis (px) */
  driftX?: number;
  driftY?: number;
  /** Full cycle duration in seconds */
  duration?: number;
  /** Stagger the start so blobs don't all move together */
  delay?: number;
}

const DEFAULT_BLOBS: BlobConfig[] = [
  {
    top: "-20%", left: "10%",
    size: "50vw",
    color: "rgba(250,42,69,0.25)",
    driftX: 40, driftY: 30, duration: 8, delay: 0,
  },
  {
    bottom: "-20%", right: "5%",
    size: "45vw",
    color: "rgba(255,0,126,0.20)",
    driftX: -35, driftY: -25, duration: 10, delay: 1.5,
  },
] as BlobConfig[];

interface Props {
  blobs?: BlobConfig[];
  /** Extra inline styles on the container (position:absolute, inset:0 by default) */
  style?: React.CSSProperties;
}

export default function AnimatedBlobs({ blobs = DEFAULT_BLOBS, style }: Props) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      refs.current.forEach((el, i) => {
        if (!el) return;
        const cfg = blobs[i];
        gsap.to(el, {
          x: cfg.driftX ?? 30,
          y: cfg.driftY ?? 20,
          duration: cfg.duration ?? 8,
          delay: cfg.delay ?? 0,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    });
    return () => ctx.revert();
  }, [blobs]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        ...style,
      }}
    >
      {blobs.map((cfg, i) => (
        <div
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          style={{
            position: "absolute",
            top: cfg.top,
            bottom: cfg.bottom,
            left: cfg.left,
            right: cfg.right,
            width: cfg.size ?? "50vw",
            height: cfg.size ?? "50vw",
            maxWidth: 700,
            maxHeight: 700,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${cfg.color ?? "rgba(250,42,69,0.2)"} 0%, transparent 70%)`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
