"use client";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout({ children, title, subtitle, alertCount = 0 }: { children: React.ReactNode; title: string; subtitle?: string; alertCount?: number }) {
  return (
    <div style={{ minHeight: "100vh", background: "#08080E", display: "flex" }}>
      <Sidebar alertCount={alertCount} />
      <div style={{ flex: 1, marginLeft: 220, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header title={title} subtitle={subtitle} alertCount={alertCount} />
        <main style={{ flex: 1, padding: 24 }} className="animate-slide-up">{children}</main>
      </div>
    </div>
  );
}