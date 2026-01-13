-- MainUI.client.lua
-- Main UI controller for Neon Rush - handles all screens
-- Place in: StarterGui

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")

local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local CarData = require(ReplicatedStorage:WaitForChild("CarData"))

local localPlayer = Players.LocalPlayer
local playerGui = localPlayer:WaitForChild("PlayerGui")

local MainUI = {}

-- UI References
local screenGui
local mainMenu
local carSelect
local hud
local gameOver

-- Colors
local COLORS = {
	background = Color3.fromRGB(10, 10, 20),
	cyan = Color3.fromRGB(0, 255, 255),
	magenta = Color3.fromRGB(255, 0, 255),
	orange = Color3.fromRGB(255, 102, 0),
	purple = Color3.fromRGB(139, 0, 255),
	white = Color3.fromRGB(255, 255, 255),
	darkGray = Color3.fromRGB(30, 30, 40)
}

-- Create the main ScreenGui
function MainUI.createScreenGui()
	screenGui = Instance.new("ScreenGui")
	screenGui.Name = "NeonRushUI"
	screenGui.ResetOnSpawn = false
	screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
	screenGui.Parent = playerGui

	return screenGui
end

-- Create neon text label
function MainUI.createNeonLabel(parent, text, size, position, color)
	local label = Instance.new("TextLabel")
	label.Size = size
	label.Position = position
	label.BackgroundTransparency = 1
	label.Text = text
	label.TextColor3 = color or COLORS.cyan
	label.Font = Enum.Font.GothamBold
	label.TextScaled = true
	label.Parent = parent

	-- Add glow effect with UIStroke
	local stroke = Instance.new("UIStroke")
	stroke.Color = color or COLORS.cyan
	stroke.Thickness = 2
	stroke.Transparency = 0.5
	stroke.Parent = label

	return label
end

-- Create Main Menu
function MainUI.createMainMenu()
	mainMenu = Instance.new("Frame")
	mainMenu.Name = "MainMenu"
	mainMenu.Size = UDim2.new(1, 0, 1, 0)
	mainMenu.BackgroundColor3 = COLORS.background
	mainMenu.BorderSizePixel = 0
	mainMenu.Parent = screenGui

	-- Title
	MainUI.createNeonLabel(
		mainMenu,
		"NEON RUSH",
		UDim2.new(0.8, 0, 0.2, 0),
		UDim2.new(0.1, 0, 0.2, 0),
		COLORS.cyan
	)

	-- Subtitle
	MainUI.createNeonLabel(
		mainMenu,
		"SYNTHWAVE ENDLESS RUNNER",
		UDim2.new(0.6, 0, 0.05, 0),
		UDim2.new(0.2, 0, 0.42, 0),
		COLORS.magenta
	)

	-- Press Space prompt (blinking)
	local prompt = MainUI.createNeonLabel(
		mainMenu,
		"PRESS SPACE TO START",
		UDim2.new(0.5, 0, 0.06, 0),
		UDim2.new(0.25, 0, 0.65, 0),
		COLORS.white
	)
	prompt.Name = "StartPrompt"

	-- Blink animation
	spawn(function()
		while mainMenu and mainMenu.Parent do
			for i = 1, 10 do
				if not prompt or not prompt.Parent then return end
				prompt.TextTransparency = i / 10
				wait(0.05)
			end
			wait(0.2)
			for i = 10, 1, -1 do
				if not prompt or not prompt.Parent then return end
				prompt.TextTransparency = i / 10
				wait(0.05)
			end
			wait(0.5)
		end
	end)

	return mainMenu
end

