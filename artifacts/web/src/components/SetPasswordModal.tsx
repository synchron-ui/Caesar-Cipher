import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";

interface SetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetPassword: (password: string) => void;
}

export function SetPasswordModal({ isOpen, onClose, onSetPassword }: SetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setConfirm("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (password.length < 3) {
      triggerError("Password must be at least 3 characters");
      return;
    }
    if (password !== confirm) {
      triggerError("Passwords do not match");
      return;
    }
    onSetPassword(password);
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              x: isShaking ? [-10, 10, -10, 10, 0] : 0
            }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, x: { duration: 0.4 } }}
            className="bg-card border border-border w-full max-w-md p-6 rounded-lg shadow-2xl relative z-10"
          >
            <div className="flex items-center space-x-3 mb-6 text-primary">
              <Lock className="w-6 h-6" />
              <h2 className="text-xl font-mono tracking-wide uppercase">Secure Decoding</h2>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Set a local password to lock decrypted messages. This password will be required to view the plaintext.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2">PASSWORD</label>
                <input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={`w-full bg-black/40 border ${error ? 'border-destructive' : 'border-border'} rounded p-3 text-foreground font-mono focus:outline-none focus:border-primary transition-colors`}
                  placeholder="•••"
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                  className={`w-full bg-black/40 border ${error ? 'border-destructive' : 'border-border'} rounded p-3 text-foreground font-mono focus:outline-none focus:border-primary transition-colors`}
                  placeholder="•••"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-destructive text-xs font-mono mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex space-x-3 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-mono border border-border text-muted-foreground rounded hover:bg-black/20 hover:text-foreground transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-mono bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity font-bold"
                >
                  LOCK
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
