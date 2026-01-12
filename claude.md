# Claude AI Context for Neon Rush

This file provides context for AI assistants working on this codebase.

## Project Overview

Neon Rush is a first-person endless runner car game with a synthwave/retrowave aesthetic. It combines gameplay elements from Temple Run 2 (obstacle dodging, endless runner) with Need for Speed (car selection, speed-focused gameplay).

## Architecture

### Core Game Loop (`src/js/game.js`)
- Uses `requestAnimationFrame` for smooth 60fps gameplay
- Manages game states: MENU, CAR_SELECT, PLAYING, GAME_OVER
- Updates all game systems each frame
- Handles difficulty scaling (speed + obstacle density)

### Rendering (`Three.js`)
- First-person camera positioned in car cockpit
- Post-processing: bloom/glow effects for neon aesthetic
- Road scrolls toward camera (player car stationary, world moves)

### Key Systems

1. **Car System** (`cars.js`, `player.js`)
   - 3 cars with different stats (acceleration, top speed, nitro capacity)
   - Each car has unique dashboard/cockpit appearance
   - Car selection on menu screen

2. **Obstacle System** (`obstacles.js`)
   - Object pooling for performance
   - Random lane spawning
   - Types: stop signs, traffic cones, other cars, barriers
   - Difficulty increases spawn rate and speed over time

3. **Power-up System** (`powerups.js`)
   - Nitro zones: glowing lane sections that fill nitro meter
   - Shield: temporary invincibility
   - Slow-mo: slows game time
   - Multiplier: 2x score

4. **Collision** (`collision.js`)
   - AABB (Axis-Aligned Bounding Box) collision detection
   - Player occupies one of 3 lanes (-1, 0, 1)
   - Obstacles also in lanes, collision if same lane and z-overlap

5. **Audio** (`audio.js`)
   - Web Audio API for procedural/loaded sounds
   - Engine sound pitch varies with speed
   - Distinct sounds for: nitro, collision, power-ups, lane switch

6. **High Score** (`highscore.js`)
   - localStorage persistence
   - Tracks best distance per car

## Visual Style

- Color palette: cyan (#00ffff), magenta (#ff00ff), purple (#8b00ff)
- Dark background (#0a0a0a)
- Neon glow effects on all interactive elements
- Grid-based road texture
- Retro sun on horizon (stacked gradient circles)

## Testing

Tests are in `/tests` directory using Jest with jsdom environment.
Key test areas:
- Collision detection accuracy
- Obstacle spawning patterns
- Power-up effects
- Game state transitions
- High score persistence

## Common Tasks

### Adding a new obstacle type
1. Add type definition in `obstacles.js` createObstacle()
2. Add 3D geometry/material in createObstacleMesh()
3. Update collision bounds if needed

### Adding a new power-up
1. Define power-up in `powerups.js` POWERUP_TYPES
2. Add spawn logic in spawnPowerup()
3. Add effect logic in activatePowerup()
4. Add UI indicator in `ui.js`

### Adjusting difficulty
- Modify `DIFFICULTY` object in `game.js`
- `speedIncreaseRate`: how fast speed ramps up
- `obstacleSpawnRate`: base spawn interval
- `difficultyRampTime`: time to reach max difficulty

## Environment Variables

- `PORT`: Server port (default: 8080)
