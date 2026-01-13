-- Init.server.lua
-- Server initialization script for Neon Rush
-- Place in: ServerScriptService

local GameManager = require(script.Parent:WaitForChild("GameManager"))

-- Initialize the game manager
GameManager.init()

print("[NeonRush] Server initialized")
