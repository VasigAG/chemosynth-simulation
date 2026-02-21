import React from 'react';

const PlanetaryConditionsTab = ({ planetaryConditions, setPlanetaryConditions }) => {
  const handleScalarChange = (condition, value) => {
    setPlanetaryConditions(prev => ({ ...prev, [condition]: value }));
  };

  const handleMineralChange = (mineral, value) => {
    setPlanetaryConditions(prev => ({
      ...prev,
      minerals: {
        ...prev.minerals,
        [mineral]: value,
      },
    }));
  };

  const scalarConditions = Object.entries(planetaryConditions).filter(([, value]) => typeof value === 'number');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {scalarConditions.map(([condition, value]) => (
        <div key={condition} className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold capitalize">{condition.replace('_', ' ')}</h2>
          <input
            type="range"
            value={value}
            min={condition === 'pH' ? 0 : 0}
            max={condition === 'pH' ? 14 : condition === 'pressure' ? 500 : 120}
            step={0.1}
            onChange={(e) => handleScalarChange(condition, Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-2">Current value: {value.toFixed(2)}</div>
        </div>
      ))}

      {Object.entries(planetaryConditions.minerals).map(([mineral, value]) => (
        <div key={mineral} className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold capitalize">{mineral}</h2>
          <input
            type="range"
            value={value}
            min={0}
            max={100}
            step={0.1}
            onChange={(e) => handleMineralChange(mineral, Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-2">Current value: {value.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
};

export default PlanetaryConditionsTab;
