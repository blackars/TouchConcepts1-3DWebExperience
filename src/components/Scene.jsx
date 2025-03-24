import { onMount, onCleanup, createSignal } from 'solid-js';
import * as THREE from 'three';
import './Scene.css';
import ParentComponent from './ParentComponent';

// No importamos Scene2 aquí, lo manejaremos a nivel del index.astro

const Scene = (props) => {
  let containerRef;
  let animationFrameId;
  let renderer;
  let scene;
  let camera;
  let cube;
  const smokeParticles = [];
  const [isSceneActive, setIsSceneActive] = createSignal(false);

  // Señal para controlar la visibilidad del modal
  const [showModal, setShowModal] = createSignal(false);
  
  // Variables para la interacción sobre el cubo
  let cubeShrinking = false;
  let shrinkStartTime = 0;
  const shrinkDuration = 2000; // 2 segundos para reducir el cubo

  // Variables para el overlay oscuro
  let darkOverlay = null;
  let darkOverlayFading = false;
  let darkOverlayStartTime = 0;
  const fadeDuration = 1000; // 1 segundo para fade in

  // Bandera para asegurarnos de llamar onSceneEnd solo una vez
  let sceneEnded = false;


  const initScene = () => {
    if (!containerRef || isSceneActive()) return;
    setIsSceneActive(true);
    //console.log('Initializing Three.js...');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Configurar cámara
    const aspect = containerRef.clientWidth / containerRef.clientHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    const initialZ = 300; // posición inicial alejada
    const targetZ = 5;    // posición objetivo (durante transición de cámara)
    camera.position.set(0, 0, initialZ);
    camera.lookAt(0, 0, 0);

    // Configurar renderer
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      precision: 'highp',
      powerPreference: 'high-performance'
    });
    renderer.setSize(containerRef.clientWidth, containerRef.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 1); // Fondo blanco en el renderer
    containerRef.innerHTML = '';
    containerRef.appendChild(renderer.domElement);

    // Crear el cubo
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x000000,
      roughness: 0.7,
      metalness: 0.2
    });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Agregar luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 2, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-2, 2, 3);
    scene.add(pointLight);

    //console.log('Scene initialized');

    // Transición de la cámara (7 segundos)
    const duration = 7000; // 7 segundos
    const camStartTime = performance.now();
    
    // Mostrar el modal después de 7 segundos
    setTimeout(() => {
      setShowModal(true);
      //console.log('Modal visibilidad activada - debería ser visible ahora');
    }, 7000);

    // Agregar listener para detectar clics y usar raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const handleClick = (event) => {
      // Convertir coordenadas de clic a NDC (Normalized Device Coordinates)
      const rect = containerRef.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cube);
      if (intersects.length > 0 && !cubeShrinking) {
        cubeShrinking = true;
        shrinkStartTime = performance.now();
      }
    };
    
    containerRef.addEventListener('click', handleClick);

    // Función de easing para la transición de la cámara (easeOutCubic)
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // Modificar la función animate para que solo se ejecute cuando la escena esté activa
    const animate = () => {
      if (!isSceneActive()) return;
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();

      // Transición de cámara: mover desde initialZ hasta targetZ en 7 segundos
      const elapsedCam = now - camStartTime;
      let camProgress = Math.min(elapsedCam / duration, 1);
      camProgress = easeOutCubic(camProgress);
      camera.position.z = THREE.MathUtils.lerp(initialZ, targetZ, camProgress);

      // Rotar el cubo (si aún no se ha iniciado su encogimiento)
      if (!cubeShrinking) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
      }

      // Encogimiento del cubo
      if (cubeShrinking) {
        const shrinkElapsed = now - shrinkStartTime;
        const shrinkProgress = Math.min(shrinkElapsed / shrinkDuration, 1);
        const newScale = THREE.MathUtils.lerp(1, 0.01, shrinkProgress);
        cube.scale.set(newScale, newScale, newScale);
        // Una vez terminado el encogimiento, iniciar overlay oscuro
        if (shrinkProgress >= 1 && !darkOverlayFading) {
          darkOverlayFading = true;
          darkOverlayStartTime = now;
          if (!darkOverlay) {
            const overlayGeometry = new THREE.PlaneGeometry(1000, 1000);
            const overlayMaterial = new THREE.MeshBasicMaterial({
              color: 0x000000,
              transparent: true,
              opacity: 0
            });
            darkOverlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
            // Colocar el overlay justo frente a la cámara
            darkOverlay.position.set(0, 0, camera.position.z - 1);
            scene.add(darkOverlay);
          }
        }
      }

      // Animar overlay oscuro: incrementar opacidad de 0 a 1 en fadeDuration
      if (darkOverlayFading && darkOverlay) {
        const fadeElapsed = now - darkOverlayStartTime;
        const fadeProgress = Math.min(fadeElapsed / fadeDuration, 1);
        darkOverlay.material.opacity = fadeProgress;
        // Cuando el overlay llega a opacidad 1, cerrar la escena y cambiar a Scene2
        if (fadeProgress === 1 && !sceneEnded) {
          sceneEnded = true;
          //console.log("Escena terminada, notificando para cambiar a Scene2");
          
          // Esperar un poco antes de notificar el cambio
          setTimeout(() => {
            // Limpiar recursos de la escena actual
            if (renderer) {
              renderer.dispose();
            }
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
            
            // Limpiar eventos
            containerRef.removeEventListener('click', handleClick);
            window.removeEventListener('resize', handleResize);
            
            // Notificar al componente padre que la escena ha terminado
            if (props.onSceneEnd) {
              props.onSceneEnd();
            }
            
            // Establecer una variable global para que el index.astro pueda detectar el cambio
            window.changeToScene2 = true;
            
            // Disparar un evento personalizado que puede ser capturado en index.astro
            window.dispatchEvent(new CustomEvent('changeScene', { detail: { nextScene: 'Scene2' } }));
          }, 500);
        }
      }

      // Actualizar las partículas de smoke (si existen)
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        const elapsed = now - p.startTime;
        const progress = elapsed / p.duration;
        if (progress < 1) {
          const scale = progress * 10;
          p.mesh.scale.set(scale, scale, 1);
          p.mesh.material.opacity = 1.0 - progress;
        } else {
          scene.remove(p.mesh);
          if (p.mesh.material.map) p.mesh.material.map.dispose();
          p.mesh.material.dispose();
          p.mesh.geometry.dispose();
          smokeParticles.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    // Iniciar la animación solo cuando se active la escena
    animate();
    //console.log('Animation started');

    // Manejar cambios de tamaño
    const handleResize = () => {
      if (!containerRef || !renderer || !camera) return;
      const width = containerRef.clientWidth;
      const height = containerRef.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    
    // Remove the onCleanup from here
    return { handleResize, handleClick }; // Return handlers for cleanup
  };

  onMount(() => {
    //console.log('Scene mounted');
    let cleanup = null;
    
    window.addEventListener('sceneActivated', () => {
      //console.log('Scene activated, initializing...');
      if (!isSceneActive()) {
        cleanup = initScene(); // Store returned handlers
      }
    });

    // Move cleanup here
    onCleanup(() => {
      if (cleanup) {
        window.removeEventListener('resize', cleanup.handleResize);
        containerRef?.removeEventListener('click', cleanup.handleClick);
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer) {
        renderer.dispose();
      }
    });
  });

  return (
    <div 
      ref={el => {
        containerRef = el;
        // Eliminar la inicialización automática aquí
        // Solo se iniciará cuando se reciba el evento sceneActivated
      }} 
      class="scene-container" 
      style={{
        "background-color": "#ffffff",
        "min-height": "100vh",
        "min-width": "100vw",
        "position": "relative"
      }}
    >
      {showModal() && (
        <div 
          class="modal-container"
          style={{
            "position": "absolute",
            "width": "100%",
            "height": "100%",
            "display": "flex",
            "justify-content": "center",
            "align-items": "center", 
            "z-index": "10"
          }}
        >
          <ParentComponent />
        </div>
      )}
    </div>
  );
};

export default Scene;

