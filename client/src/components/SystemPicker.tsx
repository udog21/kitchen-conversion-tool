import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClickableButton } from "./ClickableButton";
import { SYSTEMS, type MeasurementSystem, type SystemInfo } from "@/lib/systemDetection";

interface SystemPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSystem: MeasurementSystem;
  onSystemChange: (system: MeasurementSystem) => void;
}

export function SystemPicker({
  isOpen,
  onClose,
  currentSystem,
  onSystemChange,
}: SystemPickerProps) {
  const handleSystemSelect = (system: MeasurementSystem) => {
    onSystemChange(system);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Measurement System</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 p-4">
          {SYSTEMS.map((system: SystemInfo) => (
            <ClickableButton
              key={system.id}
              onClick={() => handleSystemSelect(system.id)}
              data-testid={`system-${system.id}`}
              className="w-full justify-start text-left"
              showInnerBorder={currentSystem === system.id}
            >
              <span className="text-2xl mr-3">
                {system.icon || system.flag}
              </span>
              <span className="flex-1">{system.name}</span>
              {currentSystem === system.id && (
                <span className="text-primary">✓</span>
              )}
            </ClickableButton>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
