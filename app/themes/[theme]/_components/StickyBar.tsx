"use client";

import { useEffect, useState } from "react";

interface Props {
  hostName: string;
  eventName: string;
  days: string;
  hours: string;
  mins: string;
  ctaText: string;
  ctaHref: string;
}

export default function StickyBar({
  hostName,
  eventName,
  days,
  hours,
  mins,
  ctaText,
  ctaHref,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastY;
      lastY = currentY;

      const hero = document.getElementById("hero");
      const heroPassed = hero ? hero.getBoundingClientRect().bottom < 80 : currentY > 200;

      if (!heroPassed) {
        // Above hero — always hidden
        setVisible(false);
      } else if (delta > 0) {
        // Scrolling down past hero — show
        setVisible(true);
      } else if (delta < -4) {
        // Scrolling up (with small threshold to avoid jitter) — hide
        setVisible(false);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`sticky-bar${visible ? " is-visible" : ""}`}
      id="stickyBar"
      aria-label="Registration bar"
    >
      <div className="container">
        <div className="logo">{hostName}</div>
        <div className="event-title">{eventName}</div>
        <div className="countdown" aria-label="Time until event">
          <span>
            <b>{days}</b> Days
          </span>
          <span>
            <b>{hours}</b> Hours
          </span>
          <span>
            <b>{mins}</b> Mins
          </span>
        </div>
        <a
          href={ctaHref}
          className="btn btn-primary btn-sm"
          style={{ background: "var(--accent-primary-light)", color: "var(--text-primary)" }}
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}
