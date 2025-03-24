import { onMount, onCleanup, createSignal } from 'solid-js';
import * as THREE from 'three';

const Scene3 = () => {
  let containerRef;
  let renderer, scene, camera;
  let videoPlane, overlayPlane;
  let animationFrameId;
  let videoElement; // Nueva referencia al elemento de video
  let isMounted = false; // Add this flag to track component lifecycle
  const duration = 5000; // 5 segundos para la transición
  const delay = 1500; // 1.5 seconds delay before starting the animation
  let startTime;
  let initialized = false; // Prevent multiple initializations

  const [showButton, setShowButton] = createSignal(false); // Estado para mostrar el botón
  const [buttonVisible, setButtonVisible] = createSignal(false); // Controla la visibilidad del botón
  const [zoomProgress, setZoomProgress] = createSignal(0); // Estado para el progreso del zoom
  const [sceneEnded, setSceneEnded] = createSignal(false); // Bandera para evitar múltiples transiciones
  const [buttonScale, setButtonScale] = createSignal(100); // Scale in percentage
  const maxButtonScale = 6000; // Maximum scale before transition
  const scaleIncrement = 330; // Scale increment per click

  const initScene = () => {
    if (!containerRef || initialized) return;
    initialized = true; // Mark as initialized
    isMounted = true; // Set mounted flag
    //console.log("Scene3: Inicializando escena...");

    // Crear la escena y la cámara
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const aspect = containerRef.clientWidth / containerRef.clientHeight;
    camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    // Crear el renderer y añadirlo al contenedor
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.clientWidth, containerRef.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.appendChild(renderer.domElement);

    // Crear el video y la textura
    const video = document.createElement('video');
    videoElement = video; // Guardar referencia al video
    video.src = 'tunel.mp4'; // Removido el slash inicial
    video.loop = true;
    video.muted = true;
    video.crossOrigin = 'anonymous'; // Añadir cross-origin

    // Manejar errores de carga del video
    video.onerror = (e) => {
      if (!isMounted) return; // Skip if component is unmounted
      console.error("Scene3: Error al cargar el video:", video.error);
      console.error("Código de error:", video.error.code);
      console.error("Mensaje de error:", video.error.message);
    };

    // Asegurarnos de que el video se cargue antes de crear la textura
    video.oncanplay = () => {
      if (!isMounted || !initialized) return; // Evitar reproducción si la escena ya no está activa
      //console.log("Scene3: Video cargado correctamente, iniciando reproducción.");
      video.play().catch(err => {
        if (isMounted) {
          console.error("Error reproduciendo video:", err);
        }
      });
    };

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    // Crear el plano que mostrará el video
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      transparent: true,
      opacity: 1,
    });
    videoPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    videoPlane.scale.set(3, 3, 1); // Inicia con escala 5 (500% zoom in)
    scene.add(videoPlane);

    // Crear un overlay negro que cubra el plano y se desvanezca
    const overlayGeometry = new THREE.PlaneGeometry(
      containerRef.clientWidth / containerRef.clientHeight * 10, 
      10
    );
    const overlayMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 1, // Comienza opaco
    });
    overlayPlane = new THREE.Mesh(overlayGeometry, overlayMaterial);
    overlayPlane.position.set(0, 0, 0.1); // Asegurarse de que el overlay esté delante del video
    scene.add(overlayPlane);

    startTime = performance.now();

    const animate = () => {
      if (!renderer || !scene || !camera) return;
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const elapsed = now - startTime;

      if (elapsed < delay) {
        // Keep the screen black during the delay
        overlayPlane.material.opacity = 1;
        renderer.render(scene, camera);
        return;
      }

      const progress = Math.min((elapsed - delay) / duration, 1);

      // Interpolar la escala del video de 5 a 2
      const scale = 20 - 18 * progress;
      videoPlane.scale.set(scale, scale, 2);

      // Interpolar la opacidad del overlay de 1 a 0
      overlayPlane.material.opacity = 1 - progress;

      renderer.render(scene, camera);
    };

    animate();
    window.addEventListener('resize', onResize);

    // Mostrar el botón después de 7 segundos
    setTimeout(() => {
      setShowButton(true);
      // Retrasamos un poco la visibilidad para asegurar una transición suave
      setTimeout(() => {
        setButtonVisible(true);
      }, 100);
    }, 7000);
  };

  const onResize = () => {
    if (!containerRef || !camera || !renderer) return;
    const width = containerRef.clientWidth;
    const height = containerRef.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  const handleButtonClick = () => {
    if (sceneEnded()) return;
    
    const newScale = buttonScale() + scaleIncrement;
    setButtonScale(newScale);

    if (newScale >= maxButtonScale) {
      //console.log("Botón alcanzó escala máxima, activando transición a Scene4...");
      activateScene4();
    }
  };

  const activateScene4 = () => {
    if (sceneEnded()) return; // Evitar múltiples activaciones
    setSceneEnded(true); // Marcar la escena como finalizada
  
    // Pre-activar Scene4 antes de iniciar la transición
    window.dispatchEvent(new CustomEvent('scene4Activate'));
    
    // Crear un overlay negro para la transición
    const overlayGeometry = new THREE.PlaneGeometry(1000, 1000);
    const overlayMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0, // Inicia transparente
    });
    const blackOverlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
    blackOverlay.position.set(0, 0, camera.position.z - 1); // Frente a la cámara
    scene.add(blackOverlay);
  
    const fadeStartTime = performance.now();
    const fadeDuration = 1000; // 1 segundo para el fade-in
  
    const fadeIn = () => {
      const elapsed = performance.now() - fadeStartTime;
      const progress = Math.min(elapsed / fadeDuration, 1);
      blackOverlay.material.opacity = progress;
  
      if (progress < 1) {
        requestAnimationFrame(fadeIn);
      } else {
        //console.log("Transición completada, cambiando a Scene4...");
        cleanupScene(); // Limpiar recursos de la escena actual
        window.dispatchEvent(new CustomEvent('changeScene', { detail: { nextScene: 'Scene4' } }));
      }
    };
  
    fadeIn();
  };
  

  const cleanupScene = () => {
    //console.log("Limpiando recursos de Scene3...");
    isMounted = false; // Mark as unmounted first

    if (videoElement) {
      try {
        videoElement.pause();
        videoElement.src = ''; // Clear source first
        videoElement.load(); // Force reload to clear buffer
        videoElement.oncanplay = null;
        videoElement.onerror = null;
        URL.revokeObjectURL(videoElement.src); // Clear any object URLs if used
        videoElement = null;
      } catch (error) {
        console.error("Error limpiando video:", error);
      }
    }

    if (renderer && renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
      renderer.dispose();
      renderer = null;
    }

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (scene) {
      scene.traverse(object => {
        if (object.material) {
          if (object.material.map) object.material.map.dispose();
          object.material.dispose();
        }
        if (object.geometry) object.geometry.dispose();
      });
      scene = null;
    }

    camera = null;
    videoPlane = null;
    overlayPlane = null;
    initialized = false;
  };

  onMount(() => {
    //console.log("Scene3 montado, esperando activación...");
    isMounted = true; // Set mounted flag
    const handleActivation = () => {
      if (initialized) return; // Evitar múltiples inicializaciones
      //console.log("Scene3: Evento de activación recibido");
      initScene();
    };

    window.addEventListener('scene3Activate', handleActivation);

    onCleanup(() => {
      isMounted = false; // Ensure this is set first
      //console.log("Scene3 desmontado, limpiando recursos...");
      window.removeEventListener('scene3Activate', handleActivation);
      window.removeEventListener('resize', onResize);
      cleanupScene();
    });
  });

  return (
    <div ref={el => containerRef = el} style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {showButton() && (
        <button onClick={handleButtonClick}>
          <img
            src="/ball.svg"
            alt="Interactive Ball"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              transform: `translate(-50%, -50%) scale(${buttonScale() / 100})`,
              "z-index": 1000,
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '30px',
              height: '30px',
              transition: 'opacity 2s ease-in-out, transform 0.5s ease-out', // Aumentado a 2s con ease-in-out
              opacity: buttonVisible() ? 1 : 0,
            }}           
          />
        </button>
      )}

    </div>
  );
};

export default Scene3;
