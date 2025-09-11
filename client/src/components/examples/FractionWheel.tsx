import { useState } from 'react';
import { FractionWheel } from '../FractionWheel';

export default function FractionWheelExample() {
  const [value, setValue] = useState("1");

  return (
    <div className="p-8 bg-card rounded-lg">
      <h3 className="text-center mb-4">Selected: {value}</h3>
      <FractionWheel 
        value={value} 
        onChange={setValue}
        dataTestId="fraction-wheel-demo"
      />
    </div>
  );
}