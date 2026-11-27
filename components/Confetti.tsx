"use client";

import { useEffect, useState } from "react";

const COLORS = ["var(--accent)", "var(--course)", "var(--amber)", "var(--velo)"];
const EVENT_NAME = "bastide-confetti";

let particleId = 0;

export function fireConfetti() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

interface Particle {
  id: number;
  left: number;
  color: string;
  delay: number;
  rotate: number;
}

export function ConfettiOverlay() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    function handle() {
      const batch: Particle[] = Array.from({ length: 28 }, () => ({
        id: particleId++,
        left: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.3,
        rotate: Math.random() * 360,
      }));
      setParticles((p) => [...p, ...batch]);
      const batchIds = new Set(batch.map((b) => b.id));
      setTimeout(() => {
        setParticles((p) => p.filter((x) => !batchIds.has(x.id)));
      }, 1600);
    }
    window.addEventListener(EVENT_NAME, handle);
    return () => window.removeEventListener(EVENT_NAME, handle);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block w-2 h-3 rounded-sm"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animation: "confetti-fall 1.3s ease-in forwards",
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
