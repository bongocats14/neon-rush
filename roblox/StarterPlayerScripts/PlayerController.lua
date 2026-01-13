-- PlayerController.lua
-- Client-side input handling and movement for Neon Rush
-- Place in: StarterPlayer > StarterPlayerScripts

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")
local RunService = game:GetService("RunService")
local Players = game:GetService("Players")

local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local CarData = require(ReplicatedStorage:WaitForChild("CarData"))

local PlayerController = {}

-- Wait for remotes
local remotesFolder = ReplicatedStorage:WaitForChild("GameRemotes")
local remotes = {
	gameStart = remotesFolder:WaitForChild("GameStart"),
	gameUpdate = remotesFolder:WaitForChild("GameUpdate"),
	gameOver = remotesFolder:WaitForChild("GameOver"),
	playerMove = remotesFolder:WaitForChild("PlayerMove"),
	playerNitro = remotesFolder:WaitForChild("PlayerNitro"),
	powerupCollected = remotesFolder:WaitForChild("PowerupCollected")
}

-- Local state
local localPlayer = Players.LocalPlayer
local currentState = GameConfig.GAME_STATES.MENU
local selectedCar = nil
local gameData = {}

-- Input state
local nitroHeld = false

-- Initialize player controller
function PlayerController.init()
	-- Setup input handling
	UserInputService.InputBegan:Connect(PlayerController.onInputBegan)
	UserInputService.InputEnded:Connect(PlayerController.onInputEnded)

	-- Setup remote event listeners
	remotes.gameUpdate.OnClientEvent:Connect(PlayerController.onGameUpdate)
	remotes.gameOver.OnClientEvent:Connect(PlayerController.onGameOver)
	remotes.powerupCollected.OnClientEvent:Connect(PlayerController.onPowerupCollected)

	print("[PlayerController] Initialized")
end

-- Handle key press
function PlayerController.onInputBegan(input, gameProcessed)
	if gameProcessed then return end

	local key = input.KeyCode

	-- Menu controls
	if currentState == GameConfig.GAME_STATES.MENU then
		if key == Enum.KeyCode.Space then
			PlayerController.showCarSelect()
		end
		return
	end

	-- Car select controls
	if currentState == GameConfig.GAME_STATES.CAR_SELECT then
		if key == Enum.KeyCode.One then
			PlayerController.selectCar("bmw_m3")
		elseif key == Enum.KeyCode.Two then
			PlayerController.selectCar("supra")
		elseif key == Enum.KeyCode.Three then
			PlayerController.selectCar("corvette")
		end
		return
	end

	-- Game over controls
	if currentState == GameConfig.GAME_STATES.GAME_OVER then
		if key == Enum.KeyCode.Space then
			PlayerController.showCarSelect()
		end
		return
	end

	-- Playing controls
	if currentState == GameConfig.GAME_STATES.PLAYING then
		-- Lane movement
		if key == Enum.KeyCode.A or key == Enum.KeyCode.Left then
			remotes.playerMove:FireServer(-1)  -- Move left
		elseif key == Enum.KeyCode.D or key == Enum.KeyCode.Right then
			remotes.playerMove:FireServer(1)   -- Move right
		-- Nitro
		elseif key == Enum.KeyCode.W or key == Enum.KeyCode.LeftShift then
			nitroHeld = true
			remotes.playerNitro:FireServer(true)
		end
	end
end

-- Handle key release
function PlayerController.onInputEnded(input, gameProcessed)
	local key = input.KeyCode

	-- Release nitro
	if key == Enum.KeyCode.W or key == Enum.KeyCode.LeftShift then
		nitroHeld = false
		remotes.playerNitro:FireServer(false)
	end
end

-- Show car selection
function PlayerController.showCarSelect()
	currentState = GameConfig.GAME_STATES.CAR_SELECT
	-- UI will be handled by separate UI script
	-- Fire event for UI to listen to
	local event = localPlayer:FindFirstChild("CarSelectEvent")
	if event then
		event:Fire()
	end
end

-- Select car and start game
function PlayerController.selectCar(carId)
	local car = CarData.getCarById(carId)
	if not car then return end

	selectedCar = carId
	currentState = GameConfig.GAME_STATES.PLAYING

	-- Tell server to start game
	remotes.gameStart:FireServer(carId)

	print("[PlayerController] Selected car:", car.name)
end

-- Handle game update from server
function PlayerController.onGameUpdate(data)
	gameData = data

	-- Update UI (handled by HUD script listening to this)
	local hudEvent = localPlayer:FindFirstChild("HUDUpdateEvent")
	if hudEvent then
		hudEvent:Fire(data)
	end
end

-- Handle game over
function PlayerController.onGameOver(data)
	currentState = GameConfig.GAME_STATES.GAME_OVER
	gameData.finalScore = data.score
	gameData.finalDistance = data.distance

	print("[PlayerController] Game Over - Distance:", data.distance)

	-- Fire event for UI
	local event = localPlayer:FindFirstChild("GameOverEvent")
	if event then
		event:Fire(data)
	end
end

-- Handle powerup collection
function PlayerController.onPowerupCollected(powerupType)
	print("[PlayerController] Collected powerup:", powerupType)

	-- Play collection effect (handled by effects script)
	local event = localPlayer:FindFirstChild("PowerupEvent")
	if event then
		event:Fire(powerupType)
	end
end

-- Get current game state
function PlayerController.getState()
	return currentState
end

-- Get current game data
function PlayerController.getGameData()
	return gameData
end

-- Get selected car
function PlayerController.getSelectedCar()
	return selectedCar
end

-- Set state (for UI scripts to call)
function PlayerController.setState(newState)
	currentState = newState
end

return PlayerController
