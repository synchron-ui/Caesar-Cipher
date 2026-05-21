import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface CipherWheelProps {
  shift: number;
  isScrambling?: boolean;
}

export function CipherWheel({ shift, isScrambling = false }: CipherWheelProps) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const radius = 140;
  const innerRadius = 90;
  
  const [scrambledLetters, setScrambledLetters] = useState(alphabet);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isScrambling) {
      const interval = setInterval(() => {
        setScrambledLetters(alphabet.map(() => alphabet[Math.floor(Math.random() * 26)]));
      }, 50);
      return () => clearInterval(interval);
    } else {
      setScrambledLetters(alphabet);
    }
  }, [isScrambling]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const maxDistance = rect.width / 2;
    
    if (distance <= maxDistance) {
      const tiltX = (deltaY / maxDistance) * 10; // max 10 degrees
      const tiltY = -(deltaX / maxDistance) * 10;
      setTilt({ x: tiltX, y: tiltY });
    }
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };
  
  return (
    <motion.div 
      className="relative w-[340px] h-[340px] flex items-center justify-center select-none"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Outer Ring Background */}
      <div className="absolute inset-0 rounded-full border-4 border-border bg-card/50 backdrop-blur-sm shadow-2xl" />
      
      {/* Decorative inner elements */}
      <div className="absolute inset-[30px] rounded-full border border-border/30" />
      <div className="absolute inset-[40px] rounded-full border border-border/20" />
      
      {/* Outer Ring (Static, Plaintext/Ciphertext) */}
      <div className="absolute inset-0">
        {alphabet.map((char, i) => {
          const angle = (i * 360) / 26;
          return (
            <div
              key={`outer-${char}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-mono font-bold text-foreground"
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`
              }}
            >
              {char}
            </div>
          );
        })}
      </div>

      {/* Inner Ring (Rotating, Ciphertext/Plaintext) */}
      <motion.div
        className="absolute inset-[50px] rounded-full border-2 border-primary/50 bg-black/60 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center"
        animate={{ rotate: -((shift % 26) * (360 / 26)) }}
        transition={{ type: "spring", stiffness: 60, damping: 15 }}
      >
        <div className="absolute inset-2 rounded-full border border-primary/20" />
        
        {alphabet.map((char, i) => {
          const angle = (i * 360) / 26;
          const shiftedChar = alphabet[(i + shift) % 26];
          return (
            <div
              key={`inner-${char}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-mono font-bold text-primary"
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${innerRadius}px) rotate(-${angle}deg)`
              }}
            >
              {isScrambling ? scrambledLetters[i] : shiftedChar}
            </div>
          );
        })}
      </motion.div>

      {/* Center hub */}
      <div className="absolute w-16 h-16 rounded-full bg-card border-4 border-border flex items-center justify-center z-10 shadow-lg">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>
      
      {/* Selection indicator */}
      <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-8 h-12 bg-primary/20 border-x border-t border-primary rounded-t-lg z-0 pointer-events-none" />
      <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary z-20 pointer-events-none" />
    </motion.div>
  );
}
