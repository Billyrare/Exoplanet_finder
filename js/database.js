// Глобальные переменные для страницы базы данных
let allPlanets = [];
let dbFilteredPlanets = [];
let currentPage = 1;
const planetsPerPage = 12; // Количество планет на странице

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация навигационного меню
    initNavMenu();
    
    // Загружаем данные об экзопланетах
    loadPlanetsData();
    
    // Инициализируем обработчики событий для элементов управления
    initDatabaseControls();
});

// Инициализация навигационного меню
function initNavMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            // Меняем иконку при открытии/закрытии меню
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
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
}

// Загрузка данных о планетах
async function loadPlanetsData() {
    showLoadingSpinner(true);
    
    try {
        // Сначала пытаемся получить данные с сервера
        try {
            const response = await fetch('/api/exoplanets');
            
            if (!response.ok) {
                throw new Error('Сервер недоступен');
            }
            
            const data = await response.json();
            allPlanets = data;
            console.log('Загружено планет из API:', allPlanets.length);
            setupDatabase(allPlanets);
            return;
        } catch (error) {
            console.warn('Не удалось загрузить данные с сервера:', error);
            console.warn('Попытка использовать локальные данные...');
        }
        
        // Если не удалось получить данные с сервера, пробуем локальные источники
        if (typeof exoplanetsDataSet !== 'undefined') {
            console.log('Найден датасет в глобальной переменной exoplanetsDataSet');
            allPlanets = exoplanetsDataSet.map(planet => ({...planet}));
            console.log('Загружено планет из датасета:', allPlanets.length);
            setupDatabase(allPlanets);
        } else if (window.exoplanetsDataSet) {
            console.log('Найден датасет в window.exoplanetsDataSet');
            allPlanets = window.exoplanetsDataSet.map(planet => ({...planet}));
            setupDatabase(allPlanets);
        } else if (window.exoplanetsData && window.exoplanetsData.length > 0) {
            console.log('Найден датасет в window.exoplanetsData');
            allPlanets = window.exoplanetsData.map(planet => ({...planet}));
            setupDatabase(allPlanets);
        } else {
            console.error('Датасет не найден нигде!');
            showErrorMessage('Не удалось загрузить данные о планетах.');
        }
    } catch (error) {
        console.error('Ошибка при инициализации базы данных:', error);
        showErrorMessage('Произошла ошибка при инициализации базы данных.');
    } finally {
        showLoadingSpinner(false);
    }
}

// Настройка интерфейса базы данных
function setupDatabase(planets) {
    if (!planets || planets.length === 0) {
        console.error('Нет данных для отображения в базе данных');
        return;
    }
    
    console.log('Настройка базы данных с', planets.length, 'планетами');
    
    // Инициализируем отфильтрованный список
    dbFilteredPlanets = [...planets];
    
    // Обновляем статистику
    updateStatistics(planets);
    
    // Отображаем первую страницу планет
    displayPlanetsPage(1);
    
    // Создаем графики для страницы базы данных
    createDatabaseCharts(planets);
}

// Обновление статистики
function updateStatistics(planets) {
    const totalPlanets = document.getElementById('total-planets');
    const habitablePlanets = document.getElementById('habitable-planets');
    const highEsiPlanets = document.getElementById('high-esi-planets');
    
    if (totalPlanets) {
        totalPlanets.textContent = planets.length;
    }
    
    if (habitablePlanets) {
        const count = planets.filter(planet => planet.potentially_habitable).length;
        habitablePlanets.textContent = count;
    }
    
    if (highEsiPlanets) {
        const count = planets.filter(planet => planet.esi >= 0.8).length;
        highEsiPlanets.textContent = count;
    }
}

