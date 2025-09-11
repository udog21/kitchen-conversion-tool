import { useState } from 'react';
import { DecimalKeypad } from '../DecimalKeypad';
import { Button } from '@/components/ui/button';

export default function DecimalKeypadExample() {
  const [value, setValue] = useState("0");
  const [showKeypad, setShowKeypad] = useState(false);

  return (
    <div className="p-8">
      <div className="text-center mb-4">
        <div className="text-lg mb-2">Value: {value}</div>
        <Button onClick={() => setShowKeypad(true)}>
          Open Keypad
        </Button>
      </div>
      
      {showKeypad && (
        <DecimalKeypad
          value={value}
          onChange={setValue}
          onClose={() => setShowKeypad(false)}
        />
      )}
    </div>
  );
}