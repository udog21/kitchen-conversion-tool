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
  const randomOffset = Math.random() * 0.3; // Random offset to vary gap positions

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
        {/* Outer shell - Sandy brown borders */}
        <rect 
          className="fill-transparent" 
          style={{ strokeWidth: "2px", stroke: "#F4A261" }}
          x="5" y="5" width="90" height="50" rx="8" ry="8"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Inner label box with exactly 3 small reflection gaps - Sandy brown (same as outer) */}
        <rect 
          className="fill-transparent" 
          style={{ 
            strokeWidth: "2px",
            stroke: "#F4A261",
            // Simple pattern: 3 small gaps (1.5% each) with solid segments
            strokeDasharray: "0.315 0.015 0.315 0.015 0.315 0.015 100",
            strokeDashoffset: randomOffset.toString()
          }}
          x="9" y="12" width="82" height="36" rx="6" ry="6"
          pathLength="1"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Text - Burnt sienna */}
        <text 
          className="font-semibold text-base" 
          style={{ fill: "#E76F51", fontSize: "12px" }}
          x="50" y="30" 
          textAnchor="middle" 
          dominantBaseline="middle"
        >
          {children}
        </text>
      </svg>
    </button>
  );
}