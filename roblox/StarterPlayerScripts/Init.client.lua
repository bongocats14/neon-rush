-- Init.client.lua
-- Client initialization script for Neon Rush
-- Place in: StarterPlayer > StarterPlayerScripts

local Players = game:GetService("Players")
local localPlayer = Players.LocalPlayer

-- Create bindable events for inter-script communication
local function createBindableEvent(name)
	local event = Instance.new("BindableEvent")
	event.Name = name
	event.Parent = localPlayer
	return event
end

-- Create events
createBindableEvent("CarSelectEvent")
createBindableEvent("HUDUpdateEvent")
createBindableEvent("GameOverEvent")
createBindableEvent("PowerupEvent")

-- Initialize controllers
local PlayerController = require(script.Parent:WaitForChild("PlayerController"))
local CameraController = require(script.Parent:WaitForChild("CameraController"))

PlayerController.init()
CameraController.init()

print("[NeonRush] Client initialized for", localPlayer.Name)
