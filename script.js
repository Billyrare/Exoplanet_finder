// Глобальные переменные
let exoplanetsData = [];
let filteredPlanets = [];

// Датасет экзопланет (исходная база данных)
const exoplanetsDataSet = [
    {
        name: "Kepler-442b",
        radius: 1.34,
        temperature: 233,
        density: 5.7,
        esi: 0.84,
        potentially_habitable: true,
        type: "Суперземля"
    },
    {
        name: "Proxima Centauri b",
        radius: 1.08,
        temperature: 234,
        density: 5.9,
        esi: 0.87,
        potentially_habitable: true,
        type: "Каменистая планета"
    },
    {
        name: "TRAPPIST-1e",
        radius: 0.92,
        temperature: 251,
        density: 5.65,
        esi: 0.91,
        potentially_habitable: true,
        type: "Земного типа"
    },
    {
        name: "TOI-700 d",
        radius: 1.19,
        temperature: 268,
        density: 5.3,
        esi: 0.86,
        potentially_habitable: true,
        type: "Земного типа"
    },
    {
        name: "Kepler-62f",
        radius: 1.41,
        temperature: 208,
        density: 5.2,
        esi: 0.83,
        potentially_habitable: true,
        type: "Суперземля"
    },
    {
        name: "Kepler-22b",
        radius: 2.4,
        temperature: 262,
        density: 3.8,
        esi: 0.71,
        potentially_habitable: true,
        type: "Океаническая планета"
    },
    {
        name: "Ross 128 b",
        radius: 1.1,
        temperature: 295,
        density: 5.6,
        esi: 0.86,
        potentially_habitable: true,
        type: "Каменистая планета"
    },
    {
        name: "Gliese 667 Cc",
        radius: 1.54,
        temperature: 277,
        density: 5.3,
        esi: 0.82,
        potentially_habitable: true,
        type: "Суперземля"
    },
    {
        name: "HD 219134 b",
        radius: 1.6,
        temperature: 700,
        density: 6.4,
        esi: 0.44,
        potentially_habitable: false,
        type: "Суперземля"
    },
    {
        name: "K2-18b",
        radius: 2.6,
        temperature: 260,
        density: 3.7,
        esi: 0.73,
        potentially_habitable: true,
        type: "Мини-Нептун"
    },
    {
        name: "WASP-12b",
        radius: 18.7,
        temperature: 2250,
        density: 0.2,
        esi: 0.01,
        potentially_habitable: false,
        type: "Горячий Юпитер"
    },
    {
        name: "TrES-2b",
        radius: 12.2,
        temperature: 1498,
        density: 1.2,
        esi: 0.02,
        potentially_habitable: false,
        type: "Горячий Юпитер"
    },
    {
        name: "Kepler-10b",
        radius: 1.47,
        temperature: 1833,
        density: 8.8,
        esi: 0.12,
        potentially_habitable: false,
        type: "Каменистая планета"
    },
    {
        name: "55 Cancri e",
        radius: 1.91,
        temperature: 2400,
        density: 5.9,
        esi: 0.05,
        potentially_habitable: false,
        type: "Суперземля"
    },
    {
        name: "HD 189733 b",
        radius: 12.8,
        temperature: 1200,
        density: 0.9,
        esi: 0.04,
        potentially_habitable: false,
        type: "Горячий Юпитер"
    },
    {
        name: "Kepler-452b",
        radius: 1.5,
        temperature: 295,
        density: 5.3,
        esi: 0.83,
        potentially_habitable: true,
        type: "Суперземля"
    },
    {
        name: "Kepler-186f",
        radius: 1.17,
        temperature: 233,
        density: 5.8,
        esi: 0.82,
        potentially_habitable: true,
        type: "Земного типа"
    },
    {
        name: "GJ 1132 b",
        radius: 1.16,
        temperature: 580,
        density: 6.0,
        esi: 0.32,
        potentially_habitable: false,
        type: "Каменистая планета"
    },
    {
        name: "Gliese 436 b",
        radius: 4.3,
        temperature: 712,
        density: 2.1,
        esi: 0.3,
        potentially_habitable: false,
        type: "Нептун"
    },
    {
        name: "HD 209458 b",
        radius: 14.8,
        temperature: 1450,
        density: 0.37,
        esi: 0.02,
        potentially_habitable: false,
        type: "Горячий Юпитер"
    }
];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка данных
    fetchExoplanetsData();
    
    // Инициализация обработчиков событий
    initEventListeners();
});

