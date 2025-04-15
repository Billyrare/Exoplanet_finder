// Enhanced interactive background with nebula effect
document.addEventListener('DOMContentLoaded', function() {
    // Create a canvas for the nebula effect
    createNebulaEffect();
    
    // Add smooth parallax effect on mouse movement
    if (window.innerWidth > 768) { // Only on desktop
        document.addEventListener('mousemove', function(e) {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            parallaxNebula(mouseX, mouseY);
        });
    }
});

function createNebulaEffect() {
    // Check if the nebula canvas already exists, if not create it
    if (!document.getElementById('nebula-canvas')) {
        const nebulaContainer = document.createElement('div');
        nebulaContainer.classList.add('nebula-container');
        nebulaContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            overflow: hidden;
            pointer-events: none;
        `;
        
        const nebulaCanvas = document.createElement('canvas');
        nebulaCanvas.id = 'nebula-canvas';
        nebulaCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.4;
            filter: blur(30px);
            transition: transform 0.5s ease-out;
        `;
        
        nebulaContainer.appendChild(nebulaCanvas);
        document.body.appendChild(nebulaContainer);
        
        // Initialize the canvas
        initNebulaCanvas();
    }
}

function initNebulaCanvas() {
    const canvas = document.getElementById('nebula-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match window
    resizeCanvas();
    
    // Create nebula clouds
    let clouds = [];
    
    // Theme colors matching our CSS variables
    const colorSchemes = [
        ['rgba(138, 43, 226, 0.2)', 'rgba(65, 105, 225, 0.15)', 'rgba(0, 191, 255, 0.1)'], // Purple, blue, cyan
        ['rgba(138, 43, 226, 0.15)', 'rgba(255, 0, 255, 0.08)', 'rgba(0, 191, 255, 0.1)'], // Purple, magenta, cyan
        ['rgba(65, 105, 225, 0.1)', 'rgba(0, 191, 255, 0.08)', 'rgba(138, 43, 226, 0.12)']  // Blue, cyan, purple
    ];
    
    // Generate initial clouds
    generateClouds();
    
    // Animation loop
    animateNebula();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        resizeCanvas();
        generateClouds(); // Regenerate on resize
    });
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function generateClouds() {
        clouds = [];
        const cloudCount = Math.max(3, Math.min(8, Math.floor(window.innerWidth / 400)));
        
        for (let i = 0; i < cloudCount; i++) {
            const colorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
            
            clouds.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: 100 + Math.random() * 200,
                colors: colorScheme,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                opacity: 0.05 + Math.random() * 0.2,
                rotate: Math.random() * Math.PI * 2,
                rotateSpeed: (Math.random() - 0.5) * 0.001
            });
        }
    }
    
    function drawCloud(cloud) {
        ctx.save();
        ctx.translate(cloud.x, cloud.y);
        ctx.rotate(cloud.rotate);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, cloud.radius);
        cloud.colors.forEach((color, i) => {
            gradient.addColorStop(i / (cloud.colors.length - 1), color);
        });
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.globalAlpha = cloud.opacity;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    function updateClouds() {
        clouds.forEach(cloud => {
            // Move clouds
            cloud.x += cloud.vx;
            cloud.y += cloud.vy;
            
            // Rotate clouds
            cloud.rotate += cloud.rotateSpeed;
            
            // Wrap around edges with buffer
            const buffer = cloud.radius;
            if (cloud.x < -buffer) cloud.x = canvas.width + buffer;
            if (cloud.x > canvas.width + buffer) cloud.x = -buffer;
            if (cloud.y < -buffer) cloud.y = canvas.height + buffer;
            if (cloud.y > canvas.height + buffer) cloud.y = -buffer;
        });
    }
    
    function animateNebula() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateClouds();
        
        // Draw clouds
        clouds.forEach(drawCloud);
        
        // Continue animation
        requestAnimationFrame(animateNebula);
    }
}

function parallaxNebula(mouseX, mouseY) {
    const nebulaCanvas = document.getElementById('nebula-canvas');
    if (!nebulaCanvas) return;
    
    // Calculate movement based on mouse position
    // Center is 0,0, edges are -1,1 (inverted for parallax effect)
    const moveX = (0.5 - mouseX) * 20; 
    const moveY = (0.5 - mouseY) * 20;
    
    // Apply movement with smooth transition
    nebulaCanvas.style.transform = `translate(${moveX}px, ${moveY}px)`;
}

// Add subtle animation for touch devices
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    function animateNebulaForTouch() {
        const time = Date.now() * 0.001;
        const moveX = Math.sin(time * 0.3) * 10;
        const moveY = Math.cos(time * 0.2) * 10;
        
        const nebulaCanvas = document.getElementById('nebula-canvas');
        if (nebulaCanvas) {
            nebulaCanvas.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
        
        requestAnimationFrame(animateNebulaForTouch);
    }
    
    window.addEventListener('load', animateNebulaForTouch);
} 