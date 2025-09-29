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
  // Generate 3 gaps with random rotation but ensuring all 3 are always visible
  const randomOffset = Math.random() * (1/3); // Only rotate within first third to keep all gaps visible
  const gapSize = 0.015; // Small gap size (1.5%)
  
  // Calculate 3 evenly spaced gap positions
  const gap1Start = randomOffset;
  const gap2Start = (randomOffset + 1/3) % 1;
  const gap3Start = (randomOffset + 2/3) % 1;
  
  // Sort gaps by position
  const gaps = [gap1Start, gap2Start, gap3Start].sort((a, b) => a - b);
  
  // Build dasharray: solid segments between gaps
  const seg1 = gaps[0]; // From start to first gap
  const seg2 = gaps[1] - gaps[0] - gapSize; // Between gap 1 and gap 2
  const seg3 = gaps[2] - gaps[1] - gapSize; // Between gap 2 and gap 3
  const seg4 = 1 - gaps[2] - gapSize; // From gap 3 to end
  
  const strokeDasharray = `${seg1} ${gapSize} ${seg2} ${gapSize} ${seg3} ${gapSize} ${seg4}`;

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
        
        {/* Inner label box with exactly 3 small reflection gaps */}
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