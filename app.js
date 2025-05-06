// Инициализация Three.js для 3D визуализации планеты
function initPlanet3D() {
    const container = document.getElementById('planet-3d');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Создание планеты
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('textures/planet-texture.jpg'),
        bumpMap: new THREE.TextureLoader().load('textures/planet-bump.jpg'),
        bumpScale: 0.05,
        specularMap: new THREE.TextureLoader().load('textures/planet-specular.jpg'),
        specular: new THREE.Color('grey'),
        emissive: new THREE.Color('#6366f1'),
        emissiveIntensity: 0.1
    });
    
    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);
    
    // Создание атмосферы
    const atmosphereGeometry = new THREE.SphereGeometry(5.2, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);
    
    // Освещение
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const light = new THREE.DirectionalLight(0x6366f1, 1);
    light.position.set(5, 3, 5);
    scene.add(light);
    
    camera.position.z = 15;
    
    // Управление орбитой
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 20;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
    
    // Анимация
    function animate() {
        requestAnimationFrame(animate);
        planet.rotation.y += 0.002;
        atmosphere.rotation.y += 0.001;
        controls.update();
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Функция для анализа параметров планеты
function analyzePlanet(params) {
    const { name, radius, temperature, density } = params;
    
    // Показываем анимацию анализа
    showAnalysisAnimation().then(() => {
        // Расчет индекса обитаемости
        const habitabilityScore = calculateHabitabilityScore(radius, temperature, density);
        
        // Обновление UI
        updateResults(name, habitabilityScore, params);
        
        // Показ секции результатов с анимацией
        const results = document.querySelector('.results');
        results.classList.remove('hidden');
        results.style.opacity = '0';
        results.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            results.style.transition = 'all 0.5s ease';
            results.style.opacity = '1';
            results.style.transform = 'translateY(0)';
        }, 100);
    });
}

