import { cn } from "@/lib/utils";

interface OutputDisplayProps {
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function OutputDisplay({ 
  children, 
  className, 
  "data-testid": dataTestId
}: OutputDisplayProps) {
  return (
    <div
      data-testid={dataTestId}
      className={cn(
        "relative px-4 py-5 rounded-lg",
        "border-2 border-[#264653]",
        "font-semibold text-[#2A9D8F]",
        "min-h-[48px]",
        "flex items-center justify-center",
        className
      )}
      style={{ fontSize: "14px", lineHeight: "1.2" }}
    >
      {children}
    </div>
  );
}
