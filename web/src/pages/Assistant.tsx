import { useState } from "react";
import { api } from "../api/client";

const QUICK_PROMPTS = [
  "Am I in danger?",
  "What is the nearest shelter?",
  "How long until the fire reaches me?",
  "What should I pack before evacuating?"
];

export function Assistant() {
  const [prompt, setPrompt] = useState(QUICK_PROMPTS[0]);
  const [answer, setAnswer] = useState("Ask FirePath AI for emergency guidance.");

  async function ask() {
    const { data } = await api.post("/fire/predict", {
      latitude: 34.05,
      longitude: -118.24,
      temperature_c: 34,
      humidity_pct: 20,
      wind_speed_kph: 30,
      vegetation_dryness_index: 0.83
    });
    setAnswer(
      `Risk ${(data.risk_score * 100).toFixed(1)}% (confidence ${(data.confidence * 100).toFixed(0)}%). ` +
        `Spread ${data.spread_direction}, ETA ${data.estimated_arrival_minutes} min.`
    );
  }

  return (
    <div className="page">
      <h1>AI Safety Assistant</h1>
      <input
        className="field"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask an emergency question..."
      />
      <button type="button" className="emergency-btn accent" onClick={ask}>
        Ask Assistant
      </button>
      <div className="panel" style={{ marginTop: "1rem" }}>
        <p>{answer}</p>
      </div>
      <h3>Quick prompts</h3>
      <ul className="muted">
        {QUICK_PROMPTS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
