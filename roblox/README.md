# Neon Rush - Roblox Adaptation

A synthwave-themed endless runner car game for Roblox, adapted from the Three.js web version.

## Setup in Roblox Studio

1. Open Roblox Studio and create a new Baseplate or empty place
2. Copy each folder's contents to the corresponding Roblox service:
   - `ReplicatedStorage/` → ReplicatedStorage
   - `ServerScriptService/` → ServerScriptService
   - `StarterPlayerScripts/` → StarterPlayer > StarterPlayerScripts
   - `StarterGui/` → StarterGui

3. Build the road and environment (see Environment Setup below)

## Project Structure

```
roblox/
├── ReplicatedStorage/
│   ├── GameConfig.lua        -- Game constants and settings
│   ├── CarData.lua           -- Car definitions and stats
│   └── PowerupData.lua       -- Power-up definitions
├── ServerScriptService/
│   ├── GameManager.lua       -- Core game state management
│   ├── ObstacleSpawner.lua   -- Obstacle generation
│   └── PowerupSpawner.lua    -- Power-up generation
├── StarterPlayerScripts/
│   ├── PlayerController.lua  -- Input handling and movement
│   ├── CameraController.lua  -- First-person camera
│   └── ClientEffects.lua     -- Visual effects (neon, bloom)
└── StarterGui/
    ├── MainMenu.lua          -- Title screen
    ├── CarSelect.lua         -- Car selection UI
    ├── HUD.lua               -- In-game HUD
    └── GameOver.lua          -- Game over screen
```

## Environment Setup

### Road
- Create 3 lanes using Parts (4 studs wide each, 12 studs total width)
- Use Neon material with dark color (25, 25, 30)
- Add cyan neon grid lines on the road surface

### Barriers
- Purple neon barriers on both sides of the road
- Height: 8 studs, Width: 1.2 studs

### Sun
- Create a large Part sphere or cylinder far down the road
- Use gradient decals (magenta to orange) for retro sun effect
- Position at Z = 1400 studs (far end of visible road)

### Lighting
- Set Ambient to dark purple (20, 10, 30)
- Use Bloom effect in Lighting for neon glow
- ColorCorrection for synthwave color grading

## Game Flow

1. Player joins → Show MainMenu
2. Player clicks Play → Show CarSelect
3. Player selects car → Spawn car, start game
4. Game runs → Obstacles spawn, player dodges
5. Collision → Show GameOver with score
6. Restart → Back to CarSelect

## Controls

| Key | Action |
|-----|--------|
| A / Left Arrow | Move left lane |
| D / Right Arrow | Move right lane |
| W / Shift | Activate nitro boost |
| Space | Start / Restart |

## Multiplayer Considerations

This adaptation supports multiplayer:
- Each player has their own car instance
- Obstacles are server-authoritative
- Scores are tracked per-player
- Leaderboard shows top scores
