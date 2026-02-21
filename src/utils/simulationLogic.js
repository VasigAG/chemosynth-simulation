// src/utils/simulationLogic.js

import {
    MAX_POPULATION, MIN_POPULATION, chemosynthesisPathways, organismTypes,
    regions
} from './constants';
import { calculateOrganismEnergy } from './energyPathwayLogic';

const MUTATION_RATE = 0.01;
const ENERGY_TRANSFER_EFFICIENCY = 0.1;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const mutatePathways = (pathways) => {
    const newPathways = { ...pathways };
    Object.keys(newPathways).forEach(pathway => {
        if (Math.random() < MUTATION_RATE) {
            newPathways[pathway] += (Math.random() * 20 - 10);
        }
    });

    const total = Object.values(newPathways).reduce((sum, val) => sum + Math.max(0, val), 0);

    if (total === 0) {
        const equalShare = 100 / Object.keys(newPathways).length;
        Object.keys(newPathways).forEach(pathway => {
            newPathways[pathway] = equalShare;
        });
        return newPathways;
    }

    Object.keys(newPathways).forEach(pathway => {
        newPathways[pathway] = Math.max(0, (newPathways[pathway] / total) * 100);
    });

    return newPathways;
};

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const getRegionByName = (name) => regions.find(region => region.name === name) || regions[0];

const getHabitabilityFactor = (organism, planetaryConditions) => {
    const region = getRegionByName(organism.region);
    const speciesRange = organismTypes[organism.type].temperatureRange;
    const localTemperature = (planetaryConditions.temperature + region.baseTemperature) / 2;
    const localPressure = (planetaryConditions.pressure + region.basePressure) / 2;

    const temperatureFitness = calculateTemperatureEffect(localTemperature, speciesRange);
    const pressureFitness = 1 - clamp(Math.abs(localPressure - region.basePressure) / 400, 0, 1);
    const pHFitness = 1 - clamp(Math.abs(planetaryConditions.pH - region.basepH) / 7, 0, 1);

    return clamp((temperatureFitness * 0.5) + (pressureFitness * 0.3) + (pHFitness * 0.2), 0, 1);
};

const getResourcePressure = (planetaryConditions) => {
    const mineralValues = Object.values(planetaryConditions.minerals || {});
    const mineralAvailability = mineralValues.reduce((sum, value) => sum + value, 0) / (mineralValues.length * 100 || 1);
    const oxygenAvailability = clamp((planetaryConditions.dissolved_oxygen || 0) / 8, 0, 1);
    return clamp((mineralAvailability * 0.8) + (oxygenAvailability * 0.2), 0.05, 1);
};

