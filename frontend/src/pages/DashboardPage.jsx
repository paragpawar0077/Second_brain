import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppLayout from "../components/AppLayout";
import GlassCard from "../components/GlassCard";
import { getStats, getRecentActivity, getInsights } from "../services/dashboardService";

const StatCard = ({ label, value, color, icon, delay }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      if (current < value) { current++; setCount(current); }
      else clearInterval(timer);
    }, 60);
    return () => clearInterval(timer);
  }, [value]);

  const colors = {
    cyan: { text: "#00d4ff", bg: "rgba(0,212,255,0.1)", bar: "linear-gradient(90deg,#00d4ff,#0ea5e9)" },
    purple: { text: "#a78bfa", bg: "rgba(167,139,250,0.1)", bar: "linear-gradient(90deg,#a78bfa,#8b5cf6)" },
    green: { text: "#34d399", bg: "rgba(52,211,153,0.1)", bar: "linear-gradient(90deg,#34d399,#10b981)" },
    pink: { text: "#f472b6", bg: "rgba(244,114,182,0.1)", bar: "linear-gradient(90deg,#f472b6,#ec4899)" },
  };
  const c = colors[color];

  return (
    <GlassCard delay={delay} className="p-5">
      <div style={{ padding: "18px" }}>
        <div style={{ fontSize: "10px", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
          {label}
        </div>
        <div style={{ fontSize: "36px", fontWeight: 600, color: c.text, lineHeight: 1 }}>
          {count}
        </div>
        <div style={{ marginTop: "12px", height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(value * 10, 100)}%` }}
            transition={{ duration: 1, delay: delay + 0.3 }}
            style={{ height: "100%", borderRadius: "2px", background: c.bar }}
          />
        </div>
        <div style={{ position: "absolute", top: "16px", right: "16px", fontSize: "20px", opacity: 0.2 }}>{icon}</div>
      </div>
    </GlassCard>
  );
};

const actionColors = {
  upload: { bg: "rgba(0,212,255,0.1)", color: "#00d4ff", border: "rgba(0,212,255,0.2)" },
  search: { bg: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "rgba(167,139,250,0.2)" },
  ask: { bg: "rgba(52,211,153,0.1)", color: "#34d399", border: "rgba(52,211,153,0.2)" },
  note: { bg: "rgba(244,114,182,0.1)", color: "#f472b6", border: "rgba(244,114,182,0.2)" },
  delete: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.2)" },
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, r, i] = await Promise.all([getStats(), getRecentActivity(), getInsights()]);
        setStats(s);
        setRecent(r);
        setInsights(i.insights);
      } catch (err) { console.error(err); }
    };
    fetchAll();
  }, []);

  const statCards = stats ? [
    { label: "Documents", value: stats.total_documents, color: "cyan", icon: "◫" },
    { label: "Notes", value: stats.total_notes, color: "purple", icon: "◎" },
    { label: "Searches", value: stats.total_searches, color: "green", icon: "◉" },
    { label: "Questions", value: stats.total_questions_asked, color: "pink", icon: "◈" },
  ] : [];

  return (
    <AppLayout>
      <div style={{ color: "#e2e8f0", fontFamily: "Inter, sans-serif" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            Neural Dashboard
          </div>
          <div style={{ fontSize: "13px", color: "rgba(226,232,240,0.4)", marginTop: "4px" }}>
            Real-time knowledge system overview
          </div>
          <div style={{ width: "40px", height: "2px", background: "linear-gradient(90deg,#00d4ff,transparent)", marginTop: "8px" }} />
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
          {statCards.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.1} />
          ))}
        </div>

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

          {/* Recent Activity */}
          <GlassCard delay={0.4}>
            <div style={{ padding: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "rgba(226,232,240,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 6px #00d4ff", display: "inline-block" }} />
                Recent Activity
              </div>
              {recent.length === 0 ? (
                <div style={{ fontSize: "13px", color: "rgba(226,232,240,0.3)", textAlign: "center", padding: "20px 0" }}>
                  No activity yet. Upload a document to start.
                </div>
              ) : (
                recent.map((a, i) => {
                  const c = actionColors[a.action_type] || actionColors.search;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "flex-start" }}
                    >
                      <span style={{ fontSize: "9px", fontWeight: 600, padding: "3px 7px", borderRadius: "4px", background: c.bg, color: c.color, border: `1px solid ${c.border}`, textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0, marginTop: "2px" }}>
                        {a.action_type}
                      </span>
                      <div>
                        <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.6)" }}>{a.description}</div>
                        <div style={{ fontSize: "10px", color: "rgba(226,232,240,0.25)", marginTop: "2px" }}>
                          {new Date(a.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </GlassCard>

          {/* Insights */}
          <GlassCard delay={0.5}>
            <div style={{ padding: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "rgba(226,232,240,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 6px #a78bfa", display: "inline-block" }} />
                Neural Insights
              </div>
              {insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    padding: "10px 12px", borderRadius: "8px", marginBottom: "8px",
                    background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.1)",
                    fontSize: "12px", color: "rgba(226,232,240,0.7)", lineHeight: 1.6,
                    display: "flex", gap: "8px",
                  }}
                >
                  <span style={{ flexShrink: 0 }}>◈</span>
                  {insight}
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;