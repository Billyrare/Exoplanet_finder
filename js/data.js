import { EARTH_PARAMS, PLANET_TYPES, PLANET_TYPE_RANGES } from './constants.js';

// Функция для определения типа планеты по радиусу
function determinePlanetType(radius) {
    if (radius <= PLANET_TYPE_RANGES.TERRESTRIAL.max) return PLANET_TYPES.TERRESTRIAL;
    if (radius <= PLANET_TYPE_RANGES.SUPER_EARTH.max) return PLANET_TYPES.SUPER_EARTH;
    if (radius <= PLANET_TYPE_RANGES.MINI_NEPTUNE.max) return PLANET_TYPES.MINI_NEPTUNE;
    if (radius <= PLANET_TYPE_RANGES.NEPTUNE.max) return PLANET_TYPES.NEPTUNE;
    return PLANET_TYPES.GAS_GIANT;
}

// Функция для расчета плотности на основе типа планеты
function estimateDensity(radius, type) {
    switch (type) {
        case PLANET_TYPES.TERRESTRIAL:
            return 5.0;
        case PLANET_TYPES.SUPER_EARTH:
            return 3.5;
        case PLANET_TYPES.MINI_NEPTUNE:
            return 2.0;
        case PLANET_TYPES.NEPTUNE:
            return 1.5;
        case PLANET_TYPES.GAS_GIANT:
            return 1.0;
        default:
            return 1.0;
    }
}

// Базовый набор экзопланет
export const exoplanetsDataSet = [
    {
        name: "Kepler-442b",
        radius: 1.34,
        temperature: 233,
        density: 1.3,
        type: PLANET_TYPES.SUPER_EARTH,
        potentially_habitable: true,
        esi: 0.84,
        star_type: "K-type"
    },
    {
        name: "Proxima Centauri b",
        radius: 1.08,
        temperature: 234,
        density: 1.1,
        type: PLANET_TYPES.TERRESTRIAL,
        potentially_habitable: true,
        esi: 0.87,
        star_type: "M-type"
    },
    {
        name: "TRAPPIST-1e",
        radius: 0.92,
        temperature: 251,
        density: 1.024,
        type: PLANET_TYPES.TERRESTRIAL,
        potentially_habitable: true,
        esi: 0.85,
        star_type: "M-type"
    },
    {
        name: "K2-18b",
        radius: 2.6,
        temperature: 265,
        density: 0.7,
        type: PLANET_TYPES.MINI_NEPTUNE,
        potentially_habitable: false,
        esi: 0.71,
        star_type: "M-type"
    },
    {
        name: "HD 40307g",
        radius: 1.71,
        temperature: 277,
        density: 1.2,
        type: PLANET_TYPES.SUPER_EARTH,
        potentially_habitable: true,
        esi: 0.79,
        star_type: "K-type"
    }
];

// Функция для получения расширенного набора данных
export async function getExtendedDataset() {
    try {
        const response = await fetch('/api/exoplanets');
        if (!response.ok) {
            throw new Error('Failed to fetch extended dataset');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.warn('Failed to fetch extended dataset:', error);
        return exoplanetsDataSet;
    }
}

// Функция для фильтрации планет
export function filterPlanets(planets, filters) {
    return planets.filter(planet => {
        // Фильтр по имени
        if (filters.name && !planet.name.toLowerCase().includes(filters.name.toLowerCase())) {
            return false;
        }

        // Фильтр по типу
        if (filters.type && filters.type !== 'all' && planet.type !== filters.type) {
            return false;
        }

        // Фильтр по обитаемости
        if (filters.habitableOnly && !planet.potentially_habitable) {
            return false;
        }

        // Фильтр по ESI
        if (filters.minESI && planet.esi < filters.minESI) {
            return false;
        }

        // Фильтр по радиусу
        if (filters.maxRadius && planet.radius > filters.maxRadius) {
            return false;
        }

        // Фильтр по температуре
        if (filters.maxTemperature && planet.temperature > filters.maxTemperature) {
            return false;
        }

        return true;
    });
}

// Функция для сортировки планет
export function sortPlanets(planets, criterion) {
    const sortedPlanets = [...planets];
    
    switch (criterion) {
        case 'name':
            return sortedPlanets.sort((a, b) => a.name.localeCompare(b.name));
        case 'radius':
            return sortedPlanets.sort((a, b) => a.radius - b.radius);
        case 'temperature':
            return sortedPlanets.sort((a, b) => a.temperature - b.temperature);
        case 'esi':
            return sortedPlanets.sort((a, b) => b.esi - a.esi);
        case 'habitability':
            return sortedPlanets.sort((a, b) => (b.potentially_habitable ? 1 : 0) - (a.potentially_habitable ? 1 : 0));
        default:
            return sortedPlanets;
    }
} 