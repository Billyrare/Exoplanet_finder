// Глобальные переменные
let exoplanetsData = [];
let filteredPlanets = [];

// Глобальные объекты для SciChart
// const {
//     SciChartSurface,
//     NumericAxis,
//     CategoryAxis,
//     XyDataSeries,
//     NumberRange,
//     RadarSeries,
//     ScatterSeries,
//     EllipsePointMarker,
//     SolidPenStyle,
//     SolidFillBrushStyle,
//     SciChartLegend,
//     ELegendPosition,
//     ZoomPanModifier,
//     ZoomExtentsModifier,
//     TooltipModifier,
//     CustomAnnotation,
//     ECoordinateMode,
//     EHorizontalAnchorPoint,
//     EVerticalAnchorPoint,
//     VerticalLineAnnotation,
//     ELabelPlacement,
//     ColumnSeries,
//     TextAnnotation
// } = SciChart;

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
    
    // Обработчик кнопки поиска в базе данных
    const dbSearchBtn = document.getElementById('db-search-btn');
    if (dbSearchBtn) {
        dbSearchBtn.addEventListener('click', function() {
            const searchQuery = document.getElementById('db-search').value.toLowerCase();
            const filteredResults = exoplanetsData.filter(planet => {
                return planet.name.toLowerCase().includes(searchQuery);
            });
            displayPlanetsList(filteredResults);
        });
    }
    
    // Обработчик фильтра типов планет
    const filterType = document.getElementById('filter-type');
    if (filterType) {
        filterType.addEventListener('change', function() {
            filterHabitablePlanets(this.value);
        });
    }
    
    // Обработчик кнопки сортировки
    const sortBtn = document.getElementById('sort-btn');
    if (sortBtn) {
        sortBtn.addEventListener('click', function() {
            const criterion = this.getAttribute('data-sort');
            sortPlanets(criterion);
            
            // Переключаем критерий сортировки
            if (criterion === 'name') {
                this.setAttribute('data-sort', 'habitability');
                this.innerHTML = '<i class="fas fa-sort"></i> Сортировать по обитаемости';
            } else {
                this.setAttribute('data-sort', 'name');
                this.innerHTML = '<i class="fas fa-sort"></i> Сортировать по имени';
            }
        });
    }
    
    // Обработчик кнопки сохранения результатов
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveResults();
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

// Выполнение анализа планеты
async function analyzePlanet() {
    // Получение данных из формы
    const name = document.getElementById('planet-name').value || 'Неизвестная планета';
    const radius = parseFloat(document.getElementById('planet-radius').value);
    const temperature = parseFloat(document.getElementById('planet-temp').value);
    const density = parseFloat(document.getElementById('planet-density').value);
    
    // Проверка корректности введенных данных
    if (isNaN(radius) || isNaN(temperature) || isNaN(density)) {
        alert('Пожалуйста, заполните все числовые поля корректными значениями');
        return;
    }
    
    // Показываем анимацию загрузки
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Анализ...';
        analyzeBtn.disabled = true;
    }
    
    try {
        // Отправляем данные на сервер для анализа
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                radius: radius,
                temperature: temperature,
                density: density
            })
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Отображаем результаты
        displayResults(data);
        
        // Убираем анимацию загрузки
        if (analyzeBtn) {
            analyzeBtn.innerHTML = 'Анализировать <i class="fas fa-search"></i>';
            analyzeBtn.disabled = false;
        }
        
        // Если база данных еще не загружена, загружаем ее
        if (exoplanetsData.length === 0) {
            fetchExoplanetsData();
        }
        
    } catch (error) {
        console.warn('Не удалось получить данные с сервера:', error);
        // Если сервер недоступен, рассчитываем локально
        const localResults = analyzeLocalPlanet(name, radius, temperature, density);
        displayResults(localResults);
        
        // Если база данных еще не загружена, загружаем ее
        if (exoplanetsData.length === 0) {
            // Используем локальный датасет
            exoplanetsData = [...exoplanetsDataSet];
            filteredPlanets = [...exoplanetsData];
            displayPlanetsList(filteredPlanets);
        }
        
        // Убираем анимацию загрузки
        if (analyzeBtn) {
            analyzeBtn.innerHTML = 'Анализировать <i class="fas fa-search"></i>';
            analyzeBtn.disabled = false;
        }
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
    
    // Создаем графики визуализации
    initChartsVisualization(data);
}

