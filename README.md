# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Technical Architecture & Design

This project is a high-performance, cross-platform dice game built with a modern React Native stack. It combines declarative UI with a real-world physics engine for an immersive gameplay experience.

### Tech Stack

- **Framework:** [Expo](https://expo.dev/) (React Native) for universal deployment (iOS, Android, Web).
- **3D Rendering:** [React Three Fiber](https://r3f.docs.pmnd.rs/) (R3F) for declarative 3D scene management using React.
- **Physics Engine:** [React Three Rapier](https://github.com/pmndrs/react-three-rapier) for high-performance, rigid-body physics (collisions, gravity, and friction).
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) for a lightweight, hook-based global state that handles game logic, scoring, and turn sequences.
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing and seamless screen transitions.
- **Animation:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) for smooth UI interactions and transitions.

### Key Architectural Decisions

1.  **Decoupled Physics & Logic:** The 3D physics simulation (Rapier) is decoupled from the core game state. The physics engine determines the final resting position and value of the dice, which is then synchronized back to the Zustand store to trigger scoring and rule evaluations.
2.  **Centralized Permissions System:** To ensure game integrity, the Zustand store includes a dynamic `permissions` object. This centralizes the logic for which actions (e.g., throwing dice, banking points, holding dice) are valid at any given point in the game turn, simplifying UI components.
3.  **Modular Scoring Engine:** Game rules (Zonk/Farkle style) are isolated in a dedicated logic module (`model/rules.ts`). This allows for easy testing and the potential to support rule variations in the future without modifying UI or state management code.
4.  **Hybrid 2D/3D UI:** The application seamlessly blends a 3D "playfield" for dice rolling with a standard 2D React Native UI for scoring, player management, and controls, ensuring high performance and a clean UX.

### Key Solutions & Algorithms

-   **Quaternion-Based Die Value Detection:** To determine which face of a die is pointing "up" after a roll, the system uses quaternion mathematics. It transforms local face normal vectors into world space based on the die's final orientation and calculates the dot product against the world's "up" vector (`[0, 1, 0]`). The face with the highest dot product is identified as the result.
-   **Dynamic Throw Physics:** Initial velocities and angular momentum for dice throws are calculated based on camera position, "power," and "accuracy" parameters. This ensures that dice are always thrown toward the center of the playfield while maintaining a natural, randomized feel.
-   **Spherical Coordinate Camera:** A custom coordinate conversion system (`lib/math.ts`) translates between Cartesian and Spherical coordinates, allowing the `OrbitControls` to smoothly orbit the playfield while maintaining a fixed focal point.

## Prototype Status & Future Vision

This project is currently a **technical prototype**. The primary goal is to validate the core technology stack—specifically the integration of real-time 3D physics with React Native—and to refine the "feel" of the dice-rolling mechanics.

### The Vision
The ultimate goal is to evolve this prototype into a full-featured, competitive online multiplayer game. Future milestones include:

-   **Real-time Multiplayer:** Implementing a synchronized backend to support multi-user sessions with minimal latency.
-   **Deterministic Physics Sync:** Ensuring that 3D physics outcomes are identical across all client devices during a shared match.
-   **High-Fidelity Assets:** Replacing placeholder geometry with polished 3D models, custom textures, and advanced lighting effects.
-   **Social & Competitive Layers:** Adding leaderboards, player profiles, and social features to support a global player base.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