// Инициализация обработчиков событий
function initEventListeners() {
    // Обработчик кнопки анализа
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzePlanet);
    }
    
    // Обработчик очистки результатов
    const clearResultsBtn = document.getElementById('clear-results');
    if (clearResultsBtn) {
        clearResultsBtn.addEventListener('click', function() {
            document.getElementById('results').classList.add('hidden');
        });
    }
    
    // Обработчики для фильтрации экзопланет
    const sortBySelect = document.getElementById('sort-by');
    if (sortBySelect) {
        sortBySelect.addEventListener('change', function() {
            sortPlanets(this.value);
        });
    }
    
    const habitableOnly = document.getElementById('habitable-only');
    if (habitableOnly) {
        habitableOnly.addEventListener('change', function() {
            filterHabitablePlanets(this.checked);
        });
    }
}

// Загрузка данных об экзопланетах (из локальной базы или с сервера)
async function fetchExoplanetsData() {
    try {
        // Сначала пробуем загрузить с сервера
        const response = await fetch('/api/exoplanets');
        
        if (!response.ok) {
            throw new Error('Сервер недоступен');
        }
        
        const data = await response.json();
        exoplanetsData = data;
        console.log('Данные успешно загружены с сервера:', exoplanetsData.length, 'планет');
    } catch (error) {
        console.warn('Не удалось загрузить данные с сервера, используем локальные данные:', error);
        // Используем локальную базу данных, если сервер недоступен
        exoplanetsData = [...exoplanetsDataSet];
        console.log('Загружены локальные данные:', exoplanetsData.length, 'планет');
    }
    
    // Проверка данных и гарантированное использование локального набора, если данные пусты
    if (!exoplanetsData || exoplanetsData.length === 0) {
        console.warn('Данные пусты, принудительное использование локального датасета');
        exoplanetsData = [...exoplanetsDataSet];
    }
    
    // Инициализируем отфильтрованный список
    filteredPlanets = [...exoplanetsData];
    
    // Отображаем список экзопланет
    displayPlanetsList(filteredPlanets);
}

// Константы и эталонные данные
const EARTH_PARAMS = {
    radius: 1.0,
    temperature: 288,
    density: 5.51
};

const WEIGHTS = {
    radius: 0.57,
    temperature: 0.43
};

// Расчет индекса подобия Земле (ESI)
function calculateESI(params, referenceParams = EARTH_PARAMS, weights = WEIGHTS) {
    let esi = 1.0;
    const paramKeys = Object.keys(weights);
    
    for (const key of paramKeys) {
        if (key in params && key in weights) {
            const xi = params[key];
            const x0 = referenceParams[key];
            const wi = weights[key];
            esi *= Math.pow((1 - Math.abs(xi - x0) / (xi + x0)), (wi / paramKeys.length));
        }
    }
    
    return esi;
}

// Комплексный анализ планеты на основе параметров
function analyzeAllPlanetData(esiValue, params) {
    // Расчет состава атмосферы на основе параметров планеты
    const atmosphereComposition = calculateAtmosphere(params.temperature, params.radius);
    
    // Расчет вероятности наличия воды
    const waterProbability = calculateWaterProbability(params.temperature, params.radius);
    
    // Расчет пригодности для различных форм жизни
    const lifeSustainability = calculateLifeSustainability(params.temperature, params.radius, esiValue);
    
    // Сравнение с известными экзопланетами
    const similarPlanets = findSimilarPlanets(params);
    
    return {
        esi: Math.round(esiValue * 10000) / 10000,
        classification: getClassification(esiValue),
        similarityScores: calculateSimilarityScores(params),
        habitabilityFactors: analyzeHabitabilityFactors(params),
        recommendations: generateRecommendations(params),
        atmosphereComposition: atmosphereComposition,
        waterProbability: waterProbability,
        lifeSustainability: lifeSustainability,
        similarPlanets: similarPlanets
    };
}

// Анализ экзопланеты по введенным параметрам
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
    
    // Параметры планеты
    const params = {
        radius,
        temperature,
        density
    };
    
    // Расчет ESI
    const esiValue = calculateESI(params);
    
    // Комплексный анализ планеты
    const analysisResults = analyzeAllPlanetData(esiValue, params);
    
    // Формируем окончательный результат
    const result = {
        name: name,
        radius: radius,
        temperature: temperature,
        density: density,
        esi: esiValue,
        habitability_score: Math.round(esiValue * 100),
        classification: analysisResults.classification,
        similarityScores: analysisResults.similarityScores,
        habitabilityFactors: analysisResults.habitabilityFactors,
        recommendations: analysisResults.recommendations,
        atmosphereComposition: analysisResults.atmosphereComposition,
        waterProbability: analysisResults.waterProbability,
        lifeSustainability: analysisResults.lifeSustainability,
        similarPlanets: analysisResults.similarPlanets
    };
    
    // Отображаем результаты
    displayResults(result);
    
    // Инициализируем графики
    initChartsVisualization(result);
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

