import React, { useEffect } from "react";


export default function Decrypt() {
  const [enc, setEnc] = useState("");
  const [key, setKey] = useState("");
  const [out, setOut] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const copyToClipboard = async () => {
    try {
      const textToCopy = out.replace("✅ DECRYPTION SUCCESSFUL!\n\n", "");
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const decrypt = async () => {
    if (!enc.trim() || !key.trim()) {
      setOut("❌ Both encrypted text and key are required");
      setIsSuccess(false);
      return;
    }

    setIsDecrypting(true);
    setProgress(0);
    setOut("🔓 Initializing decryption...");

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 70);

    try {
      await new Promise(resolve => setTimeout(resolve, 2500));

      const data = Uint8Array.from(atob(enc), c => c.charCodeAt(0));
      const keyBuf = new TextEncoder().encode(key).slice(0, 16);
      const k = await crypto.subtle.importKey("raw", keyBuf, { name: "AES-CBC" }, false, ["decrypt"]);
      const iv = new Uint8Array(16);
      const res = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, k, data);
      const result = new TextDecoder().decode(res);

      clearInterval(progressInterval);
      setProgress(100);
      setOut(`✅ DECRYPTION SUCCESSFUL!\n\n${result}`);
      setIsSuccess(true);

    } catch {
      clearInterval(progressInterval);
      setOut("❌ DECRYPTION FAILED - Invalid key or corrupted data");
      setProgress(0);
      setIsSuccess(false);
      setCopied(false);
    } finally {
      setTimeout(() => {
        setIsDecrypting(false);
        if (progress === 100) {
          setTimeout(() => setProgress(0), 1500);
        }
      }, 1500);
    }
  };

  return (
    <div className="panel active" id="decryptPanel">
      
      <div className="header">
        <h2>🔐 AES DECRYPTION</h2>
        <div className="user-name">SECURE DECRYPTION SYSTEM</div>
      </div>

      {isDecrypting && (
        <div className="toast" style={{ display: 'block' }}>
          ⚡ DECRYPTING... {Math.floor(progress)}%
        </div>
      )}

      <div className="card full">
        <div className="label">ENCRYPTED TEXT (BASE64)</div>
        <textarea
          value={enc}
          onChange={e => setEnc(e.target.value)}
          placeholder="Paste your encrypted text here..."
          disabled={isDecrypting}
          className={isDecrypting ? 'locked' : ''}
        />
      </div>

      <div className="card full">
        <div className="label">SECRET KEY</div>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="Enter your 16/24/32 byte key"
          disabled={isDecrypting}
          className={isDecrypting ? 'locked' : ''}
        />
      </div>

      <button onClick={decrypt} disabled={isDecrypting} className={isDecrypting ? 'decrypting' : ''}>
        {isDecrypting ? (
          <>
            <span className="spinner"></span>
            <span>DECRYPTING... {Math.floor(progress)}%</span>
          </>
        ) : (
          <>
            <span>⚡</span>
            <span>INITIATE DECRYPTION</span>
          </>
        )}
      </button>

      {isDecrypting && (
        <div className="card full progress-card">
          <div className="label">DECRYPTION PROGRESS</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}>
              <div className="progress-shine"></div>
            </div>
          </div>
          <div className="progress-text">
            {progress < 25 ? "⚙️ Initializing..." :
              progress < 50 ? "🔍 Analyzing..." :
                progress < 75 ? "⚡ Validating..." :
                  progress < 95 ? "🔓 Decrypting..." :
                    "✨ Finalizing..."}
            <span className="progress-percent">{Math.floor(progress)}%</span>
          </div>
        </div>
      )}

      <div className="card full">
        <div className="label">DECRYPTED OUTPUT</div>
        <div className={`decrypt-msg ${out.includes('✅') ? 'success' : out.includes('❌') ? 'error' : ''}`}>
          {out || "Decrypted text will appear here..."}
        </div>
        {isSuccess && (
          <button
            onClick={copyToClipboard}
            className={`copy-btn ${copied ? 'copied' : ''}`}
          >
            <span className="copy-icon">{copied ? '✓' : '📋'}</span>
            <span className="copy-text">{copied ? 'COPIED!' : 'COPY TEXT'}</span>
          </button>
        )}
      </div>

      <div className="link" onClick={() => setEnc("U2FtcGxlIGVuY3J5cHRlZCBkYXRhIGZvciBkZW1vbnN0cmF0aW9uLiBUcnkgZGVjcnlwdGluZyB3aXRoIGtleTogJ0lST05NQU4n")}>
        📂 Load Sample Data
      </div>
    </div>
  );
}