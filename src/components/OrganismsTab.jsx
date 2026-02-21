import React from 'react';
import { chemosynthesisPathways } from '../utils/constants';

const OrganismsTab = ({ organisms, organismTypes, populations }) => {
  return (
    <div className="organisms-tab">
      {Object.entries(organismTypes).map(([type, info]) => (
        <div key={type} className="border rounded-lg p-4 mb-4 shadow">
          <h2 className="text-xl font-semibold">{type}</h2>
          <p>Kingdom: {info.kingdom}</p>
          <p>Trophic Level: {info.trophicLevel}</p>

          <h3 className="font-semibold mt-2">Species</h3>
          <ul className="list-disc pl-5">
            {organisms
              .filter(org => org.type === type)
              .map(org => (
                <li key={org.name} className="mb-2">
                  <strong>{org.name}</strong> (Region: {org.region})
                  {org.prey.length > 0 && <span> - Preys on: {org.prey.join(', ')}</span>}
                  <div>Current Population: <strong>{populations[org.name] ?? 0}</strong></div>

                  <ul className="list-disc pl-5">
                    {Object.entries(org.pathways).map(([pathway, percentage]) => (
                      <li key={pathway}>
                        {pathway} - {percentage.toFixed(1)}% ({chemosynthesisPathways[pathway]?.description})
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default OrganismsTab;
