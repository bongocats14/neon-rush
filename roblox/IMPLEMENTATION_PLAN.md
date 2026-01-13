# Neon Rush Roblox Implementation Plan

## Overview

Convert the Three.js endless runner to a Roblox experience using Lua. The core gameplay remains the same: first-person cockpit view, 3-lane dodging, synthwave aesthetics.

---

## Phase 1: Core Infrastructure

### 1.1 GameConfig Module (ReplicatedStorage)
```lua
-- Constants matching original game.js
LANES = { LEFT = -1, CENTER = 0, RIGHT = 1 }
LANE_WIDTH = 4  -- studs (scaled from original)
ROAD_WIDTH = 12

DIFFICULTY = {
    initialSpeed = 30,
    maxSpeed = 120,
    speedIncreaseRate = 0.5,
    initialSpawnInterval = 2,  -- seconds
    minSpawnInterval = 0.5,
    difficultyRampTime = 120   -- seconds
}

GAME_STATES = { MENU = 1, CAR_SELECT = 2, PLAYING = 3, GAME_OVER = 4 }
```

### 1.2 CarData Module (ReplicatedStorage)
```lua
-- 3 cars with stats from original cars.js
CARS = {
    bmw_m3 = {
        name = "2006 BMW M3 (E46)",
        color = Color3.fromRGB(0, 191, 255),  -- cyan
        acceleration = 8,
        topSpeed = 100,
        maxNitro = 100,
        nitroRechargeRate = 5,
        laneSwitchSpeed = 10
    },
    supra = {
        name = "Toyota MK4 Supra",
        color = Color3.fromRGB(255, 102, 0),  -- orange
        acceleration = 10,
        topSpeed = 95,
        maxNitro = 120,
        nitroRechargeRate = 4,
        laneSwitchSpeed = 12
    },
    corvette = {
        name = "2017 Chevrolet Corvette C6",
        color = Color3.fromRGB(255, 0, 64),   -- red
        acceleration = 7,
        topSpeed = 110,
        maxNitro = 80,
        nitroRechargeRate = 8,
        laneSwitchSpeed = 9
    }
}
```

---

## Phase 2: Server Scripts

### 2.1 GameManager (ServerScriptService)
**Responsibilities:**
- Track game state per player
- Handle score/distance calculation
- Manage difficulty progression
- Coordinate obstacle/powerup spawning

**Key Functions:**
- `startGame(player, carId)` - Initialize player session
- `updateGame(player, dt)` - Per-frame update
- `handleCollision(player)` - Process collision (shield check, game over)
- `getSpawnInterval(player)` - Calculate spawn rate based on progress

**RemoteEvents needed:**
- `GameStart` - Client → Server (with car selection)
- `GameUpdate` - Server → Client (score, speed, distance)
- `GameOver` - Server → Client (final score)
- `PlayerMove` - Client → Server (lane change request)

### 2.2 ObstacleSpawner (ServerScriptService)
**Responsibilities:**
- Spawn obstacles ahead of players
- Object pooling for performance
- Remove obstacles that pass players

**Obstacle Types (from original):**
1. `CONE` - Small, common (weight: 30)
2. `STOP_SIGN` - Medium height (weight: 25)
3. `CAR` - Full lane block (weight: 30)
4. `BARRIER` - Wide, low (weight: 10)
5. `TRUCK` - Large, rare (weight: 5)

**Key Logic:**
- Spawn at Z = 800 studs ahead
- Move toward player at game speed
- Despawn at Z = -80 studs (behind player)
- Maintain minimum spacing per lane (60 studs / difficulty)

### 2.3 PowerupSpawner (ServerScriptService)
**Power-up Types:**
1. `SHIELD` - 5 second invincibility, cyan color
2. `SLOW_MO` - 3 second half-speed, purple color
3. `MULTIPLIER` - 10 second 2x score, gold color
4. `NITRO_ZONE` - Lane strip that fills nitro, orange color

---

## Phase 3: Client Scripts

### 3.1 PlayerController (StarterPlayerScripts)
**Responsibilities:**
- Handle keyboard input (A/D, W/Shift, Space)
- Smooth lane transitions (lerp position)
- Send movement requests to server
- Apply screen shake on collision

**Input Mapping:**
```lua
UserInputService.InputBegan:Connect(function(input)
    if input.KeyCode == Enum.KeyCode.A or input.KeyCode == Enum.KeyCode.Left then
        requestLaneChange(-1)  -- Move left
    elseif input.KeyCode == Enum.KeyCode.D or input.KeyCode == Enum.KeyCode.Right then
        requestLaneChange(1)   -- Move right
    elseif input.KeyCode == Enum.KeyCode.W or input.KeyCode == Enum.KeyCode.LeftShift then
        requestNitro(true)
    end
end)
```

