import { useState } from 'react';
import { UnitWheel } from '../UnitWheel';

export default function UnitWheelExample() {
  const units = ["teaspoon", "tablespoon", "cup", "pint", "quart", "gallon", "mL/cc", "liter"];
  const [selectedUnit, setSelectedUnit] = useState("cup");

  return (
    <div className="p-8 bg-card rounded-lg">
      <h3 className="text-center mb-4">Selected: {selectedUnit}</h3>
      <UnitWheel 
        units={units} 
        selectedUnit={selectedUnit} 
        onUnitChange={setSelectedUnit}
        dataTestId="unit-wheel-demo"
      />
    </div>
  );
}