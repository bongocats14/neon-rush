-- GameManager.lua
-- Core game state management for Neon Rush
-- Place in: ServerScriptService

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local CarData = require(ReplicatedStorage:WaitForChild("CarData"))
local PowerupData = require(ReplicatedStorage:WaitForChild("PowerupData"))

local GameManager = {}
GameManager.__index = GameManager

-- Player session data storage
local playerSessions = {}

-- Remote events
local remotes = {}

-- Initialize remote events
function GameManager.init()
	-- Create RemoteEvents folder
	local remotesFolder = Instance.new("Folder")
	remotesFolder.Name = "GameRemotes"
	remotesFolder.Parent = ReplicatedStorage

	-- Create each remote event
	for name, remoteName in pairs(GameConfig.REMOTES) do
		local remote = Instance.new("RemoteEvent")
		remote.Name = remoteName
		remote.Parent = remotesFolder
		remotes[name] = remote
	end

	-- Connect remote event handlers
	remotes.gameStart.OnServerEvent:Connect(function(player, carId)
		GameManager.startGame(player, carId)
	end)

	remotes.playerMove.OnServerEvent:Connect(function(player, direction)
		GameManager.handleMove(player, direction)
	end)

	remotes.playerNitro.OnServerEvent:Connect(function(player, active)
		GameManager.handleNitro(player, active)
	end)

	-- Handle player leaving
	Players.PlayerRemoving:Connect(function(player)
		GameManager.cleanupPlayer(player)
	end)

	-- Start game loop
	RunService.Heartbeat:Connect(function(dt)
		GameManager.update(dt)
	end)

	print("[GameManager] Initialized")
end

-- Create new player session
function GameManager.createSession(player)
	return {
		player = player,
		state = GameConfig.GAME_STATES.MENU,
		carId = nil,
		car = nil,

		-- Game stats
		score = 0,
		distance = 0,
		speed = GameConfig.DIFFICULTY.initialSpeed,
		gameTime = 0,

		-- Lane state
		currentLane = GameConfig.LANES.CENTER,
		targetLane = GameConfig.LANES.CENTER,
		lanePosition = 0,

		-- Nitro state
		nitroAmount = 0,
		maxNitro = 100,
		isNitroActive = false,

		-- Power-up state
		hasShield = false,
		shieldTimer = 0,
		isSlowMo = false,
		slowMoTimer = 0,
		scoreMultiplier = 1,
		multiplierTimer = 0,

		-- Spawning
		lastSpawnTime = 0,
		obstacles = {},
		powerups = {},
		nitroZones = {}
	}
end

-- Start game for player
function GameManager.startGame(player, carId)
	local car = CarData.getCarById(carId)
	if not car then
		warn("[GameManager] Invalid car ID:", carId)
		return
	end

	-- Get or create session
	local session = playerSessions[player.UserId]
	if not session then
		session = GameManager.createSession(player)
		playerSessions[player.UserId] = session
	end

	-- Reset session for new game
	session.state = GameConfig.GAME_STATES.PLAYING
	session.carId = carId
	session.car = car
	session.score = 0
	session.distance = 0
	session.speed = GameConfig.DIFFICULTY.initialSpeed
	session.gameTime = 0
	session.currentLane = GameConfig.LANES.CENTER
	session.targetLane = GameConfig.LANES.CENTER
	session.lanePosition = 0
	session.nitroAmount = 0
	session.maxNitro = car.maxNitro
	session.isNitroActive = false
	session.hasShield = false
	session.isSlowMo = false
	session.scoreMultiplier = 1
	session.lastSpawnTime = 0

	-- Clear existing obstacles for this player
	GameManager.clearObstacles(session)

	print("[GameManager] Game started for", player.Name, "with", car.name)
end

-- Handle lane movement request
function GameManager.handleMove(player, direction)
	local session = playerSessions[player.UserId]
	if not session or session.state ~= GameConfig.GAME_STATES.PLAYING then
		return
	end

	local newLane = session.targetLane + direction
	if newLane >= GameConfig.LANES.LEFT and newLane <= GameConfig.LANES.RIGHT then
		session.targetLane = newLane
	end
end

-- Handle nitro activation
function GameManager.handleNitro(player, active)
	local session = playerSessions[player.UserId]
	if not session or session.state ~= GameConfig.GAME_STATES.PLAYING then
		return
	end

	if active and session.nitroAmount >= GameConfig.NITRO.activationThreshold then
		session.isNitroActive = true
	else
		session.isNitroActive = false
	end
