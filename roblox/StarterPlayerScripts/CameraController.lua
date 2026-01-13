-- CameraController.lua
-- First-person cockpit camera for Neon Rush
-- Place in: StarterPlayer > StarterPlayerScripts

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Players = game:GetService("Players")

local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))

local CameraController = {}

-- Camera reference
local camera = workspace.CurrentCamera
local localPlayer = Players.LocalPlayer

-- Camera state
local targetPosition = Vector3.new(0, GameConfig.CAMERA.height, 0)
local currentTilt = 0
local screenShake = 0
local lastLanePosition = 0

-- Initialize camera
function CameraController.init()
	-- Set camera type to scriptable
	camera.CameraType = Enum.CameraType.Scriptable
	camera.FieldOfView = GameConfig.CAMERA.fov

	-- Initial position - looking down the road toward +Z
	camera.CFrame = CFrame.new(0, GameConfig.CAMERA.height, 0) * CFrame.Angles(0, math.pi, 0)

	-- Connect to render step for smooth updates
	RunService.RenderStepped:Connect(CameraController.update)

	print("[CameraController] Initialized")
end

-- Update camera each frame
function CameraController.update(dt)
	local playerController = require(script.Parent:WaitForChild("PlayerController"))
	local state = playerController.getState()

	if state == GameConfig.GAME_STATES.PLAYING then
		CameraController.updateGameCamera(dt, playerController)
	else
		CameraController.updateMenuCamera(dt)
	end
end

-- Update camera during gameplay
function CameraController.updateGameCamera(dt, playerController)
	local gameData = playerController.getGameData()
	if not gameData then return end

	local lanePosition = gameData.lanePosition or 0

	-- Calculate tilt based on lane movement
	local laneDiff = lanePosition - lastLanePosition
	local targetTilt = -laneDiff * GameConfig.CAMERA.tiltAmount
	currentTilt = currentTilt + (targetTilt - currentTilt) * 10 * dt
	lastLanePosition = lanePosition

	-- Apply screen shake
	local shakeX = 0
	local shakeY = 0
	if screenShake > 0.01 then
		shakeX = (math.random() - 0.5) * screenShake * 2
		shakeY = (math.random() - 0.5) * screenShake
		screenShake = screenShake * GameConfig.CAMERA.shakeDecay
	else
		screenShake = 0
	end

	-- Calculate camera position
	local camX = lanePosition + shakeX
	local camY = GameConfig.CAMERA.height + shakeY
	local camZ = 0  -- Player is always at Z=0, world moves toward them

	-- Build camera CFrame
	-- Position at player location, looking toward +Z (where obstacles come from)
	-- Rotated 180 degrees around Y to face +Z
	local position = Vector3.new(camX, camY, camZ)
	local rotation = CFrame.Angles(0, math.pi, currentTilt)

	camera.CFrame = CFrame.new(position) * rotation
end

-- Update camera during menus
function CameraController.updateMenuCamera(dt)
	-- Gentle floating motion for menu
	local time = tick()
	local bobY = math.sin(time * 0.5) * 0.2
	local bobX = math.cos(time * 0.3) * 0.1

	local position = Vector3.new(bobX, GameConfig.CAMERA.height + bobY, 0)
	local rotation = CFrame.Angles(0, math.pi, 0)

	camera.CFrame = CFrame.new(position) * rotation
end

-- Trigger screen shake
function CameraController.shake(intensity)
	screenShake = intensity or 1
end

-- Reset camera to default position
function CameraController.reset()
	currentTilt = 0
	screenShake = 0
	lastLanePosition = 0
	camera.CFrame = CFrame.new(0, GameConfig.CAMERA.height, 0) * CFrame.Angles(0, math.pi, 0)
end

-- Set camera for spectating/overview
function CameraController.setOverviewMode()
	camera.CFrame = CFrame.new(0, 50, -100) * CFrame.Angles(-math.pi/6, math.pi, 0)
end

return CameraController
