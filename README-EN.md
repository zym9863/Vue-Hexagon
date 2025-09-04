# Hexagon Physics Simulation Game

English | [简体中文](./README.md)

A real-time physics simulation game built with Vue.js 3, TypeScript, and Matter.js, showcasing realistic physical effects including gravity, friction, collision detection, and hexagonal container rotation.

## 🎮 Game Features

### Core Functions
- **Hexagonal Container**: Continuously rotatable hexagonal physics container
- **Physics Balls**: Realistic physics balls affected by gravity and friction
- **Collision Detection**: Precise wall collision detection and bouncing effects
- **Real-time Rendering**: Smooth 60fps Canvas rendering

### Physics Simulation
- **Gravity System**: Adjustable gravitational acceleration (0-2 m/s²)
- **Friction**: Surface friction coefficient control (0-1)
- **Elastic Collision**: Adjustable elasticity coefficient (0-1)
- **Rotational Dynamics**: Hexagonal container rotation speed control

### User Interface
- **Real-time Control Panel**: Dynamically adjust all physical parameters
- **Physics Status Monitor**: Real-time display of position, velocity, kinetic energy, etc.
- **Performance Monitor**: FPS and frame time display
- **Speed History Chart**: Visualize speed change trends
- **Preset Configurations**: Multiple preset physics scenarios

## 🚀 Quick Start

### Requirements
- Node.js 16+
- pnpm 8+

### Install Dependencies
```bash
pnpm install
```

### Start Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

### Preview Production Build
```bash
pnpm preview
```

## 🎯 Usage Guide

### Control Panel Functions

1. **Gravity Acceleration**: Controls the speed at which balls fall
2. **Friction Coefficient**: Affects friction when balls contact walls
3. **Elasticity Coefficient**: Determines bounce strength during collisions
4. **Rotation Speed**: Controls hexagonal container rotation speed (supports forward/reverse)
5. **Ball Radius**: Adjust ball size
6. **Container Size**: Change hexagonal container dimensions

### Preset Configurations

- **Standard Mode**: Balanced physics parameters for general experience
- **Low Gravity**: Simulate lunar gravity environment
- **Super Elastic**: High elasticity collision effects
- **Fast Rotation**: High-speed rotating hexagonal container

### Physics Status Monitor

- **Position Information**: Real-time display of ball X, Y coordinates
- **Velocity Vector**: Display X, Y direction velocity components
- **Speed Magnitude**: Total velocity scalar value
- **Kinetic Energy**: Current kinetic energy value
- **Container Angle**: Hexagon rotation angle
- **Motion State**: Motion status based on velocity judgment

## 🏗️ Project Structure

```
src/
├── components/           # Vue components
│   ├── HexagonGame.vue  # Main game component
│   ├── ControlPanel.vue # Control panel component
│   └── PhysicsStatus.vue# Physics status display component
├── utils/               # Utility classes
│   └── PhysicsEngine.ts # Physics engine wrapper
├── App.vue             # Main app component
├── main.ts             # Application entry
└── style.css           # Global styles
```

## 🔧 Technology Stack

- **Frontend Framework**: Vue.js 3.5+ with Composition API
- **Development Language**: TypeScript 5.8+
- **Build Tool**: Vite 7.1+
- **Physics Engine**: Matter.js 0.20+
- **Package Manager**: pnpm 10+
- **Graphics Rendering**: HTML5 Canvas API

## 🎨 Design Features

### Visual Effects
- Gradient backgrounds and glass-morphism effects
- Real-time shadows and highlight rendering
- Smooth animation transitions
- Responsive design support

### Performance Optimization
- Stable 60fps frame rate
- GPU-accelerated rendering
- Memory management optimization
- Event throttling handling

## 🔬 Physics Principles

### Collision Detection
The game uses Matter.js's precise collision detection algorithms to ensure accurate collision calculations between balls and hexagonal walls.

### Rotational Dynamics
Hexagonal container rotation affects bounce angles and velocities during collisions, simulating realistic rotating container physics effects.

### Energy Conservation
The system considers energy loss due to friction and inelastic collisions, conforming to physical laws.

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to improve this project!

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details