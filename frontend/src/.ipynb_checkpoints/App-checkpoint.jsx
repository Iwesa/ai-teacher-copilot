import { useState, useMemo, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { CBC, TOOLS } from "./data/constants";
import LessonPlanner from "./components/features/LessonPlanner";
import TeachingStrategies from "./components/features/TeachingStrategies";
import AssessmentCreator from "./components/features/AssessmentCreater";
import Dashboard from "./components/Dashboard";
import Auth from "./components/Auth";
import "./App.css";

// We need to add the Dashboard to our list of tools for the tabs
const NAV_TABS = [...TOOLS, { id: 'dashboard', label: 'My Dashboard', desc: 'Saved documents', icon: '📂', bg: '#f1f5f9', color: '#475569' }];

export default function App() {
  const [session, setSession] = useState(null);
  const [active, setActive] = useState("planner");
  
  // 1. Check for logged-in user on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const tool = useMemo(() => NAV_TABS.find(t => t.id === active), [active]);

  // 2. If no session, render the Login Screen
  if (!session) {
    return <Auth />;
  }

  // 3. If logged in, render the main application
  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ background: "var(--accent)", padding: "0 24px", boxShadow: "0 2px 12px rgba(0,0,0,.18)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span style={{ fontSize: 22 }}>🇰🇪</span>
            <div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>AI Teacher Copilot</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.7)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Kenya CBC · Grades 1 – 9</div>
            </div>
          </div>
          
          {/* Logout Button */}
          <button 
            onClick={() => supabase.auth.signOut()} 
            style={{ fontSize: 12, color: "var(--accent)", background: "#fff", border: "none", padding: "6px 14px", borderRadius: 20, fontWeight: 700, cursor: "pointer" }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 40px" }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {NAV_TABS.map(t => (
            <button 
              key={t.id} 
              onClick={() => setActive(t.id)} 
              style={{ padding: "13px 14px", borderRadius: 10, border: `2px solid ${active === t.id ? t.color : "var(--border)"}`, background: active === t.id ? t.bg : "var(--card)", cursor: "pointer", textAlign: "left", transition: "all 0.15s ease" }}
            >
              <div style={{ fontSize: 19, marginBottom: 4 }}>{t.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, color: active === t.id ? t.color : "var(--text)" }}>{t.label}</div>
            </button>
          ))}
        </div>

        {/* Active View */}
        <div key={active} style={{ animation: "fadeUp 0.2s ease" }}>
          {active === "planner" && <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "22px" }}><LessonPlanner session={session} /></div>}
          {active === "teaching" && <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "22px" }}><TeachingStrategies session={session} /></div>}
          {active === "assessment" && <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "22px" }}><AssessmentCreator session={session} /></div>}
          {active === "dashboard" && <Dashboard session={session} />}
        </div>
      </main>
    </div>
  );
}