// Расчет вероятности наличия жидкой воды
function calculateWaterProbability(temperature, radius) {
    // Идеальная температура для жидкой воды: 273-373K
    const tempFactor = 1 - Math.abs((temperature - 323) / 323); // 323K = 50°C (середина диапазона)
    
    // Гравитация должна быть достаточной для удержания атмосферы
    const gravityFactor = Math.min(radius / 0.5, 1); // Минимальный радиус 0.5 земного
    
    const probability = tempFactor * gravityFactor * 100;
    return Math.max(0, Math.min(100, probability));
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

// Расчет схожести параметров с Землей в процентах
function calculateSimilarityScores(params) {
    const scores = {};
    for (const param in params) {
        if (param in EARTH_PARAMS) {
            const similarity = (1 - Math.abs(params[param] - EARTH_PARAMS[param]) / 
                              (params[param] + EARTH_PARAMS[param]));
            
            // Переводим названия параметров на русский
            const paramNames = {
                'radius': 'Радиус',
                'temperature': 'Температура',
                'density': 'Плотность'
            };
            
            scores[paramNames[param] || param] = Math.round(similarity * 100 * 100) / 100;
        }
    }
    return scores;
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
    
    if (params.temperature > 303) {
        recommendations.push('Требуется охлаждение для обитаемости');
    } else if (params.temperature < 273) {
        recommendations.push('Требуется нагрев для обитаемости');
    }
    
    if (params.radius < 0.8) {
        recommendations.push('Низкая гравитация может затруднить удержание атмосферы');
    } else if (params.radius > 1.2) {
        recommendations.push('Высокая гравитация может затруднить развитие жизни');
    }
    
    return recommendations;
}

// Поиск похожих экзопланет из существующих в базе
function findSimilarPlanets(params) {
    const similar = [];
    
    for (const planet of exoplanetsDataSet) {
        const planetParams = {
            radius: planet.radius,
            temperature: planet.temperature,
            density: planet.density
        };
        
        const similarity = calculatePlanetSimilarity(params, planetParams);
        
        if (similarity > 0.7) { // Порог схожести
            similar.push({
                name: planet.name,
                similarity: Math.round(similarity * 100 * 100) / 100,
                params: planetParams
            });
        }
    }
    
    // Сортируем по убыванию сходства и берем первые 3
    return similar.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}

// Расчет схожести между двумя планетами
function calculatePlanetSimilarity(params1, params2) {
    if (!params1.radius || !params1.temperature || !params2.radius || !params2.temperature) {
        return 0;
    }
    
    const radiusSim = 1 - Math.abs(params1.radius - params2.radius) / (params1.radius + params2.radius);
    const tempSim = 1 - Math.abs(params1.temperature - params2.temperature) / (params1.temperature + params2.temperature);
    
    return (radiusSim + tempSim) / 2;
}

// Отображение результатов анализа
function displayResults(data) {
    // Показываем секцию с результатами
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.remove('hidden');
    } else {
        console.error('Секция результатов не найдена');
        return;
    }
    
    // Обновляем имя планеты
    const resultName = document.getElementById('result-name');
    if (resultName) {
        resultName.textContent = data.name;
    }
    
    // Обновляем показатели
    const habitabilityIndex = document.getElementById('habitability-index');
    if (habitabilityIndex) {
        habitabilityIndex.textContent = data.esi;
    }
    
    const habitabilityProgress = document.getElementById('habitability-progress');
    if (habitabilityProgress) {
        habitabilityProgress.style.width = `${data.esi * 100}%`;
        habitabilityProgress.style.backgroundColor = getHabitabilityColor(data.esi);
    }
    
    // Обновляем детали планеты
    const resultRadius = document.getElementById('result-radius');
    if (resultRadius) {
        resultRadius.textContent = data.radius;
    }
    
    const resultTemp = document.getElementById('result-temp');
    if (resultTemp) {
        resultTemp.textContent = data.temperature;
    }
    
    const resultDensity = document.getElementById('result-density');
    if (resultDensity) {
        resultDensity.textContent = data.density;
    }
    
    // Обновляем заключение
    const resultAssessment = document.getElementById('result-assessment');
    if (resultAssessment) {
        resultAssessment.textContent = getHabitabilityAssessment(data.esi);
    }
    
    // Обновляем визуализацию планеты
    const planetVisualization = document.getElementById('planet-visualization');
    if (planetVisualization) {
        planetVisualization.style.background = `radial-gradient(circle, ${getPlanetColor(data.temperature)}, #000)`;
    }
    
    // Отображаем похожие планеты
    displaySimilarPlanets(data.similarPlanets);
}

