import { getStatusColor, getStatusBg } from "@/lib/utils";
import { STATUS_LABELS, OrderStatus } from "@/types";

interface Props { status: OrderStatus; size?: "sm" | "md"; }

export default function StatusBadge({ status, size = "md" }: Props) {
  const color = getStatusColor(status);
  const bg = getStatusBg(status);
  return (
    <span style={{ color, backgroundColor: bg, border: `1px solid ${color}30`, padding: size === "sm" ? "2px 6px" : "3px 8px", fontSize: size === "sm" ? "10px" : "11px", letterSpacing: "0.04em", borderRadius: "4px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
      <span style={{ width: size === "sm" ? 4 : 5, height: size === "sm" ? 4 : 5, borderRadius: "50%", backgroundColor: color, boxShadow: `0 0 4px ${color}`, display: "inline-block", flexShrink: 0 }} />
      {STATUS_LABELS[status]}
    </span>
  );
}