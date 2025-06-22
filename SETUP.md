# PicoFermiBagel - Development Setup Guide

This guide will help you set up the PicoFermiBagel development environment.

## 🚀 Quick Start

### 1. Prerequisites Check

Make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** or **pnpm**
- **Git** - [Download here](https://git-scm.com/)

Verify your installation:
```bash
node --version  # Should be v18+
npm --version   # Should be 8+
```

### 2. Project Setup

1. **Clone and navigate to the project**
   ```bash
   git clone <your-repo-url>
   cd pico-fermi-bagel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   This will install all the required packages including:
   - React & React DOM
   - TypeScript
   - Vite
   - Electron
   - Zustand (state management)
   - Framer Motion (animations)
   - React DnD (drag & drop)
   - And many more...

### 3. Development Workflow

#### Option A: Full Electron Development
```bash
npm run electron:dev
```
This starts both the Vite dev server and Electron app. Best for testing the complete desktop experience.

#### Option B: Web-Only Development
```bash
npm run dev
```
This starts only the Vite dev server. Faster for UI development and debugging.

### 4. Building and Packaging

#### Build for web
```bash
npm run build
```

#### Package Electron app
```bash
npm run electron:pack
```

## 🛠 Development Tools

### Recommended VS Code Extensions

Install these extensions for the best development experience:

1. **ES7+ React/Redux/React-Native snippets**
2. **TypeScript Importer**
3. **Prettier - Code formatter**
4. **ESLint**
5. **Auto Rename Tag**
6. **Bracket Pair Colorizer**
7. **GitLens**

### Code Quality Tools

The project includes:
- **ESLint** for code linting
- **TypeScript** for type checking
- **Prettier** (recommended) for code formatting

Run these commands:
```bash
npm run lint        # Check for linting errors
npm run type-check  # Check TypeScript types
```

## 📁 Project Architecture

### Key Directories

- `src/components/` - React components
- `src/stores/` - Zustand state management
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions and game logic
- `electron/` - Electron main process files

### State Management

The app uses Zustand for state management with these key stores:
- `gameStore.ts` - Main game state, settings, and actions

### Component Structure

Components are organized by feature:
- Game UI components (GuessArea, SelectionArea, etc.)
- Screen components (GameScreen, SettingsScreen, etc.)
- Utility components (shared UI elements)

## 🎮 Game Logic Overview

### Core Game Flow

1. **Game Initialization**: Generate random target number
2. **Player Input**: Accept and validate guesses
3. **Feedback Generation**: Calculate Pico/Fermi/Bagel results
4. **Score Calculation**: Track performance metrics
5. **Game Completion**: Handle win conditions and scoring

### Key Files

- `src/utils/gameLogic.ts` - Core game algorithms
- `src/types/game.ts` - Type definitions
- `src/stores/gameStore.ts` - State management

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory for any environment-specific settings:

```env
# Development settings
VITE_DEV_SERVER_URL=http://localhost:5173
VITE_APP_NAME=PicoFermiBagel
VITE_APP_VERSION=1.0.0
```

### Build Configuration

- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `electron-builder` config in package.json for app packaging

## 🐛 Troubleshooting

### Common Issues

1. **Dependencies not installing**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScript errors**
   ```bash
   npm run type-check
   ```

3. **Electron not starting**
   - Check that port 5173 is available
   - Ensure all dependencies are installed
   - Try running `npm run dev` first to test the web version

4. **Build failures**
   - Clear the dist folder: `rm -rf dist`
   - Rebuild: `npm run build`

### Getting Help

- Check the main README.md for detailed documentation
- Look at the GitHub issues for known problems
- Check the console for error messages
- Ensure all dependencies are up to date

## 🚢 Deployment

### Web Deployment

The built files in `dist/` can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### Desktop App Distribution

Use electron-builder to create installers:
```bash
npm run electron:pack
```

This creates platform-specific packages in the `release/` directory.

## 📈 Next Steps

1. **Explore the codebase** - Start with `src/App.tsx` and `src/components/GameScreen.tsx`
2. **Run the app** - Use `npm run electron:dev` to see it in action
3. **Make changes** - Try modifying a component to see hot-reloading
4. **Read the game manual** - Check `pfb_manual.html` for game rules and features
5. **Check the issues** - Look for "good first issue" labels to contribute

## 🎯 Development Goals

The current scaffolding provides:
- ✅ Project structure and configuration
- ✅ Core game logic and types
- ✅ State management setup
- ✅ Component architecture
- ✅ Build and development scripts

Next development phases:
- 🔄 Complete component implementations
- 🔄 UI/UX design and styling
- 🔄 Game features (hints, scoring, etc.)
- 🔄 Testing and optimization
- 🔄 Mobile responsiveness
- 🔄 Sound effects and animations

Happy coding! 🎮 