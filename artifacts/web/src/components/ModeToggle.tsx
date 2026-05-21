import { useState } from "react";
import { motion } from "framer-motion";

interface ModeToggleProps {
  mode: "encode" | "decode";
  onChange: (mode: "encode" | "decode") => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex bg-black/40 border border-border p-1 rounded-full w-full max-w-[240px] relative">
      <button
        className={`flex-1 py-2 text-sm font-mono tracking-wider font-bold z-10 transition-colors ${
          mode === "encode" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => onChange("encode")}
      >
        ENCODE
      </button>
      <button
        className={`flex-1 py-2 text-sm font-mono tracking-wider font-bold z-10 transition-colors ${
          mode === "decode" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => onChange("decode")}
      >
        DECODE
      </button>
      
      {/* Animated Pill Background */}
      <motion.div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full z-0"
        animate={{
          left: mode === "encode" ? "4px" : "calc(50%)"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </div>
  );
}
