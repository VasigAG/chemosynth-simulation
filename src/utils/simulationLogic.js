// src/utils/simulationLogic.js

import { 
    MAX_POPULATION, MIN_POPULATION, chemosynthesisPathways, organismTypes, 
    UNIVERSAL_GAS_CONSTANT, regions
} from './constants';
import { calculateOrganismEnergy, getPathwayEfficiency } from './energyPathwayLogic';

const MUTATION_RATE = 0.01;
const ENERGY_TRANSFER_EFFICIENCY = 0.7; // 10% energy transfer between trophic levels

const mutatePathways = (pathways) => {
    const newPathways = { ...pathways };
    Object.keys(newPathways).forEach(pathway => {
        if (Math.random() < MUTATION_RATE) {
            newPathways[pathway] += (Math.random() * 20 - 10);
        }
    });

    const total = Object.values(newPathways).reduce((sum, val) => sum + Math.max(0, val), 0);
    Object.keys(newPathways).forEach(pathway => {
        newPathways[pathway] = Math.max(0, (newPathways[pathway] / total) * 100);
    });

    return newPathways;
};
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const createRandomOrganism = (organisms) => {
    // Select a random organism type
    const randomType = getRandomElement(Object.keys(organismTypes));
    
    // Select a random region
    const randomRegion = getRandomElement(regions).name;

    // Generate a random name
    const randomName = `Evolved${Math.floor(Math.random() * 1000)}`;

    // Generate random pathways
    const randomPathways = Object.keys(chemosynthesisPathways).reduce((acc, pathway) => {
        acc[pathway] = Math.floor(Math.random() * 100);
        return acc;
    }, {});

    // Normalize pathways to ensure they sum to 100
    const totalPathways = Object.values(randomPathways).reduce((sum, val) => sum + val, 0);
    Object.keys(randomPathways).forEach(key => {
        randomPathways[key] = Math.round((randomPathways[key] / totalPathways) * 100);
    });

    // Randomly select prey from existing organisms
    const randomPrey = organisms.filter(() => Math.random() < 0.3).map(org => org.name);

    // Generate a random energy value
    const randomEnergyValue = Math.floor(Math.random() * 500) + 10;

    // Generate a random initial population
    const randomInitialPopulation = Math.floor(Math.random() * (MAX_POPULATION / 10)) + MIN_POPULATION;

    // Create the new organism object
    const newOrganism = {
        name: randomName,
        type: randomType,
        region: randomRegion,
        prey: randomPrey,
        energyValue: randomEnergyValue,
        pathways: randomPathways,
        initialPopulation: randomInitialPopulation,
    };

    return newOrganism;
};

const calculateReproductionRate = (energy, trophicLevel, temperature, type) => {
    const baseRate = energy;
    const rates = {
        'Producer': 1.2,
        'Consumer': 1.0,
        'Apex Predator': 0.8,
        'Decomposer': 1.5
    };

    const temperatureEffect = calculateTemperatureEffect(temperature, organismTypes[type].temperatureRange);
    const energyFactor = Math.min(energy / 100, 1);

    return Math.min(baseRate * (rates[trophicLevel] || 1.0) * temperatureEffect * energyFactor, 0.5);
};

const calculateTemperatureEffect = (temperature, [minTemp, maxTemp]) => {
    if (temperature < minTemp || temperature > maxTemp) {
        return 0;
    }
    const optimumTemp = (minTemp + maxTemp) / 2;
    const tempDifference = Math.abs(temperature - optimumTemp);
    const tempRange = maxTemp - minTemp;
    return 1 - (tempDifference / tempRange) ** 2;
};

const calculateMortalityRate = (energy, trophicLevel, temperature, type) => {
    const baseRate = Math.max(0, 0.1 - (energy / 2000));
    const rates = {
        'Producer': 1.0,
        'Consumer': 1.1,
        'Apex Predator': 1.2,
        'Decomposer': 0.9
    };

    const temperatureEffect = 1 - calculateTemperatureEffect(temperature, organismTypes[type].temperatureRange);
    const energyFactor = Math.max(1 - (energy / 1000), 0.1);

    return Math.min(baseRate * (rates[trophicLevel] || 1.0) * energyFactor + temperatureEffect * 0.1, 0.5);
};

export const simulateGeneration = (organisms, populations, planetaryConditions) => {
    const newPop = { ...populations };
    const updatedOrganisms = organisms.map(org => ({ ...org, pathways: mutatePathways(org.pathways) }));

    updatedOrganisms.forEach(org => {
        const energy = calculateOrganismEnergy(org, planetaryConditions);
        const trophicLevel = organismTypes[org.type].trophicLevel;

        const reproductionRate = calculateReproductionRate(energy, trophicLevel, planetaryConditions.temperature, org.type);
        const mortalityRate = calculateMortalityRate(energy, trophicLevel, planetaryConditions.temperature, org.type);

        let newPopulation = newPop[org.name];
        newPopulation *= (1 + reproductionRate - 0.01*mortalityRate);

        if (trophicLevel === 'Consumer' || trophicLevel === 'Apex Predator') {
            const preyPopulation = org.prey.reduce((sum, prey) => sum + (newPop[prey] || 0), 0);
            const preyEnergyAvailable = preyPopulation * (energy / 20) * ENERGY_TRANSFER_EFFICIENCY;
            newPopulation = Math.min(newPopulation, preyEnergyAvailable / energy);
        }

        newPop[org.name] = Math.max(MIN_POPULATION, Math.min(Math.round(newPopulation), MAX_POPULATION));
    });

    return { newPopulations: newPop, updatedOrganisms };
};

export const updatePlanetaryConditions = (organisms, populations, currentConditions) => {
    const newConditions = { ...currentConditions };
    const totalPopulation = Object.values(populations).reduce((sum, pop) => sum + pop, 0) || 1;

    organisms.forEach(organism => {
        const organismEnergy = calculateOrganismEnergy(organism, currentConditions);
        const populationFactor = populations[organism.name] / totalPopulation;

        Object.entries(organism.pathways).forEach(([pathway, percentage]) => {
            const impact = chemosynthesisPathways[pathway].environmentalImpact;
            const energyImpact = (organismEnergy * percentage / 100) * populationFactor * 0.01;

            Object.entries(impact).forEach(([condition, factor]) => {
                if (condition === 'minerals') {
                    Object.entries(factor).forEach(([mineral, mineralFactor]) => {
                        newConditions.minerals[mineral] = Math.max(0, Math.min(100, newConditions.minerals[mineral] + energyImpact * mineralFactor));
                    });
                } else {
                    newConditions[condition] = Math.max(0, Math.min(100, newConditions[condition] + energyImpact * factor));
                }
            });
        });
    });

    newConditions.temperature += (newConditions.pressure - currentConditions.pressure) * 0.1;
    newConditions.dissolved_oxygen -= (newConditions.temperature - currentConditions.temperature) * 0.05;

    return newConditions;
};

export const calculateEcosystemEnergy = (organisms, populations, planetaryConditions) => {
    return organisms.reduce((totalEnergy, organism) => {
        const organismEnergy = calculateOrganismEnergy(organism, planetaryConditions);
        const population = populations[organism.name] || 0;
        return totalEnergy + organismEnergy * population;
    }, 0);
};
export { createRandomOrganism };
