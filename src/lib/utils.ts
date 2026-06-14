import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OrderStatus, LensType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function formatSLARemaining(createdAt: string, slaHours: number) {
  const deadline = new Date(createdAt).getTime() + slaHours * 3600000;
  const remaining = deadline - Date.now();
  if (remaining <= 0) {
    return { hours: Math.abs(Math.floor(remaining / 3600000)), minutes: 0, isBreached: true, percentage: 0 };
  }
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const percentage = Math.max(0, Math.min(100, (remaining / (slaHours * 3600000)) * 100));
  return { hours, minutes, isBreached: false, percentage };
}

export function getStatusColor(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    order_placed: "#94A3B8", prescription_verified: "#818CF8",
    lens_cutting: "#22D3EE", coating: "#06B6D4", qc_check: "#F59E0B",
    qc_failed: "#F43F5E", reorder: "#F97316", assembly: "#8B5CF6",
    dispatch_ready: "#10B981", dispatched: "#34D399", delivered: "#6EE7B7",
  };
  return map[status] || "#94A3B8";
}

export function getStatusBg(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    order_placed: "rgba(148,163,184,0.1)", prescription_verified: "rgba(129,140,248,0.1)",
    lens_cutting: "rgba(34,211,238,0.1)", coating: "rgba(6,182,212,0.1)",
    qc_check: "rgba(245,158,11,0.1)", qc_failed: "rgba(244,63,94,0.1)",
    reorder: "rgba(249,115,22,0.1)", assembly: "rgba(139,92,246,0.1)",
    dispatch_ready: "rgba(16,185,129,0.1)", dispatched: "rgba(52,211,153,0.1)",
    delivered: "rgba(110,231,183,0.1)",
  };
  return map[status] || "rgba(148,163,184,0.1)";
}

export function getSeverityColor(severity: string): string {
  const map: Record<string, string> = {
    low: "#10B981", medium: "#F59E0B", high: "#F97316", critical: "#F43F5E",
  };
  return map[severity] || "#94A3B8";
}

export function getSLARiskLevel(percentage: number): "safe" | "warning" | "danger" | "critical" {
  if (percentage > 50) return "safe";
  if (percentage > 30) return "warning";
  if (percentage > 10) return "danger";
  return "critical";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(amount);
}