-- Create Car Selection Screen
function MainUI.createCarSelect()
	carSelect = Instance.new("Frame")
	carSelect.Name = "CarSelect"
	carSelect.Size = UDim2.new(1, 0, 1, 0)
	carSelect.BackgroundColor3 = COLORS.background
	carSelect.BorderSizePixel = 0
	carSelect.Visible = false
	carSelect.Parent = screenGui

	-- Title
	MainUI.createNeonLabel(
		carSelect,
		"SELECT YOUR RIDE",
		UDim2.new(0.6, 0, 0.1, 0),
		UDim2.new(0.2, 0, 0.05, 0),
		COLORS.cyan
	)

	-- Car cards container
	local cardsContainer = Instance.new("Frame")
	cardsContainer.Name = "CarCards"
	cardsContainer.Size = UDim2.new(0.9, 0, 0.6, 0)
	cardsContainer.Position = UDim2.new(0.05, 0, 0.2, 0)
	cardsContainer.BackgroundTransparency = 1
	cardsContainer.Parent = carSelect

	local layout = Instance.new("UIListLayout")
	layout.FillDirection = Enum.FillDirection.Horizontal
	layout.HorizontalAlignment = Enum.HorizontalAlignment.Center
	layout.Padding = UDim.new(0.02, 0)
	layout.Parent = cardsContainer

	-- Create car cards
	local cars = CarData.getAllCars()
	for i, car in ipairs(cars) do
		MainUI.createCarCard(cardsContainer, car, i)
	end

	-- Instructions
	MainUI.createNeonLabel(
		carSelect,
		"PRESS 1, 2, OR 3 TO SELECT",
		UDim2.new(0.5, 0, 0.05, 0),
		UDim2.new(0.25, 0, 0.85, 0),
		COLORS.white
	)

	return carSelect
end

-- Create individual car card
function MainUI.createCarCard(parent, car, index)
	local card = Instance.new("Frame")
	card.Name = car.id
	card.Size = UDim2.new(0.3, 0, 1, 0)
	card.BackgroundColor3 = COLORS.darkGray
	card.BorderSizePixel = 0
	card.Parent = parent

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 10)
	corner.Parent = card

	local stroke = Instance.new("UIStroke")
	stroke.Color = car.color
	stroke.Thickness = 3
	stroke.Parent = card

	-- Car number
	MainUI.createNeonLabel(
		card,
		tostring(index),
		UDim2.new(0.2, 0, 0.1, 0),
		UDim2.new(0.05, 0, 0.02, 0),
		car.color
	)

	-- Car name
	MainUI.createNeonLabel(
		card,
		car.name,
		UDim2.new(0.9, 0, 0.12, 0),
		UDim2.new(0.05, 0, 0.15, 0),
		car.color
	)

	-- Car description
	local desc = Instance.new("TextLabel")
	desc.Size = UDim2.new(0.9, 0, 0.08, 0)
	desc.Position = UDim2.new(0.05, 0, 0.28, 0)
	desc.BackgroundTransparency = 1
	desc.Text = car.description
	desc.TextColor3 = COLORS.white
	desc.Font = Enum.Font.Gotham
	desc.TextScaled = true
	desc.Parent = card

	-- Stats
	local statsY = 0.4
	local stats = {
		{name = "SPEED", value = car.topSpeed, max = 120},
		{name = "ACCEL", value = car.acceleration, max = 12},
		{name = "NITRO", value = car.maxNitro, max = 150},
	}

	for _, stat in ipairs(stats) do
		-- Stat label
		local statLabel = Instance.new("TextLabel")
		statLabel.Size = UDim2.new(0.3, 0, 0.06, 0)
		statLabel.Position = UDim2.new(0.05, 0, statsY, 0)
		statLabel.BackgroundTransparency = 1
		statLabel.Text = stat.name
		statLabel.TextColor3 = COLORS.white
		statLabel.Font = Enum.Font.GothamBold
		statLabel.TextScaled = true
		statLabel.TextXAlignment = Enum.TextXAlignment.Left
		statLabel.Parent = card

		-- Stat bar background
		local barBg = Instance.new("Frame")
		barBg.Size = UDim2.new(0.55, 0, 0.04, 0)
		barBg.Position = UDim2.new(0.35, 0, statsY + 0.01, 0)
		barBg.BackgroundColor3 = Color3.fromRGB(50, 50, 60)
		barBg.BorderSizePixel = 0
		barBg.Parent = card

		local barCorner = Instance.new("UICorner")
		barCorner.CornerRadius = UDim.new(0.5, 0)
		barCorner.Parent = barBg

		-- Stat bar fill
		local barFill = Instance.new("Frame")
		barFill.Size = UDim2.new(stat.value / stat.max, 0, 1, 0)
		barFill.BackgroundColor3 = car.color
		barFill.BorderSizePixel = 0
		barFill.Parent = barBg

		local fillCorner = Instance.new("UICorner")
		fillCorner.CornerRadius = UDim.new(0.5, 0)
		fillCorner.Parent = barFill

		statsY = statsY + 0.12
	end

	return card
