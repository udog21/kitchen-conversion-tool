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
  const gapOffset = Math.random() * 0.8 + 0.1; // Random gap position for variety

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
        style={{
          "--gap-size": "0.06", // Reduced by 50% from 0.12
          "--gap-offset": gapOffset.toString()
        } as React.CSSProperties}
      >
        {/* Outer shell */}
        <rect 
          className="fill-transparent stroke-current" 
          style={{ strokeWidth: "3px" }}
          x="5" y="5" width="90" height="50" rx="8" ry="8"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Inner label box with reflection gap - equal margins on all sides */}
        <rect 
          className="fill-transparent stroke-current" 
          style={{ 
            strokeWidth: "2px",
            strokeDasharray: `calc(1 - var(--gap-size)) var(--gap-size)`,
            strokeDashoffset: `var(--gap-offset)`
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