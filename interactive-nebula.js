class InteractiveNebula {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.className = 'interactive-nebula';
        document.body.appendChild(this.canvas);

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.mouseVelocityX = 0;
        this.mouseVelocityY = 0;

        // Цвета из нашей новой схемы
        this.colors = [
            { r: 99, g: 102, b: 241 },  // Индиго (primary)
            { r: 59, g: 130, b: 246 },  // Синий (secondary)
            { r: 236, g: 72, b: 153 },  // Розовый (accent)
            { r: 16, g: 185, b: 129 }   // Изумрудный (success)
        ];

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        // Создаем частицы небулы
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 3 + 2,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                vx: Math.random() * 0.1 - 0.05,
                vy: Math.random() * 0.1 - 0.05,
                originalX: Math.random() * this.width,
                originalY: Math.random() * this.height
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouseVelocityX = (e.clientX - this.lastMouseX) * 0.5;
            this.mouseVelocityY = (e.clientY - this.lastMouseY) * 0.5;
            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }

    drawParticle(particle) {
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius * 4
        );

        gradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.2)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
        this.ctx.fill();
    }

    updateParticle(particle) {
        // Расстояние от мыши до частицы
        const dx = this.mouseX - particle.x;
        const dy = this.mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Влияние движения мыши
        if (distance < 200) {
            const force = (200 - distance) / 200;
            particle.vx -= (dx / distance) * force * 0.01;
            particle.vy -= (dy / distance) * force * 0.01;
        }

        // Добавляем инерцию движения мыши
        particle.vx += this.mouseVelocityX * 0.0005;
        particle.vy += this.mouseVelocityY * 0.0005;

        // Возвращение к исходной позиции
        const homeForce = 0.005;
        particle.vx += (particle.originalX - particle.x) * homeForce;
        particle.vy += (particle.originalY - particle.y) * homeForce;

        // Затухание скорости
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Обновление позиции
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Границы экрана
        if (particle.x < 0) particle.x = this.width;
        if (particle.x > this.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.height;
        if (particle.y > this.height) particle.y = 0;
    }

    drawConnections() {
        this.ctx.strokeStyle = 'rgba(248, 250, 252, 0.02)';
        this.ctx.lineWidth = 0.5;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const opacity = (150 - distance) / 150 * 0.02;
                    this.ctx.strokeStyle = `rgba(248, 250, 252, ${opacity})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Обновляем и отрисовываем частицы
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
        });

        // Рисуем соединения между частицами
        this.drawConnections();

        requestAnimationFrame(() => this.animate());
    }
}

// Создаем стили для канваса
const style = document.createElement('style');
style.textContent = `
    .interactive-nebula {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -2;
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// Инициализируем небулу при загрузке страницы
window.addEventListener('load', () => {
    new InteractiveNebula();
}); 