end

-- Create HUD
function MainUI.createHUD()
	hud = Instance.new("Frame")
	hud.Name = "HUD"
	hud.Size = UDim2.new(1, 0, 1, 0)
	hud.BackgroundTransparency = 1
	hud.Visible = false
	hud.Parent = screenGui

	-- Top bar - Car name and speed
	local topBar = Instance.new("Frame")
	topBar.Name = "TopBar"
	topBar.Size = UDim2.new(1, 0, 0.08, 0)
	topBar.Position = UDim2.new(0, 0, 0.02, 0)
	topBar.BackgroundTransparency = 1
	topBar.Parent = hud

	-- Car name (left)
	local carName = Instance.new("TextLabel")
	carName.Name = "CarName"
	carName.Size = UDim2.new(0.4, 0, 1, 0)
	carName.Position = UDim2.new(0.02, 0, 0, 0)
	carName.BackgroundTransparency = 1
	carName.Text = "BMW M3"
	carName.TextColor3 = COLORS.cyan
	carName.Font = Enum.Font.GothamBold
	carName.TextScaled = true
	carName.TextXAlignment = Enum.TextXAlignment.Left
	carName.Parent = topBar

	-- Speed (right)
	local speed = Instance.new("TextLabel")
	speed.Name = "Speed"
	speed.Size = UDim2.new(0.3, 0, 1, 0)
	speed.Position = UDim2.new(0.68, 0, 0, 0)
	speed.BackgroundTransparency = 1
	speed.Text = "0 KM/H"
	speed.TextColor3 = COLORS.white
	speed.Font = Enum.Font.GothamBold
	speed.TextScaled = true
	speed.TextXAlignment = Enum.TextXAlignment.Right
	speed.Parent = topBar

	-- Bottom bar
	local bottomBar = Instance.new("Frame")
	bottomBar.Name = "BottomBar"
	bottomBar.Size = UDim2.new(1, 0, 0.1, 0)
	bottomBar.Position = UDim2.new(0, 0, 0.88, 0)
	bottomBar.BackgroundTransparency = 1
	bottomBar.Parent = hud

	-- Nitro bar (left)
	local nitroContainer = Instance.new("Frame")
	nitroContainer.Name = "NitroContainer"
	nitroContainer.Size = UDim2.new(0.3, 0, 0.4, 0)
	nitroContainer.Position = UDim2.new(0.02, 0, 0.3, 0)
	nitroContainer.BackgroundColor3 = Color3.fromRGB(30, 30, 40)
	nitroContainer.BorderSizePixel = 0
	nitroContainer.Parent = bottomBar

	local nitroCorner = Instance.new("UICorner")
	nitroCorner.CornerRadius = UDim.new(0.3, 0)
	nitroCorner.Parent = nitroContainer

	local nitroFill = Instance.new("Frame")
	nitroFill.Name = "NitroFill"
	nitroFill.Size = UDim2.new(0, 0, 1, 0)
	nitroFill.BackgroundColor3 = COLORS.orange
	nitroFill.BorderSizePixel = 0
	nitroFill.Parent = nitroContainer

	local nitroFillCorner = Instance.new("UICorner")
	nitroFillCorner.CornerRadius = UDim.new(0.3, 0)
	nitroFillCorner.Parent = nitroFill

	local nitroLabel = Instance.new("TextLabel")
	nitroLabel.Name = "NitroLabel"
	nitroLabel.Size = UDim2.new(1, 0, 1, 0)
	nitroLabel.BackgroundTransparency = 1
	nitroLabel.Text = "NITRO"
	nitroLabel.TextColor3 = COLORS.white
	nitroLabel.Font = Enum.Font.GothamBold
	nitroLabel.TextScaled = true
	nitroLabel.Parent = nitroContainer

	-- Score (right)
	local score = Instance.new("TextLabel")
	score.Name = "Score"
	score.Size = UDim2.new(0.3, 0, 0.6, 0)
	score.Position = UDim2.new(0.68, 0, 0.2, 0)
	score.BackgroundTransparency = 1
	score.Text = "0 m"
	score.TextColor3 = COLORS.cyan
	score.Font = Enum.Font.GothamBold
	score.TextScaled = true
	score.TextXAlignment = Enum.TextXAlignment.Right
	score.Parent = bottomBar

	-- Power-up indicators (center)
	local powerups = Instance.new("Frame")
	powerups.Name = "Powerups"
	powerups.Size = UDim2.new(0.2, 0, 0.6, 0)
	powerups.Position = UDim2.new(0.4, 0, 0.2, 0)
	powerups.BackgroundTransparency = 1
	powerups.Parent = bottomBar

	local powerupLayout = Instance.new("UIListLayout")
	powerupLayout.FillDirection = Enum.FillDirection.Horizontal
	powerupLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
	powerupLayout.Padding = UDim.new(0.05, 0)
	powerupLayout.Parent = powerups

	-- Shield indicator
	local shieldIndicator = Instance.new("Frame")
	shieldIndicator.Name = "Shield"
	shieldIndicator.Size = UDim2.new(0.3, 0, 1, 0)
	shieldIndicator.BackgroundColor3 = COLORS.cyan
	shieldIndicator.BackgroundTransparency = 0.7
	shieldIndicator.Visible = false
	shieldIndicator.Parent = powerups

	-- SlowMo indicator
	local slowMoIndicator = Instance.new("Frame")
	slowMoIndicator.Name = "SlowMo"
	slowMoIndicator.Size = UDim2.new(0.3, 0, 1, 0)
	slowMoIndicator.BackgroundColor3 = COLORS.purple
	slowMoIndicator.BackgroundTransparency = 0.7
	slowMoIndicator.Visible = false
	slowMoIndicator.Parent = powerups

	-- Multiplier indicator
	local multiplierIndicator = Instance.new("Frame")
	multiplierIndicator.Name = "Multiplier"
	multiplierIndicator.Size = UDim2.new(0.3, 0, 1, 0)
	multiplierIndicator.BackgroundColor3 = Color3.fromRGB(255, 215, 0)
	multiplierIndicator.BackgroundTransparency = 0.7
	multiplierIndicator.Visible = false
	multiplierIndicator.Parent = powerups

	return hud
