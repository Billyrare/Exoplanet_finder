// Константы для расчетов
const EARTH_PARAMS = {
    radius: 1.0,
    temperature: 288,
    density: 5.51
};

// Веса для расчета ESI
const WEIGHTS = {
    radius: 0.57,
    temperature: 0.43
};

// Функция анализа планеты
async function analyzePlanet() {
    // Получение значений из формы
    const name = document.getElementById('planet-name').value || 'Неизвестная планета';
    const radius = parseFloat(document.getElementById('planet-radius').value);
    const temperature = parseFloat(document.getElementById('planet-temp').value);
    const density = parseFloat(document.getElementById('planet-density').value);
    
    // Валидация
    if (isNaN(radius) || isNaN(temperature) || isNaN(density)) {
        alert('Пожалуйста, введите корректные числовые значения для всех параметров');
        return;
    }
    
    // Показываем секцию результатов
    const resultsSection = document.getElementById('analysis-results');
    resultsSection.classList.remove('hidden');
    
    // Создаем объект с параметрами планеты
    const planetData = {
        name: name,
        radius: radius,
        temperature: temperature,
        density: density
    };
    
    // Рассчитываем ESI
    planetData.esi = calculateESI(radius, temperature);
    
    // Рассчитываем состав атмосферы
    planetData.atmosphereComposition = calculateAtmosphere(temperature, radius);
    
    // Рассчитываем пригодность для разных форм жизни
    planetData.lifeSustainability = calculateLifeSustainability(temperature, radius, planetData.esi);
    
    // Рассчитываем вероятность наличия воды
    planetData.waterProbability = calculateWaterProbability(temperature, radius);
    
    // Анализируем факторы обитаемости
    planetData.habitabilityFactors = analyzeHabitabilityFactors(planetData);
    
    // Генерируем рекомендации
    const recommendations = generateRecommendations(planetData);
    
    // Ищем похожие планеты
    const similarPlanets = findSimilarPlanets(planetData);
    
    // Обновляем визуализации
    createAtmosphereChart(planetData.atmosphereComposition);
    createLifeSustainabilityChart(planetData.lifeSustainability);
    createWaterIndicator(planetData.waterProbability);
    createEarthComparisonChart(planetData);
    createESIGauge(planetData);
    createPlanetsDistribution(planetData);
    
    // Обновляем список рекомендаций
    const recommendationsList = document.getElementById('recommendations-list');
    recommendationsList.innerHTML = recommendations
        .map(rec => `<li>${rec}</li>`)
        .join('');
    
    // Обновляем список похожих планет
    const similarPlanetsList = document.getElementById('similar-planets-list');
    similarPlanetsList.innerHTML = similarPlanets
        .map(planet => `
            <div class="similar-planet-card">
                <h4>${planet.name}</h4>
                <div class="similarity">Схожесть: ${planet.similarity}%</div>
                <div class="params">
                    Радиус: ${planet.params.radius} R⊕<br>
                    Температура: ${planet.params.temperature} K<br>
                    Плотность: ${planet.params.density} г/см³
                </div>
                <div class="type">${planet.type}</div>
            </div>
        `)
        .join('');
}

// Расчет вероятности наличия воды
function calculateWaterProbability(temperature, radius) {
    // Оптимальная температура для жидкой воды: 273K - 373K
    let tempScore = 0;
    if (temperature >= 273 && temperature <= 373) {
        tempScore = 1 - Math.abs((temperature - 323) / 50); // 323K (50°C) - середина диапазона
    } else if (temperature < 273) {
        tempScore = Math.max(0, 1 - Math.abs(temperature - 273) / 50);
    } else {
        tempScore = Math.max(0, 1 - Math.abs(temperature - 373) / 50);
    }
    
    // Оптимальный радиус для удержания атмосферы: 0.5 - 2.0 радиуса Земли
    let radiusScore = 0;
    if (radius >= 0.5 && radius <= 2.0) {
        radiusScore = 1 - Math.abs((radius - 1.25) / 0.75); // 1.25 - середина оптимального диапазона
    } else {
        radiusScore = Math.max(0, 1 - Math.abs(radius - (radius < 0.5 ? 0.5 : 2.0)) / 0.5);
    }
    
    // Вероятность наличия воды как произведение факторов
    return Math.round(tempScore * radiusScore * 100);
}