// Получение цвета оценки обитаемости
function getHabitabilityColor(score) {
    if (score < 0.5) {
        return '#ff4a4a'; // красный
    } else if (score < 0.8) {
        return '#ffaa4a'; // оранжевый
    } else {
        return '#4aff4a'; // зеленый
    }
}

// Получение текстовой оценки обитаемости
function getHabitabilityAssessment(score) {
    if (score < 0.5) {
        return 'Малопригодна для жизни. Некоторые экстремофилы могли бы теоретически выжить, но сложные формы жизни невозможны.';
    } else if (score < 0.8) {
        return 'Умеренно пригодна для жизни. Простые формы жизни могли бы существовать при определенных условиях.';
    } else {
        return 'Высокопригодна для жизни. Условия близки к идеальным для развития сложных форм жизни, подобных земным.';
    }
}

// Получение цвета планеты в зависимости от температуры
function getPlanetColor(temperature) {
    if (temperature < 200) {
        return '#a3f0ff'; // ледяная голубая
    } else if (temperature < 250) {
        return '#82b7ff'; // холодная голубая
    } else if (temperature < 300) {
        return '#429eff'; // земная голубая
    } else if (temperature < 350) {
        return '#ffb142'; // теплая оранжевая
    } else {
        return '#ff6142'; // горячая красная
    }
}

// Получение прозрачности атмосферы в зависимости от плотности
function getAtmosphereOpacity(density) {
    if (density < 2) {
        return 0.1; // тонкая атмосфера
    } else if (density < 4) {
        return 0.3; // средняя атмосфера
    } else if (density < 6) {
        return 0.5; // земная атмосфера
    } else {
        return 0.7; // плотная атмосфера
    }
}

// Отображение похожих планет
function displaySimilarPlanets(planets) {
    const container = document.getElementById('similar-planets-list');
    if (!container) {
        console.error('Контейнер для похожих планет не найден');
        return;
    }
    
    container.innerHTML = '';
    
    if (!planets || planets.length === 0) {
        container.innerHTML = '<p>Нет данных о похожих планетах.</p>';
        return;
    }
    
    planets.forEach(planet => {
        const habitabilityClass = planet.potentially_habitable ? 'habitable' : 'non-habitable';
        
        const planetElement = document.createElement('div');
        planetElement.className = `planet-item ${habitabilityClass}`;
        
        planetElement.innerHTML = `
            <h4>${planet.name}</h4>
            <p>Радиус: ${planet.params.radius} R⊕</p>
            <p>Температура: ${planet.params.temperature} K</p>
            <p>Плотность: ${planet.params.density} г/см³</p>
            <span class="esi-badge">ESI: ${typeof planet.similarity === 'number' ? planet.similarity.toFixed(2) : planet.similarity}</span>
        `;
        
        // Добавляем обработчик клика для анализа этой планеты
        planetElement.addEventListener('click', () => {
            document.getElementById('planet-name').value = planet.name;
            document.getElementById('planet-radius').value = planet.params.radius;
            document.getElementById('planet-temp').value = planet.params.temperature;
            document.getElementById('planet-density').value = planet.params.density;
            analyzePlanet();
        });
        
        container.appendChild(planetElement);
    });
}

