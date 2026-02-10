import { useEffect, useRef, useState } from "react";

const TOKEN = "Fy9DrMSPlw60Kq42yxmO-5CBU0iqRfKN";

// Blynk virtual pins
const VPIN = {
  VALID: "V7",
  DIST: "V8",   // cm
  ANGLE: "V9"   // degree
};

export default function Radar() {
  const canvasRef = useRef(null);

  const [distance, setDistance] = useState(0);
  const [angle, setAngle] = useState(0);

  const maxRange = 500; // cm

  /* ================= BLYNK READ ================= */
  const apiGet = async (pin) => {
    const r = await fetch(
      `https://blynk.cloud/external/api/get?token=${TOKEN}&${pin}`
    );
    return Number(await r.text());
  };

  const fetchRadarData = async () => {
    const valid = await apiGet(VPIN.VALID);
    if (valid === 1) {
      setDistance(await apiGet(VPIN.DIST));
      setAngle(await apiGet(VPIN.ANGLE));
    } else {
      setDistance(0);
      setAngle(0);
    }
  };

  /* ================= DRAW RADAR ================= */
  const drawRadar = (ctx, w, h) => {
    // background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h - 10;
    const scale = (w / 2 - 20) / maxRange;

    ctx.strokeStyle = "#00ff44";
    ctx.lineWidth = 2;
    ctx.font = "14px monospace";
    ctx.fillStyle = "#00ff44";

    /* RANGE CIRCLES (1m – 5m) */
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, i * 100 * scale, Math.PI, Math.PI * 2);
      ctx.stroke();

      ctx.fillText(
        i + "m",
        cx - 14,
        cy - i * 100 * scale - 4
      );
    }

    /* GRID LINES */
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - maxRange * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - maxRange * scale, cy);
    ctx.lineTo(cx + maxRange * scale, cy);
    ctx.stroke();

    /* ORIGIN DOT */
    ctx.fillStyle = "#00ff44";
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    /* TARGET DOT */
    if (distance > 0 && distance <= maxRange) {
      const rad = (angle * Math.PI) / 180;
      const tx = cx + Math.cos(rad) * distance * scale;
      const ty = cy - Math.sin(rad) * distance * scale;

      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(tx, ty, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    /* TELEMETRY TEXT */
    ctx.fillStyle = "#00ff44";
    ctx.fillText(
      "Distance: " + (distance / 100).toFixed(2) + " m",
      12,
      22
    );
    ctx.fillText(
      "Angle: " + angle.toFixed(1) + "°",
      12,
      42
    );
  };

  /* ================= LOOP ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const loop = () => {
      drawRadar(ctx, canvas.width, canvas.height);
      requestAnimationFrame(loop);
    };
    loop();

    const t = setInterval(fetchRadarData, 200);
    return () => clearInterval(t);
  }, [distance, angle]);

  return (
    <>
      <h2>🟢 Radar Scan</h2>

      <canvas
        ref={canvasRef}
        width={360}
        height={300}
        style={{
          borderRadius: "18px",
          boxShadow: "0 0 30px #00ff4444",
          border: "2px solid #00ff44"
        }}
      />
    </>
  );
}
