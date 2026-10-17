import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Candidates from "./pages/Candidates.jsx";

function NotFound() {
  return <div className="state"><p className="state-title">Page not found</p><Link to="/" className="link">Back to dashboard</Link></div>;
}

export default function App() {
  return <BrowserRouter><ToastProvider><Routes><Route element={<Layout />}><Route path="/" element={<Dashboard />} /><Route path="/candidates" element={<Candidates />} /><Route path="*" element={<NotFound />} /></Route></Routes></ToastProvider></BrowserRouter>;
}
