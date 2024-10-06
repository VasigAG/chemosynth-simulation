// src/components/RegionsTab.jsx
import React from 'react';

const RegionsTab = ({ regions, organisms, organismTypes }) => {
  return (
    <div>
      {regions.map(region => (
        <div key={region.name} className="border rounded-lg p-4 mb-4 shadow"> {/* Replacing Card */}
          <header>
            <h2 className="text-xl font-semibold">{region.name}</h2>
          </header>
          <div className="mt-2"> {/* Replacing CardContent */}
            <p>{region.description}</p>
            <h3 className="font-semibold mt-2">Organisms:</h3>
            <ul>
              {organisms
                .filter(org => org.region === region.name)
                .map(org => (
                  <li key={org.name}>
                    {org.name} ({organismTypes[org.type].trophicLevel})
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RegionsTab;
