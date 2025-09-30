import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MetricKeypad } from "./MetricKeypad";
import { ImperialFractionPicker } from "./ImperialFractionPicker";

interface AmountPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAmount: string;
  onAmountChange: (amount: string) => void;
  isMetric: boolean;
}

export function AmountPicker({ 
  isOpen, 
  onClose, 
  currentAmount, 
  onAmountChange, 
  isMetric 
}: AmountPickerProps) {
  const handleDone = (value: string) => {
    onAmountChange(value);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isMetric ? "Enter Amount" : "Select Amount"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          {isMetric ? (
            <MetricKeypad
              initialValue={currentAmount}
              onDone={handleDone}
              onCancel={handleCancel}
            />
          ) : (
            <ImperialFractionPicker
              initialValue={currentAmount}
              onDone={handleDone}
              onCancel={handleCancel}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
