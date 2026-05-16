import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function Settings() {
  const { user, logout } = useAuth();
  const [alertPhone, setAlertPhone] = useState("");
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<{ alertPhone?: string | null }>("/users/profile");
        const phone = data.alertPhone ?? "";
        setAlertPhone(phone);
        setSavedPhone(phone || null);
      } catch {
        const cached = localStorage.getItem("firepath_alert_phone");
        if (cached) {
          setAlertPhone(cached);
          setSavedPhone(cached);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function saveAlertPhone() {
    setSaving(true);
    setStatus(null);
    try {
      const { data } = await api.put<{ alertPhone?: string | null; message?: string }>("/users/profile", {
        alertPhone
      });
      const phone = data.alertPhone ?? alertPhone;
      setSavedPhone(phone || null);
      localStorage.setItem("firepath_alert_phone", phone ?? "");
      setStatus(data.message ?? "Number saved for when mobile alerts launch.");
    } catch {
      localStorage.setItem("firepath_alert_phone", alertPhone);
      setSavedPhone(alertPhone || null);
      setStatus("Saved locally. Sign in and retry to sync to your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <h1>Settings & Profile</h1>
      <div className="panel">
        <p>Email: {user?.email ?? "N/A"}</p>
        <p className="muted">High contrast emergency UI enabled</p>
        <p className="muted">Offline: last route cached in browser localStorage</p>
      </div>

      <section className="panel alert-section" aria-labelledby="alerts-heading">
        <h2 id="alerts-heading" className="alert-section-title">
          Alerts
          <span className="placeholder-badge">Coming soon</span>
        </h2>
        <p className="muted alert-section-intro">
          Mobile SMS wildfire alerts are not available yet. You can save a number now; we will use it when
          notifications launch.
        </p>
        <label className="muted" htmlFor="alert-phone" style={{ display: "block", marginBottom: "0.35rem" }}>
          Mobile alert number
        </label>
        <input
          id="alert-phone"
          className="field"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+1 555 123 4567"
          value={alertPhone}
          onChange={(e) => setAlertPhone(e.target.value)}
          disabled={loading}
        />
        <button
          type="button"
          className="emergency-btn accent"
          onClick={saveAlertPhone}
          disabled={loading || saving}
        >
          {saving ? "Saving…" : "Save alert number"}
        </button>
        {savedPhone && (
          <p className="muted" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
            On file: {savedPhone} (alerts not active)
          </p>
        )}
        {status && (
          <p className="muted" style={{ marginTop: "0.5rem", marginBottom: 0, color: "#30d158" }}>
            {status}
          </p>
        )}
      </section>

      <button type="button" className="emergency-btn warning" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