// Отображение списка экзопланет
function displayPlanetsList(planets) {
    const container = document.getElementById('exoplanets-list');
    
    // Проверка существования контейнера
    if (!container) {
        console.error('Контейнер для списка планет не найден');
        return;
    }
    
    // Очистка контейнера
    container.innerHTML = '';
    
    // Проверка наличия планет
    if (!planets || planets.length === 0) {
        container.innerHTML = '<p>Нет доступных данных о планетах. Пожалуйста, обновите страницу или проверьте соединение с сервером.</p>';
        // Принудительно используем локальные данные
        planets = [...exoplanetsDataSet];
        console.log('Принудительное отображение локальных данных, так как список планет пуст');
    }
    
    console.log('Отображаем', planets.length, 'планет');
    
    // Отображение каждой планеты напрямую в контейнере
    planets.forEach(planet => {
        // Проверка корректности данных планеты
        if (!planet || !planet.name) {
            console.warn('Некорректные данные планеты:', planet);
            return;
        }
        
        const habitabilityClass = planet.potentially_habitable ? 'habitable' : 'non-habitable';
        
        const planetElement = document.createElement('div');
        planetElement.className = `planet-item ${habitabilityClass}`;
        
        // Добавляем обработчик клика на всю карточку
        planetElement.addEventListener('click', () => {
            document.getElementById('planet-name').value = planet.name;
            document.getElementById('planet-radius').value = planet.radius;
            document.getElementById('planet-temp').value = planet.temperature;
            document.getElementById('planet-density').value = planet.density;
            analyzePlanet();
        });
        
        // Тип планеты
        const typeClass = planet.type ? planet.type.toLowerCase().replace(/\s+/g, '-') : '';
        
        planetElement.innerHTML = `
            <h4>${planet.name}</h4>
            <p>Радиус: ${planet.radius} R⊕</p>
            <p>Температура: ${planet.temperature} K</p>
            <p>Плотность: ${planet.density} г/см³</p>
            ${planet.type ? `<p class="planet-type ${typeClass}">Тип: ${planet.type}</p>` : ''}
            <span class="esi-badge">ESI: ${typeof planet.esi === 'number' ? planet.esi.toFixed(2) : planet.esi}</span>
        `;
        
        container.appendChild(planetElement);
    });
}

// Сортировка планет
function sortPlanets(criterion) {
    switch (criterion) {
        case 'esi':
            filteredPlanets.sort((a, b) => b.esi - a.esi);
            break;
        case 'radius':
            filteredPlanets.sort((a, b) => a.radius - b.radius);
            break;
        case 'temperature':
            filteredPlanets.sort((a, b) => a.temperature - b.temperature);
            break;
        default:
            // По умолчанию сортируем по ESI
            filteredPlanets.sort((a, b) => b.esi - a.esi);
    }
    
    displayPlanetsList(filteredPlanets);
}

// Фильтрация только обитаемых планет
function filterHabitablePlanets(showOnlyHabitable) {
    if (showOnlyHabitable) {
        filteredPlanets = exoplanetsData.filter(planet => planet.potentially_habitable);
    } else {
        filteredPlanets = [...exoplanetsData];
    }
    
    displayPlanetsList(filteredPlanets);
}

// Функция инициализации всех графиков
async function initChartsVisualization(planetData) {
    // Создаем диаграмму состава атмосферы
    createAtmosphereChart(planetData.atmosphereComposition);
    
    // Создаем диаграмму пригодности для разных форм жизни
    createLifeSustainabilityChart(planetData.lifeSustainability);
    
    // Создаем индикатор вероятности наличия воды
    createWaterIndicator(planetData.waterProbability);
    
    // Создаем диаграмму сравнения с Землей
    createEarthComparisonChart(planetData);
    
    // Создаем индикатор ESI
    createESIGauge(planetData);
    
    // Создаем точечную диаграмму распределения планет
    createPlanetsDistribution(planetData);
}

// Создание круговой диаграммы состава атмосферы
function createAtmosphereChart(atmosphereData) {
    const container = document.getElementById('atmosphere-chart');
    if (!container) return;
    
    const data = [{
        type: 'pie',
        values: [
            atmosphereData.Nitrogen,
            atmosphereData.Oxygen,
            atmosphereData.Argon,
            atmosphereData.CarbonDioxide
        ],
        labels: ['Азот', 'Кислород', 'Аргон', 'Углекислый газ'],
        textinfo: 'label+percent',
        insidetextorientation: 'radial',
        textfont: {
            size: 12,
            color: '#ffffff'
        },
        marker: {
            colors: ['#7986CB', '#4FC3F7', '#9575CD', '#4DB6AC'],
            line: {
                color: '#000000',
                width: 0.5
            }
        },
        hoverinfo: 'label+percent+value'
    }];
    
    const layout = {
        title: {
            text: 'Предполагаемый состав атмосферы',
            font: {
                size: 16
            }
        },
        height: 320,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: '#e0e0e0'
        },
        legend: {
            font: {
                color: '#e0e0e0',
                size: 11
            },
            orientation: 'v',
            x: 1.05,
            y: 0.5
        },
        margin: {
            l: 10,
            r: 10,
            t: 40,
            b: 10
        }
    };
    
    Plotly.newPlot(container, data, layout);
}

