import { onMount, onCleanup } from 'solid-js';
import * as THREE from 'three';

const Scene4 = () => {
  let containerRef;
  let renderer, scene, camera;
  let ball, platforms = [], triangle;
  let animationFrameId;
  let mouseX = 0;
  let gameStarted = false;
  let startTime;
  const platformSpeed = 0.01; // Reduced speed for smaller scale
  const gameDuration = 30000; // 30 seconds
  const ballRadius = 0.2; // Smaller ball radius
  const platformWidth = 1.5; // Smaller platform dimensions
  const platformHeight = 0.1;
  const platformDepth = 0.5;
  let fadeInOverlay; // Nueva variable para el overlay

  const initScene = () => {
    if (!containerRef) return;
    
    // Mostrar el contenedor inmediatamente
    containerRef.style.display = 'block';

    // Configurar escena y cámara
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const aspect = containerRef.clientWidth / containerRef.clientHeight;
    camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 0, 0);

    // Configurar renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.clientWidth, containerRef.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.appendChild(renderer.domElement);

    // Crear todos los elementos del juego inmediatamente
    initGameElements();

    // Crear y animar el overlay
    const overlayGeometry = new THREE.PlaneGeometry(100, 100);
    const overlayMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1
    });
    const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
    overlay.position.z = camera.position.z - 1;
    scene.add(overlay);

    // Establecer el tiempo de inicio del juego aquí
    startTime = performance.now();
    
    // Animación del overlay
    let fadeStartTime = performance.now();
    const fadeInDuration = 500; // 0.5 segundos

    function animateOverlay() {
      const now = performance.now();
      const progress = Math.max(0, Math.min(1, (now - fadeStartTime) / fadeInDuration));
      
      overlay.material.opacity = 1 - progress;

      if (progress < 0.5) {
        requestAnimationFrame(animateOverlay);
      } else {
        scene.remove(overlay);
        overlay.material.dispose();
        overlay.geometry.dispose();
        
        // Solo activar gameStarted, no reiniciar startTime
        gameStarted = true;
        animate();
      }
      renderer.render(scene, camera);
    }

    animateOverlay();
  };

  const initGameElements = () => {
    // Crear la bola
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 16, 16);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 5, 0);
    scene.add(ball);

    // Crear plataformas iniciales
    for (let i = 0; i < 8; i++) {
      createPlatform(-2 - i * 1.5);
    }

    // Configurar eventos
    containerRef.addEventListener('mousemove', handleMouseMove);
  };

  const createPlatform = (y) => {
    const platformGeometry = new THREE.BoxGeometry(platformWidth, platformHeight, platformDepth); // Smaller platforms
    const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(Math.random() * 3 - 1.5, y, 0); // Adjusted random range for smaller scale
    scene.add(platform);
    platforms.push(platform);
  };

  const handleMouseMove = (event) => {
    const rect = containerRef.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  };

  const handleTouchMove = (event) => {
    const rect = containerRef.getBoundingClientRect();
    const touch = event.touches[0]; // Usar el primer toque
    mouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
  };

  const resetScene = () => {
    //console.log("Reiniciando escena...");
    
    // Reiniciar la posición de la bola
    ball.position.set(0, 5, 0);
  
    // Eliminar todas las plataformas de la escena y del arreglo
    platforms.forEach(platform => scene.remove(platform));
    platforms = [];
  
    // Crear varias plataformas nuevamente
    for (let i = 0; i < 8; i++) { // Cambia 8 por la cantidad deseada
      createPlatform(-2 - i * 1.5); // Espaciadas verticalmente
    }
  
    // Reiniciar el tiempo de inicio
    startTime = performance.now();
  };

  const animate = () => {
    if (!gameStarted) return;
    
    const currentTime = performance.now();
    const elapsed = currentTime - startTime;

    // Mover la bola con el mouse
    ball.position.x = mouseX * 2.5; // Adjusted range for smaller scale

    // Aplicar gravedad a la bola solo si existen plataformas
    if (platforms.length > 0) {
      ball.position.y -= 0.02; // Adjusted gravity for smaller scale
    }

    // Mover plataformas hacia arriba
    platforms.forEach(platform => {
      platform.position.y += platformSpeed;
      if (platform.position.y > 5) {
        platform.position.y = -2;
        platform.position.x = Math.random() * 3 - 1.5; // Ajustar posición horizontal

        // Agregar una nueva plataforma al reciclar
        if (platforms.length < 10) { // Cambia 10 por la cantidad máxima deseada
          createPlatform(-2);
        }
      }
    });

    // Verificar colisiones con plataformas
    platforms.forEach(platform => {
      if (
        ball.position.y - ballRadius <= platform.position.y + platformHeight / 2 &&
        ball.position.y + ballRadius >= platform.position.y - platformHeight / 2 &&
        ball.position.x + ballRadius >= platform.position.x - platformWidth / 2 &&
        ball.position.x - ballRadius <= platform.position.x + platformWidth / 2
      ) {
        ball.position.y = platform.position.y + ballRadius + platformHeight / 2; // Adjust ball position
      }
    });

    // Reiniciar si la bola cae en el vacío
    if (ball.position.y < -5) {
      resetScene();
    }

    // Verificar si el tiempo del juego ha terminado
    if (elapsed >= gameDuration && !triangle) {
      //console.log("30 segundos alcanzados, creando triángulo");
      createTriangle();
    }

    // Verificar colisión con el triángulo
    if (triangle && ball.position.distanceTo(triangle.position) < ballRadius + 0.25) {
      //console.log("Triángulo alcanzado, iniciando transición a Scene5...");
      stopGameAndStartTransition(); // Detener el juego y comenzar la transición
      return; // Salir de la animación principal
    }

    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  };

  const stopGameAndStartTransition = () => {
    // Detener la animación principal
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    // Ocultar la bola y las plataformas
    scene.remove(ball);
    platforms.forEach(platform => scene.remove(platform));
    platforms = [];

    // Iniciar la transición al blanco
    startWhiteTransition();
  };

  const createTriangle = () => {
    if (triangle) return; // Evitar crear múltiples triángulos
    
    //console.log("Creando triángulo");
    const triangleGeometry = new THREE.ConeGeometry(0.5, 1, 3);
    const triangleMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0
    });
    triangle = new THREE.Mesh(triangleGeometry, triangleMaterial);
    triangle.position.set(0, -3, 0);
    scene.add(triangle);

    // Fade in del triángulo más lento y controlado
    let opacity = 0;
    const fadeInterval = setInterval(() => {
      opacity += 0.01;
      if (opacity >= 1) {
        clearInterval(fadeInterval);
        triangle.material.opacity = 1;
      } else {
        triangle.material.opacity = opacity;
      }
    }, 500);
  };

  const startWhiteTransition = () => {
    const overlayGeometry = new THREE.PlaneGeometry(1000, 1000);
    const overlayMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0, // Comienza transparente
    });
    const whiteOverlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
    whiteOverlay.position.set(0, 0, camera.position.z - 1); // Frente a la cámara
    scene.add(whiteOverlay);
  
    let transitionStartTime = performance.now();
  
    const animateWhiteTransition = () => {
      const elapsed = performance.now() - transitionStartTime;
      const progress = Math.min(elapsed / 1000, 1); // Transición de 1 segundo
  
      whiteOverlay.material.opacity = progress; // Incrementar opacidad
  
      renderer.render(scene, camera); // Renderizar la escena con el overlay
  
      if (progress < 1) {
        requestAnimationFrame(animateWhiteTransition);
      } else {
        //console.log("Transición completa, cambiando a Scene5...");
        window.dispatchEvent(new CustomEvent('changeScene', { detail: { nextScene: 'Scene5' } }));
      }
    };
  
    animateWhiteTransition();
  };

  const handleResize = () => {
    if (containerRef && renderer && camera) {
      const width = containerRef.clientWidth;
      const height = containerRef.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  };

  const handleSceneChange = (event) => {
    if (event.detail.nextScene === 'Scene4') {
      //console.log('Iniciando Scene4');
      initScene();
    }
  };

  onMount(() => {
    if (containerRef) {
      containerRef.addEventListener('mousemove', handleMouseMove);
      containerRef.addEventListener('touchmove', handleTouchMove);
    }
    window.addEventListener('resize', handleResize);
    window.addEventListener('changeScene', handleSceneChange);
  });

  onCleanup(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (containerRef) {
      containerRef.removeEventListener('mousemove', handleMouseMove);
      containerRef.removeEventListener('touchmove', handleTouchMove);
    }
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('changeScene', handleSceneChange);
    if (renderer) renderer.dispose();

    // Limpiar referencias
    scene = null;
    camera = null;
    ball = null;
    platforms = [];
    triangle = null;
  });

  return (
    <div
      ref={el => (containerRef = el)}
      style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'relative',
        display: 'none' // Inicialmente oculto
      }}
    />
  );
};

export default Scene4;
