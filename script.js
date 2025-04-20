// Глобальные переменные
let exoplanetsData = [];
let filteredPlanets = [];

// Глобальные переменные для 3D сцены
let scene, camera, renderer, planet, clouds, atmosphere, controls;
let isAnimating = true;
let mouseDown = false;
let rotationSpeed = 0.005;
let lastMouseX;

let currentStep = 0;
const totalSteps = 4;
const steps = [
    'data-collection',
    'parameter-calculation',
    'indicator-analysis',
    'result-formation'
];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Предварительная загрузка текстур
    preloadTextures();
    
    // Ждем небольшую задержку для уверенности, что DOM полностью готов
    setTimeout(() => {
        console.log('Initializing application...');
        
        // Загрузка данных
        fetchExoplanetsData();
        
        // Инициализация обработчиков событий
        initEventListeners();
        
        // Инициализация 3D модели планеты
        if (!initPlanet3D()) {
            console.log('Retrying 3D initialization...');
            // Повторная попытка через небольшую задержку
            setTimeout(initPlanet3D, 100);
        }
    }, 100);
});

// Загрузка данных об экзопланетах
async function fetchExoplanetsData() {
    try {
        // Создаем базовый набор данных для тестирования
        const defaultData = [
            {
                name: "Kepler-442b",
                radius: 1.34,
                temperature: 233,
                density: 5.0,
                potentially_habitable: true,
                esi: 0.84
            },
            {
                name: "Kepler-186f",
                radius: 1.17,
                temperature: 188,
                density: 4.7,
                potentially_habitable: true,
                esi: 0.78
            }
        ];

        // Используем тестовые данные
        exoplanetsData = defaultData;
        filteredPlanets = [...defaultData];
        console.log('Используем тестовые данные:', exoplanetsData.length, 'планет');
        
        // Отображаем список экзопланет
        const container = document.getElementById('exoplanets-list');
        if (container) {
            displayPlanetsList(filteredPlanets);
        }
        
    } catch (error) {
        console.error('Ошибка при инициализации данных:', error);
        exoplanetsData = [];
        filteredPlanets = [];
    }
}

