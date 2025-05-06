// Enhanced stars background for our new theme
document.addEventListener('DOMContentLoaded', function() {
    const starsContainer = document.querySelector('.stars');
    const nebulaContainer = document.querySelector('.nebula');
    
    // Clear any existing stars and nebula
    while (starsContainer.firstChild) {
        starsContainer.removeChild(starsContainer.firstChild);
    }
    while (nebulaContainer.firstChild) {
        nebulaContainer.removeChild(nebulaContainer.firstChild);
    }
    
    // Generate stars with better looks
    createStars();
    
    // Create nebula
    createNebula();
    
    // Optional: Add subtle parallax effect on mouse move
    document.addEventListener('mousemove', function(e) {
        if (window.innerWidth > 768) { // Only on larger screens
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            parallaxEffect(mouseX, mouseY);
        }
    });
});

function createStars() {
    const starsContainer = document.querySelector('.stars');
    const numberOfStars = 200;
    
    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Random size (1-3px)
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random twinkle animation delay
        star.style.animationDelay = `${Math.random() * 3}s`;
        
        starsContainer.appendChild(star);
    }
}

function createNebula() {
    const nebulaContainer = document.querySelector('.nebula');
    const numberOfParticles = 50;
    
    for (let i = 0; i < numberOfParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'nebula-particle';
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        particle.style.animationDelay = `${Math.random() * 15}s`;
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.3;
        
        nebulaContainer.appendChild(particle);
    }
}

function calculateStarCount() {
    // Responsive star count based on screen size
    const baseCount = 100;
    const screenSizeFactor = Math.min(window.innerWidth, window.innerHeight) / 500;
    return Math.floor(baseCount * screenSizeFactor);
}

function addSpecialStars(container, count) {
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.classList.add('star', 'special');
        
        // Position
        const xPos = Math.random() * 100;
        const yPos = Math.random() * 100;
        
        // Apply styles
        star.style.left = `${xPos}%`;
        star.style.top = `${yPos}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        
        // Add to container
        container.appendChild(star);
    }
}

function parallaxEffect(mouseX, mouseY) {
    const stars = document.querySelectorAll('.star');
    const intensity = 30; // Lower for more subtle effect
    
    stars.forEach(star => {
        const depth = parseFloat(getComputedStyle(star).getPropertyValue('z-index')) || 0;
        const moveX = (mouseX - 0.5) * intensity * depth;
        const moveY = (mouseY - 0.5) * intensity * depth;
        
        star.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
}

// Add star styles if they don't exist in CSS
function addStarStyles() {
    if (!document.getElementById('star-styles')) {
        const style = document.createElement('style');
        style.id = 'star-styles';
        style.textContent = `
            .star {
                position: absolute;
                background-color: white;
                border-radius: 50%;
                animation: twinkle 5s ease-in-out infinite alternate;
            }
            
            .star.small {
                width: 1px;
                height: 1px;
                z-index: 1;
            }
            
            .star.medium {
                width: 2px;
                height: 2px;
                z-index: 2;
            }
            
            .star.large {
                width: 3px;
                height: 3px;
                z-index: 3;
            }
            
            .star.special {
                width: 4px;
                height: 4px;
                background: linear-gradient(45deg, rgba(255,255,255,1), rgba(150,150,255,0.8));
                box-shadow: 0 0 10px 2px rgba(255,255,255,0.7);
                z-index: 4;
                animation: pulse 3s ease-in-out infinite alternate;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Add styles and initialize on load
window.addEventListener('load', function() {
    addStarStyles();
});

// Handle window resize to adjust star count
window.addEventListener('resize', function() {
    // Debounce to avoid frequent redraws
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(function() {
        const starsContainer = document.querySelector('.stars');
        while (starsContainer.firstChild) {
            starsContainer.removeChild(starsContainer.firstChild);
        }
        createStars(starsContainer);
    }, 500);
}); 