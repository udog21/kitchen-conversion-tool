import { cn } from "@/lib/utils";

interface ClickableButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  pressed?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function ClickableButton({ 
  children, 
  onClick, 
  pressed = false, 
  className, 
  "data-testid": dataTestId 
}: ClickableButtonProps) {
  return (
    <button
      onClick={onClick}
      data-testid={dataTestId}
      className={cn(
        "kitchen-key",
        "min-h-12 px-4 py-3",
        pressed ? "kitchen-key--down" : "kitchen-key--up",
        className
      )}
    >
      <span className="kitchen-key__label">
        {children}
      </span>
    </button>
  );
}