import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div className="landing">
      <h1>FirePath AI</h1>
      <p>Predict danger. Route safely. Alert instantly.</p>
      <Link to="/login" className="emergency-btn accent" style={{ textAlign: "center" }}>
        Get Started
      </Link>
    </div>
  );
}
