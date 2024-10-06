// OrganismsTab.jsx
import React from 'react';
import { chemosynthesisPathways } from '../utils/constants'; // Adjust the import path as needed

const OrganismsTab = ({ organisms, organismTypes }) => {
    return (
        <div className="organisms-tab">
            {Object.entries(organismTypes).map(([type, info]) => (
                <div key={type} className="bg-white shadow rounded p-4 mb-4">
                    <div className="mb-2">
                        <h2 className="text-xl font-semibold">{type}</h2>
                    </div>
                    <div>
                        <p>Kingdom: {info.kingdom}</p>
                        <p>Trophic Level: {info.trophicLevel}</p>
                        <h3 className="font-semibold mt-2">Species:</h3>
                        <ul className="list-disc pl-5">
                            {organisms
                                .filter(org => org.type === type)
                                .map(org => (
                                    <li key={org.name} className="mb-2">
                                        <div>
                                            <strong>{org.name}</strong> (Region: {org.region})
                                            {org.prey.length > 0 && (
                                                <span> - Preys on: {org.prey.join(', ')}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Pathways:</h4>
                                            <ul className="list-disc pl-5">
                                                {Object.entries(org.pathways).map(([pathway, percentage]) => (
                                                    <li key={pathway}>
                                                        {pathway} - {percentage}%
                                                        <br />
                                                        Description: {chemosynthesisPathways[pathway]?.description}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="mt-2">
                                            <h4 className="font-semibold">Population Dynamics:</h4>
                                            <p>Current Population: <strong>{org.population}</strong></p>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrganismsTab;
