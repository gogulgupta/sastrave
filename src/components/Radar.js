import { useEffect, useRef, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

export default function Radar() {
  const canvasRef = useRef(null);

  const [distance, setDistance] = useState(0); // cm
  const [angle, setAngle] = useState(0);       // deg
  const [valid, setValid] = useState(0);

  const maxRange = 500; // cm

  /* ================= FIREBASE READ ================= */
  useEffect(() => {
    const radarRef = ref(db, "smartshoes/radar");

    const unsub = onValue(radarRef, (snap) => {
      const d = snap.val();
      if (!d) return;

      setValid(d.valid ?? 0);
      setDistance(d.distance ?? 0);
      setAngle(d.angle ?? 0);
    });

    return () => unsub();
  }, []);

  /* ================= DRAW ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 300;
    canvas.height = 300;

    const cx = 150;
    const cy = 150;
    const scale = (140) / maxRange;

    const draw = () => {
      // background
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, 300, 300);

      ctx.strokeStyle = "#00ff66";
      ctx.lineWidth = 2;
      ctx.font = "12px monospace";
      ctx.fillStyle = "#00ff66";

      // circles (1m–5m)
      for (let r = 100; r <= 500; r += 100) {
        ctx.beginPath();
        ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillText(`${r / 100}m`, cx - 12, cy - r * scale - 4);
      }

      // cross lines
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, 300);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(300, cy);
      ctx.stroke();

      // target
      if (valid === 1 && distance > 0) {
        const rad = (angle * Math.PI) / 180;
        const x = cx + Math.cos(rad) * distance * scale;
        const y = cy - Math.sin(rad) * distance * scale;

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    draw();
  }, [distance, angle, valid]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>🟢 Radar Scan</h2>

      <canvas
        ref={canvasRef}
        style={{
          border: "2px solid #00ff66",
          borderRadius: "14px",
          boxShadow: "0 0 30px #00ff6633"
        }}
      />

      <div style={{ marginTop: 10, color: "#00ff66" }}>
        Distance: {(distance / 100).toFixed(2)} m<br />
        Angle: {angle.toFixed(1)}°
      </div>
    </div>
  );
}
