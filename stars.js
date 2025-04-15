// Enhanced stars background for our new theme
document.addEventListener('DOMContentLoaded', function() {
    const starsContainer = document.querySelector('.stars');
    
    // Clear any existing stars
    while (starsContainer.firstChild) {
        starsContainer.removeChild(starsContainer.firstChild);
    }
    
    // Generate stars with better looks
    createStars(starsContainer);
    
    // Optional: Add subtle parallax effect on mouse move
    document.addEventListener('mousemove', function(e) {
        if (window.innerWidth > 768) { // Only on larger screens
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            parallaxEffect(mouseX, mouseY);
        }
    });
});

function createStars(container) {
    const starCount = calculateStarCount();
    const starSizes = ['small', 'medium', 'large'];
    const minOpacity = 0.2;
    const maxOpacity = 0.9;
    
    // Create stars
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random position
        const xPos = Math.random() * 100;
        const yPos = Math.random() * 100;
        
        // Random size
        const sizeClass = starSizes[Math.floor(Math.random() * starSizes.length)];
        star.classList.add(sizeClass);
        
        // Random opacity
        const opacity = minOpacity + Math.random() * (maxOpacity - minOpacity);
        
        // Random twinkle animation delay
        const delay = Math.random() * 5; // 0-5s delay
        const duration = 3 + Math.random() * 5; // 3-8s duration
        
        // Apply styles
        star.style.left = `${xPos}%`;
        star.style.top = `${yPos}%`;
        star.style.opacity = opacity;
        star.style.animationDelay = `${delay}s`;
        star.style.animationDuration = `${duration}s`;
        
        // Add to container
        container.appendChild(star);
    }
    
    // Add a few special brighter stars
    addSpecialStars(container, Math.floor(starCount * 0.03)); // 3% of total stars
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