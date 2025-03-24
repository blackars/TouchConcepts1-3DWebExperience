import { createSignal, onCleanup } from "solid-js";
import * as THREE from "three";

const Scene6 = () => {
  const [opacity, setOpacity] = createSignal(1);
  let renderer, material, videoElement, scene, camera, mesh;
  let sphere, sphereMaterial;
  let intensityInterval, vignetteInterval, sphereInterval;
  let animationFrameId;

  const initThreeJS = () => {
    if (!document.body) return; // Verificar que document.body existe

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    renderer = new THREE.WebGLRenderer();
    if (renderer) {
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);
    }

    const handleResize = () => {
      if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    const videoTexture = new THREE.VideoTexture(videoElement);

    material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: videoTexture },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uIntensity: { value: 0.0 },
        uVignetteProgress: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec2 uMouse;
        uniform float uIntensity;
        uniform float uVignetteProgress;
        varying vec2 vUv;
        
        void main() {
          vec2 coord = vUv;
          float dist = distance(coord, uMouse);
          float effect = smoothstep(0.0, 0.5, uIntensity) * (1.0 - smoothstep(0.0, 0.5, dist));
          coord += 0.2 * effect * normalize(uMouse - coord);
          
          vec4 color = texture2D(uTexture, coord);
          
          float vignette = smoothstep(0.3, 0.0, distance(vUv, vec2(0.5, 0.5)) * (1.0 - uVignetteProgress));
          color.rgb *= vignette;
          
          gl_FragColor = color;
        }
      `,
    });

    const plane = new THREE.PlaneGeometry(2, 2);
    mesh = new THREE.Mesh(plane, material);
    scene.add(mesh);

    animate();
  };

  const animate = () => {
    if (!renderer || !scene || !camera) return;
    animationFrameId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  const cleanupThreeJS = () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    clearInterval(intensityInterval);
    clearInterval(vignetteInterval);
    clearInterval(sphereInterval);

    if (renderer) {
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer = null;
    }
    if (scene) {
      if (mesh) scene.remove(mesh);
      if (sphere) {
        scene.remove(sphere);
        sphere.geometry.dispose();
        sphere.material.dispose();
        sphere = null;
      }
      scene = null;
    }
    material = null;
    mesh = null;
    sphereMaterial = null;
  };

  const addRotatingSphere = () => {
    const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true, // Enable transparency for fade-out
      opacity: 1.0, // Start fully visible
    });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.scale.set(0, 0, 0);
    scene.add(sphere);

    let scale = 0;
    const maxScale = 3;
    sphereInterval = setInterval(() => {
      if (scale < maxScale) {
        scale += 0.01;
        sphere.scale.set(scale, scale, scale);
      }
      sphere.rotation.y += 0.01;
    }, 16);
  };

  // Transición final: fade a negro y cambio de escena
  const startBlackTransition = () => {
    const overlayGeometry = new THREE.PlaneGeometry(1000, 1000);
    const overlayMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000, // Negro
      transparent: true,
      opacity: 0, // Comienza transparente
    });
    const blackOverlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
    // Asegurarse de que la cámara exista y la escena esté activa
    if (scene && camera) {
      blackOverlay.position.set(0, 0, camera.position.z - 1);
      scene.add(blackOverlay);
    } else {
      console.error("La escena o la cámara no existen");
      return;
    }

    const transitionDuration = 300; // Duración de 3 segundo
    const transitionStartTime = performance.now();

    const fadeSphereOut = () => {
      if (sphereMaterial) {
        let sphereOpacity = sphereMaterial.opacity;
        const sphereFadeInterval = setInterval(() => {
          if (sphereOpacity > 0.0) {
            sphereOpacity -= 0.02;
            sphereMaterial.opacity = Math.max(sphereOpacity, 0.0);
          } else {
            clearInterval(sphereFadeInterval);
            // Eliminar la esfera completamente después de desvanecerla
            if (sphere) {
              scene.remove(sphere);
              sphere.geometry.dispose();
              sphere.material.dispose();
              sphere = null;
              sphereMaterial = null;
            }
          }
        }, 50);
      }
    };

    fadeSphereOut(); // Trigger sphere fade-out before the black transition

    const animateBlackTransition = () => {
      const elapsed = performance.now() - transitionStartTime;
      const progress = Math.min(elapsed / transitionDuration, 1);
      overlayMaterial.opacity = progress;

      renderer.render(scene, camera);

      if (progress < 1) {
        requestAnimationFrame(animateBlackTransition);
      } else {
        //console.log("Transición a negro completa, cambiando a Scene7...");
        cleanupThreeJS();
        window.dispatchEvent(new CustomEvent("changeScene", { detail: { nextScene: "Scene7" } }));
      }
    };

    animateBlackTransition();
  };

  const activateScene = () => {
    videoElement = document.getElementById("fullscreen-video");
    videoElement.loop = true;
    videoElement.play();
    setOpacity(1);
    initThreeJS();

    // A los 3.6 segundos inicia la deformación y la esfera
    setTimeout(() => {
      let intensity = 0.0;
      intensityInterval = setInterval(() => {
        if (material && intensity < 1.0) {
          intensity += 0.01;
          material.uniforms.uIntensity.value = intensity;
        } else {
          clearInterval(intensityInterval);
        }
      }, 100);
    }, 3600);

    setTimeout(() => {
      addRotatingSphere();
    }, 3600);

    // Animación de viñeta a los 13.6 segundos
    setTimeout(() => {
      let vignetteProgress = 1.0;
      vignetteInterval = setInterval(() => {
        if (material && vignetteProgress > 0.0) {
          vignetteProgress -= 0.02;
          material.uniforms.uVignetteProgress.value = vignetteProgress;
        } else {
          clearInterval(vignetteInterval);
        }
      }, 50);
    }, 13600);

    // Fade out the sphere's wireframe 1.7 seconds before the scene closes
    setTimeout(() => {
      if (sphereMaterial) {
        let wireframeOpacity = sphereMaterial.opacity;
        const wireframeFadeInterval = setInterval(() => {
          if (wireframeOpacity > 0.0) {
            wireframeOpacity -= 0.02;
            sphereMaterial.opacity = Math.max(wireframeOpacity, 0.0);
          } else {
            clearInterval(wireframeFadeInterval);
          }
        }, 50);
      }
    }, 19700); // 20 seconds - 1.7 seconds = 18.3 seconds

    // Después de 20 segundos se inicia el fade-out y, al llegar a 0, la transición a negro
    setTimeout(() => {
      let fadeOpacity = 1.0;
      const fadeInterval = setInterval(() => {
        if (fadeOpacity > 0.0) {
          fadeOpacity -= 0.02;
          setOpacity(fadeOpacity);
        } else {
          clearInterval(fadeInterval);
          //console.log("Iniciando transición a negro para Scene7...");
          // No se limpia la escena aquí; se espera a que el overlay negro se ejecute
          startBlackTransition();
        }
      }, 50);
    }, 20000);
  };

  const deactivateScene = () => {
    setOpacity(0);
    if (videoElement) videoElement.pause();
    cleanupThreeJS();
  };

  window.addEventListener("scene6Activate", activateScene);
  window.addEventListener("scene6Deactivate", deactivateScene);

  onCleanup(() => {
    window.removeEventListener("scene6Activate", activateScene);
    window.removeEventListener("scene6Deactivate", deactivateScene);
    cleanupThreeJS();
  });

  return (
    <div>
      <video
        id="fullscreen-video"
        autoplay
        src="/rd.mp4"
        loop
        muted
        style={{
          display: "none",
          opacity: opacity(),
          transition: "opacity 2s ease-in-out",
          pointerEvents: "none",
        }}
      ></video>
    </div>
  );
};

export default Scene6;
