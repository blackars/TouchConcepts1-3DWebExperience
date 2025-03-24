import { onMount, onCleanup, createSignal } from 'solid-js';
import * as THREE from 'three';

const Scene2 = (props) => {
  let containerRef;
  let animationFrameId;
  let renderer;
  let scene;
  let camera;
  let floor;
  let ball;
  let mousePos = new THREE.Vector2(0, 0);
  let raycaster = new THREE.Raycaster();
  let ballActive = false;
  let ballVelocity = new THREE.Vector3(0, 0, 0);
  const gravity = 0.005;
  const floorSize = 20; // Tamaño del suelo
  
  // Array para almacenar los círculos que aparecen en el suelo
  const circles = [];
  let nextCircleTime = 0;
  let score = 0;
  
  // Variables de señales (ya definidas en tu código)
  const [floorVisible, setFloorVisible] = createSignal(false);
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [isActive, setIsActive] = createSignal(false);
  const [ballReady, setBallReady] = createSignal(false);
  const [gameOver, setGameOver] = createSignal(false);
  const [gameWon, setGameWon] = createSignal(false);
  const [currentScore, setCurrentScore] = createSignal(0);
  const [showInstructions, setShowInstructions] = createSignal(false);
  
  // Variables para el plano GIF (ya existentes)
  let gifPlaneAdded = false;
  
  // NUEVAS VARIABLES PARA EL AGUJERO NEGRO
  let blackHoleAdded = false;
  let blackHole = null;
  let blackHoleStartTime = 0;
  const blackHoleDuration = 2000; // Tiempo en que crece rápidamente (1 seg)

  let videoPlane = null; // Reference to the video plane
  let blackOverlay = null; // Reference to the black overlay for scene transition
  let overlayFading = false; // Flag to track overlay fade
  let overlayStartTime = 0;
  const overlayFadeDuration = 1000; // 1 second for fade-in
  
  const initScene = () => {
    if (!containerRef) {
      console.error("Scene2: containerRef no disponible al inicializar");
      return;
    }

    if (isInitialized()) {
      //console.log("Scene2: ya inicializado, saltando inicialización");
      return;
    }
    
    setIsInitialized(true);

    // Configuración básica de la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Fondo negro

    // Configurar cámara
    const aspect = containerRef.clientWidth / containerRef.clientHeight;
    camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
    camera.position.set(0, 10, 15); // Posición elevada para ver el suelo
    camera.lookAt(0, 0, 0);

    // Configurar renderer
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      precision: 'highp',
      powerPreference: 'high-performance'
    });
    renderer.setSize(containerRef.clientWidth, containerRef.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1); // Fondo negro en el renderer

    // Crear el suelo con cuadrícula (inicialmente invisible)
    const planeGeometry = new THREE.PlaneGeometry(floorSize, floorSize, 20, 10);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0
    });
    floor = new THREE.Mesh(planeGeometry, planeMaterial);
    floor.rotation.x = -Math.PI / 2; // horizontal
    scene.add(floor);

    // Crear la bola (inicialmente no visible) 
    const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      shininess: 50,
      transparent: true,
      opacity: 0
    });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 5, 0);
    scene.add(ball);
    
    // Agregar luces
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0xff4444, 1);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    containerRef.innerHTML = '';
    containerRef.appendChild(renderer.domElement);
    
    // Función para crear un nuevo círculo
    const createCircle = () => {
      const halfSize = floorSize / 2 - 1;
      const x = Math.random() * floorSize - halfSize;
      const z = Math.random() * floorSize - halfSize;
      
      const circleGeometry = new THREE.CircleGeometry(1, 32);
      const circleColor = new THREE.Color(0x000000);
      const circleMaterial = new THREE.MeshStandardMaterial({
        color: circleColor,
        roughness: 0.2,
        metalness: 0.9
      });
      
      const circle = new THREE.Mesh(circleGeometry, circleMaterial);
      circle.rotation.x = -Math.PI / 2;
      circle.position.set(x, 0.01, z);
      scene.add(circle);
      circles.push({
        mesh: circle,
        createdAt: performance.now(),
        hit: false,
        lifetime: 5000 + Math.random() * 5000
      });
      return circle;
    };
    
    // Eventos de mouse para controlar la bola
    const handleMouseMove = (event) => {
      const rect = containerRef.getBoundingClientRect();
      mousePos.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    containerRef.addEventListener('mousemove', handleMouseMove);
    
    // Evento click para iniciar el juego
    const handleClick = (event) => {
      if (floorVisible() && ballReady() && !ballActive) {
        //console.log("Activando bola por click");
        ballActive = true;
        ballVelocity.y = -0.1;
        nextCircleTime = performance.now() + 1000;
        setShowInstructions(false);
      }
    };
    containerRef.addEventListener('click', handleClick);
    
    //console.log("Scene2: Inicializada completamente");

    // Función para comprobar colisiones entre la bola y los círculos
    const checkCircleCollisions = () => {
      if (!ballActive || !ballReady()) return;
      
      const ballPosition = ball.position.clone();
      const ballRadius = 0.5;
      
      for (let i = circles.length - 1; i >= 0; i--) {
        const circle = circles[i];
        if (!circle.hit) {
          const circlePosition = circle.mesh.position.clone();
          const distance = ballPosition.distanceTo(circlePosition);
          if (distance < ballRadius + 0.5 && Math.abs(ballPosition.y - circlePosition.y) < 0.5) {
            circle.hit = true;
            const startOpacity = circle.mesh.material.opacity || 1;
            const startScale = circle.mesh.scale.x;
            const fadeDuration = 300;
            const fadeStartTime = performance.now();
            const animateHit = () => {
              const elapsed = performance.now() - fadeStartTime;
              const progress = Math.min(elapsed / fadeDuration, 1);
              if (progress < 1) {
                circle.mesh.material.opacity = startOpacity * (1 - progress);
                const scaleX = startScale * (1 + progress * 0.5);
                const scaleY = startScale * (1 - progress * 0.8);
                circle.mesh.scale.set(scaleX, 1, scaleY);
                requestAnimationFrame(animateHit);
              } else {
                scene.remove(circle.mesh);
                circle.mesh.geometry.dispose();
                circle.mesh.material.dispose();
                circles.splice(i, 1);
                score++;
                setCurrentScore(score);
                const scoreDisplay = document.querySelector('.score-display');
                if (scoreDisplay) {
                  scoreDisplay.classList.add('updated');
                  setTimeout(() => scoreDisplay.classList.remove('updated'), 500);
                }
              }
            };
            animateHit();
          }
        }
      }
      
      for (let i = circles.length - 1; i >= 0; i--) {
        if (circles[i].hit && !circles[i].mesh.parent) {
          circles.splice(i, 1);
        }
      }
    };

    // Función de animación principal
    let sceneEnded = false; // Bandera para evitar múltiples transiciones

    const animate = () => {
      if (!renderer || !scene || !camera) return;
      const now = performance.now();
      
      // Animar fade-in del suelo y bola
      if (floorVisible()) {
        if (floor.material.opacity < 1) {
          floor.material.opacity += 0.005;
        } else {
          if (!ballReady()) {
            ball.material.opacity += 0.02;
            if (ball.material.opacity >= 1) {
              setBallReady(true);
            }
          }
        }
      }
      
      // Generar círculos periódicamente cuando el juego está activo
      if (ballActive && now >= nextCircleTime) {
        createCircle();
        const baseTime = score >= 15 ? 500 : 700;
        const randomExtra = score >= 10 ? Math.random() * 1000 : Math.random() * 2000;
        nextCircleTime = now + baseTime + randomExtra;
      }
      
      // Actualizar y eliminar círculos expirados
      for (let i = circles.length - 1; i >= 0; i--) {
        const circle = circles[i];
        if (!circle.hit && now - circle.createdAt > circle.lifetime) {
          const age = now - circle.createdAt;
          const fadeTime = 1000;
          const fadeProgress = Math.min((age - circle.lifetime) / fadeTime, 1);
          if (fadeProgress < 1) {
            circle.mesh.material.opacity = 1 - fadeProgress;
          } else {
            scene.remove(circle.mesh);
            circle.mesh.geometry.dispose();
            circle.mesh.material.dispose();
            circles.splice(i, 1);
          }
        }
      }
      
      // Actualizar la bola si está activa
      if (ballActive && ballReady()) {
        ballVelocity.y -= gravity;
        ball.position.y += ballVelocity.y;
        
        if (ball.position.y < 2) {
          raycaster.setFromCamera(mousePos, camera);
          const intersects = raycaster.intersectObject(floor);
          if (intersects.length > 0) {
            const targetX = intersects[0].point.x;
            const targetZ = intersects[0].point.z;
            ball.position.x += (targetX - ball.position.x) * 0.05;
            ball.position.z += (targetZ - ball.position.z) * 0.05;
          }
        }
        
        checkCircleCollisions();
        
        if (ball.position.y < -1) {
          const halfFloorSize = floorSize / 2;
          if (Math.abs(ball.position.x) > halfFloorSize || Math.abs(ball.position.z) > halfFloorSize) {
            setGameOver(true);
          } else {
            ball.position.y = 0;
            ballVelocity.y *= -0.6;
            if (Math.abs(ballVelocity.y) < 0.03) {
              ballVelocity.y = 0;
              ball.position.y = 0.5;
              if (score >= 60) {
                setGameWon(true);
              }
            }
          }
        }
      }
      
// Mostrar video al alcanzar 13 puntos con transición de opacidad
if (score >= 13 && !gifPlaneAdded) {
    gifPlaneAdded = true;
    //console.log("Se han alcanzado 13 puntos. Añadiendo plano con VideoTexture con transición de opacidad.");
    
    const gifPlaneGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
    
    // Crear un elemento video y configurarlo
    const video = document.createElement('video');
    video.src = '/portal.mp4'; // Asegúrate de que la ruta sea correcta
    video.loop = true;
    video.muted = true;
    video.play(); // Reproducir el video
    
    // Crear el VideoTexture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;
    
    // Crear el material usando el VideoTexture
    const gifPlaneMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      transparent: true,
      opacity: 0, // Inicia con opacidad 0
    });
    
    videoPlane = new THREE.Mesh(gifPlaneGeometry, gifPlaneMaterial);
    
    // Ajustar la posición: bajarlo para que se vea completo
    videoPlane.position.set(0, floorSize / 6, -floorSize - 5);
    
    // Orientarlo (por ejemplo, rotarlo en X y Z según lo necesites)
    videoPlane.rotation.x = -Math.PI / 6;
    videoPlane.rotation.z = Math.PI / 2;
    
    scene.add(videoPlane);
    //console.log("Plano con VideoTexture añadido a la escena.");
    // Animar la transición de opacidad
    const fadeStartTime = performance.now();
    const fadeInDuration = 1000; // 1 segundo para el fade-in
    const fadeIn = () => {
      const elapsed = performance.now() - fadeStartTime;
      const progress = Math.min(elapsed / fadeInDuration, 1);
      videoPlane.material.opacity = progress;
      if (progress < 1) {
        requestAnimationFrame(fadeIn);
      }
    };
    fadeIn();
}

