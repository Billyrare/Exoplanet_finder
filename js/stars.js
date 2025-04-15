// Функция для создания звезды
function createStar() {
    const star = document.createElement('div');
    star.className = 'twinkling-star';
    
    // Случайное положение с учетом глубины
    const depth = Math.random() * 200 - 100; // от -100 до 100
    star.style.setProperty('--depth', `${depth}px`);
    
    // Добавляем небольшое смещение в зависимости от глубины
    const depthOffset = depth * 0.2;
    const x = Math.random() * 120 - 10 + depthOffset; // от -10% до 110%
    const y = Math.random() * 120 - 10 + depthOffset; // от -10% до 110%
    
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    
    // Размер зависит от глубины
    const baseSize = 1 + Math.random() * 2;
    const sizeWithDepth = baseSize * (1 - depth/200); // звезды дальше будут меньше
    star.style.width = `${sizeWithDepth}px`;
    star.style.height = `${sizeWithDepth}px`;
    
    // Яркость зависит от глубины
    const brightness = Math.max(0.3, 1 - Math.abs(depth)/100);
    star.style.opacity = brightness;
    
    // Случайная длительность анимации
    const duration = 3 + Math.random() * 4;
    star.style.setProperty('--duration', `${duration}s`);
    
    // Случайная задержка начала анимации
    star.style.animationDelay = `${Math.random() * 2}s`;
    
    return star;
}

// Функция для создания звездопада
function createShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    
    // Случайное начальное положение сверху экрана
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = '0';
    
    // Анимация падения
    star.animate([
        { transform: 'translateY(0) translateX(0)', opacity: 1 },
        { transform: 'translateY(100vh) translateX(100px)', opacity: 0 }
    ], {
        duration: 1000,
        easing: 'ease-out'
    }).onfinish = () => star.remove();
    
    return star;
}

// Инициализация звездного неба
function initStarryNight() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;
    
    // Создаем галактику
    const galaxy = document.createElement('div');
    galaxy.className = 'galaxy';
    starsContainer.appendChild(galaxy);
    
    const starsLayer = document.createElement('div');
    starsLayer.className = 'stars-layer';
    starsContainer.appendChild(starsLayer);
    
    // Добавляем начальные звезды
    const numberOfStars = Math.min(200, Math.floor(window.innerWidth * window.innerHeight / 8000));
    
    for (let i = 0; i < numberOfStars; i++) {
        const star = createStar();
        starsLayer.appendChild(star);
    }
    
    // Периодически обновляем звезды
    setInterval(() => {
        // Удаляем случайную старую звезду
        if (starsLayer.children.length > numberOfStars) {
            const randomIndex = Math.floor(Math.random() * starsLayer.children.length);
            starsLayer.children[randomIndex].remove();
        }
        
        // Добавляем новую звезду с небольшой вероятностью
        if (Math.random() < 0.3 && starsLayer.children.length < numberOfStars * 1.2) {
            const star = createStar();
            star.style.opacity = '0';
            starsLayer.appendChild(star);
            
            // Плавно показываем новую звезду
            requestAnimationFrame(() => {
                star.style.transition = 'opacity 1s';
                star.style.opacity = '';
            });
        }
    }, 2000);
    
    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
        const newNumberOfStars = Math.min(200, Math.floor(window.innerWidth * window.innerHeight / 8000));
        
        // Удаляем или добавляем звезды при необходимости
        while (starsLayer.children.length > newNumberOfStars) {
            starsLayer.lastChild.remove();
        }
        
        while (starsLayer.children.length < newNumberOfStars) {
            const star = createStar();
            starsLayer.appendChild(star);
        }
    });
    
    // Периодически создаем звездопад
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% шанс появления звездопада
            const shootingStar = createShootingStar();
            starsContainer.appendChild(shootingStar);
        }
    }, 2000);
}

// Запускаем после загрузки страницы
document.addEventListener('DOMContentLoaded', initStarryNight); 