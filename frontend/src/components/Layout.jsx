import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "../styles/Layout.css";
import Icon from "./Icons.jsx";

const LINKS = [
  { to: "/", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/candidates", label: "Candidates", icon: "users", end: false },
];

function titleFor(path) {
  if (path === "/") return "Dashboard";
  if (path === "/candidates") return "Candidates";
  if (path.startsWith("/candidates/")) return "Candidate details";
  return "HireFlow";
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="app">
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-head">
          <div className="brand">
            <img src="/favicon.svg" alt="" width="28" height="28" />
            <span>HireFlow</span>
          </div>
          <button
            className="icon-btn sidebar-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <nav className="nav">
          {LINKS.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <Icon name={icon} /> {label}
            </NavLink>
          ))}
        </nav>

        <p className="sidebar-foot">Mini ATS</p>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            className="icon-btn menu-btn"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" size={20} />
          </button>
          <h1>{titleFor(pathname)}</h1>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
