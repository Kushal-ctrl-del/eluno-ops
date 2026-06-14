"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Package, Bell, Settings, Glasses, Activity } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/alerts", label: "Alerts", icon: Bell, badge: true },
];

export default function Sidebar({ alertCount = 0 }: { alertCount?: number }) {
  const pathname = usePathname();
  return (
    <aside style={{ position: "fixed", left: 0, top: 0, height: "100vh", width: 220, background: "#0F0F1A", borderRight: "1px solid #1E1E35", display: "flex", flexDirection: "column", zIndex: 50 }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid #1E1E35" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #818CF8, #22D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Glasses size={16} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 13, color: "#F1F5F9", letterSpacing: 2 }}>ELUNO</p>
            <p style={{ fontSize: 10, color: "#475569", letterSpacing: 3, textTransform: "uppercase" }}>Ops Center</p>
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div style={{ padding: "10px 20px", borderBottom: "1px solid #1E1E35", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="status-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
        <span style={{ fontSize: 11, color: "#475569" }}>Live · Auto-refresh 30s</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "#475569", letterSpacing: 3, textTransform: "uppercase", padding: "0 8px 12px" }}>Operations</p>
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, marginBottom: 2, cursor: "pointer", background: active ? "rgba(129,140,248,0.1)" : "transparent", color: active ? "#818CF8" : "#94A3B8", transition: "all 0.2s", borderRight: active ? "2px solid #818CF8" : "2px solid transparent" }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#1A1A30"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <Icon size={15} />
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{item.label}</span>
                {item.badge && alertCount > 0 && (
                  <span style={{ background: "#F43F5E", color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {alertCount > 9 ? "9+" : alertCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px", borderTop: "1px solid #1E1E35" }}>
        <Link href="/settings">
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, color: "#475569", cursor: "pointer" }}>
            <Settings size={15} />
            <span style={{ fontSize: 13 }}>Settings</span>
          </div>
        </Link>
        <div style={{ margin: "8px 0 0", padding: 12, borderRadius: 8, background: "#14142A", border: "1px solid #1E1E35" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Activity size={11} color="#10B981" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8" }}>System Status</span>
          </div>
          <p style={{ fontSize: 10, color: "#475569" }}>All systems operational</p>
          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            {["API","DB","AI","MQ"].map((s) => (
              <span key={s} style={{ fontSize: 9, fontWeight: 700, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: 3 }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}