import { useState, useCallback, useMemo } from "react";
import { CBC } from "../../data/constants";
import { useTool } from "../../hooks/useTool";
import { Sel, Txt, Btn } from "../ui/SharedUI";
import GeneratorLayout from "../ui/GeneratorLayout";

export default function AssessmentCreator({ session }) {
  const [form, setForm] = useState({ level: "", grade: "", area: "", topic: "", assessment_type: "Written Quiz", outcomes: "" });
  const { loading, result, error, run, retry, timeout } = useTool();

  const updateForm = useCallback((key, value) => setForm(f => ({ ...f, [key]: value })), []);
  const handleLevelChange = useCallback((v) => setForm(f => ({ ...f, level: v, grade: "", area: "" })), []);

  const grades = useMemo(() => form.level ? CBC.levels[form.level]?.grades : [], [form.level]);
  const areas = useMemo(() => form.level ? CBC.levels[form.level]?.areas : [], [form.level]);
  
  // Standard CBC Assessment Types
  const assessmentTypes = ["Written Quiz", "Observation Checklist", "Oral Questions", "Project Rubric", "Portfolio Guide"];

  const executeRun = (refinementPrompt = null) => {
    run("/api/generate/assessment", {
      level: form.level || "Not specified",
      grade: form.grade || "Not specified",
      area: form.area || "Not specified",
      topic: form.topic,
      type: form.assessment_type,
      outcomes: form.outcomes,
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
      spinnerMsg="Designing assessment tools…"
      title="📋 Assessment Tool"
      docType="assessment"
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
        <Txt label="Topic / Concept" value={form.topic} onChange={v => updateForm('topic', v)} placeholder="e.g. Properties of Matter…" req />
        <Sel label="Assessment Type" value={form.assessment_type} onChange={v => updateForm('assessment_type', v)} options={assessmentTypes} />
      </div>

      <Txt label="Specific Outcomes to Assess (optional)" value={form.outcomes} onChange={v => updateForm('outcomes', v)} placeholder="e.g. Learner should be able to identify solids…" />
      
      <Btn onClick={submit} disabled={loading} color="#9333ea">
        {loading ? "Generating…" : "📋 Create Assessment"}
      </Btn>
    </GeneratorLayout>
  );
}