// Отображение определенной страницы планет
function displayPlanetsPage(page) {
    currentPage = page;
    const planetsContainer = document.getElementById('exoplanets-list');
    
    if (!planetsContainer) {
        console.error('Контейнер для списка планет не найден');
        return;
    }
    
    // Очищаем контейнер
    planetsContainer.innerHTML = '';
    
    // Вычисляем индексы начала и конца для текущей страницы
    const startIndex = (page - 1) * planetsPerPage;
    const endIndex = Math.min(startIndex + planetsPerPage, dbFilteredPlanets.length);
    
    // Проверяем, есть ли планеты для отображения
    if (dbFilteredPlanets.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.innerHTML = `
            <i class="fas fa-search"></i>
            <p>Не найдено планет, соответствующих вашему запросу</p>
        `;
        planetsContainer.appendChild(emptyMessage);
        
        // Обновляем пагинацию
        updatePagination(0, 1);
        return;
    }
    
    // Отображаем планеты для текущей страницы
    for (let i = startIndex; i < endIndex; i++) {
        const planet = dbFilteredPlanets[i];
        const planetCard = createPlanetCard(planet);
        planetsContainer.appendChild(planetCard);
    }
    
    // Обновляем пагинацию
    const totalPages = Math.ceil(dbFilteredPlanets.length / planetsPerPage);
    updatePagination(dbFilteredPlanets.length, totalPages);
}

// Создание карточки планеты
function createPlanetCard(planet) {
    const habitabilityClass = planet.potentially_habitable ? 'habitable' : 'non-habitable';
    
    const planetElement = document.createElement('div');
    planetElement.className = `planet-item ${habitabilityClass}`;
    
    // Форматируем числовые значения
    const radius = typeof planet.radius === 'number' ? planet.radius.toFixed(2) : planet.radius;
    const density = typeof planet.density === 'number' ? planet.density.toFixed(1) : planet.density;
    const temperature = typeof planet.temperature === 'number' ? Math.round(planet.temperature) : planet.temperature;
    const esi = typeof planet.esi === 'number' ? planet.esi.toFixed(2) : planet.esi;
    const period = planet.orbital_period ? planet.orbital_period.toFixed(1) : 'Н/Д';
    const distance = planet.distance_ly ? planet.distance_ly.toFixed(1) : 'Н/Д';
    const age = planet.age_gy ? planet.age_gy.toFixed(1) : 'Н/Д';
    
    // Определяем иконку типа планеты
    let typeIcon = '';
    switch (planet.type) {
        case 'Землеподобная':
            typeIcon = 'fa-earth-americas';
            break;
        case 'Суперземля':
            typeIcon = 'fa-earth';
            break;
        case 'Мини-Нептун':
            typeIcon = 'fa-cloud';
            break;
        case 'Нептун':
            typeIcon = 'fa-water';
            break;
        case 'Газовый гигант':
            typeIcon = 'fa-circle';
            break;
        default:
            typeIcon = 'fa-globe';
    }
    
    // Определяем описание обитаемости
    let habitabilityDescription = '';
    if (planet.potentially_habitable) {
        if (planet.esi >= 0.9) {
            habitabilityDescription = 'Очень высокий потенциал обитаемости';
        } else if (planet.esi >= 0.8) {
            habitabilityDescription = 'Высокий потенциал обитаемости';
        } else {
            habitabilityDescription = 'Потенциально обитаемая';
        }
    } else {
        if (planet.esi >= 0.6) {
            habitabilityDescription = 'Умеренный потенциал обитаемости';
        } else if (planet.esi >= 0.4) {
            habitabilityDescription = 'Низкий потенциал обитаемости';
        } else {
            habitabilityDescription = 'Вероятно необитаема';
        }
    }
    
    planetElement.innerHTML = `
        <div class="planet-header">
            <h3><i class="fas ${typeIcon}"></i> ${planet.name}</h3>
            <span class="planet-type">${planet.type}</span>
        </div>
        <div class="planet-info">
            <div class="info-row">
                <span class="label">Радиус (R⊕):</span>
                <span class="value">${radius}</span>
            </div>
            <div class="info-row">
                <span class="label">Температура (K):</span>
                <span class="value">${temperature}</span>
            </div>
            <div class="info-row">
                <span class="label">Плотность (г/см³):</span>
                <span class="value">${density}</span>
            </div>
            <div class="info-row">
                <span class="label">ESI:</span>
                <span class="value ${planet.esi >= 0.8 ? 'high-esi' : ''}">${esi}</span>
            </div>
            <div class="info-row">
                <span class="label">Тип звезды:</span>
                <span class="value">${planet.star_type}</span>
            </div>
            <div class="info-row">
                <span class="label">Период обращения (дней):</span>
                <span class="value">${period}</span>
            </div>
            ${planet.distance_ly ? `
            <div class="info-row">
                <span class="label">Расстояние (св. лет):</span>
                <span class="value">${distance}</span>
            </div>
            ` : ''}
            ${planet.age_gy ? `
            <div class="info-row">
                <span class="label">Возраст (млрд. лет):</span>
                <span class="value">${age}</span>
            </div>
            ` : ''}
        </div>
        <div class="planet-habitability ${habitabilityClass}">
            <i class="fas ${planet.potentially_habitable ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            ${habitabilityDescription}
        </div>
    `;
    
    return planetElement;
}