// Расчет индекса подобия Земле (ESI)
function calculateESI(radius, temperature) {
    let esi = 1.0;
    
    // Расчет для радиуса
    const radiusDiff = Math.abs(radius - EARTH_PARAMS.radius);
    const radiusSum = radius + EARTH_PARAMS.radius;
    esi *= Math.pow(1 - radiusDiff/radiusSum, WEIGHTS.radius);
    
    // Расчет для температуры
    const tempDiff = Math.abs(temperature - EARTH_PARAMS.temperature);
    const tempSum = temperature + EARTH_PARAMS.temperature;
    esi *= Math.pow(1 - tempDiff/tempSum, WEIGHTS.temperature);
    
    return esi;
}

// Классификация планеты по ESI
function getClassification(esi) {
    if (esi >= 0.8) {
        return {
            level: 'high',
            description: 'Планета потенциально обитаема',
            color: '#2ecc71'
        };
    } else if (esi >= 0.5) {
        return {
            level: 'medium',
            description: 'Планета умеренно похожа на Землю',
            color: '#f1c40f'
        };
    } else {
        return {
            level: 'low',
            description: 'Планета, скорее всего, необитаема',
            color: '#e74c3c'
        };
    }
}

// Расчет схожести параметров с Землей
function calculateSimilarityScores(params) {
    const scores = {};
    for (const param in params) {
        if (param in EARTH_PARAMS) {
            const similarity = (1 - Math.abs(params[param] - EARTH_PARAMS[param]) / 
                              (params[param] + EARTH_PARAMS[param]));
            
            const paramNames = {
                'radius': 'Радиус',
                'temperature': 'Температура',
                'density': 'Плотность'
            };
            
            scores[paramNames[param] || param] = Math.round(similarity * 100);
        }
    }
    return scores;
}

// Расчет состава атмосферы на основе температуры и радиуса
function calculateAtmosphere(temperature, radius) {
    // Базовые значения для Земли (288K)
    const baseTemp = 288;
    
    // Корректировка на основе температуры
    const tempFactor = temperature / baseTemp;
    
    // Корректировка на основе радиуса (гравитации)
    const gravityFactor = radius / 1.0; // 1.0 - радиус Земли
    
    // Базовый состав атмосферы (как на Земле)
    let nitrogen = 78 * gravityFactor * (1 / tempFactor); // Азот более стабилен при низких температурах
    let oxygen = 21 * gravityFactor * (1 / Math.pow(tempFactor, 1.5)); // Кислород сильнее зависит от температуры
    let argon = 0.93 * gravityFactor; // Инертный газ, меньше зависит от температуры
    let co2 = 0.04 * Math.pow(tempFactor, 2) * gravityFactor; // CO2 увеличивается с температурой
    
    // Дополнительные эффекты
    if (temperature > 373) { // Выше точки кипения воды
        oxygen *= 0.5; // Меньше кислорода в горячих атмосферах
        co2 *= 2; // Больше CO2 в горячих атмосферах
    }
    
    if (temperature < 273) { // Ниже точки замерзания
        co2 *= 1.5; // Больше CO2 в холодных атмосферах
        oxygen *= 0.7; // Меньше кислорода в холодных атмосферах
    }
    
    if (radius < 0.5) { // Малая гравитация
        nitrogen *= 0.5; // Легкие газы улетучиваются
        oxygen *= 0.5;
    }
    
    // Нормализация, чтобы сумма была 100%
    const total = nitrogen + oxygen + argon + co2;
    
    return {
        Nitrogen: Math.round(nitrogen * 100 / total * 100) / 100,
        Oxygen: Math.round(oxygen * 100 / total * 100) / 100,
        Argon: Math.round(argon * 100 / total * 100) / 100,
        CarbonDioxide: Math.round(co2 * 100 / total * 100) / 100
    };
}

// Расчет пригодности для различных форм жизни
function calculateLifeSustainability(temperature, radius, esi) {
    return {
        'Микроорганизмы': calculateSustainabilityScore(temperature, radius, 0.3),
        'Растения': calculateSustainabilityScore(temperature, radius, 0.6),
        'Простые животные': calculateSustainabilityScore(temperature, radius, 0.8),
        'Сложные формы жизни': calculateSustainabilityScore(temperature, radius, 0.9)
    };
}

