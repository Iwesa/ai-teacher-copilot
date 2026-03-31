import { Spinner, ErrBox, Result } from "./SharedUI";

export default function GeneratorLayout({ 
  children,       // The input form (dropdowns, text boxes, submit button)
  loading,        // From useTool
  error,          // From useTool
  result,         // From useTool
  retry,          // From useTool
  timeout,        // From useTool
  spinnerMsg,     // e.g., "Finding the best strategies…"
  title,          // e.g., "Teaching Strategies"
  docType,        // e.g., "lesson_plan"
  metadata,       // The form data to save to Supabase
  userId,         // For saving to the database
  onRefine        // The function to run when the user asks for changes
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      
      {/* 1. Render the specific inputs passed from the parent */}
      {children}

      {/* 2. Handle all loading and error states automatically */}
      {loading && <Spinner msg={spinnerMsg} onTimeout={timeout} />}
      {error && <ErrBox message={error} onRetry={retry} />}

      {/* 3. Render the interactive Result card automatically */}
      {result && (
        <Result 
          content={result} 
          title={title} 
          isRefining={loading}
          docType={docType}
          metadata={metadata}
          userId={userId}
          onRefine={onRefine}
        />
      )}
    </div>
  );
}