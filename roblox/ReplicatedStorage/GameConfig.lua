-- GameConfig.lua
-- Core game constants and configuration for Neon Rush
-- Place in: ReplicatedStorage

local GameConfig = {}

-- Lane configuration
GameConfig.LANES = {
	LEFT = -1,
	CENTER = 0,
	RIGHT = 1
}

GameConfig.LANE_WIDTH = 16  -- studs (4 * original scale)
GameConfig.ROAD_WIDTH = GameConfig.LANE_WIDTH * 3  -- 48 studs

-- Game states
GameConfig.GAME_STATES = {
	MENU = 1,
	CAR_SELECT = 2,
	PLAYING = 3,
	GAME_OVER = 4
}

-- Difficulty settings
GameConfig.DIFFICULTY = {
	initialSpeed = 120,        -- studs per second
	maxSpeed = 480,            -- studs per second
	speedIncreaseRate = 2,     -- speed increase per second
	initialSpawnInterval = 2,  -- seconds between obstacle spawns
	minSpawnInterval = 0.5,    -- minimum spawn interval at max difficulty
	difficultyRampTime = 120   -- seconds to reach max difficulty
}

-- Obstacle configuration
GameConfig.OBSTACLE = {
	spawnDistance = 800,       -- studs ahead of player
	despawnDistance = -80,     -- studs behind player (negative Z)
	minSpacing = 60,           -- minimum studs between obstacles in same lane
}

-- Power-up durations (seconds)
GameConfig.POWERUP_DURATIONS = {
	shield = 5,
	slowMo = 3,
	multiplier = 10
}

-- Nitro configuration
GameConfig.NITRO = {
	activationThreshold = 30,  -- minimum nitro to activate
	consumeRate = 30,          -- nitro consumed per second when active
	boostMultiplier = 1.5,     -- speed multiplier when nitro active
	zoneRechargeRate = 50      -- nitro gained per second in nitro zone
}

-- Visual colors (synthwave palette)
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
	height = 6,                -- studs above road (cockpit level)
	fov = 75,                  -- field of view
	tiltAmount = 0.02,         -- roll during lane changes
	shakeDecay = 0.9           -- screen shake decay rate
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
