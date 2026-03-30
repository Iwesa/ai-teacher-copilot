import { useState, useEffect, useRef, useCallback, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { copyText, exportToWord, printToPDF, saveToDatabase } from "../../utils/helpers";

const s = {
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" },
  input: { padding: "10px 13px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--input-bg)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", lineHeight: 1.6 },
};

export const Lbl = ({ children, req, htmlFor }) => (
  <label htmlFor={htmlFor} style={s.label}>
    {children}{req && <span style={{ color: "#dc2626" }}> *</span>}
  </label>
);



export const Sel = memo(({ label, value, onChange, options, req }) => {
  const id = `sel-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div style={s.field}>
      <Lbl req={req} htmlFor={id}>{label}</Lbl>
      <select id={id} value={value} onChange={e => onChange(e.target.value)} style={{ ...s.input, cursor: "pointer" }}>
        <option value="">— select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
});

export const Txt = memo(({ label, value, onChange, placeholder, rows = 2, req }) => {
  const id = `txt-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div style={s.field}>
      <Lbl req={req} htmlFor={id}>{label}</Lbl>
      <textarea id={id} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...s.input, resize: "vertical" }} />
    </div>
  );
});

export const Btn = ({ onClick, disabled, color, children }) => (
  <button onClick={onClick} disabled={disabled}
    style={{
      padding: "13px", background: disabled ? "#9ca3af" : color, color: "#fff",
      border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
      marginTop: 4, transition: "background 0.2s"
    }}>
    {children}
  </button>
);

export function Spinner({ msg, onTimeout }) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setSecs(s => s + 1), 1000);
    // Extended timeout to 60s to account for the agentic review loop
    const to = setTimeout(() => onTimeout?.("The request took too long. Please try again."), 120000);
    return () => { clearInterval(iv); clearTimeout(to); };
  }, [onTimeout]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "28px 0", color: "var(--muted)" }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      {/* The msg will dynamically change between "Drafting" and "Evaluating" */}
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>{msg}</span>
      <span style={{ fontSize: 11, opacity: 0.6 }}>{secs}s elapsed · Graph Agent Active</span>
    </div>
  );
}
export function ErrBox({ message, onRetry }) {
  return (
    <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 10, background: "#fef2f2", border: "1.5px solid #fca5a5" }}>
      <p style={{ color: "#991b1b", fontWeight: 700, fontSize: 13, marginBottom: 5 }}>⚠️ Error</p>
      <p style={{ color: "#7f1d1d", fontSize: 13, lineHeight: 1.6, wordBreak: "break-word" }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{ marginTop: 10, padding: "6px 16px", borderRadius: 6, background: "#991b1b", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
          Retry
        </button>
      )}
    </div>
  );
}

