import { EARTH_PARAMS, WEIGHTS } from './constants.js';

// Веса для расчета ESI
const ESI_WEIGHTS = {
    radius: 0.57,
    density: 0.70,
    temperature: 0.43
};

// Базовый набор экзопланет для сравнения
export const exoplanetsDataSet = [
    {
        name: "Proxima Centauri b",
        radius: 1.08,
        temperature: 234,
        density: 5.9,
        potentially_habitable: true,
        type: "Super Earth",
        esi: 0.87
    },
    {
        name: "TRAPPIST-1 e",
        radius: 0.92,
        temperature: 251,
        density: 5.65,
        potentially_habitable: true,
        type: "Rocky",
        esi: 0.85
    },
    {
        name: "Kepler-442b",
        radius: 1.34,
        temperature: 233,
        density: 5.2,
        potentially_habitable: true,
        type: "Super Earth",
        esi: 0.84
    },
    {
        name: "TOI-700 d",
        radius: 1.19,
        temperature: 268,
        density: 5.1,
        potentially_habitable: true,
        type: "Super Earth",
        esi: 0.82
    },
    {
        name: "Teegarden's Star b",
        radius: 1.05,
        temperature: 264,
        density: 5.32,
        potentially_habitable: true,
        type: "Rocky",
        esi: 0.81
    },
    {
        name: "K2-18b",
        radius: 2.6,
        temperature: 265,
        density: 3.3,
        potentially_habitable: false,
        type: "Mini Neptune",
        esi: 0.71
    },
    {
        name: "Kepler-186f",
        radius: 1.17,
        temperature: 188,
        density: 4.9,
        potentially_habitable: false,
        type: "Super Earth",
        esi: 0.64
    },
    {
        name: "GJ 357 d",
        radius: 1.75,
        temperature: 240,
        density: 3.8,
        potentially_habitable: false,
        type: "Super Earth",
        esi: 0.68
    },
    {
        name: "HD 40307g",
        radius: 1.71,
        temperature: 284,
        density: 3.6,
        potentially_habitable: false,
        type: "Super Earth",
        esi: 0.67
    },
    {
        name: "Kepler-62f",
        radius: 1.41,
        temperature: 208,
        density: 4.5,
        potentially_habitable: false,
        type: "Super Earth",
        esi: 0.67
    }
]; 