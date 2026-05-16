import type { RiskPrediction } from "../api/client";

export function RiskCard({ risk }: { risk: RiskPrediction }) {
  const level =
    risk.risk_score > 0.7 ? "HIGH" : risk.risk_score > 0.4 ? "MEDIUM" : "LOW";
  const levelClass = risk.risk_score > 0.7 ? "high" : risk.risk_score > 0.4 ? "" : "low";

  return (
    <div className={`risk-card ${levelClass}`}>
      <strong>Current Wildfire Risk</strong>
      <div className="risk-level">{level}</div>
      <p className="muted">Risk score: {(risk.risk_score * 100).toFixed(1)}%</p>
      <p className="muted">Confidence: {(risk.confidence * 100).toFixed(1)}%</p>
      <p className="muted">Spread: {risk.spread_direction}</p>
      <p className="muted">Est. arrival: {risk.estimated_arrival_minutes} min</p>
    </div>
  );
}
