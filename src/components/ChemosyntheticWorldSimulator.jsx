import React, { useState, useEffect, useCallback } from 'react';
import OverviewTab from './OverviewTab';
import RegionsTab from './RegionsTab';
import OrganismsTab from './OrganismsTab';
import EnergyPathwaysTab from './EnergyPathwaysTab';
import SimulationTab from './SimulationTab';
import { initialOrganisms, initialPopulations, initialPlanetaryConditions, regions, organismTypes, chemosynthesisPathways } from '../utils/constants';
import { simulateGeneration, createNewOrganism, updatePlanetaryConditions } from '../utils/simulationLogic';
import { calculateOrganismEnergy } from '../utils/energyPathwayLogic';
import { createRandomOrganism } from '../utils/simulationLogic';

const ChemosyntheticWorldSimulator = () => {
  const [organisms, setOrganisms] = useState(initialOrganisms);
  const [populations, setPopulations] = useState(initialPopulations);
  const [timeStep, setTimeStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationData, setSimulationData] = useState([]);
  const [planetaryConditions, setPlanetaryConditions] = useState(initialPlanetaryConditions);
  const [activeTab, setActiveTab] = useState('overview');

  const updatePlanetaryConditions = useCallback((organisms, populations, currentConditions) => {
    const impactFactors = {
      Methanogenic: { temperature: 0.1, pressure: 0.05, pH: -0.01, minerals: { oxygen: -0.1, ironSulfate: -0.05 } },
      Hydrogenic: { temperature: 0.2, pressure: 0.1, pH: 0.01, minerals: { sulfur: -0.1 } },
      'Dark Oxygen': { temperature: -0.1, pressure: 0.2, pH: -0.02, minerals: { manganese: -0.05, nickel: -0.02 } }
    };

    const newConditions = { ...currentConditions };
    
    organisms.forEach(organism => {
      const organismEnergy = calculateOrganismEnergy(organism, currentConditions);
      const populationFactor = populations[organism.name] / 1000; // Normalize population impact
      
      Object.entries(organism.pathways).forEach(([pathway, percentage]) => {
        const impact = impactFactors[pathway];
        const energyImpact = (organismEnergy * percentage / 100) * populationFactor;
        
        for (const [condition, factor] of Object.entries(impact)) {
          if (condition === 'minerals') {
            for (const [mineral, mineralFactor] of Object.entries(factor)) {
              newConditions.minerals[mineral] = Math.max(0, Math.min(100, newConditions.minerals[mineral] + energyImpact * mineralFactor));
            }
          } else {
            newConditions[condition] = Math.max(0, Math.min(100, newConditions[condition] + energyImpact * factor));
          }
        }
      });
    });

    // Add some randomness for natural fluctuations
    newConditions.temperature += (Math.random() - 0.5) * 0.5;
    newConditions.pressure += (Math.random() - 0.5) * 0.5;
    newConditions.pH += (Math.random() - 0.5) * 0.1;
    Object.keys(newConditions.minerals).forEach(mineral => {
      newConditions.minerals[mineral] += (Math.random() - 0.5) * 0.5;
    });

    // Ensure all values are within bounds
    newConditions.temperature = Math.max(0, Math.min(100, newConditions.temperature));
    newConditions.pressure = Math.max(0, Math.min(100, newConditions.pressure));
    newConditions.pH = Math.max(0, Math.min(14, newConditions.pH));
    Object.keys(newConditions.minerals).forEach(mineral => {
      newConditions.minerals[mineral] = Math.max(0, Math.min(100, newConditions.minerals[mineral]));
    });

    return newConditions;
  }, []);

  const runSimulation = useCallback(() => {
    const { newPopulations, updatedOrganisms } = simulateGeneration(organisms, populations, planetaryConditions);
    setPopulations(newPopulations);
    setOrganisms(updatedOrganisms);
    setTimeStep(prev => prev + 1);

    // Simulate evolution
    if (Math.random() < 0.01) { // 1% chance of evolution each generation
        const newOrganism = createRandomOrganism(organisms); // Use the random organism creation function
        setOrganisms(prev => [...prev, newOrganism]);
        setPopulations(prev => ({ ...prev, [newOrganism.name]: newOrganism.initialPopulation })); // Start with the new organism's initial population
    }

    // Update planetary conditions based on organism activity
    setPlanetaryConditions(prev => updatePlanetaryConditions(updatedOrganisms, newPopulations, prev));
  }, [organisms, populations, planetaryConditions, updatePlanetaryConditions]);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(runSimulation, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, runSimulation]);

  useEffect(() => {
    setSimulationData(prev => [...prev, { timeStep, ...populations, ...planetaryConditions }]);
  }, [timeStep, populations, planetaryConditions]);

  const toggleSimulation = () => setIsRunning(!isRunning);

  const resetSimulation = () => {
    setOrganisms(initialOrganisms);
    setPopulations(initialPopulations);
    setPlanetaryConditions(initialPlanetaryConditions);
    setTimeStep(0);
    setSimulationData([]);
    setIsRunning(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chemosynthetic World Simulator</h1>
      <div className="mb-4">
        {['overview', 'regions', 'organisms', 'energy', 'simulation'].map((tab) => (
          <button
            key={tab}
            className={`mr-2 px-4 py-2 ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'regions' && <RegionsTab regions={regions} organisms={organisms} organismTypes={organismTypes} />}
        {activeTab === 'organisms' && <OrganismsTab organisms={organisms} organismTypes={organismTypes} />}
        {activeTab === 'energy' && <EnergyPathwaysTab chemosynthesisPathways={chemosynthesisPathways} organisms={organisms} planetaryConditions={planetaryConditions} />}
        {activeTab === 'simulation' && (
          <SimulationTab
            populations={populations}
            simulationData={simulationData}
            isRunning={isRunning}
            toggleSimulation={toggleSimulation}
            resetSimulation={resetSimulation}
            timeStep={timeStep}
          />
        )}
      </div>
    </div>
  );
};

export default ChemosyntheticWorldSimulator;
