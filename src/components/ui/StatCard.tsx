"use client";
import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string; value: number | string; subtitle?: string;
  icon: LucideIcon; accent?: "indigo"|"cyan"|"danger"|"success"|"warning";
  trend?: "up"|"down"; trendValue?: string; suffix?: string;
}

const COLORS = {
  indigo: { text: "#818CF8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.2)" },
  cyan:   { text: "#22D3EE", bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.2)" },
  danger: { text: "#F43F5E", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.2)" },
  success:{ text: "#10B981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)" },
  warning:{ text: "#F59E0B", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)" },
};

export default function StatCard({ title, value, subtitle, icon: Icon, accent = "indigo", trend, trendValue, suffix }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const num = typeof value === "number" ? value : null;
  const c = COLORS[accent];

  useEffect(() => {
    if (num === null) return;
    let current = 0;
    const increment = num / 40;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) { setDisplayed(num); clearInterval(timer); }
      else setDisplayed(Math.floor(current));
    }, 800 / 40);
    return () => clearInterval(timer);
  }, [num]);

  return (
    <div style={{ background: "#0F0F1A", borderRadius: 12, border: `1px solid ${c.border}`, padding: 20, position: "relative", overflow: "hidden", transition: "all 0.3s" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 20px ${c.text}20`)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={c.text} />
        </div>
        {trend && trendValue && (
          <span style={{ fontSize: 11, fontWeight: 600, color: trend === "up" ? "#10B981" : "#F43F5E" }}>
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
        )}
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontFamily: "Sora, sans-serif", fontSize: 28, fontWeight: 700, color: c.text }} className="count-animate">
          {num !== null ? displayed : value}
        </span>
        {suffix && <span style={{ fontSize: 16, color: "#94A3B8", marginLeft: 2 }}>{suffix}</span>}
      </div>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</p>
      {subtitle && <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{subtitle}</p>}
    </div>
  );
}