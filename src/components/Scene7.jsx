import { onMount, onCleanup, createSignal } from "solid-js";
import * as THREE from "three";

const Scene7 = () => {
  let containerRef;
  let renderer, scene, camera;
  let videoPlane, shapesGroup = null;
  let videoElement;
  let animationFrameId;
  const [showVideo, setShowVideo] = createSignal(true);
  const [typedText, setTypedText] = createSignal("");
  const [showHomeButton, setShowHomeButton] = createSignal(false);

  // Al finalizar el video se elimina el videoPlane y, tras 0.5s,
  // se agrega el grupo de figuras con fade‑in y transformación;
  // luego se inicia el efecto typewriter.
  const handleVideoEnd = () => {
    //console.log("Video ended, transitioning to shapes scene...");
    setShowVideo(false);
    if (videoPlane && scene) {
      scene.remove(videoPlane);
      videoPlane.geometry.dispose();
      videoPlane.material.dispose();
      videoPlane = null;
    }
    setTimeout(() => {
      shapesGroup = createShapes();
      // Inicializar opacidad a 0 para el fade‑in
      shapesGroup.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          obj.material.opacity = 0;
          obj.material.transparent = true;
        }
      });
      scene.add(shapesGroup);
      // Animar fade-in (1.5s) y luego la transformación,
      // al finalizar se inicia el efecto typewriter.
      animateFadeIn(shapesGroup, 1500, () => {
        animateGroupTransform(shapesGroup, 1500, () => {
          updateShapesGroup(); // Asegurar posicionamiento responsivo
          startTyping();
        });
      });
    }, 500);
  };

  // Animación de fade-in para el grupo: de opacidad 0 a 1 en "duration" ms.
  const animateFadeIn = (group, duration, callback) => {
    const startTime = performance.now();
    const fadeIn = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      group.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          obj.material.opacity = progress;
        }
      });
      if (progress < 1) {
        requestAnimationFrame(fadeIn);
      } else if (callback) {
        callback();
      }
    };
    fadeIn();
  };

  // Animación de transformación: reduce escala a la mitad y desplaza el grupo a (0, targetY, 0)
  // donde targetY se calcula en función del alto del frustum.
  const animateGroupTransform = (group, duration, callback) => {
    const startTime = performance.now();
    const initialScale = group.scale.clone();
    const targetScale = new THREE.Vector3(0.5, 0.5, 0.5);
    const initialPosition = group.position.clone();
    const cameraDistance = camera.position.z;
    const fov = camera.fov;
    const viewHeight = 2 * cameraDistance * Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const targetPosition = new THREE.Vector3(0, viewHeight / 2 - 1, 0);

    const transform = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      group.scale.lerpVectors(initialScale, targetScale, progress);
      group.position.lerpVectors(initialPosition, targetPosition, progress);
      if (progress < 1) {
        requestAnimationFrame(transform);
      } else if (callback) {
        callback();
      }
    };
    transform();
  };

  // Efecto typewriter: se escribe el texto letra por letra en 3.5 segundos.
  const startTyping = () => {
    const fullText = `This experience was crafted using web technologies such as Three.js, Solid.js, and Astro to swiftly create a proof of concept for a minimal interactive visual piece. A initial box of ideas to experiment with art and design as well express my creativity through new media like TouchDesigner, the Adobe Suite and many tools.

Feel free to explore more on my social media. Thank you for engaging and experimenting with me! ♡`;
    let index = 0;
    const totalDuration = 3500;
    const intervalTime = totalDuration / fullText.length;
    const typingInterval = setInterval(() => {
      index++;
      setTypedText(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(typingInterval);
        // Mostrar el botón de casa cuando se haya terminado de escribir el texto
        setShowHomeButton(true);
      }
    }, intervalTime);
  };

  const initScene = () => {
    if (!containerRef) {
      console.error("Container reference is null.");
      return;
    }
    //console.log("Initializing Scene7...");

    const width = containerRef.clientWidth || window.innerWidth;
    const height = containerRef.clientHeight || window.innerHeight;

    // Crear la escena y la cámara
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const aspect = width / height;
    camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    // Configurar el renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.appendChild(renderer.domElement);
    //console.log("Renderer configured and added to container.");

    // Crear el elemento video de forma programática y usarlo como textura
    videoElement = document.createElement("video");
    videoElement.src = "/3form.mp4";
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.onended = handleVideoEnd;
    videoElement.play();

    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    // Crear un plano para mostrar el video (relación 16:9)
    const videoGeometry = new THREE.PlaneGeometry(16, 9);
    videoPlane = new THREE.Mesh(
      videoGeometry,
      new THREE.MeshBasicMaterial({ map: videoTexture })
    );
    videoPlane.position.set(0, 0, 0);
    scaleToCover(videoPlane);
    scene.add(videoPlane);
    //console.log("Video plane added to scene.");

    animate();
    window.addEventListener("resize", onWindowResize);
  };

  // Función para escalar el video al estilo "cover" usando dimensiones del frustum.
  const scaleToCover = (object) => {
    const cameraDistance = camera.position.z;
    const viewHeight = 2 * cameraDistance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const viewWidth = viewHeight * camera.aspect;
    // La geometría del video es 16x9 (relación 16:9)
    const scaleFactor = Math.max(viewWidth / 16, viewHeight / 9);
    object.scale.set(scaleFactor, scaleFactor, 1);
  };

  // Actualiza el renderer, la cámara y reposiciona el grupo de figuras de forma responsiva.
  const onWindowResize = () => {
    if (!renderer || !camera || !containerRef) return;
    const width = containerRef.clientWidth || window.innerWidth;
    const height = containerRef.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    if (videoPlane) {
      scaleToCover(videoPlane);
    }
    updateShapesGroup();
    //console.log("Window resized, renderer, camera and shapes updated.");
  };

  // Actualiza la posición del grupo de figuras responsivamente.
  const updateShapesGroup = () => {
    if (shapesGroup && camera) {
      const cameraDistance = camera.position.z;
      const viewHeight = 2 * cameraDistance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      shapesGroup.position.y = viewHeight / 2 - 1;
    }
  };

  const createShapes = () => {
    //console.log("Creating shapes group...");
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Triángulo
    const triangleGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0.5, 0,
      -0.5, -0.5, 0,
      0.5, -0.5, 0
    ]);
    triangleGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    const triangle = new THREE.Mesh(triangleGeometry, material);
    triangle.position.set(1.5, 0, 0);
    group.add(triangle);

    // Cuadrado
    const squareGeometry = new THREE.PlaneGeometry(1, 1);
    const square = new THREE.Mesh(squareGeometry, material);
    square.position.set(0, 0, 0);
    group.add(square);

    // Círculo
    const circleGeometry = new THREE.CircleGeometry(0.5, 32);
    const circle = new THREE.Mesh(circleGeometry, material);
    circle.position.set(-1.5, 0, 0);
    group.add(circle);
       // Establecer escala inicial más pequeña
   group.scale.set(0.8, 0.8, 0.8); // Reduce el tamaño inicial al 80%
    return group;
  };

  const animate = () => {
    if (!renderer || !scene || !camera) {
      console.error("Renderer, scene, or camera is not initialized.");
      return;
    }
    animationFrameId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  const cleanupScene = () => {
    //console.log("Cleaning up Scene7...");
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (renderer) {
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }
    if (videoPlane) {
      videoPlane.geometry.dispose();
      videoPlane.material.dispose();
      videoPlane = null;
    }
    if (scene) {
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      scene = null;
    }
    camera = null;
    videoElement = null;
    shapesGroup = null;
    window.removeEventListener("resize", onWindowResize);
  };

  const activateScene = () => {
    //console.log("Scene7 activated.");
    initScene();
  };

  const deactivateScene = () => {
    //console.log("Scene7 deactivated.");
    cleanupScene();
  };

  window.addEventListener("scene7Activate", activateScene);
  window.addEventListener("scene7Deactivate", deactivateScene);

  onCleanup(() => {
    //console.log("Cleaning up event listeners for Scene7.");
    window.removeEventListener("scene7Activate", activateScene);
    window.removeEventListener("scene7Deactivate", deactivateScene);
    cleanupScene();
  });

  return (
    <div
      ref={(el) => (containerRef = el)}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Contenedor para el texto typewriter, centrado en la mitad inferior */}
      <div className={`typing-text ${typedText().length > 0 ? "active" : ""}`}>
        {typedText()}
      </div>
      {/* Botón con forma de casa, centrado debajo del texto, se muestra cuando finaliza el tipeo */}
      {showHomeButton() && (
        <a  
          href="https://blackars.com"
          target="_blank"
          rel="noopener noreferrer"
          className="home-button"
        >
          <svg width="60" height="60" viewBox="0 0 64 64">
            <path
              d="M32 12 L12 32 H20 V52 H44 V32 H52 Z"
              fill="none"
              stroke="#fff"
              strokeWidth="6"
            />
          </svg>
        </a>
      )}
      <style>
        {`
          .typing-text {
            position: absolute;
            bottom: 30%;
            left: 50%;
            transform: translate(-50%, 0);
            max-width: 90%;
            font-family: monospace;
            color: #ffffff;
            white-space: pre-wrap;
            font-size: 1.3em;
            text-align: center;
            opacity: 1;
            z-index: 1000;
          }
          .typing-text.active::after {
            content: '|';
            animation: blink 0.75s step-end infinite;
          }
          @keyframes blink {
            from, to { opacity: 0; }
            50% { opacity: 1; }
          }
          .home-button {
            position: absolute;
            bottom: 10%;
            left: 50%;
            transform: translate(-50%, 0);
            z-index: 10;
            text-decoration: none;
          }
          .home-button svg {
            display: block;
          }
        `}
      </style>
    </div>
  );
};

export default Scene7;
