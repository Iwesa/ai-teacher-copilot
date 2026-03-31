import { useState, useCallback, useMemo } from "react";
import { CBC } from "../../data/constants";
import { useTool } from "../../hooks/useTool";
import { Sel, Txt, Btn } from "../ui/SharedUI";
import GeneratorLayout from "../ui/GeneratorLayout";

export default function LessonPlanner({ session }) {
  const [form, setForm] = useState({ level: "", grade: "", area: "", topic: "", duration: "40", context: "" });
  const { loading, result, error, run, retry, timeout } = useTool();

  const updateForm = useCallback((key, value) => setForm(f => ({ ...f, [key]: value })), []);
  const handleLevelChange = useCallback((v) => setForm(f => ({ ...f, level: v, grade: "", area: "" })), []);

  const grades = useMemo(() => form.level ? CBC.levels[form.level]?.grades : [], [form.level]);
  const areas = useMemo(() => form.level ? CBC.levels[form.level]?.areas : [], [form.level]);

  const executeRun = (refinementPrompt = null) => {
    run("/api/generate/lesson-plan", {
      level: form.level || "Not specified",
      grade: form.grade || "Not specified",
      area: form.area || "Not specified",
      topic: form.topic,
      duration: form.duration,
      context: form.context,
      current_draft: result,
      refinement_prompt: refinementPrompt
    });
  };

  const submit = () => {
    if (!form.topic.trim()) return alert("Please enter a Topic or Concept.");
    executeRun();
  };

  return (
    <GeneratorLayout
      loading={loading} error={error} result={result} retry={retry} timeout={timeout}
      spinnerMsg="Drafting your lesson plan…"
      title="📝 Lesson Plan"
      docType="lesson_plan"
      metadata={{ level: form.level, grade: form.grade, topic: form.topic }}
      userId={session?.user?.id}
      onRefine={(prompt) => executeRun(prompt)}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
        <Sel label="Level (optional)" value={form.level} onChange={handleLevelChange} options={Object.keys(CBC.levels)} />
        <Sel label="Grade (optional)" value={form.grade} onChange={v => updateForm('grade', v)} options={grades} />
        <Sel label="Learning Area (optional)" value={form.area} onChange={v => updateForm('area', v)} options={areas} />
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
        <Txt label="Topic / Sub-strand" value={form.topic} onChange={v => updateForm('topic', v)} placeholder="e.g. Water Conservation…" req />
        <Txt label="Duration (mins)" value={form.duration} onChange={v => updateForm('duration', v)} placeholder="40" />
      </div>

      <Txt label="Class Context (optional)" value={form.context} onChange={v => updateForm('context', v)} placeholder="e.g. Include outdoor activities…" />
      
      <Btn onClick={submit} disabled={loading} color="#16a34a">
        {loading ? "Generating…" : "📝 Draft Lesson Plan"}
      </Btn>
    </GeneratorLayout>
  );
}