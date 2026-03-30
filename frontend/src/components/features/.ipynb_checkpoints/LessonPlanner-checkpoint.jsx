import { useState, useCallback, useMemo } from "react";
import { CBC } from "../../data/constants";
import { useTool } from "../../hooks/useTool";
import { Sel, Txt, Btn, Spinner, ErrBox, Result } from "../ui/SharedUI";

export default function LessonPlanner({ session }) {
  const [form, setForm] = useState({ level: "", grade: "", area: "", strand: "", duration: "40", context: "" });
  const { loading, result, error, status, run, retry, timeout } = useTool();

  const updateForm = useCallback((key, value) => setForm(f => ({ ...f, [key]: value })), []);
  const handleLevelChange = useCallback((v) => setForm(f => ({ ...f, level: v, grade: "", area: "" })), []);

  const grades = useMemo(() => form.level ? CBC.levels[form.level]?.grades : [], [form.level]);
  const areas = useMemo(() => form.level ? CBC.levels[form.level]?.areas : [], [form.level]);

  const submit = () => {
    if (!form.level || !form.grade || !form.area) {
      alert("Please select a Level, Grade, and Learning Area.");
      return;
    }

    // Pass the endpoint and the clean JSON payload to your hook
    run("/api/generate/lesson-plan", {
      level: form.level,
      grade: form.grade,
      area: form.area,
      topic: form.strand,
      duration: form.duration,
      context: form.context
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Sel label="Level" value={form.level} onChange={handleLevelChange} options={Object.keys(CBC.levels)} req />
        <Sel label="Grade" value={form.grade} onChange={v => updateForm('grade', v)} options={grades} req />
        <Sel label="Learning Area" value={form.area} onChange={v => updateForm('area', v)} options={areas} req />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <Txt label="Strand / Topic (optional)" value={form.strand} onChange={v => updateForm('strand', v)} placeholder="e.g. Phonics, Place Value…" />
        <Sel label="Duration (mins)" value={form.duration} onChange={v => updateForm('duration', v)} options={["30", "35", "40", "45", "60", "80"]} />
      </div>
      <Txt label="Class Context (optional)" value={form.context} onChange={v => updateForm('context', v)} placeholder="e.g. mixed ability, limited textbooks…" />
      
      <Btn onClick={submit} disabled={loading} color="#1a6b3c">
        {loading ? "Generating…" : "⚡ Generate Lesson Plan"}
      </Btn>
      
      {loading && !result && <Spinner msg={status} onTimeout={timeout} />}
      {error && <ErrBox message={error} onRetry={retry} />}
      
      {result && (
        <Result 
            content={result} 
            title="📋 CBC Lesson Plan" 
            isRefining={loading}
            docType="lesson_plan"
            metadata={{ level: form.level, grade: form.grade, topic: form.strand }}
            userId={session?.user?.id}
          onRefine={(promptText) => {
            // Re-run the generation, passing the current content and the user's prompt
            run("/api/generate/lesson-plan", {
              level: form.level,
              grade: form.grade,
              area: form.area,
              topic: form.strand,
              duration: form.duration,
              context: form.context,
              current_draft: result,
              refinement_prompt: promptText
            });
          }}
        />
      )}
    </div>
  );
}
const submit = () => {
    if (!form.level || !form.grade || !form.area || !form.topic) {
      alert("Please fill in all required fields (Level, Grade, Area, Topic).");
      return;
    }
    
    // Pass the payload to your generic useTool hook
    run("/api/generate/lesson-plan", {
        level: form.level,
        grade: form.grade,
        area: form.area,
        topic: form.topic,
        duration: form.duration || "40",
        context: form.context || ""
    });
  };