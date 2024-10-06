import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SimulationTab = ({ populations, simulationData, isRunning, toggleSimulation, resetSimulation, timeStep }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {/* Population Display */}
      <div className="border rounded-lg p-4 shadow"> {/* Replacing Card */}
        <header>
          <h2 className="text-xl font-semibold">Current Populations</h2>
        </header>
        <div className="mt-2"> {/* Replacing CardContent */}
          {Object.entries(populations).map(([name, pop]) => (
            <div key={name}>
              {name}: {pop}
            </div>
          ))}
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="border rounded-lg p-4 shadow"> {/* Replacing Card */}
        <header>
          <h2 className="text-xl font-semibold">Simulation Controls</h2>
        </header>
        <div className="mt-2"> {/* Replacing CardContent */}
          <button onClick={toggleSimulation} className="mr-2 px-4 py-2 bg-blue-500 text-white rounded">
            {isRunning ? 'Pause Simulation' : 'Start Simulation'}
          </button>
          <button onClick={resetSimulation} className="px-4 py-2 bg-red-500 text-white rounded">
            Reset Simulation
          </button>
          <div className="mt-2">Time Step: {timeStep * 10} years</div>
        </div>
      </div>

      {/* Separate Graphs for Each Organism */}
      {Object.keys(populations).map((organism, index) => (
        <div key={organism} className="border rounded-lg p-4 shadow col-span-1 md:col-span-2">
          <header>
            <h2 className="text-xl font-semibold">{organism} Population Dynamics</h2>
          </header>
          <div className="mt-2"> {/* Replacing CardContent */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timeStep" label={{ value: 'Time (10 years)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={organism}
                  stroke={`hsl(${index * 30}, 70%, 50%)`} // Assign unique color for each organism
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SimulationTab;
