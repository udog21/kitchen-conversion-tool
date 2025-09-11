import { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface UnitWheelProps {
  units: string[];
  selectedUnit: string;
  onUnitChange: (unit: string) => void;
  dataTestId?: string;
}

export function UnitWheel({ units, selectedUnit, onUnitChange, dataTestId }: UnitWheelProps) {
  const [startY, setStartY] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(() => 
    Math.max(0, units.indexOf(selectedUnit))
  );
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newIndex = units.indexOf(selectedUnit);
    if (newIndex !== -1 && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [selectedUnit, units, currentIndex]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(units.length - 1, currentIndex + delta));
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      onUnitChange(units[newIndex]);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startY) return;
    
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    
    if (Math.abs(diff) > 30) {
      const delta = diff > 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(units.length - 1, currentIndex + delta));
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        onUnitChange(units[newIndex]);
      }
      setStartY(currentY);
    }
  };

  const handleTouchEnd = () => {
    setStartY(0);
  };

  const navigateUp = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    onUnitChange(units[newIndex]);
  };

  const navigateDown = () => {
    const newIndex = Math.min(units.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
    onUnitChange(units[newIndex]);
  };

  const getVisibleUnits = () => {
    const visible = [];
    for (let i = currentIndex - 1; i <= currentIndex + 1; i++) {
      if (i >= 0 && i < units.length) {
        visible.push({ unit: units[i], index: i, offset: i - currentIndex });
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
        ref={wheelRef}
        className="h-32 flex flex-col items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        data-testid={dataTestId}
      >
        {getVisibleUnits().map(({ unit, index, offset }) => (
          <div
            key={index}
            className={`
              h-10 flex items-center justify-center px-4 transition-all duration-200
              ${offset === 0 
                ? "text-conversion-accent font-semibold text-lg scale-110" 
                : "text-muted-foreground text-sm scale-95 opacity-60"
              }
            `}
            onClick={() => {
              setCurrentIndex(index);
              onUnitChange(unit);
            }}
          >
            {unit}
          </div>
        ))}
      </div>

      <button
        onClick={navigateDown}
        disabled={currentIndex === units.length - 1}
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-10 p-1 rounded-full hover-elevate disabled:opacity-30 disabled:pointer-events-none"
        data-testid={`${dataTestId}-down`}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}