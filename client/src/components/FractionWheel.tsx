import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface FractionWheelProps {
  value: string;
  onChange: (value: string) => void;
  dataTestId?: string;
}

// Common fractions used in cooking
const fractions = ["1/8", "1/4", "1/3", "1/2", "2/3", "3/4", "1", "1 1/4", "1 1/3", "1 1/2", "1 2/3", "1 3/4", "2", "2 1/4", "2 1/2", "2 3/4", "3", "3 1/2", "4", "4 1/2", "5", "6", "7", "8", "9", "10"];

export function FractionWheel({ value, onChange, dataTestId }: FractionWheelProps) {
  const [currentIndex, setCurrentIndex] = useState(() => 
    Math.max(0, fractions.indexOf(value))
  );

  useEffect(() => {
    const newIndex = fractions.indexOf(value);
    if (newIndex !== -1 && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [value, currentIndex]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(fractions.length - 1, currentIndex + delta));
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      onChange(fractions[newIndex]);
    }
  };

  const navigateUp = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    onChange(fractions[newIndex]);
  };

  const navigateDown = () => {
    const newIndex = Math.min(fractions.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
    onChange(fractions[newIndex]);
  };

  const getVisibleFractions = () => {
    const visible = [];
    for (let i = currentIndex - 1; i <= currentIndex + 1; i++) {
      if (i >= 0 && i < fractions.length) {
        visible.push({ fraction: fractions[i], index: i, offset: i - currentIndex });
      }
    }
    return visible;
  };

  return (
    <div className="relative">
      <button
        onClick={navigateUp}
        disabled={currentIndex === 0}
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 p-1 rounded-full hover-elevate disabled:opacity-30 disabled:pointer-events-none"
        data-testid={`${dataTestId}-up`}
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      
      <div
        className="h-32 flex flex-col items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onWheel={handleWheel}
        data-testid={dataTestId}
      >
        {getVisibleFractions().map(({ fraction, index, offset }) => (
          <div
            key={index}
            className={`
              h-10 flex items-center justify-center px-4 transition-all duration-200 font-mono
              ${offset === 0 
                ? "text-conversion-accent font-bold text-xl scale-110" 
                : "text-muted-foreground text-base scale-95 opacity-60"
              }
            `}
            onClick={() => {
              setCurrentIndex(index);
              onChange(fraction);
            }}
          >
            {fraction}
          </div>
        ))}
      </div>

      <button
        onClick={navigateDown}
        disabled={currentIndex === fractions.length - 1}
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-10 p-1 rounded-full hover-elevate disabled:opacity-30 disabled:pointer-events-none"
        data-testid={`${dataTestId}-down`}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}