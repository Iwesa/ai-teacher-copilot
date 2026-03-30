import { useState, useCallback, useMemo } from "react";
import { CBC } from "../../data/constants";
import { useTool } from "../../hooks/useTool";
import { Sel, Txt, Btn, Spinner, ErrBox, Result } from '../ui/SharedUI';

export default function AssessmentCreator({ session }) { 
  const [form, setForm] = useState({ level: "", grade: "", area: "", type: "", topic: "", outcomes: "" });

  const { loading, result, error, status, run, retry, timeout } = useTool();

  const updateForm = useCallback((key, value) => setForm(f => ({ ...f, [key]: value })), []);
  const handleLevelChange = useCallback((v) => setForm(f => ({ ...f, level: v, grade: "", area: "" })), []);

  const grades = useMemo(() => form.level ? CBC.levels[form.level]?.grades : [], [form.level]);
  const areas = useMemo(() => form.level ? CBC.levels[form.level]?.areas : [], [form.level]);

  const submit = () => {
    if (!form.type.trim() || !form.topic.trim()) { 
      alert("Please select an Assessment Type and Topic."); 
      return; 
    }

    run("/api/generate/assessment", {
      level: form.level || "Not specified",
      grade: form.grade || "Not specified",
      area: form.area || "Not specified",
      type: form.type,
      topic: form.topic,
      outcomes: form.outcomes
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Sel label="Level (optional)" value={form.level} onChange={handleLevelChange} options={Object.keys(CBC.levels)} />
        <Sel label="Grade (optional)" value={form.grade} onChange={v => updateForm('grade', v)} options={grades} />
        <Sel label="Learning Area (optional)" value={form.area} onChange={v => updateForm('area', v)} options={areas} />
      </div>
      
      <Sel label="Assessment Type" value={form.type} onChange={v => updateForm('type', v)} options={CBC.assessmentTypes} req />
      <Txt label="Topic / Concept" value={form.topic} onChange={v => updateForm('topic', v)} placeholder="e.g. Water Cycle, Fractions…" req />
      <Txt label="Learning Outcomes (optional)" value={form.outcomes} onChange={v => updateForm('outcomes', v)} placeholder="e.g. Identify stages of the water cycle…" />
      
      <Btn onClick={submit} disabled={loading} color="#b45309">
        {loading ? "Generating…" : "✅ Create Assessment Tool"}
      </Btn>
      
      {loading && !result && <Spinner msg={status || "Building your assessment tool…"} onTimeout={timeout} />}
      {error && <ErrBox message={error} onRetry={retry} />}
      
      {result && (
        <Result 
          content={result} 
          title="✅ Assessment Tool" 
          isRefining={loading}
            docType="lesson_plan"
    metadata={{ level: form.level, grade: form.grade, topic: form.strand }}
            userId={session?.user?.id}
          onRefine={(promptText) => {
            run("/api/generate/assessment", {
              level: form.level || "Not specified",
              grade: form.grade || "Not specified",
              area: form.area || "Not specified",
              type: form.type,
              topic: form.topic,
              outcomes: form.outcomes,
              current_draft: result,         
              refinement_prompt: promptText  
            });
          }}
        />
      )}
    </div>
  );
}