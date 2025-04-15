class StarsBackground {
    constructor() {
        this.stars = [];
        this.shootingStars = [];
        this.numStars = 200; // Уменьшаем количество звёзд
        this.numShootingStars = 3; // Уменьшаем количество падающих звёзд
        this.container = document.querySelector('.stars');
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastTime = 0;
        this.shootingStarInterval = 3000; // Увеличиваем интервал
        this.lastShootingStarTime = 0;
        this.frameId = null;
        this.mouseMoveThrottle = false;
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        if (!this.container) return;
        this.container.innerHTML = '';
        
        // Создаем обычные звезды
        for (let i = 0; i < this.numStars; i++) {
            this.createStar();
        }
        
        // Создаем падающие звезды
        this.createShootingStars();
    }
    
    createStar() {
        const star = document.createElement('div');
        star.className = 'star';
        
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const z = Math.random() * 2; // Уменьшаем глубину для оптимизации
        const size = Math.random() * 1.5 + 0.5; // Уменьшаем размер звёзд
        const opacity = Math.random() * 0.4 + 0.2; // Уменьшаем яркость
        const twinkleDelay = Math.random() * 5;
        
        star.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            opacity: ${opacity};
            --delay: ${twinkleDelay};
            transform: translate3d(0, 0, ${z}px);
        `;
        
        this.container.appendChild(star);
        this.stars.push({
            element: star,
            x: x,
            y: y,
            z: z
        });
    }
    
    createShootingStars() {
        for (let i = 0; i < this.numShootingStars; i++) {
            setTimeout(() => this.createShootingStar(), i * 500);
        }
    }
    
    createShootingStar() {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        
        const startX = Math.random() * 100;
        const startY = -10;
        const angle = Math.random() * 30 + 30;
        const speed = Math.random() * 1.5 + 2; // Уменьшаем скорость
        const lifetime = Math.random() * 800 + 700; // Уменьшаем время жизни
        
        star.style.cssText = `
            left: ${startX}%;
            top: ${startY}%;
            transform: rotate(${angle}deg) translate3d(0, 0, 0);
        `;
        
        this.container.appendChild(star);
        this.shootingStars.push({
            element: star,
            startX: startX,
            startY: startY,
            angle: angle,
            speed: speed,
            progress: 0,
            lifetime: lifetime,
            startTime: performance.now()
        });
    }
    
    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            if (!this.mouseMoveThrottle) {
                this.mouseMoveThrottle = true;
                requestAnimationFrame(() => {
                    this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
                    this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
                    this.mouseMoveThrottle = false;
                });
            }
        }, { passive: true });
        
        window.addEventListener('resize', () => {
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            this.resizeTimeout = setTimeout(() => this.init(), 200);
        });
    }
    
    updateShootingStars(currentTime) {
        if (currentTime - this.lastShootingStarTime > this.shootingStarInterval) {
            this.createShootingStar();
            this.lastShootingStarTime = currentTime;
        }
        
        this.shootingStars = this.shootingStars.filter(star => {
            const elapsed = currentTime - star.startTime;
            if (elapsed > star.lifetime) {
                star.element.remove();
                return false;
            }
            
            star.progress = elapsed / star.lifetime;
            const distance = 120 * star.progress;
            const x = star.startX + distance * Math.cos((90 - star.angle) * Math.PI / 180);
            const y = star.startY + distance * Math.sin((90 - star.angle) * Math.PI / 180);
            
            star.element.style.transform = `translate3d(${x}%, ${y}%, 0) rotate(${star.angle}deg)`;
            return true;
        });
    }
    
    animate(currentTime) {
        if (!this.lastTime) this.lastTime = currentTime;
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime > 20) { // Уменьшаем частоту обновления до ~50 FPS
            this.stars.forEach(star => {
                const z = parseFloat(star.z);
                const offsetX = this.mouseX * (z * 10); // Уменьшаем множитель движения
                const offsetY = this.mouseY * (z * 10);
                
                star.element.style.transform = `translate3d(${offsetX}px, ${offsetY}px, ${z}px)`;
            });
            
            this.updateShootingStars(currentTime);
            this.lastTime = currentTime;
        }
        
        this.frameId = requestAnimationFrame((time) => this.animate(time));
    }
}

// Инициализация после загрузки страницы
window.addEventListener('load', () => {
    const starsBackground = new StarsBackground();
}); 