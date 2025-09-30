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
        isActive && "selectable-button-active",
        className
      )}
      style={{ fontSize: "14px", lineHeight: "1.2" }}
    >
      {children}
    </button>
  );
}
