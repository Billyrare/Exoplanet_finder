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
        // Проверяем доступность данных в основном скрипте
        if (typeof exoplanetsDataSet !== 'undefined') {
            console.log('Найден датасет в глобальной переменной exoplanetsDataSet');
            allPlanets = exoplanetsDataSet.map(planet => ({...planet}));
            console.log('Загружено планет из датасета:', allPlanets.length);
            setupDatabase(allPlanets);
        } else {
            console.warn('Глобальная переменная exoplanetsDataSet не найдена, попытка получить данные с сервера');
            try {
                // Пытаемся получить данные с сервера
                const response = await fetch('/api/exoplanets');
                
                if (!response.ok) {
                    throw new Error('Сервер недоступен');
                }
                
                const data = await response.json();
                allPlanets = data;
                setupDatabase(allPlanets);
            } catch (error) {
                console.error('Ошибка при загрузке данных с сервера:', error);
                console.warn('Поиск данных в других глобальных объектах...');
                
                // Проверяем другие возможные местоположения данных
                if (window.exoplanetsDataSet) {
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
            }
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
    
    // Форматируем плотность
    const density = typeof planet.density === 'number' ? planet.density.toFixed(1) : planet.density;
    
    // Добавляем тип планеты, если он есть
    const typeDisplay = planet.type ? 
        `<p class="planet-type ${planet.type.toLowerCase().replace(/\s+/g, '-')}">Тип: ${planet.type}</p>` : '';
    
    planetElement.innerHTML = `
        <h4>${planet.name}</h4>
        <p>Радиус: ${planet.radius} R⊕</p>
        <p>Температура: ${planet.temperature} K</p>
        <p>Плотность: ${density} г/см³</p>
        ${typeDisplay}
        <span class="esi-badge">ESI: ${typeof planet.esi === 'number' ? planet.esi.toFixed(2) : planet.esi}</span>
        <button class="glow-btn analyze-planet-btn" data-name="${planet.name}" data-radius="${planet.radius}" 
        data-temp="${planet.temperature}" data-density="${planet.density}">
            Анализировать <i class="fas fa-search"></i>
        </button>
    `;
    
    // Добавляем обработчик для кнопки анализа
    const analyzeBtn = planetElement.querySelector('.analyze-planet-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function() {
            // Перенаправление на главную страницу с параметрами для анализа
            const planetData = {
                name: this.dataset.name,
                radius: this.dataset.radius,
                temperature: this.dataset.temp,
                density: this.dataset.density
            };
            
            // Сохраняем данные в sessionStorage
            sessionStorage.setItem('planet_to_analyze', JSON.stringify(planetData));
            
            // Перенаправляем на главную страницу
            window.location.href = 'index.html#analyze';
        });
    }
    
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
    if (!dbFilteredPlanets || dbFilteredPlanets.length === 0) {
        console.warn('Нет планет для сортировки');
        return;
    }
    
    switch (criterion) {
        case 'esi':
            dbFilteredPlanets.sort((a, b) => (b.esi || 0) - (a.esi || 0));
            break;
        case 'radius':
            dbFilteredPlanets.sort((a, b) => (a.radius || 0) - (b.radius || 0));
            break;
        case 'temperature':
            dbFilteredPlanets.sort((a, b) => (a.temperature || 0) - (b.temperature || 0));
            break;
        case 'name':
        default:
            dbFilteredPlanets.sort((a, b) => {
                const nameA = a.name || '';
                const nameB = b.name || '';
                return nameA.localeCompare(nameB);
            });
    }
    
    // Отображаем первую страницу отсортированных планет
    displayPlanetsPage(1);
}

