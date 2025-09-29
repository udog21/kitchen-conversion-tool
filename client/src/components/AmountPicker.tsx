import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClickableButton } from "./ClickableButton";
import { DecimalKeypad } from "./DecimalKeypad";

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
  const [showKeypad, setShowKeypad] = useState(false);

  // Common fraction options for Imperial
  const fractionOptions = [
    "1/8", "1/4", "1/3", "1/2", "2/3", "3/4", "7/8",
    "1", "1 1/4", "1 1/3", "1 1/2", "1 2/3", "1 3/4", 
    "2", "2 1/4", "2 1/2", "2 3/4", "3", "3 1/2", "4"
  ];

  // Common decimal options for Metric
  const decimalOptions = [
    "0.25", "0.5", "0.75", "1", "1.25", "1.5", "1.75", "2", 
    "2.5", "3", "3.5", "4", "4.5", "5", "7.5", "10", "15", "20"
  ];

  const options = isMetric ? decimalOptions : fractionOptions;

  const handleOptionSelect = (value: string) => {
    onAmountChange(value);
    onClose();
  };

  const handleCustomAmount = () => {
    setShowKeypad(true);
  };

  const [keypadValue, setKeypadValue] = useState(currentAmount);

  const handleKeypadClose = () => {
    setShowKeypad(false);
    onClose();
  };

  if (showKeypad) {
    return (
      <Dialog open={isOpen} onOpenChange={handleKeypadClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter {isMetric ? 'Decimal' : 'Whole Number'} Amount</DialogTitle>
          </DialogHeader>
          <DecimalKeypad
            value={keypadValue}
            onChange={setKeypadValue}
            onClose={handleKeypadClose}
          />
          <div className="flex gap-2 p-4">
            <Button 
              variant="outline" 
              onClick={handleKeypadClose} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                onAmountChange(keypadValue);
                setShowKeypad(false);
                onClose();
              }}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Amount</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-3 p-4">
          {options.map((option) => (
            <ClickableButton
              key={option}
              pressed={currentAmount === option}
              onClick={() => handleOptionSelect(option)}
              data-testid={`amount-option-${option.replace(/[^a-zA-Z0-9]/g, '-')}`}
              className="aspect-square"
            >
              {option}
            </ClickableButton>
          ))}
          
          {/* Custom amount button */}
          <ClickableButton
            pressed={false}
            onClick={handleCustomAmount}
            data-testid="amount-custom"
            className="col-span-3 bg-conversion-accent text-background hover:bg-conversion-accent/90"
          >
            Enter Custom Amount
          </ClickableButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}