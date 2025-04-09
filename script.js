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
    
    // Пытаемся получить данные с сервера
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                radius,
                temperature,
                density
            })
        });
        
        if (!response.ok) {
            throw new Error('Ошибка сервера');
        }
        
        const data = await response.json();
        displayResults(data);
        
    } catch (error) {
        console.warn('Не удалось получить данные с сервера:', error);
        // Если сервер недоступен, рассчитываем локально
        const localResults = analyzeLocalPlanet(name, radius, temperature, density);
        displayResults(localResults);
    }
}

// Локальный анализ планеты, если сервер недоступен
function analyzeLocalPlanet(name, radius, temperature, density) {
    // Расчет индекса подобия Земле (ESI)
    // ESI = 1 - 0.5 * (|r-1|/1 + |t-288|/288 + |d-5.51|/5.51)
    const rDiff = Math.abs(radius - 1) / 1;
    const tDiff = Math.abs(temperature - 288) / 288;
    const dDiff = Math.abs(density - 5.51) / 5.51;
    
    const esi = Math.min(1, Math.max(0, 1 - 0.5 * (rDiff + tDiff + dDiff)));
    
    // Расчет оценки обитаемости (0-100)
    const habitabilityScore = Math.round(esi * 100);
    
    // Поиск похожих планет
    const similarPlanets = findSimilarPlanets(radius, temperature, density);
    
    return {
        name: name,
        radius: radius,
        temperature: temperature,
        density: density,
        esi: esi,
        habitability_score: habitabilityScore,
        similar_planets: similarPlanets
    };
}

// Поиск похожих планет в базе данных
function findSimilarPlanets(radius, temperature, density) {
    return exoplanetsData
        .map(planet => {
            // Расчет расстояния в параметрическом пространстве (меры сходства)
            const rDiff = Math.abs(planet.radius - radius) / Math.max(planet.radius, radius);
            const tDiff = Math.abs(planet.temperature - temperature) / Math.max(planet.temperature, temperature);
            const dDiff = Math.abs(planet.density - density) / Math.max(planet.density, density);
            
            // Общая мера различия
            const difference = Math.sqrt(rDiff*rDiff + tDiff*tDiff + dDiff*dDiff);
            
            // Возвращаем планету с мерой различия
            return {
                ...planet,
                difference: difference
            };
        })
        .filter(planet => planet.difference < 0.5) // Отбираем только достаточно похожие
        .sort((a, b) => a.difference - b.difference) // Сортируем по сходству
        .slice(0, 5); // Берем максимум 5 самых похожих
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
        habitabilityIndex.textContent = data.habitability_score;
    }
    
    const habitabilityProgress = document.getElementById('habitability-progress');
    if (habitabilityProgress) {
        habitabilityProgress.style.width = `${data.habitability_score}%`;
        habitabilityProgress.style.backgroundColor = getHabitabilityColor(data.habitability_score);
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
        resultAssessment.textContent = getHabitabilityAssessment(data.habitability_score);
    }
    
    // Обновляем визуализацию планеты
    const planetVisualization = document.getElementById('planet-visualization');
    if (planetVisualization) {
        planetVisualization.style.background = `radial-gradient(circle, ${getPlanetColor(data.temperature)}, #000)`;
    }
    
    // Отображаем похожие планеты
    displaySimilarPlanets(data.similar_planets);
}

// Получение цвета оценки обитаемости
function getHabitabilityColor(score) {
    if (score < 30) {
        return '#ff4a4a'; // красный
    } else if (score < 70) {
        return '#ffaa4a'; // оранжевый
    } else {
        return '#4aff4a'; // зеленый
    }
}

// Получение текстовой оценки обитаемости
function getHabitabilityAssessment(score) {
    if (score < 30) {
        return 'Малопригодна для жизни. Некоторые экстремофилы могли бы теоретически выжить, но сложные формы жизни невозможны.';
    } else if (score < 60) {
        return 'Умеренно пригодна для жизни. Простые формы жизни могли бы существовать при определенных условиях.';
    } else if (score < 80) {
        return 'Пригодна для жизни. Многие формы жизни, подобные земным, могли бы приспособиться к таким условиям.';
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
            <p>Радиус: ${planet.radius} R⊕</p>
            <p>Температура: ${planet.temperature} K</p>
            <p>Плотность: ${planet.density} г/см³</p>
            <span class="esi-badge">ESI: ${typeof planet.esi === 'number' ? planet.esi.toFixed(2) : planet.esi}</span>
        `;
        
        // Добавляем обработчик клика для анализа этой планеты
        planetElement.addEventListener('click', () => {
            document.getElementById('planet-name').value = planet.name;
            document.getElementById('planet-radius').value = planet.radius;
            document.getElementById('planet-temp').value = planet.temperature;
            document.getElementById('planet-density').value = planet.density;
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

// Экспорт функций для тестирования
if (typeof module !== 'undefined') {
    module.exports = {
        analyzePlanet,
        displayResults,
        filterPlanets,
        displayPlanetsList
    };
}
