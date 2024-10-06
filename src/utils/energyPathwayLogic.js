import { chemosynthesisPathways } from './constants';

// Gas constant (J/(mol·K))
const R = 8.314;

// Function to compute Gibbs free energy change
const computeGibbsFreeEnergy = (pathway, temperature, pressure) => {
    const baseEnergy = {
        Hydrogenic: -237000, // Converted from -237 kJ to -237000 J
        Methanogenic: -131000, // Converted from -131 kJ to -131000 J
        'Dark Oxygen': -247000, // Converted from -247 kJ to -247000 J
    };

    // Simplified adjustment based on temperature and pressure
    return baseEnergy[pathway] * (1 + (temperature - 50) / 100) * (1 + (pressure - 50) / 100);
};

// Function to compute activation energy
const computeActivationEnergy = (pathway, minerals) => {
    const baseEnergy = {
        Hydrogenic: 70000, // Converted from 70 kJ to 70000 J
        Methanogenic: 55000, // Converted from 55 kJ to 55000 J
        'Dark Oxygen': 60000, // Converted from 60 kJ to 60000 J
    };

    const mineralEffect = (pathway === 'Hydrogenic' ? (minerals.sulfur || 0) + (minerals.iron || 0) :
                          pathway === 'Methanogenic' ? (minerals.carbonates || 0) + (minerals.iron || 0) :
                          pathway === 'Dark Oxygen' ? (minerals.sulfur || 0) + (minerals.manganese || 0) : 0) / 200;

    return baseEnergy[pathway] * (1 - mineralEffect);
};

// Function to calculate the reaction rate based on pathway, temperature
const calculateReactionRate = (pathway, temperature) => {
    const T = temperature + 273.15; // Convert to Kelvin
    const Ea = computeActivationEnergy(pathway, {}); // No minerals needed here
    return Math.exp(-Ea / (R * T));
};

// Function to calculate energy yield based on pathway, reaction rate
const calculateEnergyYield = (pathway, reactionRate) => {
    const deltaG = computeGibbsFreeEnergy(pathway, 50, 50); // Use neutral conditions for yield
    return -deltaG * reactionRate; // Yield is based on Gibbs energy change
};

// Function to get pathway efficiency based on environmental conditions
export const getPathwayEfficiency = (pathway, conditions) => {
    const { temperature, pressure } = conditions;
    const pathwayInfo = chemosynthesisPathways[pathway];

    // Calculate base efficiency from environmental conditions
    const baseEfficiency = 1 + (pathwayInfo.environmentalImpact.temperature || 0) * ((temperature - 50) / 50) +
                          (pathwayInfo.environmentalImpact.pressure || 0) * ((pressure - 50) / 50);

    // Calculate reaction rate and energy yield
    const reactionRate = calculateReactionRate(pathway, temperature);
    const energyYield = calculateEnergyYield(pathway, reactionRate);

    return baseEfficiency * energyYield; // Return efficiency based on environmental factors and yield
};

// Function to calculate total energy for an organism based on its pathways and environmental conditions
export const calculateOrganismEnergy = (organism, planetaryConditions) => {
    return Object.entries(organism.pathways).reduce((totalEnergy, [pathway, percentage]) => {
        const efficiency = getPathwayEfficiency(pathway, planetaryConditions);
        return totalEnergy + (organism.energyValue * (percentage / 100) * efficiency);
    }, 0);
};
