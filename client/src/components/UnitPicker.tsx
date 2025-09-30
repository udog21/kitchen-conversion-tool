import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClickableButton } from "./ClickableButton";

interface UnitPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUnit: string;
  onUnitChange: (unit: string) => void;
  units: string[];
  title: string;
}

export function UnitPicker({ 
  isOpen, 
  onClose, 
  currentUnit, 
  onUnitChange, 
  units,
  title 
}: UnitPickerProps) {
  const handleUnitSelect = (unit: string) => {
    onUnitChange(unit);
    onClose();
  };

  // Group units by system for better organization
  const imperialUnits = ["teaspoon", "tablespoon", "cup", "pint", "quart", "gallon"];
  const metricUnits = ["mL", "liter"];
  
  const imperialOptions = units.filter(unit => imperialUnits.includes(unit));
  const metricOptions = units.filter(unit => metricUnits.includes(unit));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          {imperialOptions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Imperial</h3>
              <div className="grid grid-cols-2 gap-3">
                {imperialOptions.map((unit) => (
                  <ClickableButton
                    key={unit}
                    showInnerBorder={currentUnit === unit}
                    onClick={() => handleUnitSelect(unit)}
                    data-testid={`unit-option-${unit.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    variant="modal"
                  >
                    {unit}
                  </ClickableButton>
                ))}
              </div>
            </div>
          )}
          
          {metricOptions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Metric</h3>
              <div className="grid grid-cols-2 gap-3">
                {metricOptions.map((unit) => (
                  <ClickableButton
                    key={unit}
                    showInnerBorder={currentUnit === unit}
                    onClick={() => handleUnitSelect(unit)}
                    data-testid={`unit-option-${unit.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    variant="modal"
                  >
                    {unit}
                  </ClickableButton>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}