// Обновление пагинации
function updatePagination(totalItems, totalPages) {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    if (prevButton) {
        prevButton.disabled = currentPage <= 1;
        prevButton.onclick = () => displayPlanetsPage(currentPage - 1);
    }
    
    if (nextButton) {
        nextButton.disabled = currentPage >= totalPages;
        nextButton.onclick = () => displayPlanetsPage(currentPage + 1);
    }
    
    if (pageInfo) {
        pageInfo.textContent = `Страница ${currentPage} из ${totalPages} (Всего: ${totalItems})`;
    }
}

// Сортировка планет
function sortPlanets(criterion) {
    switch (criterion) {
        case 'name':
            dbFilteredPlanets.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'radius':
            dbFilteredPlanets.sort((a, b) => a.radius - b.radius);
            break;
        case 'temperature':
            dbFilteredPlanets.sort((a, b) => a.temperature - b.temperature);
            break;
        case 'esi':
            dbFilteredPlanets.sort((a, b) => b.esi - a.esi);
            break;
        case 'distance':
            dbFilteredPlanets.sort((a, b) => {
                if (!a.distance_ly) return 1;
                if (!b.distance_ly) return -1;
                return a.distance_ly - b.distance_ly;
            });
            break;
        case 'period':
            dbFilteredPlanets.sort((a, b) => {
                if (!a.orbital_period) return 1;
                if (!b.orbital_period) return -1;
                return a.orbital_period - b.orbital_period;
            });
            break;
    }
    
    displayPlanetsPage(1);
}

// Инициализация элементов управления для базы данных
function initDatabaseControls() {
    // Поиск по имени
    const searchInput = document.getElementById('planet-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            filterPlanets(this.value);
        }, 300));
    }
    
    // Фильтр обитаемых планет
    const habitableCheckbox = document.getElementById('show-habitable');
    if (habitableCheckbox) {
        habitableCheckbox.addEventListener('change', function() {
            filterPlanets(searchInput ? searchInput.value : '');
        });
    }
    
    // Фильтр по типу планеты
    const typeFilter = document.getElementById('planet-type-filter');
    if (typeFilter) {
        // Заполняем уникальными типами планет
        const types = ['all', ...new Set(allPlanets.map(p => p.type))];
        typeFilter.innerHTML = types.map(type => 
            `<option value="${type}">${type === 'all' ? 'Все типы' : type}</option>`
        ).join('');
        
        typeFilter.addEventListener('change', function() {
            filterPlanets(searchInput ? searchInput.value : '');
        });
    }
    
    // Фильтр по типу звезды
    const starTypeFilter = document.getElementById('star-type-filter');
    if (starTypeFilter) {
        // Заполняем уникальными типами звезд
        const starTypes = ['all', ...new Set(allPlanets.map(p => p.star_type).filter(Boolean))];
        starTypeFilter.innerHTML = starTypes.map(type => 
            `<option value="${type}">${type === 'all' ? 'Все звезды' : type}</option>`
        ).join('');
        
        starTypeFilter.addEventListener('change', function() {
            filterPlanets(searchInput ? searchInput.value : '');
        });
    }
    
    // Слайдеры для фильтрации
    const esiRange = document.getElementById('esi-range');
    const radiusRange = document.getElementById('radius-range');
    const tempRange = document.getElementById('temp-range');
    
    [esiRange, radiusRange, tempRange].forEach(range => {
        if (range) {
            range.addEventListener('input', function() {
                // Обновляем отображение значения
                const valueDisplay = document.getElementById(`${this.id}-value`);
                if (valueDisplay) {
                    valueDisplay.textContent = this.value;
                }
                filterPlanets(searchInput ? searchInput.value : '');
            });
        }
    });
    
    // Сортировка
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortPlanets(this.value);
        });
    }
}

