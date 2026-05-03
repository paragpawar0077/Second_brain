import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "../components/AppLayout";
import GlassCard from "../components/GlassCard";
import { uploadPDF, createNote, listDocuments, deleteDocument } from "../services/documentService";

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("upload");

  const fetchDocuments = async () => {
    try { setDocuments(await listDocuments()); }
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      const result = await uploadPDF(file);
      showMessage(`${result.title} uploaded and indexed. ${result.characters_extracted} chars extracted.`, "success");
      setFile(null);
      fetchDocuments();
    } catch (err) {
      showMessage(err.response?.data?.detail || "Upload failed", "error");
    } finally { setLoading(false); }
  };

  const handleNote = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createNote(noteTitle, noteContent);
      showMessage(`Note "${result.title}" saved and indexed.`, "success");
      setNoteTitle(""); setNoteContent("");
      fetchDocuments();
    } catch { showMessage("Note creation failed", "error"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await deleteDocument(id); fetchDocuments(); }
    catch (err) { console.error(err); }
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(0,212,255,0.15)", borderRadius: "10px",
    padding: "12px 14px", color: "#e2e8f0", fontSize: "13px",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <AppLayout>
      <div style={{ color: "#e2e8f0" }}>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#f1f5f9" }}>Document Matrix</div>
          <div style={{ fontSize: "13px", color: "rgba(226,232,240,0.4)", marginTop: "4px" }}>Upload PDFs and create knowledge nodes</div>
          <div style={{ width: "40px", height: "2px", background: "linear-gradient(90deg,#00d4ff,transparent)", marginTop: "8px" }} />
        </motion.div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {["upload", "note"].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
                border: `1px solid ${activeTab === tab ? "rgba(0,212,255,0.3)" : "rgba(0,212,255,0.1)"}`,
                background: activeTab === tab ? "rgba(0,212,255,0.1)" : "transparent",
                color: activeTab === tab ? "#00d4ff" : "rgba(226,232,240,0.4)",
                cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em",
              }}
            >
              {tab === "upload" ? "◫ Upload PDF" : "◎ Create Note"}
            </motion.button>
          ))}
        </div>

        {/* Message */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                marginBottom: "16px", padding: "12px 16px", borderRadius: "10px", fontSize: "13px",
                background: message.type === "success" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${message.type === "success" ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: message.type === "success" ? "#34d399" : "#f87171",
              }}
            >
              {message.type === "success" ? "✓ " : "✕ "}{message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>

          {/* Upload form */}
          {activeTab === "upload" && (
            <GlassCard delay={0.1}>
              <form onSubmit={handleUpload} style={{ padding: "20px" }}>
                <div style={{ fontSize: "11px", fontWeight: 500, color: "rgba(226,232,240,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 6px #00d4ff", display: "inline-block" }} />
                  Upload PDF
                </div>
                <label htmlFor="fileInput" style={{ display: "block", border: "2px dashed rgba(0,212,255,0.2)", borderRadius: "12px", padding: "32px", textAlign: "center", cursor: "pointer", marginBottom: "14px", background: file ? "rgba(0,212,255,0.04)" : "transparent", transition: "all 0.2s" }}>
                  <input type="file" id="fileInput" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} />
                  <div style={{ fontSize: "28px", marginBottom: "8px", opacity: 0.5 }}>◫</div>
                  <div style={{ fontSize: "13px", color: "rgba(226,232,240,0.5)" }}>{file ? file.name : "Click to select PDF"}</div>
                  <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.25)", marginTop: "4px" }}>PDF files only</div>
                </label>
                <motion.button type="submit" disabled={loading || !file} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  style={{ width: "100%", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", border: "none", borderRadius: "10px", padding: "12px", color: "white", fontSize: "13px", fontWeight: 600, cursor: file ? "pointer" : "not-allowed", opacity: !file ? 0.5 : 1, letterSpacing: "0.05em", boxShadow: "0 0 20px rgba(14,165,233,0.2)" }}>
                  {loading ? "INDEXING..." : "UPLOAD & INDEX"}
                </motion.button>
              </form>
            </GlassCard>
          )}

          {/* Note form */}
          {activeTab === "note" && (
            <GlassCard delay={0.1}>
              <form onSubmit={handleNote} style={{ padding: "20px" }}>
                <div style={{ fontSize: "11px", fontWeight: 500, color: "rgba(226,232,240,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px #34d399", display: "inline-block" }} />
                  Create Note
                </div>
                <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Note title..." required style={{ ...inputStyle, marginBottom: "10px" }} />
                <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Write your knowledge here..." rows={5} required style={{ ...inputStyle, resize: "none", marginBottom: "14px" }} />
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  style={{ width: "100%", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: "10px", padding: "12px", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em", boxShadow: "0 0 20px rgba(16,185,129,0.2)" }}>
                  {loading ? "SAVING..." : "SAVE NOTE"}
                </motion.button>
              </form>
            </GlassCard>
          )}

          {/* Document list */}
          <GlassCard delay={0.2}>
            <div style={{ padding: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "rgba(226,232,240,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f472b6", boxShadow: "0 0 6px #f472b6", display: "inline-block" }} />
                Indexed Documents ({documents.length})
              </div>
              {documents.length === 0 ? (
                <div style={{ textAlign: "center", color: "rgba(226,232,240,0.3)", padding: "20px", fontSize: "13px" }}>No documents yet.</div>
              ) : (
                <AnimatePresence>
                  {documents.map((doc, i) => (
                    <motion.div key={doc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.05 }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: "10px", marginBottom: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.2s" }}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#e2e8f0" }}>{doc.title}</div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "4px", alignItems: "center" }}>
                          <span style={{ fontSize: "9px", fontWeight: 600, padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.05em", background: doc.source_type === "pdf" ? "rgba(0,212,255,0.1)" : "rgba(52,211,153,0.1)", color: doc.source_type === "pdf" ? "#00d4ff" : "#34d399", border: `1px solid ${doc.source_type === "pdf" ? "rgba(0,212,255,0.2)" : "rgba(52,211,153,0.2)"}` }}>
                            {doc.source_type}
                          </span>
                          <span style={{ fontSize: "10px", color: "rgba(226,232,240,0.25)" }}>{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(doc.id, doc.title)}
                        style={{ background: "none", border: "none", color: "rgba(244,114,182,0.4)", cursor: "pointer", fontSize: "16px", padding: "4px 8px", transition: "color 0.2s" }}
                        onMouseEnter={(e) => e.target.style.color = "#f472b6"}
                        onMouseLeave={(e) => e.target.style.color = "rgba(244,114,182,0.4)"}
                      >✕</motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
};

export default DocumentsPage;