// Создание столбчатой диаграммы пригодности для разных форм жизни
function createLifeSustainabilityChart(lifeSustainabilityData) {
    const container = document.getElementById('life-sustainability-chart');
    if (!container) return;
    
    // Сокращенные названия для лучшего отображения
    const labels = {
        'Микроорганизмы': 'Микроорг.',
        'Растения': 'Растения',
        'Простые животные': 'Простые жив.',
        'Сложные формы жизни': 'Сложные формы'
    };
    
    const keys = Object.keys(lifeSustainabilityData);
    const values = Object.values(lifeSustainabilityData);
    
    const data = [{
        type: 'bar',
        x: keys.map(key => labels[key] || key),
        y: values,
        text: values.map(value => value.toFixed(1) + '%'),
        textposition: 'outside',
        textfont: {
            color: '#ffffff',
            size: 12
        },
        hoverinfo: 'text',
        hovertext: keys.map((key, i) => `${key}: ${values[i].toFixed(1)}%`),
        marker: {
            color: ['#00BFA5', '#00E676', '#FFD600', '#FF6D00'],
            line: {
                color: 'rgba(255, 255, 255, 0.4)',
                width: 1
            }
        }
    }];
    
    const layout = {
        title: {
            text: 'Пригодность для различных форм жизни',
            font: {
                size: 16
            }
        },
        height: 320,
        yaxis: {
            range: [0, Math.max(...values) * 1.2], // Увеличиваем верхний предел для размещения текста
            title: {
                text: 'Процент пригодности',
                font: {
                    size: 12
                }
            },
            gridcolor: 'rgba(255, 255, 255, 0.1)'
        },
        xaxis: {
            tickangle: -30,
            tickfont: {
                size: 11
            }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: '#e0e0e0'
        },
        margin: {
            l: 50,
            r: 10,
            t: 40,
            b: 80 // Увеличиваем отступ снизу для наклонного текста
        }
    };
    
    Plotly.newPlot(container, data, layout);
}

// Создание индикатора вероятности наличия воды
function createWaterIndicator(waterProbability) {
    const container = document.getElementById('water-indicator');
    if (!container) return;
    
    const data = [{
        type: 'indicator',
        mode: 'gauge+number',
        value: waterProbability,
        title: { 
            text: 'Вероятность наличия жидкой воды',
            font: { 
                size: 16
            }
        },
        gauge: {
            axis: { 
                range: [0, 100],
                tickvals: [0, 30, 70, 100],
                ticktext: ['0%', '30%', '70%', '100%'],
                tickfont: {
                    size: 11
                }
            },
            bar: { color: waterProbability > 70 ? '#00BFA5' : waterProbability > 30 ? '#FFD600' : '#FF5252' },
            steps: [
                { range: [0, 30], color: 'rgba(255, 82, 82, 0.3)' },
                { range: [30, 70], color: 'rgba(255, 214, 0, 0.3)' },
                { range: [70, 100], color: 'rgba(0, 191, 165, 0.3)' }
            ],
            threshold: {
                line: { color: "white", width: 2 },
                thickness: 0.6,
                value: 70
            }
        },
        number: {
            font: { 
                size: 30,
                color: waterProbability > 70 ? '#00BFA5' : waterProbability > 30 ? '#FFD600' : '#FF5252'
            },
            suffix: "%"
        }
    }];
    
    const layout = {
        height: 320,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: '#e0e0e0'
        },
        margin: {
            l: 10,
            r: 10,
            t: 40,
            b: 10
        }
    };
    
    Plotly.newPlot(container, data, layout);
}

