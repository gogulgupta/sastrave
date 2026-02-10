import { useState } from "react";
import "./App.css";

import Home from "./components/Home";
import Location from "./components/Location";
import Radar from "./components/Radar";
import Decrypt from "./components/Decrypt";
import Login from "./components/Login";

export default function App() {
  const [panel, setPanel] = useState("home");
  const [user, setUser] = useState(null);

  return (
    <div className="app">
      <div className="content">
        {/* HOME */}
        <div className={`panel ${panel === "home" ? "active" : ""}`}>
          <Home user={user} />
        </div>

        {/* LOCATION */}
        <div className={`panel ${panel === "loc" ? "active" : ""}`}>
          <Location />
        </div>

        {/* RADAR ✅ FIX ADDED */}
        <div className={`panel ${panel === "radar" ? "active" : ""}`}>
          <Radar />
        </div>

        {/* DECRYPT */}
        <div className={`panel ${panel === "dec" ? "active" : ""}`}>
          <Decrypt />
        </div>

        {/* LOGIN */}
        <div className={`panel ${panel === "login" ? "active" : ""}`}>
          <Login setUser={setUser} setPanel={setPanel} />
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div className="bottom-bar">
        <div
          className={`nav-btn ${panel === "home" ? "active" : ""}`}
          onClick={() => setPanel("home")}
        >
          🏠
        </div>

        <div
          className={`nav-btn ${panel === "loc" ? "active" : ""}`}
          onClick={() => setPanel("loc")}
        >
          📍
        </div>

        <div
          className={`nav-btn ${panel === "radar" ? "active" : ""}`}
          onClick={() => setPanel("radar")}
        >
          🟢
        </div>

        <div
          className={`nav-btn ${panel === "dec" ? "active" : ""}`}
          onClick={() => setPanel("dec")}
        >
          🔒
        </div>

        <div
          className={`nav-btn ${panel === "login" ? "active" : ""}`}
          onClick={() => setPanel("login")}
        >
          👤
        </div>
      </div>
    </div>
  );
}
