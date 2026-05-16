import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/app");
    } catch {
      setError("Login failed. Check email and password.");
    }
  }

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await register(email, password);
      navigate("/app");
    } catch {
      setError("Registration failed. Email may already be in use.");
    }
  }

  return (
    <div className="landing">
      <h1>Account Access</h1>
      <form onSubmit={onLogin}>
        <input
          className="field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "#ff3b30" }}>{error}</p>}
        <button type="submit" className="emergency-btn accent">
          Login
        </button>
        <button type="button" className="emergency-btn warning" onClick={onRegister}>
          Create Account
        </button>
      </form>
      <p className="muted" style={{ marginTop: "1rem" }}>
        <Link to="/">← Back</Link>
      </p>
    </div>
  );
}