// Расчет конкретного показателя пригодности
function calculateSustainabilityScore(temperature, radius, threshold) {
    const tempScore = 1 - Math.abs((temperature - 288) / 288); // 288K = 15°C (земная температура)
    const gravityScore = 1 - Math.abs((radius - 1) / 1); // Относительно земной гравитации
    
    const score = (tempScore + gravityScore) / 2 * 100;
    return Math.max(0, Math.min(100, score));
}

// Анализ отдельных факторов обитаемости
function analyzeHabitabilityFactors(params) {
    const factors = {};
    
    // Анализ температуры
    const temp = params.temperature;
    if (273 <= temp && temp <= 303) {
        factors['Температура'] = 'Оптимальная для жизни';
    } else if (240 <= temp && temp <= 350) {
        factors['Температура'] = 'Допустимая для некоторых форм жизни';
    } else {
        factors['Температура'] = 'Неблагоприятная для известных форм жизни';
    }
    
    // Анализ радиуса (гравитации)
    const radius = params.radius;
    if (0.8 <= radius && radius <= 1.2) {
        factors['Гравитация'] = 'Близкая к земной';
    } else if (0.5 <= radius && radius <= 1.5) {
        factors['Гравитация'] = 'Умеренная';
    } else {
        factors['Гравитация'] = 'Значительно отличается от земной';
    }
    
    return factors;
}

// Генерация рекомендаций для обитаемости
function generateRecommendations(params) {
    const recommendations = [];
    
    // Рекомендации по температуре
    if (params.temperature > 350) {
        recommendations.push('Экстремально высокая температура. Планета непригодна для жизни без серьезных защитных мер.');
    } else if (params.temperature > 303) {
        recommendations.push('Для обитаемости требуется охлаждение (слишком высокая температура). Возможно только для термофильных организмов.');
    } else if (params.temperature < 200) {
        recommendations.push('Экстремально низкая температура. Только некоторые экстремофилы могут выжить в искусственной среде.');
    } else if (params.temperature < 273) {
        recommendations.push('Для обитаемости требуется нагрев (слишком низкая температура). Необходимы изолированные жилища с подогревом.');
    } else if (params.temperature >= 273 && params.temperature <= 303) {
        recommendations.push('Температура в оптимальном диапазоне для земных форм жизни. Исследование можно проводить с минимальной защитой от температуры.');
    }
    
    // Рекомендации по радиусу (гравитации)
    if (params.radius < 0.5) {
        recommendations.push('Крайне низкая гравитация затруднит удержание атмосферы. Потребуются закрытые системы жизнеобеспечения.');
    } else if (params.radius < 0.8) {
        recommendations.push('Низкая гравитация может затруднить удержание атмосферы. Рекомендуется мониторинг атмосферного давления и состава.');
    } else if (params.radius > 2.0) {
        recommendations.push('Экстремально высокая гравитация. Передвижение будет крайне затруднено, потребуются экзоскелеты или роботизированные исследователи.');
    } else if (params.radius > 1.5) {
        recommendations.push('Высокая гравитация может затруднить развитие сложных форм жизни. Рекомендуется использование вспомогательных механизмов для передвижения.');
    } else if (params.radius >= 0.8 && params.radius <= 1.2) {
        recommendations.push('Гравитация близка к земной. Оптимально для колонизации без специальных адаптаций.');
    }
    
    return recommendations;
}

// Поиск похожих экзопланет
function findSimilarPlanets(params) {
    // Заглушка для демонстрации
    return [
        {
            name: "Kepler-442b",
            similarity: 95,
            params: {
                radius: 1.34,
                temperature: 293,
                density: 5.2
            },
            potentially_habitable: true,
            type: "Суперземля"
        },
        {
            name: "Kepler-62e",
            similarity: 89,
            params: {
                radius: 1.61,
                temperature: 270,
                density: 4.8
            },
            potentially_habitable: true,
            type: "Водный мир"
        },
        {
            name: "TOI-700d",
            similarity: 82,
            params: {
                radius: 1.19,
                temperature: 268,
                density: 5.1
            },
            potentially_habitable: true,
            type: "Земного типа"
        }
    ];
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzePlanet);
    }
}); 