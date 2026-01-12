# Neon Rush

A synthwave-themed first-person endless runner car game built with Three.js. Race through a neon-lit highway, dodge obstacles, collect power-ups, and chase high scores!

## Features

- **First-Person Cockpit View**: Experience the thrill from inside the car
- **3 Iconic Cars**: Choose from BMW M3 (E46), Toyota MK4 Supra, or Chevrolet Corvette C6
- **Retro Synthwave Aesthetic**: Neon grids, glowing obstacles, and a beautiful sunset horizon
- **Power-ups**: Nitro boost zones, shields, slow-motion, and score multipliers
- **Dynamic Difficulty**: Speed and obstacle density increase as you progress
- **High Score System**: Track your best runs with persistent storage
- **Sound Effects**: Engine sounds, power-up chimes, and synthwave beats

## Controls

| Key | Action |
|-----|--------|
| `A` / `Left Arrow` | Move to left lane |
| `D` / `Right Arrow` | Move to right lane |
| `W` / `Shift` | Activate nitro boost |
| `Space` | Start / Restart game |
| `1` / `2` / `3` | Select car on menu |

## Cars

### 2006 BMW M3 (E46)
- Balanced handling
- Blue neon dashboard
- Medium nitro capacity

### Toyota MK4 Supra
- Fast acceleration
- Orange neon dashboard
- Large nitro capacity

### 2017 Chevrolet Corvette C6
- Top speed bonus
- Red neon dashboard
- Quick nitro recharge

## Installation

```bash
# Clone the repository
git clone https://github.com/bongocats14/neon-rush.git
cd neon-rush

# Install dependencies
npm install

# Start the server
npm start
```

The game will be available at `http://localhost:8080`

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Engine**: Three.js
- **Audio**: Web Audio API
- **Server**: Node.js with Express
- **Testing**: Jest with jsdom

## Project Structure

```
neon-rush/
├── src/
│   ├── index.html          # Main HTML entry point
│   ├── css/style.css       # Neon styling and HUD
│   └── js/
│       ├── main.js         # Game initialization
│       ├── game.js         # Core game loop
│       ├── player.js       # Player controls
│       ├── cars.js         # Car definitions
│       ├── obstacles.js    # Obstacle system
│       ├── road.js         # Road generation
│       ├── collision.js    # Collision detection
│       ├── powerups.js     # Power-up system
│       ├── audio.js        # Sound manager
│       ├── highscore.js    # High score persistence
│       └── ui.js           # UI and menus
├── tests/                  # Test files
├── server.js               # Express server
└── package.json
```

## License

MIT
