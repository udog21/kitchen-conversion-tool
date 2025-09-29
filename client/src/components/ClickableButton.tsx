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
  pressed = true, 
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
        // Pressed (inset) style - matches left side of image
        pressed && [
          "bg-muted border-2 border-border",
          "shadow-inner shadow-muted-foreground/20",
          "transform scale-[0.98]"
        ],
        // Unpressed (raised) style - matches right side of image
        !pressed && [
          "bg-background border-2 border-border",
          "shadow-md shadow-muted-foreground/15",
          "hover:shadow-lg hover:shadow-muted-foreground/20",
          "transform scale-100 hover:scale-[1.02]"
        ],
        className
      )}
    >
      {children}
    </Button>
  );
}