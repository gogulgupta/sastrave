import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebase";

export default function Home({ user }) {
  const [steps, setSteps] = useState(0);
  const [temp, setTemp] = useState("--");
  const [relay, setRelay] = useState(0);
  const [buzzer, setBuzzer] = useState(0);
  const [toast, setToast] = useState(false);

  /* ================= FIREBASE READ ================= */
  useEffect(() => {
    const dataRef = ref(db, "sos/smartshoes");

    const unsub = onValue(dataRef, (snap) => {
      const d = snap.val();
      if (!d) return;

      setSteps(d.steps ?? 0);
      setTemp(((d.temperature * 9) / 5 + 32).toFixed(1));
      setRelay(d.relay ?? 0);
      setBuzzer(d.buzzer ?? 0);
    });

    return () => unsub();
  }, []);

  /* ================= FIREBASE WRITE ================= */
  const triggerRelay = () => {
    set(ref(db, "smartshoes/relay"), 1);
    setToast(true);

    setTimeout(() => {
      set(ref(db, "smartshoes/relay"), 0);
      setToast(false);
    }, 5000);
  };

  const toggleBuzzer = () => {
    set(ref(db, "smartshoes/buzzer"), buzzer ? 0 : 1);
  };

  /* ================= EMERGENCY ================= */
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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
  return (
    <>
      <div className="header">
        <h2>Sastradev</h2>
        <div className="user-name">
          {user && "Welcome, " + (user.displayName || user.email)}
        </div>
        <div className="goal">89%</div>
        <div className="sub">Daily Goal</div>
      </div>

      <div className="model-wrap">
        <div className="model-card" onClick={triggerRelay}>
          <model-viewer
            src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
            camera-controls
          />
        </div>
      </div>

      {toast && <div className="toast">⚡ RELAY ON (5s)</div>}

      <div className="grid">
        <div className="card full">
          <div className="label">🚨 Emergency Assistance</div>

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

        <div className="card">
          <div className="label">Temperature</div>
          <div className="value">{temp} °F</div>
        </div>

        <div className="card">
          <div className="label">Steps</div>
          <div className="value">{steps}</div>
        </div>

        <div className="card full">
          <div className="label">Relay Control</div>
          <div
            className={`switch ${relay ? "on" : ""}`}
            onClick={triggerRelay}
          />
        </div>

        <div className="card full">
          <div className="label">Blink / Buzzer</div>
          <div
            className={`switch ${buzzer ? "on" : ""}`}
            onClick={toggleBuzzer}
          />
        </div>
      </div>
    </>
  );
}
