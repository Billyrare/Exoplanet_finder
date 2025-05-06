// Aurora Borealis effect for the ExoPlanet Analyzer
document.addEventListener('DOMContentLoaded', function() {
    console.log("Aurora effect initializing...");
    
    // Make sure we have the navbar and hero section
    const navbar = document.querySelector('.navbar');
    const heroSection = document.querySelector('.hero-section');
    
    console.log("Found navbar:", navbar ? "Yes" : "No");
    console.log("Found hero section:", heroSection ? "Yes" : "No");
    
    // Create aurora containers if they don't exist
    createAuroraContainer('aurora-container');
    createAuroraContainer('hero-aurora');

    // Start the animation
    startAuroraAnimation();
    
    // Add subtle parallax effect on mouse move
    addParallaxEffect();
    
    // Add color shift on scroll 
    addScrollColorShift();
});

/**
 * Creates the aurora effect with multiple bands
 * @param {string} targetSelector - CSS selector for the target element
 * @param {string} containerClass - Class name for the aurora container
 */
function createAuroraContainer(className) {
    // Check if container already exists
    if (document.querySelector('.' + className)) {
        return; // Container already exists, skip creation
    }

    // Create container
    const container = document.createElement('div');
    container.className = className;

    // Create aurora bands
    for (let i = 0; i < 5; i++) {
        const band = document.createElement('div');
        band.className = 'aurora-band';
        container.appendChild(band);
    }

    // Add container to appropriate location
    if (className === 'aurora-container') {
        // Add to navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.insertBefore(container, navbar.firstChild);
        }
    } else if (className === 'hero-aurora') {
        // Add to hero section
        const hero = document.querySelector('.hero-section');
        if (hero) {
            hero.insertBefore(container, hero.firstChild);
        }
    }
}

function startAuroraAnimation() {
    // Get all aurora bands
    const bands = document.querySelectorAll('.aurora-band');
    
    // Add random movement to each band
    bands.forEach((band, index) => {
        // Add subtle random movement
        setInterval(() => {
            const randomX = (Math.random() - 0.5) * 2; // Random value between -1 and 1
            const randomScale = 1 + (Math.random() - 0.5) * 0.1; // Random scale between 0.95 and 1.05
            const randomSkew = (Math.random() - 0.5) * 2; // Random skew between -1 and 1
            
            // Apply smooth transition
            band.style.transition = 'transform 8s ease-in-out';
            band.style.transform = `
                translateX(${randomX}%)
                scale(${randomScale})
                skewX(${randomSkew}deg)
            `;
        }, 8000 + index * 1000); // Stagger the intervals for each band
    });
}

/**
 * Adds parallax effect to aurora bands on mouse movement
 */
function addParallaxEffect() {
    document.addEventListener('mousemove', function(e) {
        if (window.innerWidth <= 768) return; // Skip on mobile
        
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        const auroraBands = document.querySelectorAll('.aurora-band');
        const starFlares = document.querySelectorAll('.aurora-star-flare');
        
        // Apply parallax to aurora bands
        auroraBands.forEach((band, index) => {
            // Different sensitivity for different bands
            const moveFactorX = (index + 1) * 5;
            const moveFactorY = (index + 1) * 2.5;
            
            const moveX = mouseX * moveFactorX;
            const moveY = mouseY * moveFactorY;
            
            // Apply subtle movement
            band.style.transform = `translateX(${moveX}px) translateY(${moveY}px) skewX(${moveX/2}deg)`;
        });
        
        // Apply parallax to star flares (more sensitive)
        starFlares.forEach((flare) => {
            const moveFactorX = 30;
            const moveFactorY = 20;
            
            const moveX = mouseX * moveFactorX;
            const moveY = mouseY * moveFactorY;
            
            flare.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
}

/**
 * Changes aurora colors slightly based on scroll position
 */
function addScrollColorShift() {
    window.addEventListener('scroll', function() {
        // Get scroll position as percentage of page
        const scrollPos = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = scrollPos / maxScroll;
        
        // Hue rotation based on scroll position (0-30 degrees)
        const hueRotation = scrollPercent * 30;
        
        // Apply to all aurora bands
        const auroraBands = document.querySelectorAll('.aurora-band');
        auroraBands.forEach(band => {
            band.style.filter = `blur(20px) hue-rotate(${hueRotation}deg)`;
        });
        
        // Also shift star flares slightly
        const starFlares = document.querySelectorAll('.aurora-star-flare');
        starFlares.forEach(flare => {
            const currentOpacity = 0.5 + (scrollPercent * 0.3);
            flare.style.opacity = currentOpacity.toFixed(2);
        });
    });
}

/**
 * Adjusts the aurora effect on window resize
 */
window.addEventListener('resize', function() {
    // Adjust aurora container heights based on viewport
    const containers = document.querySelectorAll('.aurora-container, .hero-aurora');
    containers.forEach(container => {
        const parentHeight = container.parentElement.offsetHeight;
        container.style.height = `${parentHeight * 3}px`; // Make aurora 3x taller than parent
    });
});

// Optimize performance
document.addEventListener('visibilitychange', function() {
    const containers = document.querySelectorAll('.aurora-container, .hero-aurora');
    containers.forEach(container => {
        if (document.hidden) {
            container.style.animationPlayState = 'paused';
        } else {
            container.style.animationPlayState = 'running';
        }
    });
}); 