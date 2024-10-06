// src/components/OverviewTab.jsx
import React from 'react';
import WorldDiagram from './WorldDiagram';

const OverviewTab = () => {
  return (
    <div className="border rounded-lg p-4 shadow"> {/* Replacing Card */}
      <header>
        <h2 className="text-xl font-semibold">World Overview</h2>
      </header>
      <div className="mt-2"> {/* Replacing CardContent */}
        <p>
          This chemosynthetic world is divided into three main regions, each hosting a unique ecosystem of organisms that have adapted to their specific environmental conditions.
        </p>
        <p className="mt-2">
          The world features a complex food web with producers, consumers, apex predators, and decomposers. Energy flows through various chemosynthetic pathways, supporting life in this alien environment.
        </p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">World Diagram</h3>
          <WorldDiagram />
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