// Фильтрация планет
function filterPlanets(searchTerm = '') {
    const searchLower = searchTerm.toLowerCase();
    const showOnlyHabitable = document.getElementById('show-habitable').checked;
    const selectedType = document.getElementById('planet-type-filter').value;
    const selectedStarType = document.getElementById('star-type-filter').value;
    const esiRange = document.getElementById('esi-range').value;
    const radiusRange = document.getElementById('radius-range').value;
    const tempRange = document.getElementById('temp-range').value;
    
    dbFilteredPlanets = allPlanets.filter(planet => {
        // Поиск по имени
        const nameMatch = planet.name.toLowerCase().includes(searchLower);
        
        // Фильтр по обитаемости
        const habitableMatch = !showOnlyHabitable || planet.potentially_habitable;
        
        // Фильтр по типу планеты
        const typeMatch = selectedType === 'all' || planet.type === selectedType;
        
        // Фильтр по типу звезды
        const starTypeMatch = selectedStarType === 'all' || 
            (planet.star_type && planet.star_type.startsWith(selectedStarType));
        
        // Фильтр по ESI
        const esiMatch = planet.esi >= parseFloat(esiRange);
        
        // Фильтр по радиусу
        const radiusMatch = planet.radius <= parseFloat(radiusRange);
        
        // Фильтр по температуре
        const tempMatch = planet.temperature <= parseFloat(tempRange);
        
        return nameMatch && habitableMatch && typeMatch && starTypeMatch && 
               esiMatch && radiusMatch && tempMatch;
    });
    
    // Обновляем отображение
    displayPlanetsPage(1);
    updateStatistics(dbFilteredPlanets);
}

