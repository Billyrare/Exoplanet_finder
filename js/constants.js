// Параметры Земли для сравнения
export const EARTH_PARAMS = {
    radius: 1.0,      // Радиус Земли (1 R⊕)
    mass: 1.0,        // Масса Земли (1 M⊕)
    density: 5.51,    // Средняя плотность Земли (г/см³)
    temperature: 288, // Средняя температура поверхности (K)
    gravity: 9.81,    // Ускорение свободного падения (м/с²)
    escape_velocity: 11.2 // Вторая космическая скорость (км/с)
};

// Веса для расчета индекса подобия Земле (ESI)
export const ESI_WEIGHTS = {
    radius: 0.57,      // Вес радиуса
    density: 0.70,     // Вес плотности
    temperature: 0.43  // Вес температуры
};

// Параметры для определения потенциальной обитаемости
export const HABITABILITY_PARAMS = {
    temperature: {
        min: 200,  // Минимальная температура для жизни (K)
        max: 320,  // Максимальная температура для жизни (K)
        ideal: 288 // Идеальная температура (как на Земле)
    },
    radius: {
        min: 0.8,  // Минимальный радиус (R⊕)
        max: 1.6,  // Максимальный радиус (R⊕)
        ideal: 1.0 // Идеальный радиус (как у Земли)
    },
    density: {
        min: 0.7,  // Минимальная плотность (г/см³)
        max: 1.5,  // Максимальная плотность (г/см³)
        ideal: 5.51 // Идеальная плотность (как у Земли)
    }
};

// Типы планет
export const PLANET_TYPES = {
    TERRESTRIAL: 'Землеподобная',
    SUPER_EARTH: 'Суперземля',
    MINI_NEPTUNE: 'Мини-Нептун',
    NEPTUNE: 'Нептун',
    GAS_GIANT: 'Газовый гигант'
};

// Критерии для определения типа планеты по радиусу
export const PLANET_TYPE_RANGES = {
    TERRESTRIAL: { min: 0, max: 1.5 },
    SUPER_EARTH: { min: 1.5, max: 2.5 },
    MINI_NEPTUNE: { min: 2.5, max: 4 },
    NEPTUNE: { min: 4, max: 10 },
    GAS_GIANT: { min: 10, max: Infinity }
}; 