import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Copy, Check } from "lucide-react";

interface DecodeUnlockCardProps {
  ciphertext: string;
  plaintext: string;
  expectedPassword: string | null;
  isUnlocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
}

export function DecodeUnlockCard({ 
  ciphertext, 
  plaintext, 
  expectedPassword, 
  isUnlocked, 
  onUnlock, 
  onLock 
}: DecodeUnlockCardProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when moving to locked state and having text
  useEffect(() => {
    if (!isUnlocked && expectedPassword && ciphertext) {
      setPassword("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isUnlocked, expectedPassword, ciphertext]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (password === expectedPassword) {
      onUnlock();
      setError(false);
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleCopy = async () => {
    if (!plaintext) return;
    await navigator.clipboard.writeText(plaintext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate masked text based on ciphertext length
  const maskedText = ciphertext.replace(/[a-zA-Z]/g, "•");

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-mono tracking-widest text-primary">PLAINTEXT</label>
        {ciphertext && isUnlocked && (
          <div className="flex space-x-2">
            <button
              onClick={onLock}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
              title="Lock"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      <div className="relative flex-1 min-h-[200px] border border-primary/50 bg-black/30 rounded p-4 font-mono overflow-hidden">
        {/* Empty state */}
        {!ciphertext && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            Enter ciphertext to decode...
          </div>
        )}

        {/* Content */}
        {ciphertext && (
          <div className="break-words whitespace-pre-wrap text-lg">
            {isUnlocked || !expectedPassword ? plaintext : maskedText}
          </div>
        )}

        {/* Password Gate Overlay */}
        <AnimatePresence>
          {ciphertext && expectedPassword && !isUnlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6"
            >
              <Lock className="w-8 h-8 text-primary mb-4" />
              
              <motion.form 
                onSubmit={handleSubmit}
                animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[240px]"
              >
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    placeholder="Enter password..."
                    className={`w-full bg-black/50 border ${error ? 'border-destructive' : 'border-border'} rounded p-3 pr-10 text-center font-mono focus:outline-none focus:border-primary transition-colors`}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Unlock className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