// Создание радарной диаграммы сравнения с Землей
function createEarthComparisonChart(planetData) {
    const container = document.getElementById('earth-comparison-chart');
    if (!container) return;
    
    const earthParams = {
        'Радиус': 1.0,
        'Температура': 288,
        'Плотность': 5.51,
        'ESI': 1.0
    };
    
    const planetParams = {
        'Радиус': planetData.radius,
        'Температура': planetData.temperature,
        'Плотность': planetData.density,
        'ESI': planetData.esi
    };
    
    // Нормализуем значения для радарной диаграммы
    const normalizedEarth = {};
    const normalizedPlanet = {};
    
    Object.keys(earthParams).forEach(key => {
        normalizedEarth[key] = 1.0; // Земные параметры всегда 1.0 (эталон)
        
        // Нормализация для планеты
        const earthValue = earthParams[key];
        const planetValue = planetParams[key];
        
        // Формула нормализации: 1 - abs(planet - earth) / max(planet, earth)
        normalizedPlanet[key] = 1 - Math.abs(planetValue - earthValue) / Math.max(planetValue, earthValue);
    });
    
    const data = [
        {
            type: 'scatterpolar',
            r: Object.values(normalizedEarth),
            theta: Object.keys(normalizedEarth),
            fill: 'toself',
            name: 'Земля',
            line: { color: '#76FF03', width: 2 }
        },
        {
            type: 'scatterpolar',
            r: Object.values(normalizedPlanet),
            theta: Object.keys(normalizedPlanet),
            fill: 'toself',
            name: planetData.name,
            line: { color: '#00E5FF', width: 2 }
        }
    ];
    
    const layout = {
        title: {
            text: 'Сравнение с параметрами Земли',
            font: { size: 16 }
        },
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 1],
                tickfont: { size: 10, color: '#ffffff' },
                tickformat: '.1f',
                gridcolor: 'rgba(255, 255, 255, 0.2)'
            },
            angularaxis: {
                rotation: 45, // Поворот осей для лучшего размещения текста
                direction: 'clockwise',
                tickfont: { size: 13, color: '#ffffff' }
            },
            bgcolor: 'rgba(0, 0, 0, 0.1)'
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: '#e0e0e0',
            size: 12
        },
        legend: {
            font: {
                color: '#e0e0e0',
                size: 12
            },
            orientation: 'h',
            y: -0.25, // Перемещаем легенду вниз
            x: 0.5,
            xanchor: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            bordercolor: 'rgba(255, 255, 255, 0.2)',
            borderwidth: 1
        },
        margin: {
            l: 50,
            r: 50,
            t: 40,
            b: 60
        }
    };
    
    Plotly.newPlot(container, data, layout);
}

