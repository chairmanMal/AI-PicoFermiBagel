# PicoFermiBagel

A modern, cross-platform implementation of the classic logic-based number guessing game, built with React, TypeScript, Vite, and Electron for tablet and mobile devices.

## 🎮 About the Game

PicoFermiBagel is a challenging logic game that requires deductive reasoning, informed guessing, and strategic thinking. Players must guess a secret number by analyzing feedback from their guesses:

- **Pico**: You have a correct digit, but it's in the wrong position
- **Fermi**: You have a correct digit in the correct position  
- **Bagel**: The digit is not in the secret number at all

## 🚀 Features

### Core Game Features
- **Multiple Difficulty Levels**: Easy, Classic, Medium, Hard, and Expert modes
- **Intelligent Feedback System**: Real-time Pico/Fermi/Bagel analysis
- **Drag & Drop Interface**: Intuitive number placement with touch support
- **Smart Auto-Advancement**: Automatic progression to next input position
- **Position Locking**: Lock specific positions to prevent accidental changes

### Advanced Features
- **Hint System**: Purchase hints to reveal information about numbers
  - Bagel hints (numbers NOT in target)
  - Not-Bagel hints (numbers IN target)
  - Row Delta hints (sum comparisons)
- **Interactive Scratchpad**: Color-coded number tracking system
- **Scoring System**: Performance-based scoring with time and hint penalties
<!-- - **Leaderboards**: Cloud-based competitive scoring by difficulty level -->
- **Statistics Tracking**: Detailed game statistics and progress tracking

### Technical Features
- **Cross-Platform**: Runs on Windows, macOS, and Linux via Electron
- **Responsive Design**: Optimized for tablets and mobile devices
- **Offline Capable**: Full functionality without internet connection
- **State Persistence**: Game progress saved automatically
- **Modern UI**: Beautiful animations and transitions with Framer Motion

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Desktop App**: Electron
- **State Management**: Zustand
- **Drag & Drop**: React DnD
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Styling**: CSS3 with modern features

## 📁 Project Structure

```
pico-fermi-bagel/
├── electron/                 # Electron main process files
│   ├── main.ts              # Main Electron process
│   └── preload.ts           # Preload scripts
├── src/
│   ├── components/          # React components
│   │   ├── GameScreen.tsx   # Main game interface
│   │   ├── GuessArea.tsx    # Number input area
│   │   ├── SelectionArea.tsx # Number selection grid
│   │   ├── FeedbackArea.tsx # Game history display
│   │   ├── HintPurchasing.tsx # Hint system
│   │   ├── Scratchpad.tsx   # Player notes area
│   │   ├── ScoreArea.tsx    # Score display
│   │   ├── MenuArea.tsx     # Settings menu
│   │   └── ...              # Other components
│   ├── stores/              # State management
│   │   └── gameStore.ts     # Main game state
│   ├── types/               # TypeScript definitions
│   │   └── game.ts          # Game-related types
│   ├── utils/               # Utility functions
│   │   └── gameLogic.ts     # Core game logic
│   ├── hooks/               # Custom React hooks
│   ├── assets/              # Static assets
│   ├── App.tsx              # Main App component
│   └── main.tsx             # React entry point
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pico-fermi-bagel
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Development

1. **Start the development server**
   ```bash
   npm run electron:dev
   ```
   This will start both the Vite dev server and Electron in development mode.

2. **Web-only development**
   ```bash
   npm run dev
   ```
   For faster iteration when working on UI components.

### Building

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Package Electron app**
   ```bash
   npm run electron:pack
   ```

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run electron:dev` - Start Electron in development mode
- `npm run electron:pack` - Package Electron app for distribution
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎯 Game Rules & Strategy

### Basic Rules
1. The computer generates a secret number with unique digits
2. You guess by selecting numbers from the available range
3. No repeated digits are allowed in a single guess
4. Analyze the Pico/Fermi/Bagel feedback to deduce the secret number

### Difficulty Levels
- **Easy**: 3 digits, range 0-6
- **Classic**: 3 digits, range 0-9
- **Medium**: 4 digits, range 0-9
- **Hard**: 4 digits, range 0-12
- **Expert**: 5 digits, range 0-15

### Scoring
Score = 100 - (number of guesses) - (time in minutes) - (hint costs)

### Strategy Tips
- Start with diverse numbers to gather maximum information
- Use the scratchpad to track what you've learned
- Consider purchasing hints strategically for difficult games
- Pay attention to patterns in the feedback

## 🔧 Configuration

### Game Settings
- **Difficulty Level**: Choose from 5 preset difficulty levels
- **Target Display**: Option to show the secret number <!-- (disables leaderboard) -->
- **Selection Area Position**: Place number selection above or below guess area
- **Sound Effects**: Enable/disable game sounds

### Customization
The game supports extensive customization through the settings menu:
- Difficulty parameters (number length, digit range)
- UI preferences (layout, colors)
- Gameplay options (hints, scoring)

## 📊 Statistics

<!-- ## 🏆 Leaderboards & Statistics

- **Global Leaderboards**: Compete with players worldwide
- **Difficulty-Specific Rankings**: Separate leaderboards for each difficulty level -->
- **Detailed Statistics**: Track your progress over time
<!-- - **Achievement System**: Unlock achievements for various milestones -->

## 🎨 UI/UX Features

### Tablet-Optimized Design
- Large touch targets for easy interaction
- Responsive layout that adapts to screen size
- Intuitive drag-and-drop number placement
- Visual feedback for all interactions

### Accessibility
- High contrast color schemes
- Clear visual indicators for game state
- Keyboard navigation support
- Screen reader compatible

### Animations
- Smooth transitions between game states
- Celebratory animations for wins
- Visual feedback for user actions
- Loading animations and state changes

## 🔮 Future Enhancements

### Planned Features
- **Mobile Apps**: Native iOS and Android versions
- **Multiplayer Mode**: Compete against friends in real-time
- **Daily Challenges**: Special puzzle modes with unique constraints
- **Themes**: Customizable visual themes and color schemes
- **Tutorials**: Interactive tutorial system for new players
- **Cloud Sync**: Synchronize progress across devices

### Technical Improvements
- **Performance Optimization**: Enhanced rendering and state management
- **PWA Support**: Progressive Web App capabilities
- **Offline Mode**: Enhanced offline functionality
- **Analytics**: Game performance and user behavior tracking

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and standards
- Pull request process
- Issue reporting
- Feature requests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Original game concept from "Family Math" by Jean Kerr Stenmark, Virginia Thompson, and Ruth Cossey
- Sound effects from various Creative Commons contributors
- Inspiration from classic logic puzzle games
- React and TypeScript communities for excellent tooling

## 📞 Support

For support, feature requests, or bug reports:
- Open an issue on GitHub
- Check the documentation wiki
- Join our community discussions

---

**Happy Gaming! 🎮**

Test your logic skills and see how quickly you can crack the code in PicoFermiBagel! 