end

-- Main game update loop
function GameManager.update(dt)
	for userId, session in pairs(playerSessions) do
		if session.state == GameConfig.GAME_STATES.PLAYING then
			GameManager.updateSession(session, dt)
		end
	end
end

-- Update individual player session
function GameManager.updateSession(session, dt)
	-- Apply slow-mo effect
	local effectiveDt = session.isSlowMo and dt * 0.5 or dt
	session.gameTime = session.gameTime + effectiveDt

	-- Update difficulty/speed
	local progress = math.min(session.gameTime / GameConfig.DIFFICULTY.difficultyRampTime, 1)
	local speedRange = GameConfig.DIFFICULTY.maxSpeed - GameConfig.DIFFICULTY.initialSpeed
	local baseSpeed = GameConfig.DIFFICULTY.initialSpeed + speedRange * progress

	-- Apply nitro boost
	local nitroMultiplier = session.isNitroActive and GameConfig.NITRO.boostMultiplier or 1
	session.speed = baseSpeed * nitroMultiplier

	-- Update distance and score
	local distanceThisFrame = session.speed * effectiveDt
	session.distance = session.distance + distanceThisFrame
	session.score = session.score + math.floor(distanceThisFrame * session.scoreMultiplier)

	-- Update lane position (smooth transition)
	local targetX = session.targetLane * GameConfig.LANE_WIDTH
	local diff = targetX - session.lanePosition
	if math.abs(diff) > 0.1 then
		local switchSpeed = session.car and session.car.laneSwitchSpeed or 10
		session.lanePosition = session.lanePosition + diff * switchSpeed * effectiveDt
	else
		session.lanePosition = targetX
		session.currentLane = session.targetLane
	end

	-- Update nitro
	if session.isNitroActive and session.nitroAmount > 0 then
		session.nitroAmount = math.max(0, session.nitroAmount - GameConfig.NITRO.consumeRate * effectiveDt)
		if session.nitroAmount <= 0 then
			session.isNitroActive = false
		end
	end

	-- Update power-up timers
	GameManager.updatePowerups(session, effectiveDt)

	-- Check if should spawn obstacle
	local spawnInterval = GameManager.getSpawnInterval(session)
	if session.gameTime - session.lastSpawnTime >= spawnInterval then
		session.lastSpawnTime = session.gameTime
		GameManager.spawnObstacle(session)
	end

	-- Update obstacles
	GameManager.updateObstacles(session, effectiveDt)

	-- Check collisions
	GameManager.checkCollisions(session)

	-- Send update to client
	remotes.gameUpdate:FireClient(session.player, {
		score = session.score,
		distance = math.floor(session.distance),
		speed = session.speed,
		nitro = session.nitroAmount,
		maxNitro = session.maxNitro,
		lanePosition = session.lanePosition,
		hasShield = session.hasShield,
		isSlowMo = session.isSlowMo,
		scoreMultiplier = session.scoreMultiplier
	})
end

-- Update power-up timers
function GameManager.updatePowerups(session, dt)
	-- Shield timer
	if session.hasShield then
		session.shieldTimer = session.shieldTimer - dt
		if session.shieldTimer <= 0 then
			session.hasShield = false
		end
	end

	-- Slow-mo timer
	if session.isSlowMo then
		session.slowMoTimer = session.slowMoTimer - dt
		if session.slowMoTimer <= 0 then
			session.isSlowMo = false
		end
	end

	-- Multiplier timer
	if session.scoreMultiplier > 1 then
		session.multiplierTimer = session.multiplierTimer - dt
		if session.multiplierTimer <= 0 then
			session.scoreMultiplier = 1
		end
	end
end

-- Get spawn interval based on difficulty
function GameManager.getSpawnInterval(session)
	local progress = math.min(session.gameTime / GameConfig.DIFFICULTY.difficultyRampTime, 1)
	local intervalRange = GameConfig.DIFFICULTY.initialSpawnInterval - GameConfig.DIFFICULTY.minSpawnInterval
	return GameConfig.DIFFICULTY.initialSpawnInterval - intervalRange * progress
end

