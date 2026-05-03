import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { logout } from "../services/authService";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "◈" },
  { path: "/documents", label: "Documents", icon: "◫" },
  { path: "/search", label: "Search", icon: "◉" },
  { path: "/chat", label: "Neural Chat", icon: "◎" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        width: "220px", flexShrink: 0,
        background: "rgba(2,8,23,0.9)",
        borderRight: "1px solid rgba(0,212,255,0.1)",
        backdropFilter: "blur(20px)",
        display: "flex", flexDirection: "column",
        padding: "24px 0",
        position: "relative", zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(0,212,255,0.1)", marginBottom: "16px" }}>
        <div style={{ fontSize: "24px" }}>🧠</div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#00d4ff", letterSpacing: "0.05em", marginTop: "6px" }}>
          AI SECOND BRAIN
        </div>
        <div style={{ fontSize: "10px", color: "rgba(0,212,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Neural Interface v2.0
        </div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: "0 12px" }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ x: 4 }}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", borderRadius: "10px", marginBottom: "4px",
                  background: isActive ? "rgba(0,212,255,0.08)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(0,212,255,0.2)" : "transparent"}`,
                  color: isActive ? "#00d4ff" : "rgba(226,232,240,0.5)",
                  fontSize: "13px", fontWeight: isActive ? 500 : 400,
                  transition: "all 0.2s", cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "15px", width: "20px", textAlign: "center" }}>{item.icon}</span>
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: "#00d4ff", marginLeft: "auto",
                      boxShadow: "0 0 8px #00d4ff",
                    }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* User footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(0,212,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 600, color: "white",
            boxShadow: "0 0 12px rgba(14,165,233,0.4)",
          }}>
            U
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "#e2e8f0" }}>User</div>
            <div style={{ fontSize: "10px", color: "#10b981" }}>● Online</div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          style={{
            width: "100%", background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px",
            padding: "8px", color: "#f87171", fontSize: "12px",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          Logout
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;