// Вспомогательные функции
function showLoadingSpinner(show) {
    const spinner = document.getElementById('loading-planets');
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

function showErrorMessage(message) {
    const container = document.getElementById('exoplanets-list');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <button class="retry-btn" onclick="loadPlanetsData()">Повторить</button>
            </div>
        `;
    }
}

// Создание графиков для страницы базы данных
function createDatabaseCharts(planets) {
    createPlanetsByTypeChart(planets);
    createHabitabilityDistributionChart(planets);
    createRadiusVsTempChart(planets);
}

// График распределения планет по типам
function createPlanetsByTypeChart(planets) {
    const container = document.getElementById('planets-by-type-chart');
    if (!container) return;
    
    // Собираем статистику по типам
    const typeCount = {};
    
    planets.forEach(planet => {
        const type = planet.type || 'Неизвестный тип';
        typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    const types = Object.keys(typeCount);
    const counts = types.map(type => typeCount[type]);
    
    // Цвета для различных типов планет
    const colors = [
        '#4DB6AC', '#7986CB', '#9575CD', '#4FC3F7', 
        '#FFD54F', '#FF8A65', '#A1887F', '#90A4AE'
    ];
    
    const data = [{
        type: 'bar',
        x: types,
        y: counts,
        marker: {
            color: colors.slice(0, types.length),
            line: {
                color: '#000',
                width: 1
            }
        }
    }];
    
    const layout = {
        title: 'Распределение экзопланет по типам',
        font: { color: '#fff' },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: {
            title: 'Тип планеты',
            color: '#fff',
            gridcolor: 'rgba(255,255,255,0.1)'
        },
        yaxis: {
            title: 'Количество',
            color: '#fff',
            gridcolor: 'rgba(255,255,255,0.1)'
        },
        margin: { t: 50, l: 80, r: 30, b: 100 }
    };
    
    const config = { responsive: true };
    
    Plotly.newPlot(container, data, layout, config);
}

// График распределения планет по обитаемости
function createHabitabilityDistributionChart(planets) {
    const container = document.getElementById('habitability-distribution');
    if (!container) return;
    
    const habitableCount = planets.filter(p => p.potentially_habitable).length;
    const nonHabitableCount = planets.length - habitableCount;
    
    const data = [{
        values: [habitableCount, nonHabitableCount],
        labels: ['Потенциально обитаемые', 'Необитаемые'],
        type: 'pie',
        marker: {
            colors: ['#4CAF50', '#F44336'],
            line: {
                color: '#000',
                width: 1
            }
        },
        textinfo: 'label+percent',
        textfont: {
            color: '#fff'
        },
        hoverinfo: 'label+value+percent'
    }];
    
    const layout = {
        font: { color: '#fff' },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 30, l: 30, r: 30, b: 30 }
    };
    
    const config = { responsive: true };
    
    Plotly.newPlot(container, data, layout, config);
}

// График зависимости радиуса от температуры
function createRadiusVsTempChart(planets) {
    const container = document.getElementById('radius-vs-temp');
    if (!container) return;
    
    // Подготавливаем данные
    const habitablePlanets = planets.filter(p => p.potentially_habitable);
    const nonHabitablePlanets = planets.filter(p => !p.potentially_habitable);
    
    // Создаем два набора данных: для обитаемых и необитаемых планет
    const habitableData = {
        x: habitablePlanets.map(p => p.temperature),
        y: habitablePlanets.map(p => p.radius),
        mode: 'markers',
        type: 'scatter',
        name: 'Потенциально обитаемые',
        marker: {
            color: '#4CAF50',
            size: 10,
            opacity: 0.7,
            line: {
                color: '#fff',
                width: 1
            }
        },
        hoverinfo: 'text',
        text: habitablePlanets.map(p => `${p.name}<br>Радиус: ${p.radius} R⊕<br>Температура: ${p.temperature} K<br>ESI: ${p.esi.toFixed(2)}`)
    };
    
    const nonHabitableData = {
        x: nonHabitablePlanets.map(p => p.temperature),
        y: nonHabitablePlanets.map(p => p.radius),
        mode: 'markers',
        type: 'scatter',
        name: 'Необитаемые',
        marker: {
            color: '#F44336',
            size: 8,
            opacity: 0.5,
            line: {
                color: '#fff',
                width: 1
            }
        },
        hoverinfo: 'text',
        text: nonHabitablePlanets.map(p => `${p.name}<br>Радиус: ${p.radius} R⊕<br>Температура: ${p.temperature} K<br>ESI: ${p.esi.toFixed(2)}`)
    };
    
    // Добавляем зону обитаемости
    const habitableZone = {
        x: [220, 220, 320, 320, 220],
        y: [0.5, 2, 2, 0.5, 0.5],
        mode: 'lines',
        type: 'scatter',
        fill: 'toself',
        fillcolor: 'rgba(76, 175, 80, 0.2)',
        line: {
            color: 'rgba(76, 175, 80, 0.8)',
            width: 2,
            dash: 'dash'
        },
        name: 'Зона обитаемости',
        hoverinfo: 'skip'
    };
    
    const data = [habitableZone, habitableData, nonHabitableData];
    
    const layout = {
        title: 'Зависимость радиуса от температуры',
        font: { color: '#fff' },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: {
            title: 'Температура (K)',
            color: '#fff',
            gridcolor: 'rgba(255,255,255,0.1)'
        },
        yaxis: {
            title: 'Радиус (R⊕)',
            color: '#fff',
            gridcolor: 'rgba(255,255,255,0.1)'
        },
        legend: {
            font: { color: '#fff' },
            x: 0,
            y: 1
        },
        margin: { t: 50, l: 80, r: 30, b: 80 }
    };
    
    const config = { responsive: true };
    
    Plotly.newPlot(container, data, layout, config);
}

// Функция для предотвращения частых вызовов
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 