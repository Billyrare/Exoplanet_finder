import { EARTH_PARAMS, WEIGHTS } from './constants.js';

// Веса для расчета ESI
export const ESI_WEIGHTS = {
    radius: 0.57,
    density: 0.70,
    temperature: 0.43
};

// Расширенный набор данных экзопланет
export const exoplanetsDataSet = [
    {
        name: "Kepler-442b",
        radius: 1.34,
        temperature: 233,
        density: 1.3,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.84
    },
    {
        name: "Proxima Centauri b",
        radius: 1.08,
        temperature: 234,
        density: 1.1,
        type: "Землеподобная",
        potentially_habitable: true,
        esi: 0.87
    },
    {
        name: "TRAPPIST-1e",
        radius: 0.92,
        temperature: 251,
        density: 1.024,
        type: "Землеподобная",
        potentially_habitable: true,
        esi: 0.85
    },
    {
        name: "K2-18b",
        radius: 2.6,
        temperature: 265,
        density: 0.7,
        type: "Мини-Нептун",
        potentially_habitable: false,
        esi: 0.71
    },
    {
        name: "HD 40307g",
        radius: 1.71,
        temperature: 277,
        density: 1.2,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.79
    },
    {
        name: "Kepler-186f",
        radius: 1.17,
        temperature: 188,
        density: 1.4,
        type: "Землеподобная",
        potentially_habitable: true,
        esi: 0.64
    },
    {
        name: "TOI-700d",
        radius: 1.19,
        temperature: 268,
        density: 1.1,
        type: "Землеподобная",
        potentially_habitable: true,
        esi: 0.92
    },
    {
        name: "Kepler-62f",
        radius: 1.41,
        temperature: 208,
        density: 1.3,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.67
    },
    {
        name: "Kepler-22b",
        radius: 2.38,
        temperature: 262,
        density: 0.8,
        type: "Океаническая",
        potentially_habitable: false,
        esi: 0.71
    },
    {
        name: "Teegarden's Star b",
        radius: 1.02,
        temperature: 264,
        density: 1.1,
        type: "Землеподобная",
        potentially_habitable: true,
        esi: 0.94
    },
    {
        name: "Kepler-452b",
        radius: 1.63,
        temperature: 265,
        density: 1.2,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.83
    },
    {
        name: "GJ 357d",
        radius: 1.75,
        temperature: 240,
        density: 1.3,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.75
    },
    {
        name: "WASP-12b",
        radius: 15.2,
        temperature: 2525,
        density: 0.19,
        type: "Горячий Юпитер",
        potentially_habitable: false,
        esi: 0.12
    },
    {
        name: "HD 209458b",
        radius: 13.8,
        temperature: 1450,
        density: 0.24,
        type: "Горячий Юпитер",
        potentially_habitable: false,
        esi: 0.15
    },
    {
        name: "55 Cancri e",
        radius: 1.91,
        temperature: 1618,
        density: 1.16,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.32
    },
    {
        name: "TRAPPIST-1b",
        radius: 1.086,
        temperature: 400,
        density: 0.85,
        type: "Землеподобная",
        potentially_habitable: false,
        esi: 0.55
    },
    {
        name: "TRAPPIST-1c",
        radius: 1.056,
        temperature: 342,
        density: 1.15,
        type: "Землеподобная",
        potentially_habitable: false,
        esi: 0.62
    },
    {
        name: "TRAPPIST-1d",
        radius: 0.772,
        temperature: 288,
        density: 1.17,
        type: "Землеподобная",
        potentially_habitable: true,
        esi: 0.89
    },
    {
        name: "TRAPPIST-1f",
        radius: 1.045,
        temperature: 219,
        density: 0.816,
        type: "Землеподобная",
        potentially_habitable: true,
        esi: 0.82
    },
    {
        name: "TRAPPIST-1g",
        radius: 1.129,
        temperature: 199,
        density: 0.759,
        type: "Землеподобная",
        potentially_habitable: true,
        esi: 0.78
    },
    {
        name: "TRAPPIST-1h",
        radius: 0.775,
        temperature: 167,
        density: 0.87,
        type: "Землеподобная",
        potentially_habitable: false,
        esi: 0.56
    },
    {
        name: "LHS 1140b",
        radius: 1.7,
        temperature: 235,
        density: 1.02,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.80
    },
    {
        name: "Kepler-442c",
        radius: 2.36,
        temperature: 276,
        density: 0.89,
        type: "Мини-Нептун",
        potentially_habitable: false,
        esi: 0.67
    },
    {
        name: "Kepler-62e",
        radius: 1.61,
        temperature: 270,
        density: 1.12,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.83
    },
    {
        name: "Kepler-186b",
        radius: 1.19,
        temperature: 292,
        density: 1.26,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.85
    },
    {
        name: "Kepler-283c",
        radius: 1.82,
        temperature: 248,
        density: 0.92,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.76
    },
    {
        name: "Kepler-296e",
        radius: 1.53,
        temperature: 267,
        density: 1.08,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.85
    },
    {
        name: "Kepler-296f",
        radius: 1.80,
        temperature: 242,
        density: 0.96,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.77
    },
    {
        name: "Kepler-438b",
        radius: 1.12,
        temperature: 276,
        density: 1.14,
        type: "Землеподобная",
        potentially_habitable: true,
        esi: 0.88
    },
    {
        name: "Kepler-440b",
        radius: 1.86,
        temperature: 233,
        density: 0.98,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.70
    },
    {
        name: "Wolf 1061c",
        radius: 1.6,
        temperature: 223,
        density: 1.15,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.75
    },
    {
        name: "Kepler-442c",
        radius: 2.36,
        temperature: 276,
        density: 0.89,
        type: "Мини-Нептун",
        potentially_habitable: false,
        esi: 0.67
    },
    {
        name: "Kepler-62e",
        radius: 1.61,
        temperature: 270,
        density: 1.12,
        type: "Суперземля",
        potentially_habitable: true,
        esi: 0.83
    },
    {
        name: "GJ 1214b",
        radius: 2.68,
        temperature: 547,
        density: 0.49,
        type: "Мини-Нептун",
        potentially_habitable: false,
        esi: 0.41
    },
    {
        name: "HD 97658b",
        radius: 2.34,
        temperature: 753,
        density: 0.58,
        type: "Мини-Нептун",
        potentially_habitable: false,
        esi: 0.33
    },
    {
        name: "CoRoT-7b",
        radius: 1.58,
        temperature: 1756,
        density: 1.07,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.27
    },
    {
        name: "Kepler-10b",
        radius: 1.47,
        temperature: 2169,
        density: 1.21,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.24
    },
    {
        name: "Kepler-78b",
        radius: 1.20,
        temperature: 2300,
        density: 1.32,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.22
    },
    {
        name: "WASP-47e",
        radius: 1.82,
        temperature: 2200,
        density: 1.11,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.23
    },
    {
        name: "HD 219134b",
        radius: 1.60,
        temperature: 1015,
        density: 1.28,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.37
    },
    {
        name: "Kepler-93b",
        radius: 1.50,
        temperature: 1270,
        density: 1.45,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.34
    },
    {
        name: "GJ 1132b",
        radius: 1.16,
        temperature: 579,
        density: 1.13,
        type: "Землеподобная",
        potentially_habitable: false,
        esi: 0.46
    },
    {
        name: "K2-3b",
        radius: 2.10,
        temperature: 463,
        density: 0.82,
        type: "Мини-Нептун",
        potentially_habitable: false,
        esi: 0.49
    },
    {
        name: "HD 3167b",
        radius: 1.70,
        temperature: 1759,
        density: 1.24,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.26
    },
    {
        name: "GJ 9827b",
        radius: 1.64,
        temperature: 1960,
        density: 1.18,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.25
    },
    {
        name: "Pi Mensae c",
        radius: 2.04,
        temperature: 1170,
        density: 0.91,
        type: "Мини-Нептун",
        potentially_habitable: false,
        esi: 0.35
    },
    {
        name: "HD 21749b",
        radius: 2.61,
        temperature: 788,
        density: 0.67,
        type: "Мини-Нептун",
        potentially_habitable: false,
        esi: 0.38
    },
    {
        name: "LTT 1445Ab",
        radius: 1.38,
        temperature: 680,
        density: 1.31,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.43
    },
    {
        name: "L 98-59c",
        radius: 1.35,
        temperature: 515,
        density: 1.24,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.48
    },
    {
        name: "L 98-59d",
        radius: 1.57,
        temperature: 416,
        density: 1.09,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.52
    },
    {
        name: "GJ 357c",
        radius: 3.40,
        temperature: 401,
        density: 0.55,
        type: "Мини-Нептун",
        potentially_habitable: false,
        esi: 0.47
    },
    {
        name: "Kepler-20b",
        radius: 1.91,
        temperature: 1212,
        density: 1.12,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.33
    },
    {
        name: "Kepler-48b",
        radius: 1.88,
        temperature: 983,
        density: 1.18,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.36
    },
    {
        name: "Kepler-406b",
        radius: 1.43,
        temperature: 2520,
        density: 1.35,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.21
    },
    {
        name: "HD 15337b",
        radius: 1.64,
        temperature: 1640,
        density: 1.22,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.28
    },
    {
        name: "HD 213885b",
        radius: 1.74,
        temperature: 2070,
        density: 1.16,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.24
    },
    {
        name: "TOI-402b",
        radius: 1.70,
        temperature: 1570,
        density: 1.20,
        type: "Суперземля",
        potentially_habitable: false,
        esi: 0.29
    }
];

// Функция для расчета ESI
export function calculateESI(planet) {
    const radiusESI = Math.exp(-Math.abs(Math.log(planet.radius / EARTH_PARAMS.radius)) / ESI_WEIGHTS.radius);
    const densityESI = Math.exp(-Math.abs(Math.log(planet.density / EARTH_PARAMS.density)) / ESI_WEIGHTS.density);
    const tempESI = Math.exp(-Math.abs(Math.log(planet.temperature / EARTH_PARAMS.temperature)) / ESI_WEIGHTS.temperature);
    
    return Math.pow(radiusESI * densityESI * tempESI, 1/3);
}

// Функция для определения потенциальной обитаемости
export function isPotentiallyHabitable(planet) {
    const tempRange = { min: 200, max: 320 }; // K
    const radiusRange = { min: 0.8, max: 1.6 }; // Earth radii
    const densityRange = { min: 0.7, max: 1.5 }; // Earth density
    
    return planet.temperature >= tempRange.min && 
           planet.temperature <= tempRange.max &&
           planet.radius >= radiusRange.min && 
           planet.radius <= radiusRange.max &&
           planet.density >= densityRange.min && 
           planet.density <= densityRange.max;
} 