// Отображение ошибки загрузки
function showErrorMessage(message) {
    const container = document.getElementById('exoplanets-list');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// Инициализация обработчиков событий
function initEventListeners() {
    // Обработчик кнопки анализа
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function(event) {
            event.preventDefault();
            analyzePlanet();
        });
    }
    
    // Обработчик очистки результатов
    const clearResultsBtn = document.getElementById('clear-results');
    if (clearResultsBtn) {
        clearResultsBtn.addEventListener('click', function() {
            document.getElementById('results').classList.add('hidden');
        });
    }
    
    // Обработчик для мобильного меню
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }
    
    // Закрываем меню при клике по ссылке в мобильной версии
    const navItems = document.querySelectorAll('.nav-links li a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
    
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

// Функция анализа планеты
async function analyzePlanet() {
    try {
        // Получаем элементы формы
        const nameInput = document.getElementById('planet-name');
        const radiusInput = document.getElementById('planet-radius');
        const tempInput = document.getElementById('planet-temp');
        const densityInput = document.getElementById('planet-density');

        // Проверяем наличие всех необходимых элементов
        if (!nameInput || !radiusInput || !tempInput || !densityInput) {
            throw new Error('Не найдены все необходимые поля формы');
        }

        // Получение значений из формы
        const name = nameInput.value || 'Неизвестная планета';
        const radius = parseFloat(radiusInput.value);
        const temperature = parseFloat(tempInput.value);
        const relativeDensity = parseFloat(densityInput.value);
        
        // Валидация
        if (isNaN(radius) || isNaN(temperature) || isNaN(relativeDensity)) {
            throw new Error('Пожалуйста, введите корректные числовые значения для всех параметров');
        }

        // Показываем оверлей анализа
        showAnalysisOverlay();
        
        // Запускаем анимацию прогресса
        currentStep = 0;
        updateAnalysisProgress();
        
        // Конвертируем относительную плотность в абсолютную (г/см³)
        const absoluteDensity = relativeDensity * EARTH_PARAMS.density;
        
        // Параметры планеты
        const params = {
            name: name,
            radius: radius,
            temperature: temperature,
            density: absoluteDensity
        };
        
        // Расчет ESI
        const esiValue = calculateESI(params);
        console.log('ESI calculated:', esiValue);
        
        // Комплексный анализ планеты
        const analysisResults = analyzeAllPlanetData(esiValue, params);
        
        // Формируем окончательный результат
        const result = {
            name: name,
            radius: radius,
            temperature: temperature,
            density: relativeDensity,
            absoluteDensity: absoluteDensity,
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

        // Создаем планету
        createPlanetModel(result);
        
        // Отображаем результаты
        displayResults(result);
        
        // Инициализируем графики
        initChartsVisualization(result);

        // Скрываем оверлей
        hideAnalysisOverlay();
        
        // Показываем секцию с результатами
        document.getElementById('results-section').classList.remove('hidden');

    } catch (error) {
        console.error('Ошибка при анализе планеты:', error);
        hideAnalysisOverlay();
        alert(error.message);
    }
}

// Функция создания модели планеты
function createPlanetModel(planetData) {
    console.log('Creating planet model with data:', planetData);
    
    // Получаем текстуры для планеты
    const textureSet = getPlanetTexture(planetData);
    console.log('Texture set:', textureSet);
    
    // Создаем геометрию планеты
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Загружаем текстуры
    const textureLoader = new THREE.TextureLoader();
    
    // Загружаем основную текстуру
    textureLoader.load(textureSet.surface, (surfaceTexture) => {
        // Загружаем карту неровностей
        textureLoader.load(textureSet.bump, (bumpTexture) => {
            // Создаем материал планеты
            const material = new THREE.MeshPhongMaterial({
                map: surfaceTexture,
                bumpMap: bumpTexture,
                bumpScale: 0.05,
                shininess: textureSet.shininess || 10
            });
            
            // Если уже есть планета, удаляем её
            if (planet) {
                scene.remove(planet);
            }
            
            // Создаем новую планету
            planet = new THREE.Mesh(geometry, material);
            scene.add(planet);
            
            // Если нужны облака
            if (textureSet.clouds) {
                textureLoader.load(textureSet.clouds, (cloudsTexture) => {
                    const cloudsGeometry = new THREE.SphereGeometry(1.01, 64, 64);
                    const cloudsMaterial = new THREE.MeshPhongMaterial({
                        map: cloudsTexture,
                        transparent: true,
                        opacity: 0.4
                    });
                    
                    // Если уже есть облака, удаляем их
                    if (clouds) {
                        scene.remove(clouds);
                    }
                    
                    // Создаем новые облака
                    clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
                    scene.add(clouds);
                });
            }
        });
    });
}

// Функция определения текстур планеты
function getPlanetTexture(planetData) {
    const temp = planetData.temperature;
    const esi = planetData.esi;
    
    console.log('Selecting texture for temperature:', temp, 'ESI:', esi);

    // Базовые пути к текстурам
    const basePath = './textures/planets/';
    let textureSet;

    // Очень холодная ледяная планета (< 200K)
    if (temp < 200) {
        console.log('Selected: Very cold planet textures');
        textureSet = {
            surface: basePath + 'moon.jpg',
            bump: basePath + 'planet_bump.jpg',
            shininess: 15
        };
    }
    // Холодная планета (200-273K)
    else if (temp < 273) {
        console.log('Selected: Cold planet textures');
        textureSet = {
            surface: basePath + 'earth2.jpg',
            bump: basePath + 'planet_bump.jpg',
            shininess: 5
        };
    }
    // Умеренная планета (273-323K)
    else if (temp >= 273 && temp <= 323) {
        console.log('Selected: Temperate planet textures');
        textureSet = {
            surface: basePath + 'earth.jpg',
            bump: basePath + 'planet_bump.jpg',
            clouds: basePath + 'clouds_texture.png',
            shininess: 8
        };
    }
    // Горячая планета (>323K)
    else {
        console.log('Selected: Hot planet textures');
        textureSet = {
            surface: basePath + 'venus.jpg',
            bump: basePath + 'planet_bump.jpg',
            shininess: 20
        };
    }

    // Добавляем облака только для планет с высоким ESI, если они еще не добавлены
    if (esi >= 0.8 && !textureSet.clouds) {
        textureSet.clouds = basePath + 'clouds_texture.png';
    }

    console.log('Final texture set:', textureSet);
    return textureSet;
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
    
    // Дополнительные рекомендации на основе плотности
    if (params.density < 2) { // <0.36 относительной плотности Земли
        recommendations.push('Крайне низкая плотность указывает на газовый состав. Планета, вероятно, не имеет твердой поверхности. Рекомендуется изучение с орбиты.');
    } else if (params.density < 3) { // <0.55 относительной плотности Земли
        recommendations.push('Низкая плотность указывает на преобладание легких элементов. Возможно наличие толстой газовой оболочки. Необходимо исследование состава атмосферы.');
    } else if (params.density > 8) { // >1.45 относительной плотности Земли
        recommendations.push('Экстремально высокая плотность указывает на высокое содержание тяжелых металлов. Возможны ценные месторождения, но и высокий радиационный фон.');
    } else if (params.density > 7) { // >1.3 относительной плотности Земли
        recommendations.push('Высокая плотность указывает на железное/металлическое ядро. Возможно наличие сильного магнитного поля, защищающего от космической радиации.');
    } else if (params.density >= 5 && params.density <= 6) { // Близко к земной плотности
        recommendations.push('Плотность близка к земной. Вероятно сходное распределение элементов в коре и мантии с Землей.');
    }
    
    return recommendations;
}

// Поиск похожих экзопланет
function findSimilarPlanets(params) {
    const similar = [];
    
    // Проверим, что у нас есть данные
    if (!exoplanetsData || exoplanetsData.length === 0) {
        console.warn('Нет данных о планетах для сравнения');
        return [];
    }
    
    console.log('Поиск похожих планет среди', exoplanetsData.length, 'планет в базе');
    console.log('Параметры для сравнения:', params);
    
    for (const planet of exoplanetsData) {
        const planetParams = {
            radius: planet.radius,
            temperature: planet.temperature,
            density: planet.density
        };
        
        const similarity = calculatePlanetSimilarity(params, planetParams);
        
        if (similarity > 0.6) {
            similar.push({
                name: planet.name,
                similarity: Math.round(similarity * 100),
                params: planetParams,
                potentially_habitable: planet.potentially_habitable || false,
                type: planet.type || 'Неизвестный тип'
            });
        }
    }
    
    // Сортируем по убыванию сходства и берем первые 3
    const result = similar.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
    console.log('Найдено похожих планет:', result.length);
    return result;
}

// Расчет схожести между двумя планетами
function calculatePlanetSimilarity(params1, params2) {
    if (!params1.radius || !params1.temperature || !params2.radius || !params2.temperature) {
        return 0;
    }
    
    const radiusSim = 1 - Math.abs(params1.radius - params2.radius) / (params1.radius + params2.radius);
    const tempSim = 1 - Math.abs(params1.temperature - params2.temperature) / (params1.temperature + params2.temperature);
    
    // Для плотности используем дополнительную проверку
    let densitySim = 0.5; // Среднее значение по умолчанию
    if (params1.density && params2.density) {
        densitySim = 1 - Math.abs(params1.density - params2.density) / (params1.density + params2.density);
    }
    
    // Взвешиваем важность параметров (радиус и температура важнее, чем плотность)
    return (radiusSim * 0.4 + tempSim * 0.4 + densitySim * 0.2);
}

// Отображение рекомендаций
function displayRecommendations(recommendationsList, recommendations) {
    if (!recommendationsList) return;
    
    recommendationsList.innerHTML = '';
    
    if (!recommendations || recommendations.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = "Нет особых рекомендаций для данной планеты.";
        listItem.classList.add('no-recommendations');
        recommendationsList.appendChild(listItem);
        return;
    }
    
    // Определение иконок для разных типов рекомендаций
    const getIconForRecommendation = (text) => {
        if (text.includes('температура') || text.includes('нагрев') || text.includes('охлаждение')) {
            return '<i class="fas fa-temperature-high"></i>'; // Иконка температуры
        } else if (text.includes('гравитация') || text.includes('радиус')) {
            return '<i class="fas fa-weight-hanging"></i>'; // Иконка гравитации
        } else if (text.includes('плотность') || text.includes('металл') || text.includes('элемент')) {
            return '<i class="fas fa-atom"></i>'; // Иконка атома/элементов
        } else if (text.includes('атмосфер') || text.includes('газов')) {
            return '<i class="fas fa-cloud"></i>'; // Иконка атмосферы
        } else if (text.includes('магнитн')) {
            return '<i class="fas fa-magnet"></i>'; // Иконка магнитного поля
        } else if (text.includes('вод')) {
            return '<i class="fas fa-tint"></i>'; // Иконка воды
        } else {
            return '<i class="fas fa-globe"></i>'; // Иконка планеты по умолчанию
        }
    };
    
    recommendations.forEach(recommendation => {
        const listItem = document.createElement('li');
        const icon = getIconForRecommendation(recommendation);
        listItem.innerHTML = `${icon} ${recommendation}`;
        recommendationsList.appendChild(listItem);
    });
}

// Отображение результатов анализа планеты
function displayResults(data) {
    const resultSection = document.getElementById('results-section');
    resultSection.classList.remove('hidden');
    
    // Прокрутка до результатов
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    // Заполняем основную информацию
    const resultName = document.getElementById('result-name');
    if (resultName) {
        resultName.textContent = data.name;
    }
    
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
        resultDensity.textContent = data.density.toFixed(2);
    }
    
    const habitabilityIndex = document.getElementById('habitability-index');
    if (habitabilityIndex) {
        habitabilityIndex.textContent = data.habitability_score;
    }
    
    const habitabilityProgress = document.getElementById('habitability-progress');
    if (habitabilityProgress) {
        habitabilityProgress.style.width = `${data.habitability_score}%`;
        habitabilityProgress.style.backgroundColor = getHabitabilityColor(data.esi);
    }
    
    const resultAssessment = document.getElementById('result-assessment');
    if (resultAssessment) {
        resultAssessment.textContent = getHabitabilityAssessment(data.esi);
    }
    
    // Отображаем рекомендации
    const recommendationsList = document.getElementById('result-recommendations');
    displayRecommendations(recommendationsList, data.recommendations);
    
    // Обновляем 3D визуализацию планеты
    createPlanetModel(data);
    
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
    
    console.log('Отображаем похожие планеты:', planets);
    
    planets.forEach(planet => {
        const habitabilityClass = planet.potentially_habitable ? 'habitable' : 'non-habitable';
        
        const planetElement = document.createElement('div');
        planetElement.className = `planet-item ${habitabilityClass}`;
        
        // Вычисляем относительную плотность, если она задана в абсолютных единицах
        let densityDisplay = planet.params.density;
        
        // Форматируем отображение плотности
        densityDisplay = parseFloat(densityDisplay).toFixed(1);
        
        // Добавляем тип планеты, если он есть
        const typeDisplay = planet.type ? `<p class="planet-type ${planet.type.toLowerCase().replace(/\s+/g, '-')}">Тип: ${planet.type}</p>` : '';
        
        planetElement.innerHTML = `
            <h4>${planet.name}</h4>
            <p>Радиус: ${planet.params.radius} R⊕</p>
            <p>Температура: ${planet.params.temperature} K</p>
            <p>Плотность: ${densityDisplay} г/см³</p>
            ${typeDisplay}
            <span class="esi-badge">ESI: ${planet.similarity}</span>
        `;
        
        // Добавляем обработчик клика для анализа этой планеты
        planetElement.addEventListener('click', () => {
            document.getElementById('planet-name').value = planet.name;
            document.getElementById('planet-radius').value = planet.params.radius;
            document.getElementById('planet-temp').value = planet.params.temperature;
            document.getElementById('planet-density').value = planet.params.density / EARTH_PARAMS.density; // Преобразуем в относительную плотность
            analyzePlanet();
        });
        
        container.appendChild(planetElement);
    });
}

// Отображение списка экзопланет
function displayPlanetsList(planets) {
    const container = document.getElementById('exoplanets-list');
    
    // Если контейнер не найден, просто пропускаем отображение
    if (!container) {
        console.log('Контейнер для списка планет не найден - пропускаем отображение');
        return;
    }
    
    // Очистка контейнера
    container.innerHTML = '';
    
    // Проверка наличия планет
    if (!planets || planets.length === 0) {
        container.innerHTML = '<p>Нет доступных данных о планетах.</p>';
        return;
    }
    
    console.log('Отображаем', planets.length, 'планет');
    
    // Отображение каждой планеты
    planets.forEach(planet => {
        if (!planet || !planet.name) return;
        
        const habitabilityClass = planet.potentially_habitable ? 'habitable' : 'non-habitable';
        
        const planetElement = document.createElement('div');
        planetElement.className = `planet-item ${habitabilityClass}`;
        
        planetElement.innerHTML = `
            <h4>${planet.name}</h4>
            <p>Радиус: ${planet.radius} R⊕</p>
            <p>Температура: ${planet.temperature} K</p>
            <p>Плотность: ${planet.density} г/см³</p>
            ${planet.type ? `<p class="planet-type ${planet.type.toLowerCase().replace(/\s+/g, '-')}">Тип: ${planet.type}</p>` : ''}
            <span class="esi-badge">ESI: ${typeof planet.esi === 'number' ? planet.esi.toFixed(2) : 'N/A'}</span>
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

// Функция инициализации 3D сцены
function initPlanet3D() {
    const container = document.getElementById('planet-3d-container');
    if (!container) {
        console.error('Container for 3D planet not found');
        return;
    }

    // Проверяем размеры контейнера
    if (container.clientWidth === 0 || container.clientHeight === 0) {
        console.log('Container has zero size, waiting for proper dimensions...');
        requestAnimationFrame(() => initPlanet3D());
        return;
    }

    console.log('Initializing 3D scene with container size:', 
                container.clientWidth, 'x', container.clientHeight);
    
    // Очистка контейнера
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Создание сцены
    scene = new THREE.Scene();
    
    // Создание камеры с перспективой
    const aspectRatio = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.set(0, 0, 2);
    camera.lookAt(0, 0, 0);
    
    // Создание рендерера
    renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        logarithmicDepthBuffer: true,
        powerPreference: "high-performance"
    });
    
    // Установка размеров и параметров рендерера
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Центрирование рендерера в контейнере
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '50%';
    renderer.domElement.style.top = '50%';
    renderer.domElement.style.transform = 'translate(-50%, -50%)';
    
    // Добавление рендерера в DOM
    container.appendChild(renderer.domElement);
    
    // Добавление OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 1.5;
    controls.maxDistance = 4.0;
    controls.rotateSpeed = 0.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    
    // Настройка освещения
    setupLighting();
    
    // Адаптация к изменению размера окна
    window.addEventListener('resize', onWindowResize);

    // Запускаем рендеринг
    animate();

    console.log('3D scene initialized successfully');
    return true;
}

// Настройка освещения сцены
function setupLighting() {
    // Основной рассеянный свет
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);
    
    // Основной направленный свет (как от звезды)
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(5, 3, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);
    
    // Настройка теней для основного света
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 10;
    
    // Заполняющий свет с противоположной стороны
    const fillLight = new THREE.DirectionalLight(0x8088ff, 0.8);
    fillLight.position.set(-5, -2, -5);
    scene.add(fillLight);
    
    // Дополнительный верхний свет
    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 5, 0);
    scene.add(topLight);
}

// Анимация
function animate() {
    if (!scene || !camera || !renderer) {
        console.warn('Scene, camera or renderer not initialized');
        return;
    }

    requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    if (clouds && controls.autoRotate) {
        clouds.rotation.y += 0.0005;
    }
    
    renderer.render(scene, camera);
}

// Обработчик изменения размера окна
function onWindowResize() {
    const container = document.getElementById('planet-3d-container');
    if (!container || !camera || !renderer) return;
    
    // Проверяем размеры контейнера
    if (container.clientWidth === 0 || container.clientHeight === 0) {
        console.warn('Container has invalid dimensions during resize');
        return;
    }
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function showAnalysisOverlay() {
    const overlay = document.querySelector('.analysis-overlay');
    overlay.classList.remove('hidden');
}

function hideAnalysisOverlay() {
    const overlay = document.querySelector('.analysis-overlay');
    overlay.classList.add('hidden');
    resetAnalysisProgress();
}

function resetAnalysisProgress() {
    currentStep = 0;
    updateProgressBar(0);
    steps.forEach(stepId => {
        const step = document.getElementById(stepId);
        step.classList.remove('active', 'completed');
    });
}

function updateAnalysisProgress() {
    if (currentStep >= totalSteps) {
        setTimeout(hideAnalysisOverlay, 1000);
        return;
    }

    const progress = (currentStep / totalSteps) * 100;
    updateProgressBar(progress);

    steps.forEach((stepId, index) => {
        const step = document.getElementById(stepId);
        if (index < currentStep) {
            step.classList.remove('active');
            step.classList.add('completed');
        } else if (index === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });

    currentStep++;
    setTimeout(updateAnalysisProgress, 1500);
}

function updateProgressBar(progress) {
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = `${progress}%`;
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

// Определение наличия облаков
function shouldHaveClouds(planetData) {
    const temp = planetData.temperature;
    const esi = planetData.esi;
    
    // Планеты с высоким ESI или в диапазоне температур от 250 до 350К могут иметь облака
    return (esi >= 0.7 || (temp >= 250 && temp <= 350));
}

// Определение цвета атмосферы
function getAtmosphereColor(planetData) {
    const temp = planetData.temperature;
    
    if (temp < 220) {
        return new THREE.Color(0x88ccff); // Холодная голубая (как у Нептуна)
    } else if (temp < 273) {
        return new THREE.Color(0xaaddff); // Прохладная голубая (как у Урана)
    } else if (temp <= 323) {
        return new THREE.Color(0x6699ff); // Земноподобная голубая
    } else if (temp <= 500) {
        return new THREE.Color(0xffaa66); // Горячая оранжевая
    } else {
        return new THREE.Color(0xff6666); // Экстремально горячая красная
    }
}

// Определение интенсивности атмосферы
function getAtmosphereIntensity(planetData) {
    const radius = planetData.radius;
    const temp = planetData.temperature;
    
    // Маленькие или очень горячие планеты имеют тонкую атмосферу или не имеют ее вовсе
    if (radius < 0.5 || temp > 700) {
        return 0.05;
    } 
    // Умеренные планеты имеют хорошо видимую атмосферу
    else if (radius >= 0.8 && radius <= 2.0 && temp >= 200 && temp <= 350) {
        return 0.3;
    } 
    // Стандартная атмосфера для других планет
    else {
        return 0.15;
    }
}

// Предварительная загрузка текстур
function preloadTextures() {
    const textureLoader = new THREE.TextureLoader();
    const texturesToPreload = [
        './textures/planets/earth.jpg',
        './textures/planets/mars.jpg',
        './textures/planets/moon.jpg',
        './textures/planets/venus.jpg',
        './textures/planets/planet_bump.jpg',
        './textures/planets/clouds_texture.png'
    ];
    
    window.preloadedTextures = {};
    
    texturesToPreload.forEach(texturePath => {
        textureLoader.load(
            texturePath,
            (texture) => {
                texture.encoding = THREE.sRGBEncoding;
                window.preloadedTextures[texturePath] = texture;
            },
            undefined,
            (error) => console.warn('Error preloading texture:', texturePath, error)
        );
    });
}

// Обновляем стили контейнера
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('planet-3d-container');
    if (container) {
        container.style.position = 'relative';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.overflow = 'hidden';
    }
});
