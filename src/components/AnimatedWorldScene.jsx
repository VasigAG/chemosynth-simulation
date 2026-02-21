import React from 'react';

const orbiters = [
  { id: 'hydro-1', r: 26, duration: 7, size: 3, color: '#5fd1ff' },
  { id: 'meth-1', r: 38, duration: 11, size: 4, color: '#7fffa1' },
  { id: 'oxy-1', r: 48, duration: 13, size: 3, color: '#dca7ff' },
  { id: 'pred-1', r: 58, duration: 17, size: 4, color: '#ff9e7a' },
];

const AnimatedWorldScene = () => {
  return (
    <div className="world-scene" aria-label="Animated chemosynthetic world">
      <div className="nebula-glow" />
      <div className="planet-core" />
      <div className="planet-haze" />

      {orbiters.map((orbiter) => (
        <div
          key={orbiter.id}
          className="orbiter-ring"
          style={{
            width: orbiter.r * 2,
            height: orbiter.r * 2,
            animationDuration: `${orbiter.duration}s`,
          }}
        >
          <span
            className="orbiter-dot"
            style={{
              width: orbiter.size * 2,
              height: orbiter.size * 2,
              background: orbiter.color,
              boxShadow: `0 0 12px ${orbiter.color}`,
            }}
          />
        </div>
      ))}

      <div className="vent vent-a" />
      <div className="vent vent-b" />
      <div className="vent vent-c" />
    </div>
  );
};

export default AnimatedWorldScene;
