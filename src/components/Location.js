import { useRef, useState } from "react";

export default function Location(){
  const frame = useRef();
  const [isScanning, setIsScanning] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [status, setStatus] = useState('');

  const loadMap = () => {
    if(!navigator.geolocation){
      alert("Location not supported");
      return;
    }

    setIsScanning(true);
    setStatus('Initializing GPS...');

    setTimeout(() => setStatus('Locating position...'), 800);
    setTimeout(() => setStatus('Acquiring coordinates...'), 1600);

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setCoordinates({ latitude, longitude });
        
        setTimeout(() => {
          setStatus('Loading map...');
        }, 2400);

        setTimeout(() => {
          frame.current.src =
            `https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;
          setIsScanning(false);
          setStatus('Location acquired ✓');
          setTimeout(() => setStatus(''), 2000);
        }, 3200);
      },
      err => {
        setIsScanning(false);
        setStatus('❌ Access denied');
        setTimeout(() => setStatus(''), 2000);
      }
    );
  };

  const sendSMS = () => {
    if (!coordinates) {
      alert("Please load location first");
      return;
    }

    const { latitude, longitude } = coordinates;
    const msg = `🌍 My location: https://maps.google.com/?q=${latitude},${longitude}`;
    window.location.href = `sms:8923484333?body=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="location-container">
      
      {/* Header */}
      <div className="location-header">
        <h2 className="location-title">
          <span className="icon-wrapper">📍</span>
          GEOLOCATION SYSTEM
        </h2>
        <p className="location-subtitle">GPS TRACKING</p>
      </div>

      {/* Status Display */}
      {status && (
        <div className="status-bar">
          <div className="status-indicator"></div>
          <span>{status}</span>
        </div>
      )}

      {/* Coordinates Display */}
      {coordinates && (
        <div className="coords-display">
          <div className="coord-item">
            <span className="coord-label">LAT</span>
            <span className="coord-value">{coordinates.latitude.toFixed(6)}</span>
          </div>
          <div className="coord-divider"></div>
          <div className="coord-item">
            <span className="coord-label">LNG</span>
            <span className="coord-value">{coordinates.longitude.toFixed(6)}</span>
          </div>
        </div>
      )}

      {/* Scanning Animation Overlay */}
      {isScanning && (
        <div className="scan-overlay">
          <div className="scan-circle"></div>
          <div className="center-target">
            <div className="target-ring"></div>
            <div className="target-dot"></div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="map-container">
        <div className="map-frame-border">
          <iframe
            ref={frame}
            title="map"
            className="map-frame"
          />
          {!coordinates && (
            <div className="map-placeholder">
              <div className="placeholder-icon">🌐</div>
              <p>AWAITING COORDINATES</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={loadMap}
          disabled={isScanning}
          className="action-btn scan-btn"
        >
          <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span>{isScanning ? 'SCANNING...' : 'SCAN LOCATION'}</span>
        </button>

        <button
          onClick={sendSMS}
          disabled={!coordinates || isScanning}
          className="action-btn send-btn"
        >
          <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>SEND SMS</span>
        </button>
      </div>

      <style>{`
        .location-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 20px;
          gap: 16px;
          position: relative;
        }

        /* Header */
        .location-header {
          text-align: center;
          position: relative;
          padding: 20px;
        }

        .location-title {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 6px;
          letter-spacing: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .icon-wrapper {
          font-size: 24px;
          animation: iconFloat 3s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .location-subtitle {
          font-size: 10px;
          color: #666;
          letter-spacing: 2px;
          font-weight: 600;
        }

        /* Status Bar */
        .status-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-size: 12px;
          color: #fff;
          font-weight: 600;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #fff;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        /* Coordinates Display */
        .coords-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 14px;
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-family: 'Courier New', monospace;
          animation: slideDown 0.4s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .coord-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .coord-label {
          font-size: 10px;
          color: #666;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .coord-value {
          font-size: 16px;
          color: #fff;
          font-weight: 700;
        }

        .coord-divider {
          width: 1px;
          height: 30px;
          background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        }

        /* Scanning Animation */
        .scan-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .scan-circle {
          position: absolute;
          width: 120px;
          height: 120px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: expandCircle 2s ease-out infinite;
        }

        @keyframes expandCircle {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        .center-target {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .target-ring {
          position: absolute;
          inset: 0;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          animation: targetPulse 2s ease-in-out infinite;
        }

        @keyframes targetPulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.3; 
            transform: scale(1.3); 
          }
        }

        .target-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
        }

        /* Map Container */
        .map-container {
          flex: 1;
          position: relative;
          min-height: 300px;
        }

        .map-frame-border {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #0a0a0a;
        }

        .map-frame {
          width: 100%;
          height: 100%;
          border: 0;
          border-radius: 14px;
        }

        .map-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(0, 0, 0, 0.5);
        }

        .placeholder-icon {
          font-size: 48px;
          animation: iconFloat 3s ease-in-out infinite;
          opacity: 0.5;
        }

        .map-placeholder p {
          color: #666;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 2px;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          flex: 1;
          padding: 14px 20px;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          letter-spacing: 0.5px;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon {
          position: relative;
          z-index: 1;
        }

        .action-btn span {
          position: relative;
          z-index: 1;
        }

        .scan-btn {
          background: #fff;
          color: #000;
        }

        .scan-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.15);
        }

        .scan-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .send-btn {
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #fff;
        }

        .send-btn:hover:not(:disabled) {
          background: #1a1a1a;
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        .send-btn:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}