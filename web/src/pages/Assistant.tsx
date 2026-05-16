import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { getCurrentPosition } from "../lib/geolocation";

const QUICK_PROMPTS = [
  "Am I in danger?",
  "What is the nearest shelter?",
  "How long until the fire reaches me?",
  "What should I pack before evacuating?"
];

export function Assistant() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("Ask FirePath AI about danger, shelters, evacuation, or conditions near you.");
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const loadLocation = useCallback(async () => {
    const position = await getCurrentPosition();
    setCoords(position);
    return position;
  }, []);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  async function ask(question: string) {
    const text = question.trim();
    if (!text) return;

    setLoading(true);
    setPrompt(text);

    try {
      const position = coords ?? (await loadLocation());
      const { data } = await api.post<{ answer: string }>("/assistant/chat", {
        question: text,
        lat: position.lat,
        lng: position.lng
      });
      setAnswer(data.answer);
    } catch {
      setAnswer("Assistant unavailable. Check login and that the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>AI Safety Assistant</h1>
      <p className="muted">
        Answers use your location, live weather, NASA FIRMS anomalies, shelters, and the risk model.
        {coords && ` · ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`}
      </p>
      <input
        className="field"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && ask(prompt)}
        placeholder="Ask an emergency question..."
      />
      <button type="button" className="emergency-btn accent" onClick={() => ask(prompt)} disabled={loading}>
        {loading ? "Thinking…" : "Ask Assistant"}
      </button>
      <div className="panel" style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>
        <p>{answer}</p>
      </div>
      <h3>Quick prompts</h3>
      <ul className="quick-prompt-list" style={{ listStyle: "none", padding: 0 }}>
        {QUICK_PROMPTS.map((item) => (
          <li key={item} style={{ marginBottom: "0.5rem" }}>
            <button
              type="button"
              className="emergency-btn quick-prompt-btn"
              style={{ width: "100%", textAlign: "left", fontWeight: 500 }}
              onClick={() => ask(item)}
              disabled={loading}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
