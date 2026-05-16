import { useAuth } from "../context/AuthContext";

export function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <h1>Settings & Profile</h1>
      <div className="panel">
        <p>Email: {user?.email ?? "N/A"}</p>
        <p className="muted">High contrast emergency UI enabled</p>
        <p className="muted">Offline: last route cached in browser localStorage</p>
      </div>
      <button type="button" className="emergency-btn warning" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
