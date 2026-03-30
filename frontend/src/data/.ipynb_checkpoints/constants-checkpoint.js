export const CBC = {
  levels: {
    "Lower Primary": {
      grades: ["Grade 1", "Grade 2", "Grade 3"],
      areas: ["Literacy Activities", "Mathematical Activities", "Environmental Activities", "Hygiene & Nutrition", "Creative Arts", "Religious Education", "Movement & Creative Arts"],
    },
    "Upper Primary": {
      grades: ["Grade 4", "Grade 5", "Grade 6"],
      areas: ["English", "Kiswahili", "Mathematics", "Integrated Science", "Social Studies", "Creative Arts & Sports", "Religious Education", "Agriculture & Nutrition", "Home Science"],
    },
    "Junior Secondary": {
      grades: ["Grade 7", "Grade 8", "Grade 9"],
      areas: ["English", "Kiswahili/KSL", "Mathematics", "Integrated Science", "Social Studies", "Creative Arts", "Business Studies", "Agriculture", "Home Science", "Computer Science", "Physical & Health Education", "Religious Education"],
    },
  },
  competencies: ["Communication & Collaboration", "Critical Thinking & Problem Solving", "Creativity & Imagination", "Citizenship", "Digital Literacy", "Learning to Learn", "Self-Efficacy"],
  assessmentTypes: ["Formative Assessment", "Summative Assessment", "Learner Portfolio Entry", "Oral Assessment", "Practical Assessment", "Project-Based Assessment"],
};

export const TOOLS = [
  { id: "planner", icon: "📋", label: "Lesson Planner", desc: "Generate CBC-aligned lesson plans fast", color: "#1a6b3c", bg: "#f0fdf4" },
  { id: "teaching", icon: "🎯", label: "Teaching Strategies", desc: "Contextual activities & differentiation tips", color: "#2563eb", bg: "#eff6ff" },
  { id: "assessment", icon: "✅", label: "Assessment Creator", desc: "Build rubrics & CBC assessment tools", color: "#b45309", bg: "#fffbeb" },
];

export const taskGuide = {
  "Formative Assessment": "5–6 in-lesson tasks: oral questions, observation prompts, quick written/drawn tasks. No marks — record observations.",
  "Summative Assessment": "12 questions: Section A — 4 multiple choice/fill-in (1 mk each), Section B — 4 short-answer (2 mks each), Section C — 2 applied tasks (4 mks each). Total = 20 marks. Include a mark scheme.",
  "Learner Portfolio Entry": "Portfolio task prompt + 4 learner reflection questions + list of evidence the learner collects.",
  "Oral Assessment": "8 oral questions across Bloom's levels. Include expected responses for each.",
  "Practical Assessment": "Clear task instructions + step-by-step procedure + safety notes + what teacher observes.",
  "Project-Based Assessment": "Project brief (scenario) + 3–4 deliverables + 2-week timeline + assessment criteria.",
};