-- Spawn obstacle for player
function GameManager.spawnObstacle(session)
	local obstacleType = PowerupData.getRandomObstacleType()
	local obstacleData = PowerupData.OBSTACLES[obstacleType]

	-- Random lane
	local lanes = {GameConfig.LANES.LEFT, GameConfig.LANES.CENTER, GameConfig.LANES.RIGHT}
	local lane = lanes[math.random(1, 3)]

	local obstacle = {
		id = game:GetService("HttpService"):GenerateGUID(false),
		type = obstacleType,
		lane = lane,
		z = GameConfig.OBSTACLE.spawnDistance,
		size = obstacleData.size,
		color = obstacleData.color
	}

	table.insert(session.obstacles, obstacle)

	-- Occasionally spawn a second obstacle in different lane
	if math.random() < 0.3 then
		local otherLanes = {}
		for _, l in ipairs(lanes) do
			if l ~= lane then
				table.insert(otherLanes, l)
			end
		end
		if #otherLanes > 0 then
			local secondLane = otherLanes[math.random(1, #otherLanes)]
			local secondType = PowerupData.getRandomObstacleType()
			local secondData = PowerupData.OBSTACLES[secondType]

			local secondObstacle = {
				id = game:GetService("HttpService"):GenerateGUID(false),
				type = secondType,
				lane = secondLane,
				z = GameConfig.OBSTACLE.spawnDistance + math.random(0, 40),
				size = secondData.size,
				color = secondData.color
			}
			table.insert(session.obstacles, secondObstacle)
		end
	end
end

-- Update obstacles positions
function GameManager.updateObstacles(session, dt)
	local moveDistance = session.speed * dt

	for i = #session.obstacles, 1, -1 do
		local obstacle = session.obstacles[i]
		obstacle.z = obstacle.z - moveDistance

		-- Remove if past player
		if obstacle.z < GameConfig.OBSTACLE.despawnDistance then
			table.remove(session.obstacles, i)
		end
	end
end

-- Check collisions with obstacles
function GameManager.checkCollisions(session)
	local playerLane = session.lanePosition / GameConfig.LANE_WIDTH

	for i, obstacle in ipairs(session.obstacles) do
		-- Check if obstacle is in collision range (near player at z=0)
		if obstacle.z >= -20 and obstacle.z <= 20 then
			-- Check if same lane (with some tolerance)
			local laneDiff = math.abs(playerLane - obstacle.lane)
			if laneDiff < 0.7 then
				-- Collision detected
				GameManager.handleCollision(session, obstacle)
				break
			end
		end
	end
end

-- Handle collision
function GameManager.handleCollision(session, obstacle)
	if session.hasShield then
		-- Shield absorbs collision
		session.hasShield = false
		session.shieldTimer = 0
		-- Remove the obstacle
		for i, obs in ipairs(session.obstacles) do
			if obs.id == obstacle.id then
				table.remove(session.obstacles, i)
				break
			end
		end
		return
	end

	-- Game over
	session.state = GameConfig.GAME_STATES.GAME_OVER

	remotes.gameOver:FireClient(session.player, {
		score = session.score,
		distance = math.floor(session.distance)
	})

	-- Clear obstacles
	GameManager.clearObstacles(session)

	print("[GameManager] Game over for", session.player.Name, "- Distance:", math.floor(session.distance))
end

-- Clear all obstacles for session
function GameManager.clearObstacles(session)
	session.obstacles = {}
	session.powerups = {}
	session.nitroZones = {}
end

-- Activate power-up for player
function GameManager.activatePowerup(session, powerupType)
	local powerupData = PowerupData.POWERUPS[powerupType]
	if not powerupData then return end

	if powerupType == "shield" then
		session.hasShield = true
		session.shieldTimer = powerupData.duration
	elseif powerupType == "slowmo" then
		session.isSlowMo = true
		session.slowMoTimer = powerupData.duration
	elseif powerupType == "multiplier" then
		session.scoreMultiplier = 2
		session.multiplierTimer = powerupData.duration
	end

	remotes.powerupCollected:FireClient(session.player, powerupType)
end

-- Add nitro to player
function GameManager.addNitro(session, amount)
	session.nitroAmount = math.min(session.maxNitro, session.nitroAmount + amount)
end

-- Cleanup when player leaves
function GameManager.cleanupPlayer(player)
	local session = playerSessions[player.UserId]
	if session then
		GameManager.clearObstacles(session)
		playerSessions[player.UserId] = nil
	end
end

-- Get session for player (for external access)
function GameManager.getSession(player)
	return playerSessions[player.UserId]
end

return GameManager