export function Result({ content, title, isRefining, onRefine, docType, metadata, userId }) {
    const [st, setSt] = useState("idle");
    const [refineText, setRefineText] = useState("");
    const [isSaving, setIsSaving] = useState(false); // Track save state
    const contentRef = useRef(null);
    
    const handleCopy = useCallback(async () => {
    try {
      await copyText(content);
      setSt("ok");
    } catch {
      setSt("err");
    } finally {
      setTimeout(() => setSt("idle"), 2500);
    }
    }, [content]);
    
    const handleWordExport = () => {
    if (contentRef.current) {
      // Pass the actual rendered HTML to our Word exporter
      exportToWord(contentRef.current.innerHTML, `${title.replace(/ /g, '_')}.doc`);
    }
    };
    
    const handlePrint = () => {
        if (contentRef.current) {
          printToPDF(contentRef.current.innerHTML, title);
        }
    };

    const handleRefineSubmit = () => {
        if (refineText.trim() && !isRefining) {
          onRefine(refineText);
          setRefineText(""); // Clear the input after sending
        }
      };
    const handleSave = async () => {
        // Safety check: ensure the user is actually logged in
        if (!userId) {
          alert("You must be logged in to save documents.");
          return;
        }
        
        setIsSaving(true);
        try {
          // Pass the userId to the database function
          await saveToDatabase(title, docType, content, metadata, userId);
          alert("Document saved to your dashboard!");
        } catch (e) {
          alert("Error saving document.");
        } finally {
          setIsSaving(false);
        }
      };
    
    const [bg, col, lbl] = st === "ok" ? ["#d1fae5", "#065f46", "✓ Copied!"] 
                       : st === "err" ? ["#fee2e2", "#991b1b", "⚠ Failed"] 
                       : ["var(--bg)", "var(--muted)", "📋 Copy"];
    
    return (
    <div style={{ marginTop: 20, border: "1.5px solid var(--border)", borderRadius: 12, overflow: "hidden", animation: "fadeUp 0.3s ease", background: "var(--card)" }}>
      
      {/* --- Action Bar --- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "var(--card-header)", borderBottom: "1.5px solid var(--border)", flexWrap: "wrap", gap: "10px" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{title}</span>
        
        <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleSave} disabled={isSaving} style={{ padding: "5px 12px", borderRadius: 6, border: "1.5px solid var(--border)", background: isSaving ? "#cbd5e1" : "var(--accent)", color: isSaving ? "#fff" : "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
            {isSaving ? "Saving..." : "💾 Save"}
          </button>
          <button onClick={handleWordExport} style={{ padding: "5px 12px", borderRadius: 6, border: "1.5px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
            📄 Word
          </button>
          <button onClick={handlePrint} style={{ padding: "5px 12px", borderRadius: 6, border: "1.5px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
            🖨️ PDF / Print
          </button>
          <button onClick={handleCopy} style={{ padding: "5px 14px", borderRadius: 6, border: "1.5px solid var(--border)", background: bg, color: col, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
            {lbl}
          </button>
        </div>
      </div>
      
      {/* --- Rendered Content --- */}
      <div 
        ref={contentRef} 
        className="markdown-body" 
        style={{ padding: "18px 20px", maxHeight: "60vh", overflowY: "auto", fontSize: 14, lineHeight: 1.8, color: "var(--text-soft)" }}
      >
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({node, ...props}) => <h2 className="rh2" {...props} />,
            h3: ({node, ...props}) => <h3 className="rh3" {...props} />,
            ul: ({node, ...props}) => <ul style={{ margin: "10px 0 10px 24px" }} {...props} />,
            ol: ({node, ...props}) => <ol style={{ margin: "10px 0 10px 24px" }} {...props} />,
            li: ({node, ...props}) => <li style={{ paddingLeft: "4px", marginBottom: "6px" }} {...props} />,
            table: ({node, ...props}) => <table style={{ width: "100%", borderCollapse: "collapse", margin: "16px 0" }} {...props} />,
            th: ({node, ...props}) => <th style={{ border: "1px solid var(--border)", padding: "8px", background: "var(--card-header)", textAlign: "left" }} {...props} />,
            td: ({node, ...props}) => <td style={{ border: "1px solid var(--border)", padding: "8px" }} {...props} />
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
        {onRefine && (
        <div style={{ padding: "12px 16px", background: "var(--card-header)", borderTop: "1.5px solid var(--border)", display: "flex", gap: "10px", alignItems: "center" }}>
          <input 
            type="text"
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRefineSubmit()}
            placeholder="Ask AI to change something (e.g., 'Make the intro 5 mins shorter')"
            disabled={isRefining}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1.5px solid var(--border)", outline: "none", fontSize: 13.5, fontFamily: "inherit" }}
          />
          <button 
            onClick={handleRefineSubmit}
            disabled={isRefining || !refineText.trim()}
            style={{ padding: "10px 18px", borderRadius: 8, background: isRefining || !refineText.trim() ? "#cbd5e1" : "var(--accent)", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: isRefining || !refineText.trim() ? "not-allowed" : "pointer", transition: "all 0.2s" }}
          >
            {isRefining ? "Updating..." : "✨ Update"}
          </button>
        </div>
      )}
    </div>
  );
}