import { Button } from "@/components/ui/button";
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
    <Button
      variant="ghost"
      onClick={onClick}
      data-testid={dataTestId}
      className={cn(
        "h-auto min-h-12 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200",
        // Dark solid border around all buttons - use ! to override default styles
        "!border-2 !border-foreground/80 bg-background",
        // Pressed/selected state with inner border
        pressed && [
          "shadow-inner shadow-foreground/30",
          "!border-foreground",
          "relative",
          "after:content-[''] after:absolute after:inset-1 after:border after:border-foreground/60 after:rounded-md after:pointer-events-none"
        ],
        // Normal state
        !pressed && [
          "hover:bg-muted/50 hover:!border-foreground",
          "active:shadow-inner active:shadow-foreground/20"
        ],
        className
      )}
    >
      {children}
    </Button>
  );
}