const createRandomOrganism = (organisms) => {
    const randomType = getRandomElement(Object.keys(organismTypes));
    const randomRegion = getRandomElement(regions).name;
    const randomName = `Evolved${Math.floor(Math.random() * 1000)}`;

    const randomPathways = Object.keys(chemosynthesisPathways).reduce((acc, pathway) => {
        acc[pathway] = Math.floor(Math.random() * 100);
        return acc;
    }, {});

    const totalPathways = Object.values(randomPathways).reduce((sum, val) => sum + val, 0);
    Object.keys(randomPathways).forEach(key => {
        randomPathways[key] = Math.round((randomPathways[key] / totalPathways) * 100);
    });

    const randomPrey = organisms.filter(() => Math.random() < 0.3).map(org => org.name);
    const randomEnergyValue = Math.floor(Math.random() * 500) + 10;
    const randomInitialPopulation = Math.floor(Math.random() * (MAX_POPULATION / 10)) + MIN_POPULATION;

    return {
        name: randomName,
        type: randomType,
        region: randomRegion,
        prey: randomPrey,
        energyValue: randomEnergyValue,
        pathways: randomPathways,
        initialPopulation: randomInitialPopulation,
    };
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

export const simulateGeneration = (organisms, populations, planetaryConditions) => {
    const newPop = { ...populations };
    const updatedOrganisms = organisms.map(org => ({ ...org, pathways: mutatePathways(org.pathways) }));
    const resourcePressure = getResourcePressure(planetaryConditions);

    updatedOrganisms.forEach(org => {
        const trophicLevel = organismTypes[org.type].trophicLevel;
        const energy = Math.max(0.01, calculateOrganismEnergy(org, planetaryConditions));
        const habitability = getHabitabilityFactor(org, planetaryConditions);
        const currentPopulation = newPop[org.name] || MIN_POPULATION;

        const carryingCapacity = MAX_POPULATION * (0.35 + (habitability * 0.45) + (resourcePressure * 0.2));
        const growthPotential = (energy / 120) * habitability * resourcePressure;
        const logisticLimiter = clamp(1 - (currentPopulation / Math.max(1, carryingCapacity)), -1, 1);

        let populationDelta = currentPopulation * growthPotential * logisticLimiter;

        if (trophicLevel === 'Consumer' || trophicLevel === 'Apex Predator') {
            const preyPopulation = org.prey.reduce((sum, prey) => sum + (newPop[prey] || 0), 0);
            const preySupport = preyPopulation * ENERGY_TRANSFER_EFFICIENCY;
            const predationStress = clamp(currentPopulation / Math.max(1, preyPopulation + 1), 0, 2);
            populationDelta += (preySupport - currentPopulation) * 0.08;
            populationDelta -= currentPopulation * predationStress * 0.04;
        }

        if (trophicLevel === 'Decomposer') {
            const biomass = Object.values(newPop).reduce((sum, pop) => sum + pop, 0);
            populationDelta += (biomass / MAX_POPULATION) * 5;
        }

        const environmentalStress = (1 - habitability) * 0.15;
        const stressedPopulation = currentPopulation + populationDelta - (currentPopulation * environmentalStress);
        newPop[org.name] = clamp(Math.round(stressedPopulation), MIN_POPULATION, MAX_POPULATION);
    });

    return { newPopulations: newPop, updatedOrganisms };
};

export const updatePlanetaryConditions = (organisms, populations, currentConditions) => {
    const newConditions = {
        ...currentConditions,
        minerals: { ...currentConditions.minerals },
    };

    const totalPopulation = Object.values(populations).reduce((sum, pop) => sum + pop, 0) || 1;

    organisms.forEach(organism => {
        const organismEnergy = Math.max(0, calculateOrganismEnergy(organism, currentConditions));
        const populationFactor = (populations[organism.name] || 0) / totalPopulation;

        Object.entries(organism.pathways).forEach(([pathway, percentage]) => {
            const impact = chemosynthesisPathways[pathway].environmentalImpact;
            const energyImpact = (organismEnergy * percentage / 100) * populationFactor * 0.002;

            Object.entries(impact).forEach(([condition, factor]) => {
                if (condition === 'minerals') {
                    Object.entries(factor).forEach(([mineral, mineralFactor]) => {
                        newConditions.minerals[mineral] = clamp(
                            newConditions.minerals[mineral] + (energyImpact * mineralFactor),
                            0,
                            100
                        );
                    });
                } else {
                    newConditions[condition] = clamp(newConditions[condition] + (energyImpact * factor), 0, 100);
                }
            });
        });
    });

    const tectonicPulse = Math.sin(Date.now() / 8000) * 0.02;
    newConditions.temperature = clamp((newConditions.temperature * 0.93) + (currentConditions.temperature * 0.07) + tectonicPulse, 0, 120);
    newConditions.pressure = clamp((newConditions.pressure * 0.95) + (currentConditions.pressure * 0.05), 50, 500);
    newConditions.pH = clamp((newConditions.pH * 0.97) + (currentConditions.pH * 0.03), 0, 14);
    newConditions.dissolved_oxygen = clamp(
        newConditions.dissolved_oxygen - ((newConditions.temperature - currentConditions.temperature) * 0.01),
        0,
        12
    );

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
