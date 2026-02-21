import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { chemosynthesisPathways, organismTypes, initialPlanetaryConditions } from '../utils/constants';
import { getPathwayEfficiency, calculateOrganismEnergy } from '../utils/energyPathwayLogic';

const EnergyCalculator = ({ organisms }) => {
  const [pathwayEfficiencies, setPathwayEfficiencies] = useState({});
  const [planetaryConditions, setPlanetaryConditions] = useState(initialPlanetaryConditions);

  useEffect(() => {
    const efficiencies = {};
    organisms.forEach(organism => {
      for (const pathway in organism.pathways) {
        efficiencies[pathway] = getPathwayEfficiency(pathway, planetaryConditions);
      }
    });
    setPathwayEfficiencies(efficiencies);
  }, [organisms, planetaryConditions]);

  const renderConditionSlider = (condition, min, max, value, onChangeHandler) => (
    <div key={condition} className="mb-2">
      <label className="block text-sm font-medium text-gray-700">{condition}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChangeHandler}
        className="w-full"
      />
      <span>{value}</span>
    </div>
  );

  const calculateTotalEnergy = (organism) => {
    return calculateOrganismEnergy(organism, planetaryConditions)*10000;
  };

  return organisms.length > 0 ? (
    <div className="bg-white shadow rounded p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Energy Calculator</h2>
      <h3 className="font-semibold mt-4 mb-2">Planetary Conditions</h3>
      <div className="grid grid-cols-2 gap-4">
        {renderConditionSlider('temperature', 0, 100, planetaryConditions.temperature, 
          (e) => setPlanetaryConditions(prev => ({ ...prev, temperature: parseFloat(e.target.value) })))}
        {renderConditionSlider('pressure', 0, 100, planetaryConditions.pressure, 
          (e) => setPlanetaryConditions(prev => ({ ...prev, pressure: parseFloat(e.target.value) })))}
        {renderConditionSlider('pH', 0, 14, planetaryConditions.pH, 
          (e) => setPlanetaryConditions(prev => ({ ...prev, pH: parseFloat(e.target.value) })))}
      </div>

      <h3 className="font-semibold mt-4 mb-2">Minerals</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(planetaryConditions.minerals).map(([mineral, value]) => 
          renderConditionSlider(mineral, 0, 100, value, 
            (e) => setPlanetaryConditions(prev => ({ 
              ...prev, minerals: { ...prev.minerals, [mineral]: parseFloat(e.target.value) } 
            }))
          )
        )}
      </div>

      {organisms.map((organism) => {
        const totalEnergy = calculateTotalEnergy(organism);
        const pieChartData = Object.entries(organism.pathways).map(([pathway, percentage]) => ({
          name: pathway,
          value: percentage * (pathwayEfficiencies[pathway] || 0), // Use default value if undefined
        }));

        return (
          <div key={organism.name} className="mt-6">
            <h2 className="text-xl font-semibold mb-2">{organism.name} Energy Details</h2>
            <p>Type: {organism.type} ({organismTypes[organism.type].trophicLevel})</p>
            <p>Region: {organism.region}</p>
            <p>Energy Value: {organism.energyValue} </p>
            <p>Total Energy: {totalEnergy.toFixed(2)}</p>

            <h3 className="font-semibold mt-4 mb-2">Energy Pathways</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chemosynthesisPathways[entry.name].color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4">
              {Object.entries(organism.pathways).map(([pathway, percentage]) => (
                <div key={pathway} className="mb-2">
                  <h4 className="font-semibold">{pathway}</h4>
                  <p>Percentage: {percentage.toFixed(2)}%</p>
                  <p>Efficiency: {(pathwayEfficiencies[pathway] * 100 || 0).toFixed(2)}%</p>
                  <p>Energy Contribution: {(percentage * (pathwayEfficiencies[pathway] || 0) * organism.energyValue / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="text-center text-gray-500">No organisms selected. Please select organisms to view energy details.</div>
  );
};

export default EnergyCalculator;