// Mostrar agujero negro al alcanzar n puntos (después del video)
if (score >=25  && !blackHoleAdded) {
    blackHoleAdded = true;
    //console.log("Se han alcanzado 25 puntos. Añadiendo agujero negro.");
    blackHoleStartTime = now;
    
    const blackHoleGeometry = new THREE.CircleGeometry(0.5, 32); // Empieza pequeño
    const blackHoleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
    
    // Posicionar en el centro del suelo
    blackHole.rotation.x = -Math.PI / 2;
    blackHole.position.set(0, 0.02, 0);
    scene.add(blackHole);
  }
  
  // Animar el agujero negro para que crezca rápidamente
  if (blackHoleAdded && blackHole && !sceneEnded) {
    const elapsedHole = now - blackHoleStartTime;
    const growthFactor = 1 + (elapsedHole / blackHoleDuration) * 10; // Ajusta el factor si es necesario
    blackHole.scale.set(growthFactor, growthFactor, 1);
  
    if (growthFactor >= 25) {
      //console.log("Agujero negro alcanzó tamaño máximo. Preparando transición a Scene3.");
  
      if (!overlayFading) {
        overlayFading = true;
        overlayStartTime = performance.now();
  
        // Crear un overlay negro para la transición
        const overlayGeometry = new THREE.PlaneGeometry(1000, 1000);
        const overlayMaterial = new THREE.MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0, // Inicia transparente
        });
        blackOverlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
        blackOverlay.position.set(0, 0, camera.position.z - 1); // Frente a la cámara
        scene.add(blackOverlay);
      }
    }
  }
  
  // Animar el overlay negro para cubrir toda la pantalla
  if (overlayFading && blackOverlay) {
    const elapsedOverlay = performance.now() - overlayStartTime;
    const overlayProgress = Math.min(elapsedOverlay / overlayFadeDuration, 1);
    blackOverlay.material.opacity = overlayProgress;
  
    if (overlayProgress === 1 && !sceneEnded) {
      //console.log("Pantalla completamente negra. Transición a Scene3.");
      // Disparar evento para cambiar a Scene3
      window.dispatchEvent(new CustomEvent('changeScene', { detail: { nextScene: 'Scene3' } }));
      sceneEnded = true; // Marcar la escena como finalizada después de disparar el evento
    }
  }
  
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    //console.log('Animation started in Scene2');

    const handleResize = () => {
      if (!containerRef || !renderer || !camera) return;
      const width = containerRef.clientWidth;
      const height = containerRef.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    containerRef.addEventListener('mousemove', handleMouseMove);
    containerRef.addEventListener('click', handleClick);

    return { handleResize, handleMouseMove, handleClick }; // Return handlers for cleanup
  };
  
  const activateScene = () => {
    //console.log("Scene2: Activando escena");
    setIsActive(true);
    if (!isInitialized() && containerRef) {
      //console.log("Scene2: Inicializando durante activación");
      initScene();
    }
    setTimeout(() => {
      //console.log("Scene2: Mostrando suelo");
      setFloorVisible(true);
    }, 2000);
  };

  onMount(() => {
    //console.log('Scene2 montado, esperando activación...');
    let cleanup = null;

    const handleActivation = () => {
      //console.log("Scene2: Evento de activación recibido");
      cleanup = activateScene(); // Store returned handlers
    };

    window.addEventListener('scene2Activate', handleActivation);

    // Move cleanup here
    onCleanup(() => {
      //console.log("Scene2 desmontado, limpiando recursos...");
      window.removeEventListener('scene2Activate', handleActivation);
      if (cleanup) {
        window.removeEventListener('resize', cleanup.handleResize);
        containerRef?.removeEventListener('mousemove', cleanup.handleMouseMove);
        containerRef?.removeEventListener('click', cleanup.handleClick);
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer) {
        renderer.dispose();
        circles.forEach(circle => {
          if (circle.mesh) {
            scene.remove(circle.mesh);
            if (circle.mesh.geometry) circle.mesh.geometry.dispose();
            if (circle.mesh.material) circle.mesh.material.dispose();
          }
        });
      }
    });
  });

  return (
    <div 
      ref={el => {
        containerRef = el;
      }} 
      class="scene-container" 
      style={{
        "background-color": "#000000",
        "min-height": "100vh",
        "min-width": "100vw",
        "position": "relative"
      }}
    >
    </div>
  );
};

export default Scene2;
