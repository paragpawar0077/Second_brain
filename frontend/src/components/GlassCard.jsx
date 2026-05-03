import { motion } from "framer-motion";

const GlassCard = ({ children, className = "", delay = 0, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ borderColor: "rgba(0,212,255,0.3)", y: -2 }}
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(0,212,255,0.1)",
        borderRadius: "16px",
        backdropFilter: "blur(20px)",
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
      }}
      className={className}
    >
      {/* Top shimmer line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
      }} />
      {/* Corner accents */}
      <div style={{ position: "absolute", top: -1, left: -1, width: 12, height: 12, borderTop: "2px solid rgba(0,212,255,0.5)", borderLeft: "2px solid rgba(0,212,255,0.5)", borderRadius: "4px 0 0 0" }} />
      <div style={{ position: "absolute", top: -1, right: -1, width: 12, height: 12, borderTop: "2px solid rgba(0,212,255,0.5)", borderRight: "2px solid rgba(0,212,255,0.5)", borderRadius: "0 4px 0 0" }} />
      {children}
    </motion.div>
  );
};

export default GlassCard;