### 3.2 CameraController (StarterPlayerScripts)
**Responsibilities:**
- First-person cockpit view
- Position camera at driver seat level
- Apply tilt during lane changes
- Screen shake effect

**Camera Setup:**
```lua
camera.CameraType = Enum.CameraType.Scriptable
camera.CFrame = CFrame.new(playerX, 6, 0) * CFrame.Angles(0, math.pi, 0)
-- Y=6 studs is cockpit height, looking toward +Z (obstacles)
```

### 3.3 ClientEffects (StarterPlayerScripts)
**Visual Effects:**
- Neon glow (Bloom in Lighting)
- Speed lines during nitro
- Color flash on powerup collect
- Dashboard lighting based on car color

---

## Phase 4: UI (StarterGui)

### 4.1 MainMenu
- Title: "NEON RUSH" with neon glow effect
- "PRESS SPACE TO START" blinking text
- Synthwave background (gradient purple/pink)

### 4.2 CarSelect
- 3 car cards with stats display
- Highlight selected car
- Car preview (rotating model or image)
- "Press 1/2/3 to select"

### 4.3 HUD (ScreenGui)
```
┌─────────────────────────────────┐
│ [CAR NAME]              [SPEED] │
│                                 │
│                                 │
│                                 │
│ [POWERUP ICONS]                 │
│ [NITRO BAR]           [SCORE]   │
└─────────────────────────────────┘
```

### 4.4 GameOver
- "GAME OVER" title
- Final distance display
- High score comparison
- "Press SPACE to restart"

---

## Phase 5: World Building

### 5.1 Road Construction
```
Parts needed:
- RoadBase: 12x0.4x2000 studs, Neon material, dark gray
- LaneDividers: 0.4x0.2x8 studs (dashed), Neon magenta
- GridLines: 12x0.1x0.2 studs, Neon cyan, every 8 studs
- Barriers: 1.2x8x2000 studs each side, Neon purple
```

### 5.2 Environment
```
- Skybox: Dark purple/black gradient
- Sun: Large cylinder at Z=1400, magenta-orange gradient decal
- Stars: ParticleEmitter in sky, white dots
- Fog: Atmosphere service, dark purple, density 0.3
```

### 5.3 Obstacles (ReplicatedStorage templates)
```
Models to create:
- Cone: Orange neon cone, 1.2x3.2x1.2 studs
- StopSign: Gray pole + red neon octagon, 0.2x10x0.2 + 3.2x3.2x0.4
- Car: Purple neon box, 8x4.8x16 studs
- Barrier: Magenta neon box, 12x3.2x1.2 studs
- Truck: Blue neon box, 10x10x32 studs
```

---

## Phase 6: Lighting & Effects

### 6.1 Lighting Settings
```lua
Lighting.Ambient = Color3.fromRGB(20, 10, 30)
Lighting.Brightness = 0
Lighting.EnvironmentDiffuseScale = 0
Lighting.EnvironmentSpecularScale = 0

-- Add Bloom effect
local bloom = Instance.new("BloomEffect")
bloom.Intensity = 0.8
bloom.Size = 24
bloom.Threshold = 0.8
bloom.Parent = Lighting

-- Add ColorCorrection for synthwave look
local cc = Instance.new("ColorCorrectionEffect")
cc.Saturation = 0.2
cc.TintColor = Color3.fromRGB(255, 200, 255)
cc.Parent = Lighting
```

---

## File Creation Order

1. **ReplicatedStorage/GameConfig.lua** - Constants first
2. **ReplicatedStorage/CarData.lua** - Car definitions
3. **ReplicatedStorage/PowerupData.lua** - Powerup definitions
4. **ServerScriptService/GameManager.lua** - Core game logic
5. **ServerScriptService/ObstacleSpawner.lua** - Obstacle system
6. **StarterPlayerScripts/PlayerController.lua** - Input handling
7. **StarterPlayerScripts/CameraController.lua** - Camera system
8. **StarterGui/HUD.lua** - In-game UI
9. **StarterGui/MainMenu.lua** - Menu screens

---

## Roblox-Specific Considerations

### Networking
- Use RemoteEvents for client-server communication
- Server authoritative for collision detection
- Client predicts movement for responsiveness

### Performance
- Object pooling for obstacles (don't destroy, reposition)
- Use Streaming for large road if needed
- Limit particle effects

### Scaling
- Original units × 4 = Roblox studs (roughly)
- Speed values may need tuning for feel

---

## Testing Checklist

- [ ] Car selection works
- [ ] Lane switching is smooth
- [ ] Obstacles spawn and move correctly
- [ ] Collision detection works
- [ ] Power-ups function correctly
- [ ] UI updates properly
- [ ] Nitro system works
- [ ] Game over triggers correctly
- [ ] Score saves to leaderboard
- [ ] Multiplayer doesn't break anything