// Функция инициализации визуализации с использованием Plotly
async function initChartsVisualization(planetData) {
    // Создаем радар-диаграмму
    await createRadarChart(planetData);
    
    // Создаем карту экзопланет
    await fetchAndCreateExoplanetMap(planetData);
    
    // Загружаем данные для диаграмм распределения
    await loadDistributionData(planetData);
    
    // Создаем сравнительную диаграмму
    await createComparisonChart(planetData);
}

// Создание радар-диаграммы с использованием Plotly
async function createRadarChart(planetData) {
    const normalizedData = normalizeDataForRadar(planetData);
    
    const data = [{
        type: 'scatterpolar',
        r: normalizedData.values,
        theta: normalizedData.categories,
        fill: 'toself',
        name: planetData.name,
        line: {
            color: 'rgba(32, 156, 238, 0.8)'
        }
    }, {
        type: 'scatterpolar',
        r: [1, 1, 1, 1],
        theta: normalizedData.categories,
        fill: 'toself',
        name: 'Идеальные параметры',
        line: {
            color: 'rgba(76, 175, 80, 0.5)'
        }
    }];
    
    const layout = {
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 1]
            }
        },
        showlegend: true,
        legend: {
            x: 0,
            y: 1,
            bgcolor: 'rgba(10, 10, 30, 0.7)',
            font: {
                color: '#fff'
            }
        },
        paper_bgcolor: 'rgba(10, 10, 30, 0.0)',
        plot_bgcolor: 'rgba(10, 10, 30, 0.0)',
        font: {
            color: '#fff'
        },
        margin: {
            l: 40,
            r: 40,
            t: 30,
            b: 30
        }
    };
    
    Plotly.newPlot('radar-chart', data, layout, {responsive: true});
}

// Создание карты экзопланет с использованием Plotly
async function fetchAndCreateExoplanetMap(planetData) {
    // Используем данные из глобальной переменной экзопланет
    createExoplanetMap([...exoplanetsData, planetData]);
}

async function createExoplanetMap(data) {
    const traces = [];
    
    // Добавляем обитаемые планеты
    const habitablePlanets = data.filter(p => p.esi >= 0.8 || p.potentially_habitable);
    
    // Добавляем необитаемые планеты
    const nonHabitablePlanets = data.filter(p => p.esi < 0.8 && !p.potentially_habitable);
    
    // Создаем trace для обитаемых планет
    if (habitablePlanets.length > 0) {
        const habitable = {
            x: habitablePlanets.map(p => p.temperature),
            y: habitablePlanets.map(p => p.radius),
            text: habitablePlanets.map(p => p.name),
            mode: 'markers',
            type: 'scatter',
            name: 'Потенциально обитаемые',
            marker: {
                size: habitablePlanets.map(p => Math.max(8, Math.min(15, p.esi * 15))),
                color: habitablePlanets.map(p => getHabitabilityColor(p.esi * 100)),
                opacity: habitablePlanets.map(p => getAtmosphereOpacity(p.density))
            }
        };
        traces.push(habitable);
    }
    
    // Создаем trace для необитаемых планет
    if (nonHabitablePlanets.length > 0) {
        const nonHabitable = {
            x: nonHabitablePlanets.map(p => p.temperature),
            y: nonHabitablePlanets.map(p => p.radius),
            text: nonHabitablePlanets.map(p => p.name),
            mode: 'markers',
            type: 'scatter',
            name: 'Необитаемые',
            marker: {
                size: nonHabitablePlanets.map(p => Math.max(6, Math.min(12, p.radius * 4))),
                color: nonHabitablePlanets.map(p => getPlanetColor(p.temperature)),
                opacity: nonHabitablePlanets.map(p => getAtmosphereOpacity(p.density))
            }
        };
        traces.push(nonHabitable);
    }
    
    // Добавляем зону обитаемости (habitable zone)
    const habitableZoneX = [200, 300, 300, 200, 200];
    const habitableZoneY = [0.5, 0.5, 2, 2, 0.5];
    
    const habitableZone = {
        x: habitableZoneX,
        y: habitableZoneY,
        fill: 'toself',
        fillcolor: 'rgba(0, 255, 100, 0.1)',
        line: {
            color: 'rgba(0, 255, 100, 0.5)'
        },
        type: 'scatter',
        mode: 'lines',
        name: 'Зона обитаемости'
    };
    
    traces.push(habitableZone);
    
    const layout = {
        title: '',
        xaxis: {
            title: 'Температура (K)',
            gridcolor: 'rgba(255, 255, 255, 0.1)',
            range: [150, Math.min(2000, Math.max(...data.map(p => p.temperature)) * 1.1)]
        },
        yaxis: {
            title: 'Радиус (R⊕)',
            gridcolor: 'rgba(255, 255, 255, 0.1)',
            range: [0, Math.min(5, Math.max(...data.map(p => p.radius)) * 1.1)]
        },
        hovermode: 'closest',
        showlegend: true,
        legend: {
            x: 0,
            y: 1,
            bgcolor: 'rgba(10, 10, 30, 0.7)',
            font: {
                color: '#fff'
            }
        },
        paper_bgcolor: 'rgba(10, 10, 30, 0.0)',
        plot_bgcolor: 'rgba(10, 10, 30, 0.0)',
        font: {
            color: '#fff'
        },
        margin: {
            l: 50,
            r: 30,
            t: 30,
            b: 50
        }
    };
    
    Plotly.newPlot('exoplanet-map', traces, layout, {responsive: true});
}

