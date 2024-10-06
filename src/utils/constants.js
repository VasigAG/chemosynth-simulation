// src/utils/constants.js

export const MAX_POPULATION = 1000;
export const MIN_POPULATION = 0; // Increased to prevent populations from going extinct too easily

export const regions = [
    { 
        name: 'Abyssal Plains', 
        description: 'Vast underwater deserts with bioluminescent creatures',
        baseTemperature: 2, // °C
        basePressure: 400, // atm
        baseLight: 0, // lumens/m²
        basepH: 7.5,
    },
    { 
        name: 'Volcanic Oases', 
        description: 'Hotspots of life around underwater volcanoes and vents',
        baseTemperature: 350, // °C
        basePressure: 250, // atm
        baseLight: 0, // lumens/m²
        basepH: 2.8,
    },
    { 
        name: 'Twilight Zone', 
        description: 'Mysterious realm where light fades into darkness',
        baseTemperature: 10, // °C
        basePressure: 100, // atm
        baseLight: 0.1, // lumens/m²
        basepH: 7.8,
    },
];

export const chemosynthesisPathways = {
    'Hydrogenic': { 
        description: 'Uses hydrogen as an electron donor', 
        color: '#FF6B6B',
        reaction: '4H2 + CO2 → CH4 + 2H2O',
        environmentalImpact: {
            temperature: 0.01,
            pressure: 0.005,
            pH: -0.002,
            minerals: { sulfur: 0.01, iron: -0.005 },
        },
    },
    'Methanogenic': { 
        description: 'Utilizes methane in low-oxygen environments', 
        color: '#45B7D1',
        reaction: 'CH4 + 2O2 → CO2 + 2H2O',
        environmentalImpact: {
            temperature: -0.005,
            pressure: -0.002,
            pH: 0.005,
            minerals: { carbonates: 0.01, iron: 0.01 },
        },
    },
    'Dark Oxygen': { 
        description: 'Oxidizes sulfur compounds for energy', 
        color: '#4ECDC4',
        reaction: 'H2S + 2O2 → H2SO4',
        environmentalImpact: {
            temperature: 0.005,
            pressure: 0.01,
            pH: -0.02,
            minerals: { sulfur: -0.01, manganese: 0.005 },
        },
    },
};

export const organismTypes = {
    'HydroThermus': { kingdom: 'Archaea', trophicLevel: 'Producer', temperatureRange: [60, 110] },
    'MethanoBubbler': { kingdom: 'Bacteria', trophicLevel: 'Producer', temperatureRange: [0, 70] },
    'OxyNox': { kingdom: 'Bacteria', trophicLevel: 'Consumer', temperatureRange: [2, 40] },
    'AbyssalSiphon': { kingdom: 'Animalia', trophicLevel: 'Consumer', temperatureRange: [0, 20] },
    'TwilightHunter': { kingdom: 'Animalia', trophicLevel: 'Apex Predator', temperatureRange: [0, 20] },
    'VentCrawler': { kingdom: 'Animalia', trophicLevel: 'Consumer', temperatureRange: [2, 35] },
    'ChemoSludge': { kingdom: 'Bacteria', trophicLevel: 'Decomposer', temperatureRange: [0, 120] },
};

export const initialOrganisms = [
    { 
        name: 'HydroThermus', 
        type: 'HydroThermus', 
        region: 'Volcanic Oases', 
        prey: [], 
        energyValue: 10, 
        pathways: { 'Hydrogenic': 80, 'Methanogenic': 20, 'Dark Oxygen': 0 } 
    },
    { 
        name: 'MethanoBubbler', 
        type: 'MethanoBubbler', 
        region: 'Twilight Zone', 
        prey: [], 
        energyValue: 15, 
        pathways: { 'Hydrogenic': 10, 'Methanogenic': 90, 'Dark Oxygen': 0 } 
    },
    { 
        name: 'OxyNox', 
        type: 'OxyNox', 
        region: 'Abyssal Plains', 
        prey: ['HydroThermus'], 
        energyValue: 25, 
        pathways: { 'Hydrogenic': 20, 'Methanogenic': 20, 'Dark Oxygen': 60 } 
    },
    { 
        name: 'AbyssalSiphon', 
        type: 'AbyssalSiphon', 
        region: 'Abyssal Plains', 
        prey: ['MethanoBubbler'], 
        energyValue: 30, 
        pathways: { 'Hydrogenic': 40, 'Methanogenic': 30, 'Dark Oxygen': 30 } 
    },
    { 
        name: 'TwilightHunter', 
        type: 'TwilightHunter', 
        region: 'Twilight Zone', 
        prey: ['OxyNox', 'AbyssalSiphon'], 
        energyValue: 100, 
        pathways: { 'Hydrogenic': 0, 'Methanogenic': 30, 'Dark Oxygen': 70 } 
    },
    { 
        name: 'VentCrawler', 
        type: 'VentCrawler', 
        region: 'Volcanic Oases', 
        prey: ['HydroThermus', 'MethanoBubbler'], 
        energyValue: 500, 
        pathways: { 'Hydrogenic': 20, 'Methanogenic': 50, 'Dark Oxygen': 30 } 
    },
    { 
        name: 'ChemoSludge', 
        type: 'ChemoSludge', 
        region: 'Abyssal Plains', 
        prey: ['HydroThermus', 'OxyNox'], 
        energyValue: 5, 
        pathways: { 'Hydrogenic': 30, 'Methanogenic': 20, 'Dark Oxygen': 50 } 
    },
];

export const initialPopulations = initialOrganisms.reduce((acc, org) => {
    let basePopulation;

    switch (organismTypes[org.type].trophicLevel) {
        case 'Producer':
            basePopulation = Math.floor(Math.random() * (MAX_POPULATION / 2)) + (MAX_POPULATION / 2); // Higher numbers for producers
            break;
        case 'Consumer':
            basePopulation = Math.floor(Math.random() * (MAX_POPULATION / 4)) + MIN_POPULATION; // Moderate numbers for regular consumers
            break;
        case 'Apex Predator':
            basePopulation = Math.floor(Math.random() * (MAX_POPULATION / 10)) + MIN_POPULATION; // Lower numbers for apex predators
            break;
        case 'Decomposer':
            basePopulation = Math.floor(Math.random() * (MAX_POPULATION / 5)) + MIN_POPULATION; // Moderate numbers for decomposers
            break;
        default:
            basePopulation = MIN_POPULATION; // Fallback
    }

    acc[org.name] = basePopulation;
    return acc;
}, {});

export const initialPlanetaryConditions = {
    temperature: 50, // °C
    pressure: 250, // atm
    pH: 7,
    dissolved_oxygen: 2, // mg/L
    minerals: {
        sulfur: 50, // ppm
        iron: 50, // ppm
        carbonates: 50, // ppm
        manganese: 50, // ppm
    },
};

export const UNIVERSAL_GAS_CONSTANT = 8.314; // J/(mol·K)
