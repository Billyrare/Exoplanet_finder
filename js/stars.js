// Создаем звезды для параллакс-эффекта
function createParallaxStars() {
    const starsContainer = document.querySelector('.stars');
    const starCount = 150; // Уменьшаем количество звезд

    // Очищаем контейнер
    starsContainer.innerHTML = '';

    // Создаем звезды
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Случайное положение
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Случайный размер (меньше чем раньше)
        const size = Math.random() * 2 + 0.5;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Случайная задержка анимации
        star.style.animationDelay = `${Math.random() * 10}s`;
        
        // Случайный цвет
        const colorType = Math.random();
        if (colorType < 0.7) { // 70% белых звезд
            star.style.background = 'rgba(255, 255, 255, 0.8)';
        } else if (colorType < 0.8) { // 10% голубых звезд
            star.style.background = 'rgba(204, 229, 255, 0.8)';
        } else if (colorType < 0.9) { // 10% желтых звезд
            star.style.background = 'rgba(255, 244, 179, 0.8)';
        } else { // 10% красноватых звезд
            star.style.background = 'rgba(255, 204, 204, 0.8)';
        }

        // Случайная продолжительность анимации
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        
        // Добавляем звезду в контейнер
        starsContainer.appendChild(star);
    }
}

// Обработчик движения мыши для параллакс-эффекта
function handleMouseMove(event) {
    const stars = document.querySelector('.stars');
    const mouseX = event.clientX / window.innerWidth;
    const mouseY = event.clientY / window.innerHeight;
    
    // Применяем эффект параллакса (уменьшаем смещение)
    stars.style.transform = `translate(${mouseX * 10}px, ${mouseY * 10}px)`;
}

// Добавляем стили для звезд
function addStarStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .star {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            box-shadow: 0 0 3px rgba(255, 255, 255, 0.3);
            animation: twinkle var(--duration, 3s) infinite ease-in-out;
        }

        @keyframes twinkle {
            0% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1); }
            100% { opacity: 0.3; transform: scale(0.8); }
        }
    `;
    document.head.appendChild(style);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    addStarStyles();
    createParallaxStars();
    document.addEventListener('mousemove', handleMouseMove);
}); 