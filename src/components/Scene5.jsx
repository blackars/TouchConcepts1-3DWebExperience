import { onMount, onCleanup, createSignal } from 'solid-js';
import * as THREE from 'three';

const Scene5 = (props) => {
  let containerRef;
  let renderer, scene, camera;
  let triangle;
  let animationFrameId;
  const [triangleScale, setTriangleScale] = createSignal(1);
  
  const initScene = () => {
    if (!containerRef) return;
    
    // Crear la escena y la cámara
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Cambiar fondo a blanco
    
    const aspect = containerRef.clientWidth / containerRef.clientHeight;
    camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    
    // Crear el renderer y añadirlo al contenedor
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.clientWidth, containerRef.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.appendChild(renderer.domElement);
    
    // Crear una geometría de triángulo (tres vértices)
    const geometry = new THREE.ConeGeometry(1, 2, 3, 1, true); // Asegurar simetría con segmentos adecuados
    
    // Material sencillo para el triángulo
    const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }); // Cambiar color del triángulo a negro
    triangle = new THREE.Mesh(geometry, material);
    triangle.scale.set(triangleScale(), triangleScale(), triangleScale()); // Escalar uniformemente en 3D
    scene.add(triangle);
    
    animate();
    window.addEventListener('resize', onResize);
  };

  const animate = () => {
    if (!triangle || !renderer || !scene || !camera) return;
    
    triangle.rotation.y += 0.01; // Rotar el triángulo sobre el eje Y
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  };
  
  const onResize = () => {
    if (!camera || !renderer || !containerRef) return;
    
    const width = containerRef.clientWidth;
    const height = containerRef.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  
  // Cada click incrementa la escala del triángulo
  const handleClick = () => {
    if (!triangle) return; // Ensure triangle is not null before proceeding

    // Incrementar la escala multiplicándola (por ejemplo, por 1.5 cada click)
    setTriangleScale(prev => {
      const newScale = prev * 1.5;
      triangle.scale.set(newScale, newScale, newScale); // Escalar uniformemente en los tres ejes
      //console.log(`Triángulo escala actual: ${newScale}`);
      
      // Si se alcanza la escala deseada (por ejemplo, >= 20), se dispara el cambio de escena
      if (newScale >= 20) {
        //console.log("Triángulo ha llenado la pantalla. Transición a la siguiente escena.");
        // Detener la animación y limpiar recursos
        cleanupScene();
        // Disparar evento para cambiar de escena (a Scene6)
        window.dispatchEvent(new CustomEvent('changeScene', { detail: { nextScene: 'Scene6' } }));
      }
      return newScale;
    });
  };
  
  const cleanupScene = () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (renderer) {
      renderer.dispose();
    }
    scene = null;
    camera = null;
    triangle = null;
  };
  
  onMount(() => {
    initScene();
    containerRef.addEventListener('click', handleClick);
  });
  
  onCleanup(() => {
    window.removeEventListener('resize', onResize);
    containerRef.removeEventListener('click', handleClick);
    cleanupScene();
  });
  
  return (
    <div ref={el => containerRef = el} style={{ width: '100vw', height: '100vh' }} />
  );
};

export default Scene5;
