// Интерактивный космический фон
let scene, camera, renderer, stars = [];

// Инициализация Three.js
function initBackground() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 1;
    camera.rotation.x = Math.PI/2;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('space-background').appendChild(renderer.domElement);

    // Создаем звезды
    for(let i = 0; i < 10000; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(
                0.5 + Math.random() * 0.5,
                0.5 + Math.random() * 0.5,
                0.5 + Math.random() * 0.5
            )
        });
        const star = new THREE.Mesh(geometry, material);

        star.position.x = Math.random() * 2000 - 1000;
        star.position.y = Math.random() * 2000 - 1000;
        star.position.z = Math.random() * 2000 - 1000;

        scene.add(star);
        stars.push(star);
    }

    // Добавляем туманность
    const nebulaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            
            float noise(vec2 p) {
                return fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453);
            }
            
            void main() {
                vec2 uv = vUv;
                float n = noise(uv * 10.0 + time);
                vec3 color1 = vec3(0.27, 0.38, 0.99); // Синий
                vec3 color2 = vec3(0.4, 0.3, 0.7);    // Фиолетовый
                vec3 color = mix(color1, color2, n);
                gl_FragColor = vec4(color, 0.3);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    const nebulaGeometry = new THREE.PlaneGeometry(2000, 2000);
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    nebula.position.z = -500;
    scene.add(nebula);

    // Анимация
    function animate() {
        requestAnimationFrame(animate);

        // Вращаем звезды
        stars.forEach(star => {
            star.rotation.y += 0.002;
            star.rotation.z += 0.002;
        });

        // Обновляем время для шейдера туманности
        nebulaMaterial.uniforms.time.value += 0.001;

        renderer.render(scene, camera);
    }

    animate();

    // Обработка изменения размера окна
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Создаем контейнер для фона
    const backgroundContainer = document.createElement('div');
    backgroundContainer.id = 'space-background';
    backgroundContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
    `;
    document.body.prepend(backgroundContainer);

    // Инициализируем фон
    initBackground();
}); 