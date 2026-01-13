# Neon Rush - Roblox Adaptation

A synthwave-themed first-person endless runner car game for Roblox, adapted from the Three.js web version.

## Features

- **First-Person Cockpit View**: Race from inside the car with camera tilt and shake effects
- **3 Iconic Cars**: BMW M3 (E46), Toyota MK4 Supra, Chevrolet Corvette C6
- **Retro Synthwave Aesthetic**: Neon colors, glowing UI, dark atmosphere
- **Power-ups**: Shield, slow-motion, score multiplier, nitro zones
- **Dynamic Difficulty**: Speed and obstacle density increase over time
- **Multiplayer Ready**: Each player has independent game session

## Quick Start

### 1. Import Scripts

In Roblox Studio, create scripts in these locations:

| Source File | Roblox Location |
|-------------|-----------------|
| `ReplicatedStorage/*.lua` | ReplicatedStorage (as ModuleScripts) |
| `ServerScriptService/Init.server.lua` | ServerScriptService (as Script) |
| `ServerScriptService/GameManager.lua` | ServerScriptService (as ModuleScript) |
| `StarterPlayerScripts/*.lua` | StarterPlayer > StarterPlayerScripts |
| `StarterGui/MainUI.client.lua` | StarterGui (as LocalScript) |

### 2. Build the Environment

**Road (Workspace)**
```
- RoadBase: Part, Size (48, 1, 2000), Material: Neon, Color: (10, 10, 15)
- Left Barrier: Part, Size (2, 16, 2000), Position: (-25, 8, 0), Color: (139, 0, 255)
- Right Barrier: Part, Size (2, 16, 2000), Position: (25, 8, 0), Color: (139, 0, 255)
```

**Lighting Settings**
```lua
Lighting.Ambient = Color3.fromRGB(20, 10, 30)
Lighting.Brightness = 0
-- Add BloomEffect: Intensity=0.8, Size=24, Threshold=0.8
-- Add ColorCorrectionEffect: TintColor=(255, 200, 255)
```

### 3. Play Test

Press F5 to play test. Press Space to start, then 1/2/3 to select a car.

## Project Structure

```
roblox/
├── ReplicatedStorage/
│   ├── GameConfig.lua      # Constants, colors, difficulty settings
│   ├── CarData.lua         # Car stats (speed, nitro, handling)
│   └── PowerupData.lua     # Obstacle/powerup definitions
├── ServerScriptService/
│   ├── Init.server.lua     # Server initialization
│   └── GameManager.lua     # Game state, collisions, spawning
├── StarterPlayerScripts/
│   ├── Init.client.lua     # Client initialization
│   ├── PlayerController.lua # Input handling, lane movement
│   └── CameraController.lua # First-person camera, effects
├── StarterGui/
│   └── MainUI.client.lua   # All UI screens (menu, HUD, game over)
└── Tests/
    ├── GameConfig.spec.lua # Config validation tests
    ├── CarData.spec.lua    # Car data tests
    └── GameManager.spec.lua # Game logic tests
```

## Controls

| Key | Action |
|-----|--------|
| `Space` | Start game / Restart |
| `1` / `2` / `3` | Select car |
| `A` / `Left Arrow` | Move to left lane |
| `D` / `Right Arrow` | Move to right lane |
| `W` / `Shift` | Activate nitro boost |

## Cars

| Car | Top Speed | Nitro | Special |
|-----|-----------|-------|---------|
| BMW M3 (E46) | 100 | 100 | Balanced handling |
| Toyota Supra | 95 | 120 | Fast acceleration |
| Corvette C6 | 110 | 80 | Quick nitro recharge |

## Game Mechanics

### Lanes
- 3 lanes: Left (-1), Center (0), Right (1)
- Lane width: 16 studs
- Smooth transitions between lanes

### Difficulty Scaling
- Initial speed: 120 studs/sec
- Max speed: 480 studs/sec
- Ramps up over 120 seconds
- Obstacle spawn rate increases with speed

### Scoring
- Distance traveled = score
- 2x multiplier power-up available
- Per-player leaderboard tracking

## Testing

Tests use [TestEZ](https://github.com/Roblox/testez) framework.

### Running Tests in Roblox Studio

1. Install TestEZ via Rojo or copy to ReplicatedStorage
2. Create a Script in ServerScriptService:
```lua
local TestEZ = require(ReplicatedStorage.TestEZ)
TestEZ.TestBootstrap:run({ReplicatedStorage.Tests})
```
3. Check Output window for results

### Test Coverage

- `GameConfig.spec.lua` - Validates all config values
- `CarData.spec.lua` - Tests car retrieval and stats
- `PowerupData.spec.lua` - Tests random selection weights
- `GameManager.spec.lua` - Tests game session logic

## Multiplayer

The game is multiplayer-ready:
- Server manages all game state
- Each player has independent session
- Obstacles are server-authoritative (prevents cheating)
- RemoteEvents handle client-server communication

## Network Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `GameStart` | Client → Server | Start game with car ID |
| `GameUpdate` | Server → Client | Sync score, speed, powerups |
| `GameOver` | Server → Client | Send final score |
| `PlayerMove` | Client → Server | Request lane change |
| `PlayerNitro` | Client → Server | Toggle nitro |

## License

MIT
