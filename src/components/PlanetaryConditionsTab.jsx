// src/components/PlanetaryConditionsTab.jsx
import React from 'react';

const PlanetaryConditionsTab = ({ planetaryConditions, setPlanetaryConditions }) => {
  const handleConditionChange = (condition, value) => {
    setPlanetaryConditions(prev => ({ ...prev, [condition]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(planetaryConditions).map(([condition, value]) => (
        <div key={condition} className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow duration-200"> {/* Enhanced hover effect */}
          <header className="border-b pb-2 mb-2">
            <h2 className="text-xl font-semibold capitalize">{condition}</h2>
          </header>
          <div className="mt-2"> 
            <input
              type="range"
              value={value}
              min={0}
              max={100}
              step={1}
              onChange={(e) => handleConditionChange(condition, Number(e.target.value))}
              className="w-full accent-blue-500" // Custom accent color for the slider
            />
            <div className="mt-2 flex justify-between"> {/* Flexbox for spacing */}
              <span>Current value: {value}</span>
              {value < 25 || value > 75 ? (
                <span className="text-red-500 font-semibold">Extreme conditions!</span>
              ) : null}
            </div>
            {value < 25 || value > 75 ? (
              <div className="text-red-500 mt-1">⚠️ Warning: Extreme conditions</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlanetaryConditionsTab;
