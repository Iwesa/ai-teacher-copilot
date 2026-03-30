/**
 * Exports HTML content to a Microsoft Word file
 */
export function exportToWord(htmlContent, filename = 'document.doc') {
  // Add necessary XML namespaces for Word to recognize the HTML
  const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export</title></head><body>`;
  const footer = `</body></html>`;
  const sourceHTML = header + htmlContent + footer;

  const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
  const fileDownload = document.createElement("a");
  
  document.body.appendChild(fileDownload);
  fileDownload.href = source;
  fileDownload.download = filename;
  fileDownload.click();
  document.body.removeChild(fileDownload);
}

/**
 * Opens a clean window with just the content and triggers the browser's Print/PDF dialog
 */
export function printToPDF(htmlContent, title) {
  const printWindow = window.open('', '', 'height=800,width=800');
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write(`
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #000; padding: 20px; }
      h2 { color: #1a6b3c; border-bottom: 2px solid #e8f3ec; padding-bottom: 6px; margin-top: 24px; font-size: 18px; text-transform: uppercase; }
      h3 { font-size: 16px; margin-top: 16px; }
      table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
      th { background-color: #f5f5f5; }
      ul, ol { margin-left: 20px; }
      li { margin-bottom: 6px; }
    </style>
  `);
  printWindow.document.write('</head><body>');
  printWindow.document.write(htmlContent);
  printWindow.document.write('</body></html>');
  
  printWindow.document.close();
  printWindow.focus();
  
  // Slight delay ensures the styles and content are fully painted before the dialog opens
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

export async function streamBackend(endpoint, payload, onMessage) {
  const ctrl = new AbortController();
  // Set a 120-second timeout to give LangGraph time to loop if needed
  const tid = setTimeout(() => ctrl.abort(), 120000); 

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try { const j = await res.json(); detail = j?.detail || detail; } catch {}
      throw new Error(`API error — ${detail}`);
    }

    // Set up the stream reader
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the incoming byte chunk and add it to our text buffer
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // Keep the last line in the buffer
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6).trim();
          if (!dataStr) continue;
          
          try {
            const parsed = JSON.parse(dataStr);
            onMessage(parsed); // Send the parsed JSON back to our React hook
          } catch (e) {
            console.error("Failed to parse SSE JSON:", dataStr);
          }
        }
      }
    }
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("Request timed out (120s). The AI is taking too long to generate the rubric.");
    }
    throw e;
  } finally {
    clearTimeout(tid);
  }
}

/**
 * Copies text to the user's clipboard
 */
export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = Object.assign(document.createElement("textarea"), {
    value: text,
    style: "position:fixed;top:-9999px;left:-9999px;opacity:0",
  });
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  if (!ok) throw new Error("Copy not supported in this browser.");
}

export async function saveToDatabase(title, type, content, metadata, userId) {
  const res = await fetch("${import.meta.env.VITE_API_URL}/api/db/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, type, content, metadata, user_id: userId }),
  });

  if (!res.ok) throw new Error("Failed to save to database");
  return await res.json();
}