end

-- Create Game Over Screen
function MainUI.createGameOver()
	gameOver = Instance.new("Frame")
	gameOver.Name = "GameOver"
	gameOver.Size = UDim2.new(1, 0, 1, 0)
	gameOver.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
	gameOver.BackgroundTransparency = 0.3
	gameOver.Visible = false
	gameOver.Parent = screenGui

	-- Game Over title
	MainUI.createNeonLabel(
		gameOver,
		"GAME OVER",
		UDim2.new(0.6, 0, 0.15, 0),
		UDim2.new(0.2, 0, 0.2, 0),
		COLORS.magenta
	)

	-- Distance
	local distanceLabel = MainUI.createNeonLabel(
		gameOver,
		"DISTANCE",
		UDim2.new(0.3, 0, 0.05, 0),
		UDim2.new(0.35, 0, 0.45, 0),
		COLORS.white
	)

	local distanceValue = Instance.new("TextLabel")
	distanceValue.Name = "DistanceValue"
	distanceValue.Size = UDim2.new(0.4, 0, 0.1, 0)
	distanceValue.Position = UDim2.new(0.3, 0, 0.5, 0)
	distanceValue.BackgroundTransparency = 1
	distanceValue.Text = "0 m"
	distanceValue.TextColor3 = COLORS.cyan
	distanceValue.Font = Enum.Font.GothamBold
	distanceValue.TextScaled = true
	distanceValue.Parent = gameOver

	-- Restart prompt
	MainUI.createNeonLabel(
		gameOver,
		"PRESS SPACE TO CONTINUE",
		UDim2.new(0.5, 0, 0.05, 0),
		UDim2.new(0.25, 0, 0.75, 0),
		COLORS.white
	)

	return gameOver
