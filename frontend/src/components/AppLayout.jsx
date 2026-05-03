import NeuralBackground from "./NeuralBackground";
import Navbar from "./Navbar";
import { motion } from "framer-motion";

const AppLayout = ({ children }) => {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative" }}>
      <NeuralBackground />

      {/* Grid overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <Navbar />

      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          flex: 1, overflowY: "auto",
          position: "relative", zIndex: 10,
          padding: "28px",
        }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default AppLayout;