// Анимация процесса анализа
function showAnalysisAnimation() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'analysis-overlay';
        overlay.innerHTML = `
            <div class="analysis-content card">
                <h3 class="gradient-text">Анализ данных</h3>
                <div class="analysis-steps">
                    <div class="step active">
                        <i class="fas fa-database"></i>
                        <span>Сбор данных</span>
                    </div>
                    <div class="step">
                        <i class="fas fa-microchip"></i>
                        <span>Обработка параметров</span>
                    </div>
                    <div class="step">
                        <i class="fas fa-chart-line"></i>
                        <span>Расчет показателей</span>
                    </div>
                </div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const steps = overlay.querySelectorAll('.step');
        const progressBar = overlay.querySelector('.progress-bar');
        let currentStep = 0;
        
        function nextStep() {
            if (currentStep > 0) {
                steps[currentStep - 1].classList.remove('active');
                steps[currentStep - 1].classList.add('completed');
            }
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('active');
                progressBar.style.width = `${(currentStep + 1) * (100 / steps.length)}%`;
                currentStep++;
                setTimeout(nextStep, 1000);
            } else {
                setTimeout(() => {
                    overlay.style.opacity = '0';
                    setTimeout(() => {
                        overlay.remove();
                        resolve();
                    }, 300);
                }, 500);
            }
        }
        
        setTimeout(nextStep, 500);
    });
}

// Расчет индекса обитаемости
function calculateHabitabilityScore(radius, temperature, density) {
    // Идеальные значения для Земли
    const idealTemp = 288; // K
    const idealRadius = 1.0; // R⊕
    const idealDensity = 1.0; // ρ⊕
    
    // Веса параметров
    const tempWeight = 0.4;
    const radiusWeight = 0.3;
    const densityWeight = 0.3;
    
    // Расчет отклонений от идеальных значений
    const tempScore = 1 - Math.abs(temperature - idealTemp) / idealTemp;
    const radiusScore = 1 - Math.abs(radius - idealRadius) / idealRadius;
    const densityScore = 1 - Math.abs(density - idealDensity) / idealDensity;
    
    // Взвешенная сумма
    return (tempScore * tempWeight + 
            radiusScore * radiusWeight + 
            densityScore * densityWeight);
}

// Обновление результатов в интерфейсе
function updateResults(name, habitabilityScore, params) {
    // Обновление имени планеты
    document.getElementById('planet-name').textContent = name;
    
    // Обновление индекса обитаемости с анимацией
    const scoreValue = document.querySelector('.score-value');
    const progressBar = document.querySelector('.progress-bar');
    
    let currentScore = 0;
    const duration = 1500;
    const increment = habitabilityScore / (duration / 16);
    
    function updateScore() {
        if (currentScore < habitabilityScore) {
            currentScore = Math.min(currentScore + increment, habitabilityScore);
            scoreValue.textContent = currentScore.toFixed(2);
            progressBar.style.width = `${currentScore * 100}%`;
            requestAnimationFrame(updateScore);
        }
    }
    
    requestAnimationFrame(updateScore);
    
    // Обновление параметров с анимацией
    const parameters = document.querySelectorAll('.parameter-card strong');
    parameters[0].textContent = `${params.radius} R⊕`;
    parameters[1].textContent = `${params.temperature} K`;
    parameters[2].textContent = `${params.density} ρ⊕`;
    
    // Инициализация графиков
    initCharts(params, habitabilityScore);
}

// Инициализация графиков
function initCharts(params, habitabilityScore) {
    // Настройка темной темы для Plotly
    const darkTheme = {
        paper_bgcolor: 'rgba(2, 6, 23, 0)',
        plot_bgcolor: 'rgba(2, 6, 23, 0)',
        font: {
            color: '#f8fafc'
        },
        grid: {
            color: 'rgba(248, 250, 252, 0.1)'
        }
    };
    
    // График сравнения с Землей
    const earthComparisonData = {
        type: 'scatterpolar',
        r: [params.radius, params.temperature / 288, params.density],
        theta: ['Радиус', 'Температура', 'Плотность'],
        fill: 'toself',
        name: 'Экзопланета',
        line: {
            color: '#6366f1'
        },
        fillcolor: 'rgba(99, 102, 241, 0.2)'
    };
    
    const earthData = {
        type: 'scatterpolar',
        r: [1, 1, 1],
        theta: ['Радиус', 'Температура', 'Плотность'],
        fill: 'toself',
        name: 'Земля',
        line: {
            color: '#10b981'
        },
        fillcolor: 'rgba(16, 185, 129, 0.2)'
    };
    
    const layout = {
        ...darkTheme,
        showlegend: true,
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 2]
            }
        }
    };
    
    Plotly.newPlot('earth-comparison-chart', [earthComparisonData, earthData], layout);
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация 3D визуализации
    initPlanet3D();
    
    // Обработка отправки формы
    const analyzeBtn = document.querySelector('.analyze-btn');
    analyzeBtn.addEventListener('click', () => {
        const name = document.querySelector('input[placeholder="Введите название"]').value;
        const radius = parseFloat(document.querySelector('input[placeholder="1.0"]').value);
        const temperature = parseFloat(document.querySelector('input[placeholder="288"]').value);
        const density = parseFloat(document.querySelector('input[placeholder="1.0"]').value);
        
        if (name && !isNaN(radius) && !isNaN(temperature) && !isNaN(density)) {
            analyzePlanet({ name, radius, temperature, density });
        } else {
            // Показываем ошибку с анимацией
            const inputs = document.querySelectorAll('.input');
            inputs.forEach(input => {
                if (!input.value) {
                    input.style.borderColor = 'var(--danger)';
                    input.style.animation = 'shake 0.5s ease';
                    setTimeout(() => {
                        input.style.borderColor = '';
                        input.style.animation = '';
                    }, 500);
                }
            });
        }
    });
    
    // Обработка ввода в поля
    const inputs = document.querySelectorAll('.input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });
});

// Добавляем анимацию тряски для невалидных полей
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`; 