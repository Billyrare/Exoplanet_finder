let scene, camera, renderer, planet, atmosphere, stars;
const container = document.getElementById('hero-planet-container');

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Planet geometry
    const geometry = new THREE.SphereGeometry(0.8, 64, 64);
    
    // Planet material with custom shader
    const planetMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            varying vec3 vNormal;
            
            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }
            
            void main() {
                vec3 baseColor = vec3(0.2, 0.5, 0.8);
                vec3 highlightColor = vec3(0.4, 0.7, 1.0);
                
                float n = noise(vUv + time * 0.1);
                float pattern = smoothstep(0.4, 0.6, n);
                
                vec3 color = mix(baseColor, highlightColor, pattern);
                
                // Fresnel effect
                float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                color = mix(color, vec3(1.0), fresnel * 0.5);
                
                gl_FragColor = vec4(color, 1.0);
            }
        `
    });

    // Create planet mesh
    planet = new THREE.Mesh(geometry, planetMaterial);
    scene.add(planet);

    // Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(0.82, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec3 vNormal;
            
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
                gl_FragColor = vec4(atmosphereColor, intensity * 0.5);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Add stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.02,
        transparent: true
    });

    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10;
        const z = -Math.random() * 5;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation
    animate();
}

function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    // Rotate planet
    planet.rotation.y = time * 0.1;
    atmosphere.rotation.y = time * 0.12;

    // Update shader uniforms
    planet.material.uniforms.time.value = time;
    atmosphere.material.uniforms.time.value = time;

    // Subtle camera movement
    camera.position.y = Math.sin(time * 0.5) * 0.1;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 