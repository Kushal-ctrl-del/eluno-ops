"use client";
import AppLayout from "@/components/layout/AppLayout";
import { Bell, Palette, Database, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppLayout title="Settings" subtitle="System configuration">
      <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { icon: Bell, label: "Alert Thresholds", desc: "Configure SLA breach probability thresholds", color: "#F59E0B" },
          { icon: Palette, label: "Appearance", desc: "Theme and display preferences", color: "#818CF8" },
          { icon: Database, label: "Data Sources", desc: "ERP integration and sync settings", color: "#22D3EE" },
          { icon: Shield, label: "Permissions", desc: "Team roles and access control", color: "#10B981" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, background: "#0F0F1A", borderRadius: 12, border: "1px solid #1E1E35", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(129,140,248,0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1E1E35")}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "#14142A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <item.icon size={18} color={item.color} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>{item.label}</p>
              <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}