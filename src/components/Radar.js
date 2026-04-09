import { useEffect, useRef, useState } from "react";

export default function Radar({ mqttClient }) {
  const canvasRef = useRef(null);
  const [distance, setDistance] = useState(0); // meters
  const [angle, setAngle] = useState(0);       // degrees
  const [presence, setPresence] = useState(0);

  const maxRange = 6; // meters

  /* ================= MQTT SUBSCRIBE ================= */
  useEffect(() => {
    if (!mqttClient) return;

    const onMessage = (topic, message) => {
      const msg = message.toString();

      if (topic === "shoes/radar/distance") {
        setDistance(Number(msg));
      }

      if (topic === "shoes/radar/angle") {
        setAngle(Number(msg));
      }

      if (topic === "shoes/radar/presence") {
        setPresence(Number(msg));
      }
    };

    mqttClient.on("message", onMessage);

    return () => mqttClient.off("message", onMessage);
  }, [mqttClient]);

  /* ================= DRAW RADAR ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 300;
    canvas.height = 300;

    const cx = 150;
    const cy = 150;
    const scale = 130 / maxRange;

    const draw = () => {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, 300, 300);

      ctx.strokeStyle = "#00ff66";
      ctx.lineWidth = 2;
      ctx.font = "12px monospace";
      ctx.fillStyle = "#00ff66";

      // Range circles
      for (let r = 1; r <= maxRange; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillText(`${r}m`, cx - 10, cy - r * scale - 4);
      }

      // Cross lines
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, 300);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(300, cy);
      ctx.stroke();

      // Target
      if (presence === 1 && distance > 0) {
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
  }, [distance, angle, presence]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>🟢 Human Presence Detection</h2>

      <canvas
        ref={canvasRef}
        style={{
          border: "2px solid #00ff66",
          borderRadius: "14px",
          boxShadow: "0 0 30px #00ff6633"
        }}
      />

      <div style={{ marginTop: 10, color: "#00ff66" }}>
        Presence: {presence ? "YES" : "NO"} <br />
        Distance: {distance.toFixed(2)} m <br />
        Angle: {angle.toFixed(1)}°
      </div>
    </div>
  );
}
