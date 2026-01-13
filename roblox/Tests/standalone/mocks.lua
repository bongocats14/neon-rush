-- mocks.lua
-- Mock Roblox types for standalone testing

local Mocks = {}

-- Mock Color3
Mocks.Color3 = {}
Mocks.Color3.__index = Mocks.Color3

function Mocks.Color3.new(r, g, b)
    local self = setmetatable({}, Mocks.Color3)
    self.R = r or 0
    self.G = g or 0
    self.B = b or 0
    return self
end

function Mocks.Color3.fromRGB(r, g, b)
    return Mocks.Color3.new((r or 0) / 255, (g or 0) / 255, (b or 0) / 255)
end

-- Mock Vector3
Mocks.Vector3 = {}
Mocks.Vector3.__index = Mocks.Vector3

function Mocks.Vector3.new(x, y, z)
    local self = setmetatable({}, Mocks.Vector3)
    self.X = x or 0
    self.Y = y or 0
    self.Z = z or 0
    return self
end

-- Mock typeof function
function Mocks.typeof(value)
    local mt = getmetatable(value)
    if mt == Mocks.Color3 then
        return "Color3"
    elseif mt == Mocks.Vector3 then
        return "Vector3"
    else
        return type(value)
    end
end

-- Mock game:GetService (returns empty table)
Mocks.game = {
    GetService = function(self, name)
        return {}
    end
}

-- Mock HttpService
Mocks.HttpService = {
    GenerateGUID = function(self, wrapInCurlyBraces)
        return string.format("%x%x%x%x-%x%x-%x%x-%x%x-%x%x%x%x%x%x",
            math.random(0, 15), math.random(0, 15), math.random(0, 15), math.random(0, 15),
            math.random(0, 15), math.random(0, 15),
            math.random(0, 15), math.random(0, 15),
            math.random(0, 15), math.random(0, 15),
            math.random(0, 15), math.random(0, 15), math.random(0, 15), math.random(0, 15), math.random(0, 15), math.random(0, 15))
    end
}

return Mocks
