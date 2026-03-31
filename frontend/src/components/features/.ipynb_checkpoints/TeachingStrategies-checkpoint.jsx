import { useState, useCallback, useMemo } from "react";
import { CBC } from "../../data/constants";
import { useTool } from "../../hooks/useTool";
import { Sel, Txt, Btn } from "../ui/SharedUI";
import GeneratorLayout from "../ui/GeneratorLayout";

export default function TeachingStrategies({ session }) {
  const [form, setForm] = useState({ level: "", grade: "", area: "", topic: "", challenge: "" });
  const { loading, result, error, run, retry, timeout } = useTool();

  const updateForm = useCallback((key, value) => setForm(f => ({ ...f, [key]: value })), []);
  const handleLevelChange = useCallback((v) => setForm(f => ({ ...f, level: v, grade: "", area: "" })), []);

  const grades = useMemo(() => form.level ? CBC.levels[form.level]?.grades : [], [form.level]);
  const areas = useMemo(() => form.level ? CBC.levels[form.level]?.areas : [], [form.level]);

  const executeRun = (refinementPrompt = null) => {
    run("/api/generate/teaching-strategies", {
      level: form.level || "Not specified",
      grade: form.grade || "Not specified",
      area: form.area || "Not specified",
      topic: form.topic,
      challenge: form.challenge,
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
      spinnerMsg="Finding the best strategies…"
      title="🎯 Teaching Strategies"
      docType="teaching_strategy"
      metadata={{ level: form.level, grade: form.grade, topic: form.topic }}
      userId={session?.user?.id}
      onRefine={(prompt) => executeRun(prompt)}
    >
      {/* Everything inside here is just the input form! */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
        <Sel label="Level (optional)" value={form.level} onChange={handleLevelChange} options={Object.keys(CBC.levels)} />
        <Sel label="Grade (optional)" value={form.grade} onChange={v => updateForm('grade', v)} options={grades} />
        <Sel label="Learning Area (optional)" value={form.area} onChange={v => updateForm('area', v)} options={areas} />
      </div>
      
      <Txt label="Topic / Concept" value={form.topic} onChange={v => updateForm('topic', v)} placeholder="e.g. Fractions…" req />
      <Txt label="Teaching Challenge (optional)" value={form.challenge} onChange={v => updateForm('challenge', v)} placeholder="e.g. Large class of 50…" />
      
      <Btn onClick={submit} disabled={loading} color="#2563eb">
        {loading ? "Generating…" : "🎯 Get Teaching Strategies"}
      </Btn>
    </GeneratorLayout>
  );
}