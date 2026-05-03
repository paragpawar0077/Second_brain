import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { signup } from "../services/authService";
import NeuralBackground from "../components/NeuralBackground";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signup(username, email, password);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <NeuralBackground />

      <div style={{
        position: "fixed", inset: 0, zIndex: 1,
        backgroundImage: "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        animation: "gridMove 20s linear infinite",
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: "420px",
          margin: "0 20px",
          background: "rgba(2,8,23,0.85)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(0,212,255,0.2)",
          borderRadius: "24px",
          padding: "44px",
          boxShadow: "0 0 80px rgba(0,212,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
          overflow: "hidden",
        }}
      >
        {/* Scan line */}
        <motion.div
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute", left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.6), transparent)",
            zIndex: 1,
          }}
        />

        {/* Corner accents */}
        {[["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]].map(([v, h], i) => (
          <div key={i} style={{
            position: "absolute", [v]: -1, [h]: -1,
            width: 16, height: 16,
            [`border${v.charAt(0).toUpperCase() + v.slice(1)}`]: "2px solid #00d4ff",
            [`border${h.charAt(0).toUpperCase() + h.slice(1)}`]: "2px solid #00d4ff",
            borderRadius: v === "top" && h === "left" ? "4px 0 0 0" : v === "top" ? "0 4px 0 0" : h === "left" ? "0 0 0 4px" : "0 0 4px 0",
          }} />
        ))}

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ fontSize: "44px", marginBottom: "12px" }}
          >
            🧠
          </motion.div>
          <div style={{ fontSize: "20px", fontWeight: 600, color: "#00d4ff", letterSpacing: "0.05em" }}>
            AI SECOND BRAIN
          </div>
          <div style={{ fontSize: "11px", color: "rgba(0,212,255,0.4)", letterSpacing: "0.2em", marginTop: "4px", textTransform: "uppercase" }}>
            Register Neural Profile
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171", padding: "10px 14px", borderRadius: "10px",
              fontSize: "13px", marginBottom: "16px",
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSignup}>
          {[
            { label: "Username", type: "text", value: username, onChange: setUsername, placeholder: "yourname" },
            { label: "Email Address", type: "email", value: email, onChange: setEmail, placeholder: "you@example.com" },
            { label: "Password", type: "password", value: password, onChange: setPassword, placeholder: "••••••••" },
          ].map((field, i) => (
            <div key={i} style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                {field.label}
              </div>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                required
                style={{
                  width: "100%", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(0,212,255,0.15)", borderRadius: "10px",
                  padding: "12px 16px", color: "#e2e8f0", fontSize: "14px",
                  outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(0,212,255,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(0,212,255,0.15)"}
              />
            </div>
          ))}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(14,165,233,0.4)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: "100%",
              background: loading ? "rgba(14,165,233,0.5)" : "linear-gradient(135deg, #0ea5e9, #0284c7)",
              border: "none", borderRadius: "12px", padding: "14px",
              color: "white", fontSize: "14px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.05em", marginTop: "8px",
              boxShadow: "0 0 30px rgba(14,165,233,0.3)",
            }}
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </motion.button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "rgba(226,232,240,0.3)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#00d4ff", textDecoration: "none" }}>
            Sign In
          </Link>
        </div>
      </motion.div>

      <style>{`
        @keyframes gridMove { from { transform: translateY(0); } to { transform: translateY(60px); } }
      `}</style>
    </div>
  );
};

export default SignupPage;