import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <nav className="nav">
        <NavLink to="/app" end>
          Dashboard
        </NavLink>
        <NavLink to="/app/map">Map</NavLink>
        <NavLink to="/app/routes">Routes</NavLink>
        <NavLink to="/app/alerts">Alerts</NavLink>
        <NavLink to="/app/assistant">Assistant</NavLink>
        <NavLink to="/app/contacts">Contacts</NavLink>
        <NavLink to="/app/settings">Settings</NavLink>
        <span className="spacer" />
        <span className="muted" style={{ alignSelf: "center", fontSize: "0.85rem" }}>
          {user?.email}
        </span>
        <button
          type="button"
          className="emergency-btn warning"
          style={{ width: "auto", padding: "0.4rem 0.75rem", margin: 0 }}
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Logout
        </button>
      </nav>
      <Outlet />
    </>
  );
}