// Создание индикатора ESI в виде шкалы
function createESIGauge(planetData) {
    const container = document.getElementById('esi-gauge');
    if (!container) return;
    
    const esiValue = planetData.esi;
    let color = planetData.classification.color;
    
    const data = [{
        type: 'indicator',
        mode: 'gauge+number',
        value: esiValue,
        title: { 
            text: 'Индекс подобия Земле (ESI)', 
            font: { size: 24, color: '#ffffff' } 
        },
        gauge: {
            axis: { 
                range: [0, 1], 
                tickcolor: "#e0e0e0",
                tickvals: [0, 0.3, 0.5, 0.8, 1],
                ticktext: ['0', '0.3', '0.5', '0.8', '1']
            },
            bar: { color: color, thickness: 0.6 },
            bgcolor: "rgba(255, 255, 255, 0.1)",
            bordercolor: "#e0e0e0",
            steps: [
                { range: [0, 0.3], color: 'rgba(231, 76, 60, 0.3)' },
                { range: [0.3, 0.5], color: 'rgba(230, 126, 34, 0.3)' },
                { range: [0.5, 0.8], color: 'rgba(241, 196, 15, 0.3)' },
                { range: [0.8, 1.0], color: 'rgba(46, 204, 113, 0.3)' }
            ],
            threshold: {
                line: { color: "white", width: 3 },
                thickness: 0.75,
                value: 0.8 // Порог высокой обитаемости
            }
        },
        number: {
            font: { color: color, size: 50 },
            suffix: ""
        }
    }];
    
    const layout = {
        height: 300,
        margin: { t: 50, r: 40, l: 40, b: 80 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e0e0e0' },
        annotations: [
            {
                x: 0.5,
                y: 0, // Перемещение текста вниз (в самый низ)
                xanchor: 'center',
                yanchor: 'top',
                text: planetData.classification.description,
                showarrow: false,
                font: {
                    size: 20,
                    color: color
                },
                bgcolor: 'rgba(0,0,0,0.3)',
                borderpad: 8,
                borderwidth: 1,
                bordercolor: color
            }
        ]
    };
    
    Plotly.newPlot(container, data, layout);
}

// Создание точечной диаграммы распределения планет
function createPlanetsDistribution(planetData) {
    const container = document.getElementById('planets-distribution');
    if (!container) return;
    
    // Собираем данные для всех планет
    const habitablePlanets = exoplanetsData.filter(p => p.potentially_habitable);
    const nonHabitablePlanets = exoplanetsData.filter(p => !p.potentially_habitable);
    
    // Трейс для обитаемых планет
    const habTrace = {
        x: habitablePlanets.map(p => p.radius),
        y: habitablePlanets.map(p => p.temperature),
        mode: 'markers',
        type: 'scatter',
        name: 'Потенциально обитаемые',
        text: habitablePlanets.map(p => p.name),
        hovertemplate: '<b>%{text}</b><br>Радиус: %{x} R⊕<br>Температура: %{y} K',
        marker: {
            size: 10,
            color: 'rgba(46, 204, 113, 0.7)',
            line: {
                color: 'rgba(46, 204, 113, 1)',
                width: 1
            }
        }
    };
    
    // Трейс для необитаемых планет
    const nonHabTrace = {
        x: nonHabitablePlanets.map(p => p.radius),
        y: nonHabitablePlanets.map(p => p.temperature),
        mode: 'markers',
        type: 'scatter',
        name: 'Необитаемые',
        text: nonHabitablePlanets.map(p => p.name),
        hovertemplate: '<b>%{text}</b><br>Радиус: %{x} R⊕<br>Температура: %{y} K',
        marker: {
            size: 10,
            color: 'rgba(231, 76, 60, 0.7)',
            line: {
                color: 'rgba(231, 76, 60, 1)',
                width: 1
            }
        }
    };
    
    // Трейс для анализируемой планеты
    const currentPlanetTrace = {
        x: [planetData.radius],
        y: [planetData.temperature],
        mode: 'markers+text',
        type: 'scatter',
        name: planetData.name,
        text: [planetData.name],
        textposition: 'top center',
        textfont: {
            color: '#ffffff',
            size: 12
        },
        hovertemplate: '<b>%{text}</b><br>Радиус: %{x} R⊕<br>Температура: %{y} K',
        marker: {
            size: 15,
            color: 'rgba(52, 152, 219, 1)',
            line: {
                color: 'white',
                width: 2
            },
            symbol: 'star'
        }
    };
    
    // Определение зоны обитаемости
    const habZoneX = [0.5, 2.0, 2.0, 0.5, 0.5]; // радиус
    const habZoneY = [200, 200, 300, 300, 200]; // температура
    
    const habZoneTrace = {
        x: habZoneX,
        y: habZoneY,
        mode: 'lines',
        type: 'scatter',
        fill: 'toself',
        name: 'Зона обитаемости',
        line: {
            color: 'rgba(46, 204, 113, 0.5)'
        },
        fillcolor: 'rgba(46, 204, 113, 0.1)'
    };
    
    const layout = {
        title: {
            text: 'Распределение экзопланет по радиусу и температуре',
            font: {
                size: 18
            }
        },
        xaxis: {
            title: {
                text: 'Радиус (в радиусах Земли)',
                font: {
                    size: 14
                }
            },
            gridcolor: 'rgba(255, 255, 255, 0.1)',
            tickfont: {
                size: 12
            },
            range: [0, Math.min(6, Math.max(...exoplanetsData.map(p => p.radius)) * 1.1)]
        },
        yaxis: {
            title: {
                text: 'Температура (К)',
                font: {
                    size: 14
                }
            },
            gridcolor: 'rgba(255, 255, 255, 0.1)',
            tickfont: {
                size: 12
            },
            range: [100, Math.min(1000, Math.max(...exoplanetsData.map(p => p.temperature)) * 1.1)]
        },
        hovermode: 'closest',
        legend: {
            x: 0.01,
            y: 0.99,
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            font: {
                color: '#e0e0e0',
                size: 12
            },
            bordercolor: 'rgba(255, 255, 255, 0.2)',
            borderwidth: 1
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: '#e0e0e0'
        },
        margin: {
            l: 60,
            r: 30,
            t: 50,
            b: 60
        },
        annotations: [
            {
                x: 1.25,
                y: 250,
                text: 'Зона<br>обитаемости',
                showarrow: false,
                font: {
                    color: 'rgba(46, 204, 113, 1)',
                    size: 12
                },
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                borderpad: 4
            }
        ]
    };
    
    Plotly.newPlot(container, [habZoneTrace, habTrace, nonHabTrace, currentPlanetTrace], layout);
}

// Экспорт функций для тестирования
if (typeof module !== 'undefined') {
    module.exports = {
        analyzePlanet,
        displayResults,
        filterPlanets,
        displayPlanetsList
    };
}
