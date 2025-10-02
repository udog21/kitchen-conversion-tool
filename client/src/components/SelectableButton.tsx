import { cn } from "@/lib/utils";

interface SelectableButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function SelectableButton({ 
  children, 
  onClick, 
  isActive = false,
  disabled = false,
  className, 
  "data-testid": dataTestId
}: SelectableButtonProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      data-testid={dataTestId}
      disabled={disabled}
      className={cn(
        "relative px-4 py-5 rounded-lg transition-all duration-200",
        "min-h-[48px]",
        disabled ? (
          // Disabled state: gray colors, outer border only
          "border-2 border-gray-300 dark:border-gray-600 font-semibold text-gray-400 dark:text-gray-500 cursor-not-allowed"
        ) : (
          // Normal state: sandy brown/coral colors
          "border-2 border-[#F4A261] font-semibold text-[#E76F51] cursor-pointer outline-none hover:bg-[#F4A261]/5 active:bg-[#F4A261]/10"
        ),
        isActive && !disabled && "selectable-button-active",
        className
      )}
      style={{ fontSize: "14px", lineHeight: "1.2" }}
    >
      {children}
    </button>
  );
}
