class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.moveSpeed = 0;
        this.parallaxStrength = 0.5;
        
        this.init();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }
    
    init() {
        document.querySelector('.stars').appendChild(this.canvas);
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        
        this.resize();
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Пересоздаем частицы при изменении размера
        this.createParticles();
    }
    
    createParticles() {
        this.particles = [];
        const numberOfParticles = Math.min(150, Math.floor((this.width * this.height) / 10000));
        
        for (let i = 0; i < numberOfParticles; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 1,
                speedX: Math.random() * 0.1 - 0.05,
                speedY: Math.random() * 0.1 - 0.05,
                opacity: Math.random() * 0.5 + 0.3,
                depth: Math.random() * 3 + 1
            });
        }
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            // Вычисляем скорость движения мыши
            this.moveSpeed = Math.hypot(this.mouseX - this.lastX, this.mouseY - this.lastY);
            this.lastX = this.mouseX;
            this.lastY = this.mouseY;
        });
    }
    
    createNebula(x, y, radius) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(63, 29, 186, 0.1)');
        gradient.addColorStop(0.4, 'rgba(42, 84, 245, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        return gradient;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Рисуем туманности
        this.ctx.fillStyle = this.createNebula(this.width * 0.3, this.height * 0.4, 300);
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = this.createNebula(this.width * 0.7, this.height * 0.6, 400);
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Рисуем частицы
        this.particles.forEach(particle => {
            const parallaxX = (this.mouseX - this.width/2) * particle.depth * this.parallaxStrength * 0.01;
            const parallaxY = (this.mouseY - this.height/2) * particle.depth * this.parallaxStrength * 0.01;
            
            this.ctx.beginPath();
            this.ctx.arc(
                particle.x + parallaxX,
                particle.y + parallaxY,
                particle.size,
                0,
                Math.PI * 2
            );
            
            // Добавляем свечение при движении мыши
            const glowIntensity = Math.min(0.3, this.moveSpeed * 0.01);
            const glow = this.ctx.createRadialGradient(
                particle.x + parallaxX,
                particle.y + parallaxY,
                0,
                particle.x + parallaxX,
                particle.y + parallaxY,
                particle.size * 2
            );
            
            glow.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity + glowIntensity})`);
            glow.addColorStop(0.4, `rgba(255, 255, 255, ${(particle.opacity + glowIntensity) * 0.6})`);
            glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = glow;
            this.ctx.fill();
        });
    }
    
    update() {
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Возвращаем частицы в пределы экрана
            if (particle.x < -50) particle.x = this.width + 50;
            if (particle.x > this.width + 50) particle.x = -50;
            if (particle.y < -50) particle.y = this.height + 50;
            if (particle.y > this.height + 50) particle.y = -50;
            
            // Пульсация прозрачности
            particle.opacity += Math.sin(Date.now() * 0.001 * particle.depth) * 0.002;
        });
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Создаем эффект падающих звезд
class ShootingStars {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.stars = [];
        this.lastStarTime = 0;
        this.minStarInterval = 4000; // Увеличиваем интервал между падающими звездами
        
        this.animate();
    }
    
    createStar() {
        const now = Date.now();
        if (now - this.lastStarTime < this.minStarInterval) return;
        
        const star = {
            x: Math.random() * this.canvas.width,
            y: 0,
            length: Math.random() * 80 + 50,
            speed: Math.random() * 8 + 5, // Уменьшаем скорость падающих звезд
            opacity: 1
        };
        
        this.stars.push(star);
        this.lastStarTime = now;
    }
    
    draw() {
        this.stars.forEach((star, index) => {
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            
            // Создаем градиент для следа звезды
            const gradient = this.ctx.createLinearGradient(
                star.x, star.y,
                star.x + star.length * Math.cos(Math.PI / 4),
                star.y + star.length * Math.sin(Math.PI / 4)
            );
            
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.lineTo(
                star.x + star.length * Math.cos(Math.PI / 4),
                star.y + star.length * Math.sin(Math.PI / 4)
            );
            this.ctx.stroke();
        });
    }
    
    update() {
        if (Math.random() < 0.02) this.createStar();
        
        this.stars.forEach((star, index) => {
            star.x += star.speed * Math.cos(Math.PI / 4);
            star.y += star.speed * Math.sin(Math.PI / 4);
            star.opacity -= 0.01;
            
            if (star.opacity <= 0 || star.y > this.canvas.height || star.x > this.canvas.width) {
                this.stars.splice(index, 1);
            }
        });
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Инициализация после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    const particleSystem = new ParticleSystem();
    const shootingStars = new ShootingStars(particleSystem.canvas);
}); 