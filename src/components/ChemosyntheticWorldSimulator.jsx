import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import WorldDiagram from './WorldDiagram';
import {
  initialOrganisms,
  initialPopulations,
  initialPlanetaryConditions,
  organismTypes,
  chemosynthesisPathways,
} from '../utils/constants';
import {
  simulateGeneration,
  updatePlanetaryConditions as updateConditionsFromSimulation,
  createRandomOrganism,
  calculateEcosystemEnergy,
} from '../utils/simulationLogic';
import { calculateOrganismEnergy } from '../utils/energyPathwayLogic';

const ChemosyntheticWorldSimulator = () => {
  const [organisms, setOrganisms] = useState(initialOrganisms);
  const [populations, setPopulations] = useState(initialPopulations);
  const [timeStep, setTimeStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationData, setSimulationData] = useState([]);
  const [planetaryConditions, setPlanetaryConditions] = useState(initialPlanetaryConditions);

  const runSimulation = useCallback(() => {
    const { newPopulations, updatedOrganisms } = simulateGeneration(organisms, populations, planetaryConditions);

    setPopulations(newPopulations);
    setOrganisms(updatedOrganisms);
    setTimeStep(prev => prev + 1);

    if (Math.random() < 0.01) {
      const newOrganism = createRandomOrganism(updatedOrganisms);
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
    const ecosystemEnergy = calculateEcosystemEnergy(organisms, populations, planetaryConditions);
    setSimulationData(prev => [
      ...prev,
      {
        timeStep,
        ...populations,
        temperature: planetaryConditions.temperature,
        pressure: planetaryConditions.pressure,
        pH: planetaryConditions.pH,
        dissolved_oxygen: planetaryConditions.dissolved_oxygen,
        ecosystemEnergy,
      },
    ]);
  }, [timeStep, organisms, populations, planetaryConditions]);

  const resetSimulation = () => {
    setOrganisms(initialOrganisms);
    setPopulations(initialPopulations);
    setPlanetaryConditions(initialPlanetaryConditions);
    setTimeStep(0);
    setSimulationData([]);
    setIsRunning(false);
  };

  const populationChartData = useMemo(
    () => organisms.map(org => ({ name: org.name, population: populations[org.name] || 0 })),
    [organisms, populations]
  );

  const energyTransferData = useMemo(
    () => organisms.map(org => {
      const totalEnergy = calculateOrganismEnergy(org, planetaryConditions);
      const pathways = Object.entries(org.pathways).reduce((acc, [pathway, percent]) => {
        acc[pathway] = (totalEnergy * percent) / 100;
        return acc;
      }, {});

      return {
        name: org.name,
        ...pathways,
      };
    }),
    [organisms, planetaryConditions]
  );

  const latestMetrics = simulationData[simulationData.length - 1] || { ecosystemEnergy: 0 };

  return (
    <div className="sim-root one-page-layout">
      <header className="hero glass-panel">
        <h1 className="sim-title">Chemosynthetic World Simulator</h1>
        <p className="hero-text">
          A single-page live dashboard combining world overview, organism dynamics, planetary feedback, and energy transfer.
        </p>
      </header>

      <section className="glass-panel section-block">
        <h2 className="section-title">Overview</h2>
        <div className="overview-row">
          <div>
            <p>
              This world evolves through chemosynthetic pathways. Organism populations and planetary conditions influence
              each other in every generation through environmental impact and resource constraints.
            </p>
            <p>
              Time step: <strong>{timeStep}</strong> generations | Ecosystem energy: <strong>{latestMetrics.ecosystemEnergy.toFixed(2)}</strong>
            </p>
          </div>
          <WorldDiagram />
        </div>
      </section>

      <section className="glass-panel section-block">
        <div className="section-header">
          <h2 className="section-title">Simulation of Organisms</h2>
          <div className="controls-row">
            <button className="tab-btn active" onClick={() => setIsRunning(prev => !prev)}>
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button className="tab-btn" onClick={runSimulation}>Step</button>
            <button className="tab-btn" onClick={resetSimulation}>Reset</button>
          </div>
        </div>

        <div className="chart-grid">
          <div className="chart-card">
            <h3>Current Populations</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={populationChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                <XAxis dataKey="name" tick={{ fill: '#d9e7ff' }} />
                <YAxis tick={{ fill: '#d9e7ff' }} />
                <Tooltip />
                <Bar dataKey="population" fill="#7af0ce" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Population Trends (Top Species)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={simulationData.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                <XAxis dataKey="timeStep" tick={{ fill: '#d9e7ff' }} />
                <YAxis tick={{ fill: '#d9e7ff' }} />
                <Tooltip />
                <Legend />
                {organisms.slice(0, 4).map((org, index) => (
                  <Line
                    key={org.name}
                    type="monotone"
                    dataKey={org.name}
                    stroke={`hsl(${index * 70 + 180}, 90%, 70%)`}
                    dot={false}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="glass-panel section-block">
        <h2 className="section-title">Simulation of Planetary Conditions</h2>
        <div className="conditions-grid">
          <div className="condition-slider">
            <label>Temperature: {planetaryConditions.temperature.toFixed(1)}</label>
            <input type="range" min={0} max={120} step={0.1} value={planetaryConditions.temperature} onChange={(e) => setPlanetaryConditions(prev => ({ ...prev, temperature: Number(e.target.value) }))} />
          </div>
          <div className="condition-slider">
            <label>Pressure: {planetaryConditions.pressure.toFixed(1)}</label>
            <input type="range" min={50} max={500} step={0.1} value={planetaryConditions.pressure} onChange={(e) => setPlanetaryConditions(prev => ({ ...prev, pressure: Number(e.target.value) }))} />
          </div>
          <div className="condition-slider">
            <label>pH: {planetaryConditions.pH.toFixed(2)}</label>
            <input type="range" min={0} max={14} step={0.01} value={planetaryConditions.pH} onChange={(e) => setPlanetaryConditions(prev => ({ ...prev, pH: Number(e.target.value) }))} />
          </div>
          <div className="condition-slider">
            <label>Dissolved Oxygen: {planetaryConditions.dissolved_oxygen.toFixed(2)}</label>
            <input type="range" min={0} max={12} step={0.01} value={planetaryConditions.dissolved_oxygen} onChange={(e) => setPlanetaryConditions(prev => ({ ...prev, dissolved_oxygen: Number(e.target.value) }))} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Planetary Conditions Through Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={simulationData.slice(-50)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
              <XAxis dataKey="timeStep" tick={{ fill: '#d9e7ff' }} />
              <YAxis tick={{ fill: '#d9e7ff' }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="temperature" stroke="#ff9f7a" fill="#ff9f7a55" />
              <Area type="monotone" dataKey="pressure" stroke="#88a8ff" fill="#88a8ff44" />
              <Area type="monotone" dataKey="pH" stroke="#c4a3ff" fill="#c4a3ff44" />
              <Area type="monotone" dataKey="dissolved_oxygen" stroke="#7af0ce" fill="#7af0ce44" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass-panel section-block">
        <h2 className="section-title">Energy Transfer</h2>
        <div className="chart-grid">
          <div className="chart-card">
            <h3>Pathway Energy Contribution (Current)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={energyTransferData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                <XAxis dataKey="name" tick={{ fill: '#d9e7ff' }} />
                <YAxis tick={{ fill: '#d9e7ff' }} />
                <Tooltip />
                <Legend />
                {Object.keys(chemosynthesisPathways).map((pathway) => (
                  <Bar key={pathway} dataKey={pathway} stackId="a" fill={chemosynthesisPathways[pathway].color} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Total Ecosystem Energy Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={simulationData.slice(-50)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                <XAxis dataKey="timeStep" tick={{ fill: '#d9e7ff' }} />
                <YAxis tick={{ fill: '#d9e7ff' }} />
                <Tooltip />
                <Line type="monotone" dataKey="ecosystemEnergy" stroke="#5da7ff" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChemosyntheticWorldSimulator;
