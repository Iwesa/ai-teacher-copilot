import { useState, useCallback, useMemo } from "react";
import { CBC } from "../../data/constants";
import { useTool } from "../../hooks/useTool";
import { Sel, Txt, Btn, Spinner, ErrBox, Result } from "../ui/SharedUI";

export default function TeachingStrategies({ session }) {
  const [form, setForm] = useState({ level: "", grade: "", area: "", topic: "", challenge: "" });
  const { loading, result, error, run, retry, timeout } = useTool();

  const updateForm = useCallback((key, value) => setForm(f => ({ ...f, [key]: value })), []);
  const handleLevelChange = useCallback((v) => setForm(f => ({ ...f, level: v, grade: "", area: "" })), []);

  const grades = useMemo(() => form.level ? CBC.levels[form.level]?.grades : [], [form.level]);
  const areas = useMemo(() => form.level ? CBC.levels[form.level]?.areas : [], [form.level]);

  const submit = () => {
    if (!form.topic.trim()) { 
      alert("Please enter a Topic or Concept."); 
      return; 
    }

    run("/api/generate/teaching-strategies", {
      level: form.level || "Not specified",
      grade: form.grade || "Not specified",
      area: form.area || "Not specified",
      topic: form.topic,
      challenge: form.challenge
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Sel label="Level (optional)" value={form.level} onChange={handleLevelChange} options={Object.keys(CBC.levels)} />
        <Sel label="Grade (optional)" value={form.grade} onChange={v => updateForm('grade', v)} options={grades} />
        <Sel label="Learning Area (optional)" value={form.area} onChange={v => updateForm('area', v)} options={areas} />
      </div>
      
      <Txt label="Topic / Concept" value={form.topic} onChange={v => updateForm('topic', v)} placeholder="e.g. Fractions, Photosynthesis…" req />
      <Txt label="Teaching Challenge (optional)" value={form.challenge} onChange={v => updateForm('challenge', v)} placeholder="e.g. Large class of 50…" />
      
      <Btn onClick={submit} disabled={loading} color="#2563eb">
        {loading ? "Generating…" : "🎯 Get Teaching Strategies"}
      </Btn>
      
      {loading && <Spinner msg="Finding the best strategies…" onTimeout={timeout} />}
      {error && <ErrBox message={error} onRetry={retry} />}
      {result && <Result content={result} title="🎯 Teaching Strategies" />}
        {result && (
        <Result 
          content={result} 
          title="🎯 Teaching Strategies" 
          isRefining={loading}
            docType="lesson_plan"
            metadata={{ level: form.level, grade: form.grade, topic: form.strand }}
            userId={session?.user?.id}
          onRefine={(promptText) => {
            // Re-run the generation, passing the current content and the user's prompt
              run("/api/generate/teaching-strategies", {
            level: form.level || "Not specified",
            grade: form.grade || "Not specified",
            area: form.area || "Not specified",
            topic: form.topic,
            challenge: form.challenge,
            current_draft: result,
            refinement_prompt: promptText
            });
          }}
        />
      )}
    </div>
  );
}