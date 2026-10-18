import { useState } from "react";
import { BrowserRouter, Link, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Candidates from "./pages/Candidates.jsx";

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const title = pathname === "/" ? "Dashboard" : "Candidates";

  return <div className="app">
    {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}
    <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
      <div className="sidebar-head">
        <Link to="/" className="brand"><img src="/favicon.svg" alt="" width="28" height="28" /><span>HireFlow</span></Link>
        <button className="icon-btn sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button>
      </div>
      <nav className="nav">
        <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>▦ Dashboard</NavLink>
        <NavLink to="/candidates" onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>♙ Candidates</NavLink>
      </nav>
    </aside>
    <div className="main">
      <header className="topbar"><button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">☰</button><h1>{title}</h1></header>
      <main className="content"><Outlet /></main>
    </div>
  </div>;
}

function NotFound() {
  return <div className="state"><p className="state-title">Page not found</p><Link to="/" className="link">Back to dashboard</Link></div>;
}

export default function App() {
  return <BrowserRouter><Routes><Route element={<Layout />}><Route path="/" element={<Dashboard />} /><Route path="/candidates" element={<Candidates />} /><Route path="*" element={<NotFound />} /></Route></Routes></BrowserRouter>;
}
