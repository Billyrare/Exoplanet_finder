// Создаем Three.js сцену для космического фона
let scene, camera, renderer, stars;

// Инициализация сцены
function init() {
    // Создаем сцену
    scene = new THREE.Scene();

    // Настраиваем камеру
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Создаем рендерер
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Добавляем canvas в DOM
    document.querySelector('.space-bg').appendChild(renderer.domElement);

    // Создаем звезды
    createStars();

    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', onWindowResize, false);

    // Запускаем анимацию
    animate();
}

// Создание звезд
function createStars() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    // Создаем 2000 звезд с разными размерами и цветами
    for (let i = 0; i < 2000; i++) {
        vertices.push(
            Math.random() * 600 - 300, // x
            Math.random() * 600 - 300, // y
            Math.random() * 600 - 300  // z
        );

        // Случайный цвет с преобладанием белого
        const colorType = Math.random();
        if (colorType < 0.7) { // 70% белых звезд
            colors.push(1, 1, 1);
        } else if (colorType < 0.8) { // 10% голубых звезд
            colors.push(0.8, 0.9, 1);
        } else if (colorType < 0.9) { // 10% желтых звезд
            colors.push(1, 0.9, 0.7);
        } else { // 10% красноватых звезд
            colors.push(1, 0.8, 0.8);
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Материал для звезд
    const material = new THREE.PointsMaterial({
        size: 0.7,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });

    stars = new THREE.Points(geometry, material);
    scene.add(stars);
}

// Обработчик изменения размера окна
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Анимация
function animate() {
    requestAnimationFrame(animate);

    // Вращаем звезды
    if (stars) {
        stars.rotation.x += 0.0001;
        stars.rotation.y += 0.00005;
    }

    renderer.render(scene, camera);
}

// Инициализируем фон при загрузке страницы
document.addEventListener('DOMContentLoaded', init); 