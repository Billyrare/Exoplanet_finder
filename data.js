import { EARTH_PARAMS, WEIGHTS } from './constants.js';

// Веса для расчета ESI
const ESI_WEIGHTS = {
    radius: 0.57,
    density: 0.70,
    temperature: 0.43
};

// Тестовый набор данных экзопланет
const exoplanetsDataSet = [
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
    }
]; 