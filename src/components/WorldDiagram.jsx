// src/components/WorldDiagram.jsx
import React from 'react';
import { regions } from '../utils/constants';

const WorldDiagram = () => {
  const scaleFactor = 0.6; // Scale down by 60%

  return (
    <svg viewBox="0 0 200 200" className="max-w-full h-auto" style={{ width: '120px', height: '120px' }}>
      <circle cx="100" cy="100" r={90 * scaleFactor} fill="#0d3b66" />
      {regions.map((region, index) => (
        <g key={region.name}>
          <path
            d={`M100 100 L${100 + (90 * scaleFactor) * Math.cos(index * 2 * Math.PI / regions.length)} ${100 + (90 * scaleFactor) * Math.sin(index * 2 * Math.PI / regions.length)} A${90 * scaleFactor} ${90 * scaleFactor} 0 0 1 ${100 + (90 * scaleFactor) * Math.cos((index + 1) * 2 * Math.PI / regions.length)} ${100 + (90 * scaleFactor) * Math.sin((index + 1) * 2 * Math.PI / regions.length)} Z`}
            fill={`hsl(${index * 120}, 70%, 70%)`} // Lighter color for better contrast
            stroke="#ffffff" // White stroke for better visibility
            strokeWidth="2"
          />
          <text
            x={100 + (60 * scaleFactor) * Math.cos((index + 0.5) * 2 * Math.PI / regions.length)}
            y={100 + (60 * scaleFactor) * Math.sin((index + 0.5) * 2 * Math.PI / regions.length)}
            textAnchor="middle"
            fill={`hsl(${index * 120}, 80%, 50%)`} // Colorful text based on index
            fontSize="5" // Smaller font size
            fontWeight="bold" // Bold text for emphasis
            fontFamily="Arial, sans-serif" // Consistent font family
          >
            {region.name}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default WorldDiagram;
