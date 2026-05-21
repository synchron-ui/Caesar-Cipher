import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface ShiftSelectorProps {
  shift: number;
  onChange: (shift: number) => void;
  maxShift?: number;
}

export function ShiftSelector({ shift, onChange, maxShift = 62 }: ShiftSelectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleDecrement = () => {
    onChange(shift <= 1 ? maxShift : shift - 1);
  };

  const handleIncrement = () => {
    onChange(shift >= maxShift ? 1 : shift + 1);
  };

  const handleInputSubmit = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= maxShift) {
      onChange(parsed);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xs font-mono tracking-[0.2em] text-muted-foreground">
        SHIFT KEY <span className="text-muted-foreground/50">(1–{maxShift})</span>
      </div>

      <div className="flex items-center justify-center space-x-6">
        <button
          onClick={handleDecrement}
          className="w-12 h-12 flex items-center justify-center rounded-full border border-border bg-black/20 text-muted-foreground hover:text-primary hover:border-primary transition-colors active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="w-20 text-center">
          {isEditing ? (
            <input
              autoFocus
              type="number"
              min={1}
              max={maxShift}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
              className="w-full text-center text-4xl font-mono text-primary bg-transparent border-b-2 border-primary focus:outline-none"
            />
          ) : (
            <motion.div
              key={shift}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-mono text-primary cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                setInputValue(String(shift));
                setIsEditing(true);
              }}
              title="Click to type a value"
            >
              {shift.toString().padStart(2, "0")}
            </motion.div>
          )}
        </div>

        <button
          onClick={handleIncrement}
          className="w-12 h-12 flex items-center justify-center rounded-full border border-border bg-black/20 text-muted-foreground hover:text-primary hover:border-primary transition-colors active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
