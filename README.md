# TouchConcepts1-3DWebExperience

**TouchConcepts1-3DWebExperience** is an interactive experience based on modern web technologies like **Three.js**, **Solid.js**, and **Astro**. This project combines 3D graphics, animations, and smooth transitions to create an immersive visual narrative.

## 🚀 Features

- **3D Graphics**: Rendered with Three.js to create visually appealing scenes.
- **Scene Transitions**: Smooth navigation between multiple interactive scenes.
- **Interactivity**: Interactive elements like buttons, animations, and visual effects.
- **Background Music**: Integrated audio to complement the user experience.
- **Modular Design**: Reusable and well-organized components.

## 📂 Project Structure

The project follows an organized structure to facilitate development and collaboration:

3DGame/
├── .vscode/           # Development environment configuration
├── .astro/           # Astro generated files
├── components preview/# Visual resources for scenes
├── public/           # Static files (images, videos, audio)
├── src/             # Project source code
│ ├── components/    # Solid.js components
│ ├── layouts/      # Astro layouts
│ └── pages/        # Astro pages
├── astro.config.mjs # Astro configuration
├── package.json    # Project dependencies and scripts
├── tsconfig.json   # TypeScript configuration
└── README.md      # Project documentation

### 📁 Key Directories

- **`src/components/`**: Contains components for each scene (`Scene1.jsx`, `Scene2.jsx`, etc.) and other interactive elements like `ChatModal` and `BackgroundMusic`.
- **`public/`**: Static files like videos (`portal.mp4`, `tunel.mp4`), images (`ball.svg`), and music (`bgmusic.mp3`).
- **`src/pages/index.astro`**: Main page that organizes scenes and handles transitions between them.

## 🛠️ Technologies Used

- **[Astro](https://astro.build/)**: Framework for building fast and modern websites.
- **[Solid.js](https://solidjs.com/)**: Library for building reactive user interfaces.
- **[Three.js](https://threejs.org/)**: Library for 3D rendering on the web.
- **TypeScript**: Static typing for safer and more scalable development.

## ⚙️ Setup and Running

### 1. Clone the Repository

```bash
git clone https://github.com/blackars/TouchConcepts1-3DWebExperience.git
cd TouchConcepts1-3DWebExperience
```

### 2. Install Dependencies
Make sure you have Node.js installed. Then run:

```bash
npm install
```

### 3. Run Development Server
Start the development server with:

```bash
npm run dev
```

The project will be available at http://localhost:4321.

### 4. Build for Production
To generate static files ready for production:

```bash
npm run build
```

Generated files will be in the dist/ directory.

### 5. Preview Build
To preview the production version:

```bash
npm run preview
```

## 🎮 How to Play
- Start: Experience begins with an interactive warning on the home page.
- Scenes: Navigate through multiple scenes (Scene1 to Scene7) with smooth transitions and interactive elements through clicks.
- Interaction: Click on interactive elements to advance through the visual narrative.
- End: Experience concludes with a message and a button to explore more content.

## 📜 Important Scripts
- `npm run dev`: Starts development server.
- `npm run build`: Builds project for production.
- `npm run preview`: Previews production version.

## 📚 Code Documentation
### Key Components
- `BackgroundMusic.jsx`: Controls background music playback.
- `IntroWarning.jsx`: Displays initial warning before starting experience.
- `Scene1.jsx` to `Scene7.jsx`: Components representing different game scenes.
- `ChatModal.jsx`: Interactive modal for displaying messages.

### Scene Transitions
Scene transitions are handled in index.astro using custom events like sceneActivated, scene2Activate, etc.

## 🖼️ Resources
- Previews: Stored in components preview/.
- Images: Stored in public/.
- Videos: Stored in public/ (portal.mp4, tunel.mp4, etc.).
- Audio: Background music (bgmusic.mp3) in public/.

## 🧑‍💻 Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Make your changes and commit (`git commit -m 'Add new feature'`).
4. Push to your branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

## 📝 License
This project is under the MIT license.

## 🌟 Credits
Crafted by blackars. Inspired by minimalist conceptual art and interactive design.
Music track: "Do For Me" by KrippSoulisc.

Thank you for exploring and experimenting with TouchConcepts1-3DWebExperience! 🎮✨