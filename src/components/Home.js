import { useEffect, useState, useRef } from "react";

export default function Home({ user, mqttClient }) {
  const [steps, setSteps] = useState(0);
  const [temp, setTemp] = useState("--");
  const [relay, setRelay] = useState(0);
  const [buzzer, setBuzzer] = useState(0);
  const [cooldown, setCooldown] = useState(false);

  const lockRef = useRef(false);

  /* ================= MOBILE CHECK ================= */
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  /* ================= MQTT ================= */
  useEffect(() => {
    if (!mqttClient) return;

    mqttClient.subscribe("shoes/bmp280");
    mqttClient.subscribe("shoes/steps");
    mqttClient.subscribe("shoes/relay/status");
    mqttClient.subscribe("shoes/buzzer/status");

    const onMessage = (topic, message) => {
      const msg = message.toString().trim();

      console.log("MQTT:", topic, msg);

      /* ===== TEMP ===== */
      if (topic === "shoes/bmp280") {
        try {
          let value;

          if (msg.startsWith("{")) {
            const d = JSON.parse(msg);
            value = d.temp || d.temperature;
          } else {
            value = Number(msg);
          }

          if (!isNaN(value)) {
            const f = (value * 9) / 5 + 32;
            setTemp(f.toFixed(1));
          }
        } catch (e) {
          console.error("Temp parse error:", msg);
        }
      }

      /* ===== STEPS ===== */
      if (topic === "shoes/steps") {
        let clean = msg;

        if (clean.includes(":")) {
          clean = clean.split(":")[1];
        }

        const val = Number(clean);
        if (!isNaN(val)) setSteps(val);
      }

      /* ===== RELAY ===== */
      if (topic === "shoes/relay/status") {
        const val = Number(msg);
        setRelay(val);

        if (val === 0) {
          setCooldown(false);
          lockRef.current = false;
        }
      }

      /* ===== BUZZER ===== */
      if (topic === "shoes/buzzer/status") {
        setBuzzer(msg === "1" || msg === "ON" ? 1 : 0);
      }
    };

    mqttClient.on("message", onMessage);

    return () => {
      mqttClient.off("message", onMessage);

      mqttClient.unsubscribe("shoes/bmp280");
      mqttClient.unsubscribe("shoes/steps");
      mqttClient.unsubscribe("shoes/relay/status");
      mqttClient.unsubscribe("shoes/buzzer/status");
    };
  }, [mqttClient]);

  /* ================= EMERGENCY MQTT ================= */
  const triggerEmergency = () => {
    if (!mqttClient || !mqttClient.connected) {
      alert("MQTT not connected");
      return;
    }

    if (lockRef.current) return;

    lockRef.current = true;
    setCooldown(true);

    mqttClient.publish("shoes/emergency/cmd", "1");

    setTimeout(() => {
      lockRef.current = false;
      setCooldown(false);
    }, 7000);
  };

  /* ================= BUZZER ================= */
  const toggleBuzzer = () => {
    if (!mqttClient || !mqttClient.connected) return;

    mqttClient.publish("shoes/buzzer/cmd", buzzer ? "OFF" : "ON");
  };

  /* ================= SMS ================= */
  const getLocationAndSendSMS = (type) => {
    if (!isMobile) {
      alert("📱 Emergency SMS works only on mobile phones");
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;

      let number = "";
      let msg = "";

      if (type === "police") {
        number = "112";
        msg = `🚨 EMERGENCY ALERT 🚨\n\n📍 Location:\n${mapLink}`;
      }

      if (type === "ambulance") {
        number = "108";
        msg = `🚑 MEDICAL EMERGENCY 🚑\n\n📍 Location:\n${mapLink}`;
      }

      window.location.href = `sms:${number}?body=${encodeURIComponent(msg)}`;
    });
  };

  /* ================= MAP ================= */
  const openNearbyPoliceStation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      window.open(
        `https://www.google.com/maps/search/police+station/@${latitude},${longitude},15z`,
        "_blank"
      );
    });
  };

  const openNearbyHospital = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      window.open(
        `https://www.google.com/maps/search/hospital/@${latitude},${longitude},15z`,
        "_blank"
      );
    });
  };

  /* ================= UI ================= */
  const relayUIOn = relay === 1 || cooldown;

  return (
    <>
      <div className="header">
        <h2>Hybrid Smart Shoes</h2>
        <div className="user-name">
          {user && "Welcome, " + (user.displayName || user.email)}
        </div>
      </div>

      {/* MODEL */}
      <div className="model-wrap">
        <div className="model-card">
          <model-viewer
            src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
            camera-controls
          />
          <div
            className="model-click-layer"
            onClick={triggerEmergency}
          />
        </div>
      </div>

      <div className="grid">
        {/* 🚨 SOS */}
        <div className="card full">
          <div className="label">Emergency Assistance</div>

          <button onClick={() => getLocationAndSendSMS("police")}>
            🚓 SOS Police
          </button>

          <button onClick={() => getLocationAndSendSMS("ambulance")}>
            🚑 SOS Ambulance
          </button>

          <button onClick={openNearbyPoliceStation}>
            🏢 Nearby Police Station
          </button>

          <button onClick={openNearbyHospital}>
            🏥 Nearby Hospital
          </button>
        </div>

        {/* TEMP */}
        <div className="card">
          <div className="label">Temperature</div>
          <div className="value">{temp} °F</div>
        </div>

        {/* STEPS */}
        <div className="card">
          <div className="label">Steps</div>
          <div className="value">{steps}</div>
        </div>

        {/* RELAY */}
        <div className="card full">
          <div className="label">
            Relay {cooldown && "(5s ON)"}
          </div>
          <div
            className={`switch ${relayUIOn ? "on" : ""}`}
            onClick={triggerEmergency}
          />
        </div>

        {/* BUZZER */}
        <div className="card full">
          <div className="label">Buzzer</div>
          <div
            className={`switch ${buzzer ? "on" : ""}`}
            onClick={toggleBuzzer}
          />
        </div>
      </div>
    </>
  );
}