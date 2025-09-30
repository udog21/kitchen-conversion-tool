import { cn } from "@/lib/utils";

interface ClickableButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  pressed?: boolean;
  className?: string;
  "data-testid"?: string;
  variant?: "normal" | "modal";
  showInnerBorder?: boolean;
}

export function ClickableButton({ 
  children, 
  onClick, 
  pressed = false, 
  className, 
  "data-testid": dataTestId,
  variant = "normal",
  showInnerBorder = true
}: ClickableButtonProps) {
  return (
    <button
      onClick={onClick}
      data-testid={dataTestId}
      className={cn(
        "relative px-4 py-5 rounded-lg transition-all duration-200",
        "border-2 border-[#F4A261]",
        "font-semibold text-[#E76F51]",
        "cursor-pointer outline-none",
        "hover:bg-[#F4A261]/5 active:bg-[#F4A261]/10",
        "min-h-[48px]",
        "text-sm", // Default size, can be overridden by className prop
        showInnerBorder && "clickable-button-with-inner-border",
        className
      )}
      style={{ lineHeight: "1.2" }}
    >
      {children}
    </button>
  );
}