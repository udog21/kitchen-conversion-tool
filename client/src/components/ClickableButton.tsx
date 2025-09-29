import { cn } from "@/lib/utils";

interface ClickableButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  pressed?: boolean;
  className?: string;
  "data-testid"?: string;
  variant?: "normal" | "modal";
}

export function ClickableButton({ 
  children, 
  onClick, 
  pressed = false, 
  className, 
  "data-testid": dataTestId,
  variant = "normal"
}: ClickableButtonProps) {
  // Calculate exactly 3 evenly spaced gaps with random starting position
  const randomStart = Math.random();
  const gapWidth = 0.02; // 2% gap width
  
  // Generate 3 gap positions evenly spaced around perimeter
  const gaps = [
    { start: (randomStart) % 1, width: gapWidth },
    { start: (randomStart + 1/3) % 1, width: gapWidth },
    { start: (randomStart + 2/3) % 1, width: gapWidth }
  ].sort((a, b) => a.start - b.start);
  
  // Build non-repeating dasharray pattern
  const dashArray: number[] = [];
  let currentPos = 0;
  
  for (const gap of gaps) {
    // Add solid segment before gap
    const solidLength = gap.start - currentPos;
    if (solidLength > 0) {
      dashArray.push(solidLength);
      dashArray.push(gap.width);
      currentPos = gap.start + gap.width;
    }
  }
  
  // Add final solid segment to complete the perimeter
  const finalSolid = 1 - currentPos;
  if (finalSolid > 0) {
    dashArray.push(finalSolid);
  }
  
  const strokeDasharray = dashArray.join(' ');

  return (
    <button
      onClick={onClick}
      data-testid={dataTestId}
      className={cn(
        "relative inline-block cursor-pointer outline-none transition-all duration-200",
        className
      )}
      style={{ width: "auto", minHeight: "48px" }}
    >
      <svg 
        viewBox="0 0 100 60" 
        className="w-full h-full min-h-10"
      >
        {/* Outer shell */}
        <rect 
          className="fill-transparent stroke-current" 
          style={{ strokeWidth: "3px" }}
          x="5" y="5" width="90" height="50" rx="8" ry="8"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Inner label box with exactly 3 reflection gaps */}
        <rect 
          className="fill-transparent stroke-current" 
          style={{ 
            strokeWidth: "2px",
            strokeDasharray: strokeDasharray
          }}
          x="12" y="12" width="76" height="36" rx="6" ry="6"
          pathLength="1"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Text */}
        <text 
          className="fill-current font-semibold text-base" 
          x="50" y="30" 
          textAnchor="middle" 
          dominantBaseline="middle"
          style={{ fontSize: "12px" }}
        >
          {children}
        </text>
      </svg>
    </button>
  );
}