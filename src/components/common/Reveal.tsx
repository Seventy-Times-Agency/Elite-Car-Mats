"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}

export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);
  // Initial state: visible from the start on browsers without
  // IntersectionObserver — keeps content reachable for legacy clients
  // and SSR (where window doesn't exist) without a setState-in-effect.
  const [visible, setVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => setVisible(true), delay);
            } else {
              setVisible(true);
            }
            obs.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  // @ts-expect-error generic ref tag
  return <Tag ref={ref} className={`fade-in ${visible ? "is-visible" : ""} ${className}`}>{children}</Tag>;
}
