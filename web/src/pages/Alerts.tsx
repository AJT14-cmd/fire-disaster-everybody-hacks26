import { api } from "../api/client";

export function Alerts() {
  async function sendTestAlert() {
    await api.post("/alerts/send", {
      severity: "critical",
      message: "FirePath Alert: Fire front shifted. Evacuate immediately.",
      sendSms: true,
      sendPush: true
    });
    alert("Test emergency alert dispatched.");
  }

  return (
    <div className="page">
      <h1>Emergency Alerts</h1>
      <p className="muted">Push and SMS delivery for wildfire updates.</p>
      <button type="button" className="emergency-btn danger" onClick={sendTestAlert}>
        Send Test Emergency Alert
      </button>
    </div>
  );
}
