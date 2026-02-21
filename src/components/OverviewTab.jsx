import React from 'react';
import WorldDiagram from './WorldDiagram';
import AnimatedWorldScene from './AnimatedWorldScene';

const OverviewTab = () => {
  return (
    <div className="overview-grid">
      <section className="glass-panel">
        <h2 className="section-title">World Overview</h2>
        <p>
          This biosphere is driven by chemical energy gradients around hydrothermal vents, high-pressure trenches,
          and mineral-rich plumes. Organisms continuously adapt their pathways as conditions shift.
        </p>
        <p>
          Population growth now responds to local habitability, resource pressure, and prey support, creating
          more stable long-term ecosystem dynamics.
        </p>
      </section>

      <section className="glass-panel scene-panel">
        <h3 className="section-title">Living Planet</h3>
        <AnimatedWorldScene />
      </section>

      <section className="glass-panel">
        <h3 className="section-title">Biome Layout</h3>
        <WorldDiagram />
      </section>
    </div>
  );
};

export default OverviewTab;