// Нормализация данных для радарного графика
function normalizeDataForRadar(planetData) {
    // Идеальные значения (Земля)
    const idealRadius = 1.0;
    const idealTemp = 288;
    const idealDensity = 5.51;
    
    // Диапазоны для нормализации
    const radiusRange = 2.0;    // ±2 радиуса Земли
    const tempRange = 100;      // ±100K от земной температуры
    const densityRange = 3.0;   // ±3 г/см³ от плотности Земли
    
    // Нормализация значений
    const normRadius = Math.max(0, 1 - Math.abs(planetData.radius - idealRadius) / radiusRange);
    const normTemp = Math.max(0, 1 - Math.abs(planetData.temperature - idealTemp) / tempRange);
    const normDensity = Math.max(0, 1 - Math.abs(planetData.density - idealDensity) / densityRange);
    const normHabitability = planetData.habitability_score / 100;  // Индекс обитаемости уже в шкале 0-100
    
    return {
        categories: ['Радиус', 'Температура', 'Плотность', 'Обитаемость'],
        values: [normRadius, normTemp, normDensity, normHabitability]
    };
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

// Отображение списка экзопланет в интерфейсе
function displayPlanetsList(planets) {
    const container = document.getElementById('exoplanets-list');
    if (!container) {
        console.error('Контейнер для списка экзопланет не найден');
        return;
    }
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    if (planets.length === 0) {
        container.innerHTML = '<p>Нет данных об экзопланетах, соответствующих критериям.</p>';
        return;
    }
    
    // Добавляем планеты в интерфейс
    planets.forEach(planet => {
        const habitabilityClass = planet.potentially_habitable ? 'habitable' : 'non-habitable';
        const esiValue = typeof planet.esi === 'number' ? planet.esi.toFixed(2) : planet.esi;
        
        const planetElement = document.createElement('div');
        planetElement.className = `planet-item ${habitabilityClass}`;
        
        // Преобразуем тип планеты для корректного отображения в CSS классе
        const typeClass = planet.type ? planet.type.toLowerCase().replace(/\s+/g, '-') : '';
        
        planetElement.innerHTML = `
            <h4>${planet.name}</h4>
            <p>Радиус: ${planet.radius} R⊕</p>
            <p>Температура: ${planet.temperature} K</p>
            <p>Плотность: ${planet.density} г/см³</p>
            <span class="planet-type ${typeClass}">${planet.type || 'Нет данных'}</span>
            <span class="esi-badge">ESI: ${esiValue}</span>
            <button class="analyze-item-btn glow-btn">Анализировать</button>
        `;
        
        // Добавляем обработчик для анализа планеты при клике на кнопку
        const analyzeBtn = planetElement.querySelector('.analyze-item-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', function() {
                // Заполняем форму данными выбранной планеты
                document.getElementById('planet-name').value = planet.name;
                document.getElementById('planet-radius').value = planet.radius;
                document.getElementById('planet-temp').value = planet.temperature;
                document.getElementById('planet-density').value = planet.density;
                
                // Запускаем анализ
                analyzePlanet();
                
                // Прокручиваем к форме анализа
                document.querySelector('.search-section').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
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

// Функция для перехода на страницу визуализации с параметрами текущей планеты
function navigateToDetailedVisualization(planetData) {
    // Кодируем данные планеты в URL параметры
    const params = new URLSearchParams({
        name: planetData.name || 'Неизвестная планета',
        radius: planetData.radius || 1,
        temperature: planetData.temperature || 288,
        density: planetData.density || 5.51,
        habitability: planetData.habitability_score || 50
    });
    
    // Переходим на страницу визуализации с параметрами
    window.location.href = `/visualization?${params.toString()}`;
}

// Загрузка и отображение данных распределения параметров
async function loadDistributionData(planetData) {
    const distributionElement = document.getElementById('distribution-chart');
    if (!distributionElement) {
        console.error('Элемент графика распределения не найден');
        return;
    }
    
    distributionElement.innerHTML = '<div class="loading">Загрузка данных...</div>';
    
    const parameter = document.getElementById('parameter-select').value;
    
    try {
        const response = await fetch('/api/visualization/parameter-distribution');
        const data = await response.json();
        
        // Очищаем контейнер перед созданием нового графика
        distributionElement.innerHTML = '';
        
        // Создаем график распределения
        await createDistributionChart(data, parameter, planetData);
    } catch (error) {
        console.error('Ошибка при загрузке данных распределения:', error);
        // Если не удалось получить данные с сервера, создаем простой график
        createSimpleDistributionChart(planetData, parameter);
    }
}

// Функция для создания простой диаграммы распределения (гистограммы)
async function createSimpleDistributionChart(planetData, parameter) {
    // Создаем трейс для гистограммы всех планет
    const allPlanetsTrace = {
        x: exoplanetsData.map(p => p[parameter]),
        type: 'histogram',
        name: 'Все экзопланеты',
        opacity: 0.7,
        marker: {
            color: 'rgba(100, 149, 237, 0.7)'
        },
        autobinx: true
    };
    
    // Создаем трейс для анализируемой планеты (вертикальная линия)
    const planetLine = {
        x: [planetData[parameter], planetData[parameter]],
        y: [0, 10], // Будет автоматически масштабироваться
        type: 'scatter',
        mode: 'lines',
        name: planetData.name,
        line: {
            color: 'rgba(255, 99, 71, 1)',
            width: 2,
            dash: 'dash'
        }
    };
    
    let title = '';
    let xaxisTitle = '';
    
    switch(parameter) {
        case 'radius':
            title = 'Распределение радиусов экзопланет';
            xaxisTitle = 'Радиус (R⊕)';
            break;
        case 'temperature':
            title = 'Распределение температур экзопланет';
            xaxisTitle = 'Температура (K)';
            break;
        case 'density':
            title = 'Распределение плотности экзопланет';
            xaxisTitle = 'Плотность (г/см³)';
            break;
        case 'esi':
            title = 'Распределение индекса обитаемости экзопланет';
            xaxisTitle = 'Индекс обитаемости (ESI)';
            break;
    }
    
    const layout = {
        title: '',
        xaxis: {
            title: xaxisTitle,
            gridcolor: 'rgba(255, 255, 255, 0.1)'
        },
        yaxis: {
            title: 'Количество экзопланет',
            gridcolor: 'rgba(255, 255, 255, 0.1)'
        },
        hovermode: 'closest',
        showlegend: true,
        legend: {
            x: 0,
            y: 1,
            bgcolor: 'rgba(10, 10, 30, 0.7)',
            font: {
                color: '#fff'
            }
        },
        paper_bgcolor: 'rgba(10, 10, 30, 0.0)',
        plot_bgcolor: 'rgba(10, 10, 30, 0.0)',
        font: {
            color: '#fff'
        },
        margin: {
            l: 50,
            r: 30,
            t: 30,
            b: 50
        }
    };
    
    Plotly.newPlot('distribution-chart', [allPlanetsTrace, planetLine], layout, {responsive: true});
}

// Создание графика сравнения ключевых параметров
async function createComparisonChart(planetData) {
    // Находим Землю и другие известные планеты для сравнения
    const earthLikeIndex = exoplanetsData.findIndex(p => p.name === "TRAPPIST-1e");
    const jupiterLikeIndex = exoplanetsData.findIndex(p => p.name === "WASP-12b");
    
    // Если не нашли в базе, используем планету с индексами 2 и 10
    const earthLike = earthLikeIndex !== -1 ? exoplanetsData[earthLikeIndex] : exoplanetsData[2];
    const jupiterLike = jupiterLikeIndex !== -1 ? exoplanetsData[jupiterLikeIndex] : exoplanetsData[10];
    
    // Формируем данные для сравнения
    const planets = [earthLike, jupiterLike, planetData];
    const categories = ['Радиус', 'Температура', 'Плотность', 'ESI'];
    
    // Формируем traceyы для каждой планеты
    const traces = planets.map(planet => {
        // Нормализуем температуру относительно оптимальной (273-288К)
        const normalizedTemp = Math.min(1, 288 / planet.temperature);
        
        // Нормализуем радиус относительно Земли (1.0)
        const normalizedRadius = Math.min(1, 1 / planet.radius);
        
        // Нормализуем плотность относительно плотности Земли (5.51 г/см³)
        const normalizedDensity = Math.min(1, planet.density / 5.51);
        
        return {
            x: categories,
            y: [
                planet.radius,
                planet.temperature,
                planet.density,
                planet.esi || 0
            ],
            type: 'bar',
            name: planet.name
        };
    });
    
    const layout = {
        title: '',
        xaxis: {
            title: '',
            gridcolor: 'rgba(255, 255, 255, 0.1)'
        },
        yaxis: {
            title: 'Значение',
            gridcolor: 'rgba(255, 255, 255, 0.1)',
            type: 'log'
        },
        barmode: 'group',
        showlegend: true,
        legend: {
            x: 0,
            y: 1,
            bgcolor: 'rgba(10, 10, 30, 0.7)',
            font: {
                color: '#fff'
            }
        },
        paper_bgcolor: 'rgba(10, 10, 30, 0.0)',
        plot_bgcolor: 'rgba(10, 10, 30, 0.0)',
        font: {
            color: '#fff'
        },
        margin: {
            l: 50,
            r: 30,
            t: 30,
            b: 50
        }
    };
    
    Plotly.newPlot('comparison-chart', traces, layout, {responsive: true});
}

// Функция сохранения результатов анализа
function saveResults() {
    // Получаем данные результатов
    const name = document.getElementById('result-name').textContent;
    const radius = document.getElementById('result-radius').textContent;
    const temperature = document.getElementById('result-temp').textContent;
    const density = document.getElementById('result-density').textContent;
    const habitability = document.getElementById('habitability-index').textContent;
    const assessment = document.getElementById('result-assessment').textContent;
    
    // Формируем текст отчета
    const reportText = `
Отчет по анализу экзопланеты: ${name}
---------------------------------------
Параметры планеты:
- Радиус: ${radius} R⊕
- Температура: ${temperature} K
- Плотность: ${density} г/см³

Результаты анализа:
- Индекс обитаемости: ${habitability}/100
- Заключение: ${assessment}

Отчет сгенерирован: ${new Date().toLocaleString()}
`;
    
    // Создаем файл для скачивания
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    // Создаем ссылку для скачивания
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `Анализ_${name.replace(/\s+/g, '_')}.txt`;
    
    // Добавляем ссылку в DOM и симулируем клик
    document.body.appendChild(a);
    a.click();
    
    // Удаляем ссылку
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
