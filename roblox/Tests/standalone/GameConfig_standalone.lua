-- GameConfig_standalone.lua
-- Standalone version of GameConfig for testing outside Roblox

local Mocks = require("mocks")
local Color3 = Mocks.Color3

local GameConfig = {}

-- Lane configuration
GameConfig.LANES = {
    LEFT = -1,
    CENTER = 0,
    RIGHT = 1
}

GameConfig.LANE_WIDTH = 16
GameConfig.ROAD_WIDTH = GameConfig.LANE_WIDTH * 3

-- Game states
GameConfig.GAME_STATES = {
    MENU = 1,
    CAR_SELECT = 2,
    PLAYING = 3,
    GAME_OVER = 4
}

-- Difficulty settings
GameConfig.DIFFICULTY = {
    initialSpeed = 120,
    maxSpeed = 480,
    speedIncreaseRate = 2,
    initialSpawnInterval = 2,
    minSpawnInterval = 0.5,
    difficultyRampTime = 120
}

-- Obstacle configuration
GameConfig.OBSTACLE = {
    spawnDistance = 800,
    despawnDistance = -80,
    minSpacing = 60,
}

-- Power-up durations
GameConfig.POWERUP_DURATIONS = {
    shield = 5,
    slowMo = 3,
    multiplier = 10
}

-- Nitro configuration
GameConfig.NITRO = {
    activationThreshold = 30,
    consumeRate = 30,
    boostMultiplier = 1.5,
    zoneRechargeRate = 50
}

-- Visual colors
GameConfig.COLORS = {
    cyan = Color3.fromRGB(0, 255, 255),
    magenta = Color3.fromRGB(255, 0, 255),
    orange = Color3.fromRGB(255, 102, 0),
    purple = Color3.fromRGB(139, 0, 255),
    red = Color3.fromRGB(255, 0, 64),
    blue = Color3.fromRGB(0, 191, 255),
    darkBg = Color3.fromRGB(10, 10, 15)
}

-- Camera settings
GameConfig.CAMERA = {
    height = 6,
    fov = 75,
    tiltAmount = 0.02,
    shakeDecay = 0.9
}

-- Remote event names
GameConfig.REMOTES = {
    gameStart = "GameStart",
    gameUpdate = "GameUpdate",
    gameOver = "GameOver",
    playerMove = "PlayerMove",
    playerNitro = "PlayerNitro",
    powerupCollected = "PowerupCollected"
}

return GameConfig
