// Jest setup file
import { jest, beforeEach } from '@jest/globals';

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    store: {},
};

localStorageMock.getItem.mockImplementation((key) => localStorageMock.store[key] || null);
localStorageMock.setItem.mockImplementation((key, value) => {
    localStorageMock.store[key] = String(value);
});
localStorageMock.removeItem.mockImplementation((key) => {
    delete localStorageMock.store[key];
});
localStorageMock.clear.mockImplementation(() => {
    localStorageMock.store = {};
});

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
});

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 16);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock AudioContext
class MockAudioContext {
    constructor() {
        this.state = 'running';
        this.destination = {};
    }
    createOscillator() {
        return {
            type: 'sine',
            frequency: { value: 440, setValueAtTime: jest.fn() },
            connect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn(),
        };
    }
    createGain() {
        return {
            gain: { value: 1, setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() },
            connect: jest.fn(),
        };
    }
    createBiquadFilter() {
        return {
            type: 'lowpass',
            frequency: { value: 1000 },
            connect: jest.fn(),
        };
    }
    resume() {
        return Promise.resolve();
    }
}

globalThis.AudioContext = MockAudioContext;
globalThis.webkitAudioContext = MockAudioContext;

// Reset localStorage before each test
beforeEach(() => {
    localStorageMock.store = {};
    jest.clearAllMocks();
});