// Инициализация элементов управления для базы данных
function initDatabaseControls() {
    // Обработчик для поиска с кнопкой
    const searchInput = document.getElementById('db-search');
    const searchButton = document.getElementById('db-search-btn');
    
    if (searchInput && searchButton) {
        // Поиск при нажатии на кнопку
        searchButton.addEventListener('click', () => {
            console.log('Поиск по запросу:', searchInput.value);
            filterPlanets(searchInput.value);
        });
        
        // Поиск при нажатии Enter
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                console.log('Поиск по Enter:', searchInput.value);
                filterPlanets(searchInput.value);
            }
        });
    } else {
        console.error('Элементы поиска не найдены');
    }
    
    // Обработчик для выбора типа фильтрации
    const filterTypeSelect = document.getElementById('filter-type');
    if (filterTypeSelect) {
        filterTypeSelect.addEventListener('change', function() {
            console.log('Изменен тип фильтрации:', this.value);
            filterPlanets(searchInput ? searchInput.value : '');
        });
    } else {
        console.error('Элемент выбора типа фильтрации не найден');
    }
    
    // Обработчик для сортировки
    const sortButton = document.getElementById('sort-btn');
    if (sortButton) {
        sortButton.addEventListener('click', function() {
            const currentSort = this.getAttribute('data-sort');
            let newSort;
            
            // Меняем тип сортировки
            switch (currentSort) {
                case 'name':
                    newSort = 'esi';
                    this.innerHTML = '<i class="fas fa-sort"></i> По ESI';
                    break;
                case 'esi':
                    newSort = 'radius';
                    this.innerHTML = '<i class="fas fa-sort"></i> По радиусу';
                    break;
                case 'radius':
                    newSort = 'temperature';
                    this.innerHTML = '<i class="fas fa-sort"></i> По температуре';
                    break;
                case 'temperature':
                    newSort = 'name';
                    this.innerHTML = '<i class="fas fa-sort"></i> По имени';
                    break;
                default:
                    newSort = 'name';
                    this.innerHTML = '<i class="fas fa-sort"></i> По имени';
            }
            
            this.setAttribute('data-sort', newSort);
            console.log('Сортировка по:', newSort);
            sortPlanets(newSort);
        });
    } else {
        console.error('Элемент сортировки не найден');
    }
}

// Фильтрация планет
function filterPlanets(searchTerm = '') {
    if (!allPlanets || allPlanets.length === 0) {
        console.error('Нет данных для фильтрации');
        return;
    }
    
    const filterType = document.getElementById('filter-type');
    const selectedType = filterType ? filterType.value : 'all';
    
    console.log('Фильтрация планет. Поисковый запрос:', searchTerm, 'Тип:', selectedType);
    console.log('Всего планет перед фильтрацией:', allPlanets.length);
    
    // Фильтруем планеты
    dbFilteredPlanets = allPlanets.filter(planet => {
        // Фильтрация по поисковому запросу
        const nameMatch = !searchTerm || 
            planet.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Фильтрация по типу
        let typeMatch = true;
        
        if (selectedType !== 'all') {
            switch (selectedType) {
                case 'habitable':
                    typeMatch = planet.potentially_habitable === true;
                    break;
                case 'non-habitable':
                    typeMatch = planet.potentially_habitable !== true;
                    break;
                case 'earth-like':
                    typeMatch = planet.type && 
                        (planet.type.toLowerCase().includes('земн') || 
                         planet.type.toLowerCase().includes('earth'));
                    break;
                case 'super-earth':
                    typeMatch = planet.type && 
                        planet.type.toLowerCase().includes('суперземл');
                    break;
                case 'gas-giant':
                    typeMatch = planet.type && 
                        (planet.type.toLowerCase().includes('газов') || 
                         planet.type.toLowerCase().includes('гигант') ||
                         planet.type.toLowerCase().includes('юпитер'));
                    break;
            }
        }
        
        return nameMatch && typeMatch;
    });
    
    console.log('Планет после фильтрации:', dbFilteredPlanets.length);
    
    // Отображаем первую страницу отфильтрованных планет
    displayPlanetsPage(1);
    
    // Обновляем статистику
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