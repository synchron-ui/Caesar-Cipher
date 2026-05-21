import { useState } from "react";
import { ModeToggle } from "./components/ModeToggle";
import { CipherWheel } from "./components/CipherWheel";
import { ShiftSelector } from "./components/ShiftSelector";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Lock, Unlock, AlertCircle, Loader2, Key } from "lucide-react";

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
const MAX_SHIFT = ALPHABET.length - 1; // 62
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

export default function App() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  // Encode state
  const [plaintext, setPlaintext] = useState("");
  const [encryptResult, setEncryptResult] = useState<{ encrypted_text: string; shift: number } | null>(null);
  const [isScrambling, setIsScrambling] = useState(false);

  // Decode state
  const [ciphertext, setCiphertext] = useState("");
  const [decodeShift, setDecodeShift] = useState(1);
  const [password, setPassword] = useState("");
  const [decryptResult, setDecryptResult] = useState("");
  const [decryptError, setDecryptError] = useState("");

  // UI state
  const [copied, setCopied] = useState<"text" | "shift" | null>(null);
  const [loading, setLoading] = useState(false);

  const currentShift = mode === "encode" ? (encryptResult?.shift ?? 0) : decodeShift;

  const handleModeChange = (newMode: "encode" | "decode") => {
    setMode(newMode);
    if (newMode === "encode") {
      setCiphertext("");
      setDecodeShift(1);
      setPassword("");
      setDecryptResult("");
      setDecryptError("");
    } else {
      setPlaintext("");
      setEncryptResult(null);
    }
  };

  const handleEncrypt = async () => {
    if (!plaintext.trim() || loading) return;
    setLoading(true);
    setIsScrambling(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/encrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: plaintext }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Encryption failed");
      }

      setEncryptResult({ encrypted_text: data.encrypted_text, shift: data.shift });
    } catch (err) {
      console.error("Encryption failed:", err);
      const shift = Math.floor(Math.random() * MAX_SHIFT) + 1;
      let encrypted_text = "";
      for (let i = 0; i < plaintext.length; i++) {
        const char = plaintext[i];
        const idx = ALPHABET.indexOf(char);
        encrypted_text += idx === -1 ? char : ALPHABET[(idx + shift) % ALPHABET.length];
      }
      setEncryptResult({ encrypted_text, shift });
    } finally {
      setLoading(false);
      setIsScrambling(false);
    }
  };

  const handleDecrypt = async () => {
    if (!ciphertext.trim() || !password || loading) return;
    setLoading(true);
    setDecryptError("");
    setDecryptResult("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/decrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ciphertext, shift: decodeShift, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Decryption failed.");
      }

      setDecryptResult(data.decrypted_text);
    } catch (err) {
      console.error("Decryption failed:", err);
      setDecryptError(err instanceof Error ? err.message : "Decryption failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, type: "text" | "shift") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Preview mappings for shift selector
  const previewChars = ["a", "M", "5"];
  const previewMappings = previewChars.map((char) => {
    const idx = ALPHABET.indexOf(char);
    if (idx === -1 || currentShift === 0) return { from: char, to: char };
    const mapped = ALPHABET[(idx + currentShift) % ALPHABET.length];
    return { from: char, to: mapped };
  });

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans p-4 md:p-8 flex flex-col relative overflow-hidden">
      {/* Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <main className="max-w-[1100px] w-full mx-auto flex-1 flex flex-col md:flex-row gap-8 lg:gap-16 relative z-10">
        {/* Left Column: Controls & Wheel */}
        <div className="w-full md:w-1/2 flex flex-col items-center pt-4 md:pt-12 space-y-12">
          <div className="w-full flex justify-center">
            <ModeToggle mode={mode} onChange={handleModeChange} />
          </div>

          <div className="py-4">
            <CipherWheel shift={currentShift} isScrambling={isScrambling} />
          </div>

          {/* Shift Control */}
          <div className="w-full max-w-[340px]">
            {mode === "encode" ? (
              /* Encode: read-only shift display */
              <div className="flex flex-col items-center space-y-4">
                <div className="text-xs font-mono tracking-[0.2em] text-muted-foreground">
                  SHIFT VALUE
                </div>
                <motion.div
                  key={encryptResult?.shift ?? "none"}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl font-mono text-primary"
                >
                  {encryptResult ? encryptResult.shift.toString().padStart(2, "0") : "—"}
                </motion.div>
                <div className="text-xs font-mono text-muted-foreground/60">
                  {encryptResult ? "Randomly generated" : "Encrypt to generate"}
                </div>
              </div>
            ) : (
              /* Decode: editable shift selector */
              <ShiftSelector shift={decodeShift} onChange={setDecodeShift} maxShift={MAX_SHIFT} />
            )}

            {/* Preview mappings */}
            {currentShift > 0 && (
              <div className="flex space-x-8 pt-4 mt-6 border-t border-border/50 w-full justify-center">
                {previewMappings.map(({ from, to }) => (
                  <div key={from} className="flex items-center space-x-2 font-mono text-sm">
                    <span className="text-muted-foreground">{from}</span>
                    <span className="text-primary text-xs">→</span>
                    <motion.span
                      key={`${from}-${currentShift}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-foreground"
                    >
                      {to === " " ? "␣" : to}
                    </motion.span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: I/O */}
        <div className="w-full md:w-1/2 flex flex-col space-y-4 pb-8 md:pt-12">
          {mode === "encode" ? (
            /* ===== ENCODE MODE ===== */
            <>
              {/* Plaintext Input */}
              <div className="flex flex-col min-h-[180px]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono tracking-widest text-muted-foreground">
                    PLAINTEXT
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-mono text-muted-foreground">
                      {plaintext.length} chars
                    </span>
                    {plaintext && (
                      <button
                        onClick={() => {
                          setPlaintext("");
                          setEncryptResult(null);
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={plaintext}
                  onChange={(e) => setPlaintext(e.target.value)}
                  placeholder="Enter message to encode..."
                  className="flex-1 bg-black/20 border border-border rounded p-4 font-mono text-lg focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Encrypt Button */}
              <button
                onClick={handleEncrypt}
                disabled={!plaintext.trim() || loading}
                className="w-full py-3 font-mono font-bold tracking-widest bg-primary text-primary-foreground rounded hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>ENCRYPT</span>
              </button>

              {/* Ciphertext Output */}
              <div className="flex flex-col min-h-[150px]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono tracking-widest text-primary">
                    CIPHERTEXT
                  </label>
                  {encryptResult && (
                    <button
                      onClick={() => handleCopy(encryptResult.encrypted_text, "text")}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {copied === "text" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                <div className="flex-1 border border-primary/50 bg-black/30 rounded p-4 font-mono text-lg break-words whitespace-pre-wrap overflow-y-auto">
                  {encryptResult?.encrypted_text || (
                    <span className="text-muted-foreground/50 text-sm">
                      Awaiting encryption...
                    </span>
                  )}
                </div>
              </div>

              {/* Shift Key Card */}
              <AnimatePresence>
                {encryptResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center justify-between bg-card border border-primary/30 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <Key className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-xs font-mono text-muted-foreground tracking-widest">
                          SHIFT KEY
                        </div>
                        <div className="text-2xl font-mono text-primary font-bold">
                          {encryptResult.shift}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(String(encryptResult.shift), "shift")}
                      className="text-muted-foreground hover:text-primary transition-colors p-2"
                    >
                      {copied === "shift" ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* ===== DECODE MODE ===== */
            <>
              {/* Ciphertext Input */}
              <div className="flex flex-col min-h-[150px]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono tracking-widest text-muted-foreground">
                    CIPHERTEXT
                  </label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {ciphertext.length} chars
                  </span>
                </div>
                <textarea
                  value={ciphertext}
                  onChange={(e) => setCiphertext(e.target.value)}
                  placeholder="Enter ciphertext to decode..."
                  className="flex-1 bg-black/20 border border-border rounded p-4 font-mono text-lg focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="text-xs font-mono tracking-widest text-muted-foreground mb-2 block">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setDecryptError("");
                    }}
                    placeholder="Enter decryption password..."
                    className="w-full bg-black/20 border border-border rounded p-3 pl-10 font-mono focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Decrypt Button */}
              <button
                onClick={handleDecrypt}
                disabled={!ciphertext.trim() || !password || loading}
                className="w-full py-3 font-mono font-bold tracking-widest bg-primary text-primary-foreground rounded hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Unlock className="w-5 h-5" />
                )}
                <span>DECRYPT</span>
              </button>

              {/* Plaintext Output */}
              <div className="flex flex-col min-h-[150px]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono tracking-widest text-primary">
                    PLAINTEXT
                  </label>
                  {decryptResult && (
                    <button
                      onClick={() => handleCopy(decryptResult, "text")}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {copied === "text" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                <div className="flex-1 border border-primary/50 bg-black/30 rounded p-4 font-mono text-lg break-words whitespace-pre-wrap overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {decryptError ? (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center space-x-2 text-destructive"
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{decryptError}</span>
                      </motion.div>
                    ) : decryptResult ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {decryptResult}
                      </motion.div>
                    ) : (
                      <span className="text-muted-foreground/50 text-sm">
                        Awaiting decryption...
                      </span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
