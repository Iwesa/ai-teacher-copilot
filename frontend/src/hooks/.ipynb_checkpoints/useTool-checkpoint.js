import { useState, useRef, useCallback } from "react";
import { streamBackend } from "../utils/helpers";

export function useTool() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  
  const [status, setStatus] = useState(""); 
  
  const lastReqRef = useRef({ endpoint: "", payload: null });

  const run = useCallback(async (endpoint, payload) => {
    lastReqRef.current = { endpoint, payload };
    setLoading(true);
    setResult("");
    setError("");
    setStatus("Initializing Agents...");
    
    try {
      await streamBackend(endpoint, payload, (data) => {
        if (data.type === "clear") {
          // The reviewer rejected the draft, clear the screen for the rewrite
          setResult("");
        } else if (data.type === "token") {
          // Append the new word to the UI
          setResult((prev) => prev + data.content);
        } else if (data.type === "status") {
          // Update the phase
          setStatus(data.content);
        } else if (data.type === "error") {
          setError(data.content);
        }
      });
    } catch (e) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  }, []);

  const retry = useCallback(() => {
    const { endpoint, payload } = lastReqRef.current;
    if (endpoint && payload) run(endpoint, payload);
  }, [run]);

  const timeout = useCallback((msg) => { setError(msg); setLoading(false); }, []);

  return { loading, result, error, status, run, retry, timeout };
}