import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "../components/AppLayout";
import GlassCard from "../components/GlassCard";
import { semanticSearch } from "../services/searchService";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await semanticSearch(query);
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ color: "#e2e8f0" }}>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#f1f5f9" }}>Semantic Search</div>
          <div style={{ fontSize: "13px", color: "rgba(226,232,240,0.4)", marginTop: "4px" }}>Search by meaning across your entire knowledge base</div>
          <div style={{ width: "40px", height: "2px", background: "linear-gradient(90deg,#00d4ff,transparent)", marginTop: "8px" }} />
        </motion.div>

        {/* Search bar */}
        <GlassCard delay={0.1}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", padding: "16px" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your knowledge base by meaning..."
              style={{
                flex: 1, background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(0,212,255,0.15)", borderRadius: "10px",
                padding: "12px 16px", color: "#e2e8f0", fontSize: "14px", outline: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(0,212,255,0.4)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(0,212,255,0.15)"}
            />
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(14,165,233,0.4)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: "linear-gradient(135deg,#0ea5e9,#0284c7)",
                border: "none", borderRadius: "10px", padding: "12px 24px",
                color: "white", fontSize: "13px", fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.05em",
                boxShadow: "0 0 20px rgba(14,165,233,0.3)",
              }}
            >
              {loading ? "SCANNING..." : "SEARCH"}
            </motion.button>
          </form>
        </GlassCard>

        {/* Results */}
        <div style={{ marginTop: "16px" }}>
          {searched && results.length === 0 && !loading && (
            <div style={{ textAlign: "center", color: "rgba(226,232,240,0.3)", padding: "40px", fontSize: "13px" }}>
              No results found. Try a different query.
            </div>
          )}

          <AnimatePresence>
            {results.map((result, i) => (
              <motion.div
                key={result.rank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ marginBottom: "12px" }}
              >
                <GlassCard>
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#00d4ff" }}>{result.title}</span>
                      <span style={{ fontSize: "11px", color: "rgba(226,232,240,0.25)" }}>Rank #{result.rank}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "rgba(226,232,240,0.6)", lineHeight: 1.7 }}>
                      {result.chunk_text}
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      {[
                        result.source_type === "pdf" ? "◫ PDF" : "◎ Note",
                        `Chunk #${result.chunk_index}`,
                        `doc_id: ${result.document_id}`,
                      ].map((tag, j) => (
                        <span key={j} style={{
                          fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
                          background: "rgba(0,212,255,0.06)", color: "rgba(0,212,255,0.6)",
                          border: "1px solid rgba(0,212,255,0.1)",
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
};

export default SearchPage;