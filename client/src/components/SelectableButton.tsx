import { cn } from "@/lib/utils";

interface SelectableButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function SelectableButton({ 
  children, 
  onClick, 
  isActive = false,
  className, 
  "data-testid": dataTestId
}: SelectableButtonProps) {
  // Use consistent offset for deterministic rendering
  const strokeOffset = "0.1";

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
        
        {/* Inner label box - only shown when active */}
        {isActive && (
          <rect 
            className="fill-transparent" 
            style={{ 
              strokeWidth: "2px",
              stroke: "#F4A261",
              // Simple pattern: 3 small gaps (1.5% each) with solid segments
              strokeDasharray: "0.315 0.015 0.315 0.015 0.315 0.015 100",
              strokeDashoffset: strokeOffset
            }}
            x="12" y="12" width="76" height="36" rx="6" ry="6"
            pathLength="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
        
        {/* Text - Burnt sienna */}
        <text 
          className="font-semibold text-base" 
          style={{ fill: "#E76F51", fontSize: "11px" }}
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