end

-- Show specific screen
function MainUI.showScreen(screenName)
	mainMenu.Visible = (screenName == "menu")
	carSelect.Visible = (screenName == "carSelect")
	hud.Visible = (screenName == "hud")
	gameOver.Visible = (screenName == "gameOver")
end

-- Update HUD values
function MainUI.updateHUD(data)
	if not hud then return end

	-- Update speed
	local speedLabel = hud:FindFirstChild("TopBar"):FindFirstChild("Speed")
	if speedLabel and data.speed then
		speedLabel.Text = string.format("%d KM/H", math.floor(data.speed))
	end

	-- Update score/distance
	local scoreLabel = hud:FindFirstChild("BottomBar"):FindFirstChild("Score")
	if scoreLabel and data.distance then
		scoreLabel.Text = string.format("%d m", data.distance)
	end

	-- Update nitro bar
	local nitroContainer = hud:FindFirstChild("BottomBar"):FindFirstChild("NitroContainer")
	if nitroContainer and data.nitro and data.maxNitro then
		local nitroFill = nitroContainer:FindFirstChild("NitroFill")
		if nitroFill then
			local ratio = math.clamp(data.nitro / data.maxNitro, 0, 1)
			nitroFill.Size = UDim2.new(ratio, 0, 1, 0)
		end
	end

	-- Update power-up indicators
	local powerups = hud:FindFirstChild("BottomBar"):FindFirstChild("Powerups")
	if powerups then
		local shield = powerups:FindFirstChild("Shield")
		local slowMo = powerups:FindFirstChild("SlowMo")
		local multiplier = powerups:FindFirstChild("Multiplier")

		if shield then shield.Visible = data.hasShield or false end
		if slowMo then slowMo.Visible = data.isSlowMo or false end
		if multiplier then multiplier.Visible = (data.scoreMultiplier or 1) > 1 end
	end
end

-- Update game over screen
function MainUI.showGameOver(data)
	if not gameOver then return end

	local distanceValue = gameOver:FindFirstChild("DistanceValue")
	if distanceValue and data.distance then
		distanceValue.Text = string.format("%d m", data.distance)
	end

	MainUI.showScreen("gameOver")
end

-- Initialize all UI
function MainUI.init()
	MainUI.createScreenGui()
	MainUI.createMainMenu()
	MainUI.createCarSelect()
	MainUI.createHUD()
	MainUI.createGameOver()

	-- Listen for events
	local carSelectEvent = localPlayer:WaitForChild("CarSelectEvent")
	carSelectEvent.Event:Connect(function()
		MainUI.showScreen("carSelect")
	end)

	local hudUpdateEvent = localPlayer:WaitForChild("HUDUpdateEvent")
	hudUpdateEvent.Event:Connect(function(data)
		MainUI.showScreen("hud")
		MainUI.updateHUD(data)
	end)

	local gameOverEvent = localPlayer:WaitForChild("GameOverEvent")
	gameOverEvent.Event:Connect(function(data)
		MainUI.showGameOver(data)
	end)

	-- Show main menu initially
	MainUI.showScreen("menu")

	print("[MainUI] Initialized")
end

-- Start
MainUI.init()

return MainUI
