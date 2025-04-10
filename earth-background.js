class EarthBackground {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        // Добавляем переменные для отслеживания мыши
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        
        // Добавляем переменные для масштабирования
        this.baseScale = 5;
        this.targetScale = this.baseScale;
        this.currentScale = this.baseScale;
        this.lastScrollTop = 0;
        
        this.init();
        this.createEarth();
        this.animate();
    }
    
    init() {
        // Настройка рендерера
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);
        document.getElementById('earth-bg').appendChild(this.renderer.domElement);
        
        // Настройка камеры
        this.camera.position.z = 15;
        
        // Добавление освещения
        const ambientLight = new THREE.AmbientLight(0x888888);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);
        
        // Добавляем обработчики событий
        document.addEventListener('mousemove', (event) => this.onMouseMove(event), false);
        window.addEventListener('resize', () => this.onWindowResize(), false);
        window.addEventListener('scroll', () => this.onScroll(), false);
    }
    
    onScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDelta = scrollTop - this.lastScrollTop;
        
        // Изменяем целевой масштаб в зависимости от направления скролла
        if (scrollDelta > 0) {
            // Скролл вниз - увеличиваем
            this.targetScale = Math.min(this.baseScale * 1.5, this.targetScale + 0.1);
        } else if (scrollDelta < 0) {
            // Скролл вверх - уменьшаем
            this.targetScale = Math.max(this.baseScale * 0.8, this.targetScale - 0.1);
        }
        
        this.lastScrollTop = scrollTop;
    }
    
    createEarth() {
        const textureLoader = new THREE.TextureLoader();
        
        // Загрузка всех текстур
        Promise.all([
            textureLoader.loadAsync('./textures/earth_texture.jpg'),
            textureLoader.loadAsync('./textures/earth_bump.jpg'),
            textureLoader.loadAsync('./textures/earth_specular.jpg'),
            textureLoader.loadAsync('./textures/clouds_texture.png')
        ]).then(([earthMap, bumpMap, specularMap, cloudsMap]) => {
            // Создаем Землю
            const earthGeometry = new THREE.SphereGeometry(1, 64, 64); // Базовый размер 1
            const earthMaterial = new THREE.MeshPhongMaterial({
                map: earthMap,
                bumpMap: bumpMap,
                bumpScale: 0.15,
                specularMap: specularMap,
                specular: new THREE.Color('white'),
                shininess: 50
            });
            
            this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
            this.earth.rotation.x = 0.4;
            this.earth.scale.set(this.baseScale, this.baseScale, this.baseScale);
            this.scene.add(this.earth);
            
            // Создаем облака
            const cloudsGeometry = new THREE.SphereGeometry(1.016, 64, 64); // Чуть больше базового размера
            const cloudsMaterial = new THREE.MeshPhongMaterial({
                map: cloudsMap,
                transparent: true,
                opacity: 0.3
            });
            
            this.clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
            this.clouds.rotation.x = 0.4;
            this.clouds.scale.set(this.baseScale, this.baseScale, this.baseScale);
            this.scene.add(this.clouds);
            
        }).catch(error => {
            console.error('Ошибка при загрузке текстур:', error);
            console.error('Путь к текстурам:', './textures/');
        });
    }
    
    onMouseMove(event) {
        this.mouseX = (event.clientX - this.windowHalfX) / 100;
        this.mouseY = (event.clientY - this.windowHalfY) / 100;
    }
    
    onWindowResize() {
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.earth && this.clouds) {
            // Плавное изменение масштаба
            this.currentScale += (this.targetScale - this.currentScale) * 0.05;
            this.earth.scale.set(this.currentScale, this.currentScale, this.currentScale);
            this.clouds.scale.set(this.currentScale, this.currentScale, this.currentScale);
            
            // Плавное вращение в зависимости от положения мыши
            this.targetRotationY += (this.mouseX * 0.02 - this.targetRotationY) * 0.01;
            this.targetRotationX += (this.mouseY * 0.02 - this.targetRotationX) * 0.01;
            
            this.earth.rotation.y += 0.001;
            this.earth.rotation.x = 0.4 + this.targetRotationX;
            this.earth.rotation.z = this.targetRotationY;
            
            this.clouds.rotation.y += 0.0012;
            this.clouds.rotation.x = 0.4 + this.targetRotationX;
            this.clouds.rotation.z = this.targetRotationY;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Инициализация после загрузки страницы
window.addEventListener('load', () => {
    const earthBg = new EarthBackground();
}); 