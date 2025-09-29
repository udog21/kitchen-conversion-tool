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
  const getVariantClasses = () => {
    if (variant === "modal") {
      return pressed ? "kitchen-key--modal-selected" : "kitchen-key--modal-unselected";
    }
    return pressed ? "kitchen-key--down" : "kitchen-key--up";
  };

  return (
    <button
      onClick={onClick}
      data-testid={dataTestId}
      className={cn(
        "kitchen-key",
        "min-h-12 px-4 py-3",
        getVariantClasses(),
        className
      )}
    >
      <span className="kitchen-key__label">
        {children}
      </span>
    </button>
  );
}