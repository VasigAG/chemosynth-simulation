import React, { useState, useEffect, useCallback } from 'react';
import OverviewTab from './OverviewTab';
import RegionsTab from './RegionsTab';
import OrganismsTab from './OrganismsTab';
import EnergyPathwaysTab from './EnergyPathwaysTab';
import SimulationTab from './SimulationTab';
import PlanetaryConditionsTab from './PlanetaryConditionsTab';
import {
  initialOrganisms,
  initialPopulations,
  initialPlanetaryConditions,
  regions,
  organismTypes,
  chemosynthesisPathways,
} from '../utils/constants';
import {
  simulateGeneration,
  updatePlanetaryConditions as updateConditionsFromSimulation,
  createRandomOrganism,
} from '../utils/simulationLogic';

const ChemosyntheticWorldSimulator = () => {
  const [organisms, setOrganisms] = useState(initialOrganisms);
  const [populations, setPopulations] = useState(initialPopulations);
  const [timeStep, setTimeStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationData, setSimulationData] = useState([]);
  const [planetaryConditions, setPlanetaryConditions] = useState(initialPlanetaryConditions);
  const [activeTab, setActiveTab] = useState('overview');

  const runSimulation = useCallback(() => {
    const { newPopulations, updatedOrganisms } = simulateGeneration(organisms, populations, planetaryConditions);
    setPopulations(newPopulations);
    setOrganisms(updatedOrganisms);
    setTimeStep(prev => prev + 1);

    if (Math.random() < 0.01) {
      const newOrganism = createRandomOrganism(organisms);
      setOrganisms(prev => [...prev, newOrganism]);
      setPopulations(prev => ({ ...prev, [newOrganism.name]: newOrganism.initialPopulation }));
    }

    setPlanetaryConditions(prev => updateConditionsFromSimulation(updatedOrganisms, newPopulations, prev));
  }, [organisms, populations, planetaryConditions]);

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

  const tabs = ['overview', 'regions', 'organisms', 'planet', 'energy', 'simulation'];

  return (
    <div className="sim-root">
      <h1 className="sim-title">Chemosynthetic World Simulator</h1>
      <div className="tab-row">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'regions' && <RegionsTab regions={regions} organisms={organisms} organismTypes={organismTypes} />}
      {activeTab === 'organisms' && <OrganismsTab organisms={organisms} organismTypes={organismTypes} populations={populations} />}
      {activeTab === 'planet' && (
        <PlanetaryConditionsTab
          planetaryConditions={planetaryConditions}
          setPlanetaryConditions={setPlanetaryConditions}
        />
      )}
      {activeTab === 'energy' && (
        <EnergyPathwaysTab
          chemosynthesisPathways={chemosynthesisPathways}
          organisms={organisms}
          planetaryConditions={planetaryConditions}
        />
      )}
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
  );
};

export default ChemosyntheticWorldSimulator;
