"use client";
import { useEffect, useState } from "react";
import { formatSLARemaining, getSLARiskLevel } from "@/lib/utils";

interface Props { createdAt: string; slaHours: number; size?: number; strokeWidth?: number; showLabel?: boolean; }

export default function SLARing({ createdAt, slaHours, size = 56, strokeWidth = 4, showLabel = true }: Props) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(i);
  }, []);

  const { hours, minutes, isBreached, percentage } = formatSLARemaining(createdAt, slaHours);
  const risk = isBreached ? "critical" : getSLARiskLevel(percentage);
  const colorMap = { safe: "#10B981", warning: "#F59E0B", danger: "#F97316", critical: "#F43F5E" };
  const color = colorMap[risk];
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percentage / 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(30,30,53,0.8)" strokeWidth={strokeWidth} />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={isBreached ? circumference : dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease", filter: `drop-shadow(0 0 4px ${color}60)` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {isBreached ? (
            <span style={{ color, fontSize: 9, fontWeight: 700, lineHeight: 1.2 }}>BREACH</span>
          ) : (
            <>
              <span style={{ color, fontSize: size < 48 ? 10 : 12, fontWeight: 700, fontFamily: "monospace", lineHeight: 1 }}>{String(hours).padStart(2,"0")}h</span>
              <span style={{ color: "#475569", fontSize: size < 48 ? 8 : 9, fontFamily: "monospace" }}>{String(minutes).padStart(2,"0")}m</span>
            </>
          )}
        </div>
        {risk === "critical" && !isBreached && (
          <div className="breach-pulse" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${color}40` }} />
        )}
      </div>
      {showLabel && (
        <p style={{ color, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {isBreached ? `+${hours}h over` : risk === "critical" ? "Critical" : risk === "danger" ? "At Risk" : risk === "warning" ? "Monitor" : "On Track"}
        </p>
      )}
    </div>
  );
}