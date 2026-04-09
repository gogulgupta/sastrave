import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";
import "./App.css";

import Home from "./components/Home";
import Location from "./components/Location";
import Radar from "./components/Radar";
import Decrypt from "./components/Decrypt";
import Login from "./components/Login";

export default function App() {
  const [panel, setPanel] = useState("home");
  const [user, setUser] = useState(null);
  const [mqttStatus, setMqttStatus] = useState("DISCONNECTED");

  // 🔥 MQTT CLIENT SHOULD NEVER CAUSE RE-RENDER
  const mqttClientRef = useRef(null);

  /* ================= MQTT INIT (ONLY ONCE) ================= */
  useEffect(() => {
    if (mqttClientRef.current) return;

    const client = mqtt.connect(
      "wss://a738d3b00ce44d5b910cf43df07f4340.s1.eu.hivemq.cloud:8884/mqtt",
      {
        username: "Gogulgupta",
        password: "Gogul162905@",
        clientId: "web_app_" + Math.random().toString(16).slice(2),
        clean: true,
        reconnectPeriod: 2000,
        keepalive: 30,
      }
    );

    mqttClientRef.current = client;

    client.on("connect", () => {
      console.log("✅ MQTT CONNECTED (APP)");
      setMqttStatus("CONNECTED");

      // GLOBAL SUBSCRIPTIONS
      client.subscribe([
        "shoes/bmp280",
        "shoes/steps",
      
        "shoes/radar/distance",
        "shoes/radar/angle",
        "shoes/radar/presence",
      
        "shoes/emergency",
        "shoes/relay/status",
      ]);      
    });

    client.on("reconnect", () => {
      console.log("🔁 MQTT RECONNECTING...");
      setMqttStatus("RECONNECTING");
    });

    client.on("close", () => {
      console.log("❌ MQTT DISCONNECTED");
      setMqttStatus("DISCONNECTED");
    });

    client.on("error", (err) => {
      console.error("MQTT ERROR:", err);
    });

    return () => {
      client.end(true);
      mqttClientRef.current = null;
    };
  }, []);

  const mqttClient = mqttClientRef.current;

  return (
    <div className="app">
      {/* MQTT STATUS BADGE */}
      <div className={`mqtt-status ${mqttStatus.toLowerCase()}`}>
        MQTT: {mqttStatus}
      </div>

      <div className="content">
        {/* HOME */}
        <div className={`panel ${panel === "home" ? "active" : ""}`}>
          <Home user={user} mqttClient={mqttClient} />
        </div>

        {/* LOCATION */}
        <div className={`panel ${panel === "loc" ? "active" : ""}`}>
          <Location mqttClient={mqttClient} />
        </div>

        {/* RADAR */}
        <div className={`panel ${panel === "radar" ? "active" : ""}`}>
          <Radar mqttClient={mqttClient} />
        </div>

        {/* DECRYPT */}
        <div className={`panel ${panel === "dec" ? "active" : ""}`}>
          <Decrypt mqttClient={mqttClient} />
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
