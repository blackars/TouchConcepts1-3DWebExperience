# TouchConcepts1-3DWebExperience

**TouchConcepts1-3DWebExperience** es una experiencia interactiva basada en tecnologías web modernas como **Three.js**, **Solid.js**, y **Astro**. Este proyecto combina gráficos 3D, animaciones y transiciones fluidas para crear una narrativa visual inmersiva.

## 🚀 Características

- **Gráficos 3D**: Renderizado con Three.js para crear escenas visualmente atractivas.
- **Transiciones entre escenas**: Navegación fluida entre múltiples escenas interactivas.
- **Interactividad**: Elementos interactivos como botones, animaciones y efectos visuales.
- **Música de fondo**: Audio integrado para complementar la experiencia del usuario.
- **Diseño modular**: Componentes reutilizables y bien organizados.

## 📂 Estructura del Proyecto

El proyecto sigue una estructura organizada para facilitar el desarrollo y la colaboración:

3DGame/ ├── .vscode/ # Configuración del entorno de desarrollo ├── .astro/ # Archivos generados por Astro ├── components preview/ # Recursos visuales para las escenas ├── public/ # Archivos estáticos (imágenes, videos, audio) ├── src/ # Código fuente del proyecto │ ├── components/ # Componentes de Solid.js │ ├── layouts/ # Layouts de Astro │ └── pages/ # Páginas de Astro ├── astro.config.mjs # Configuración de Astro ├── package.json # Dependencias y scripts del proyecto ├── tsconfig.json # Configuración de TypeScript └── README.md # Documentación del proyecto


### 📁 Directorios Clave

- **`src/components/`**: Contiene los componentes de cada escena (`Scene1.jsx`, `Scene2.jsx`, etc.) y otros elementos interactivos como `ChatModal` y `BackgroundMusic`.
- **`public/`**: Archivos estáticos como videos (`portal.mp4`, `tunel.mp4`), imágenes (`ball.svg`), y música (`bgmusic.mp3`).
- **`src/pages/index.astro`**: Página principal que organiza las escenas y maneja las transiciones entre ellas.

## 🛠️ Tecnologías Utilizadas

- **[Astro](https://astro.build/)**: Framework para construir sitios web rápidos y modernos.
- **[Solid.js](https://solidjs.com/)**: Biblioteca para construir interfaces de usuario reactivas.
- **[Three.js](https://threejs.org/)**: Biblioteca para renderizado 3D en la web.
- **TypeScript**: Tipado estático para un desarrollo más seguro y escalable.

## ⚙️ Configuración y Ejecución

### 1. Clonar el Repositorio

```bash
git clone https://github.com/blackars/TouchConcepts1-3DWebExperience.git
cd TouchConcepts#1-3D-web-experience

2. Instalar Dependencias
Asegúrate de tener Node.js instalado. Luego, ejecuta:

3. Ejecutar el Servidor de Desarrollo
Inicia el servidor de desarrollo con:

El proyecto estará disponible en http://localhost:4321.

4. Construir para Producción
Para generar los archivos estáticos listos para producción:

Los archivos generados estarán en el directorio dist/.

5. Previsualizar la Construcción
Para previsualizar la versión de producción:

🎮 Cómo Jugar
Inicio: La experiencia comienza con una advertencia interactiva en la página de inicio.
Escenas: Navega a través de múltiples escenas (Scene1 a Scene7) con transiciones fluidas y elementos interactivos.
Interacción: Haz clic en los elementos interactivos para avanzar en la narrativa visual.
Final: La experiencia concluye con un mensaje y un botón para explorar más contenido.

📜 Scripts Importantes
npm run dev: Inicia el servidor de desarrollo.
npm run build: Construye el proyecto para producción.
npm run preview: Previsualiza la versión de producción.

📚 Documentación del Código
Componentes Clave
BackgroundMusic.jsx: Controla la reproducción de música de fondo.
IntroWarning.jsx: Muestra una advertencia inicial antes de comenzar la experiencia.
Scene1.jsx a Scene7.jsx: Componentes que representan las diferentes escenas del juego.
ChatModal.jsx: Modal interactivo para mostrar mensajes.
Transiciones entre Escenas
Las transiciones entre escenas se manejan en index.astro mediante eventos personalizados como sceneActivated, scene2Activate, etc.

🖼️ Recursos
Previsualizaciones: Almacenadas en components preview/.
Imágenes: Almacenadas en public/.
Videos: Almacenados en public/ (portal.mp4, tunel.mp4, etc.).
Audio: Música de fondo (bgmusic.mp3) en public/.

🧑‍💻 Contribuir
Haz un fork del repositorio.
Crea una rama para tu funcionalidad (git checkout -b feature/nueva-funcionalidad).
Realiza tus cambios y haz commit (git commit -m 'Añadir nueva funcionalidad').
Haz push a tu rama (git push origin feature/nueva-funcionalidad).
Abre un Pull Request.
📝 Licencia
Este proyecto está bajo la licencia MIT.

🌟 Créditos
Creado por blackars. Inspirado en el arte conceptual minimalista y el diseño interactivo.

¡Gracias por explorar y experimentar con TouchConcepts1-3DWebExperience! 🎮✨ ```