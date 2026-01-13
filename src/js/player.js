// Player controls and cockpit rendering

import * as THREE from 'three';
import { LANE_WIDTH, LANES } from './game.js';
import { CARS } from './cars.js';

class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.currentLane = LANES.CENTER;
        this.targetLane = LANES.CENTER;
        this.lanePosition = 0;
        this.laneSwitchSpeed = 10;
        this.selectedCar = null;

        // Cockpit elements
        this.dashboard = null;
        this.speedometer = null;
        this.nitroMeter = null;
        this.cockpitGroup = null;

        // Effects
        this.screenShake = 0;
        this.nitroVisualIntensity = 0;
    }

    /**
     * Initialize player with selected car
     */
    init(carId) {
        this.selectedCar = CARS[carId];
        this.laneSwitchSpeed = this.selectedCar?.laneSwitchSpeed || 10;
        this.currentLane = LANES.CENTER;
        this.targetLane = LANES.CENTER;
        this.lanePosition = 0;

        // Set up camera for first-person view
        this.camera.position.set(0, 1.5, 0);
        this.camera.rotation.set(0, 0, 0);

        this.createCockpit();
    }

    /**
     * Create cockpit/dashboard overlay
     */
    createCockpit() {
        // Remove existing cockpit
        if (this.cockpitGroup) {
            this.scene.remove(this.cockpitGroup);
        }

        this.cockpitGroup = new THREE.Group();

        const carColor = this.selectedCar?.color || 0x00ffff;

        // Dashboard base
        const dashGeom = new THREE.BoxGeometry(3, 0.3, 1.5);
        const dashMaterial = new THREE.MeshBasicMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0.9
        });
        this.dashboard = new THREE.Mesh(dashGeom, dashMaterial);
        this.dashboard.position.set(0, 0.5, 0.8); // Positive z (in front)
        this.cockpitGroup.add(this.dashboard);

        // Dashboard accent lines
        const accentMaterial = new THREE.MeshBasicMaterial({
            color: carColor,
            transparent: true,
            opacity: 0.8
        });

        // Top accent line
        const topAccent = new THREE.Mesh(
            new THREE.BoxGeometry(2.8, 0.02, 0.02),
            accentMaterial
        );
        topAccent.position.set(0, 0.66, 0.8);
        this.cockpitGroup.add(topAccent);

        // Side pillars (A-pillars framing the view)
        [-1.4, 1.4].forEach(x => {
            const pillarGeom = new THREE.BoxGeometry(0.1, 1.5, 0.1);
            const pillar = new THREE.Mesh(pillarGeom, dashMaterial);
            pillar.position.set(x, 1, 0.9);
            this.cockpitGroup.add(pillar);

            // Pillar glow
            const glowPillar = new THREE.Mesh(
                new THREE.BoxGeometry(0.02, 1.4, 0.02),
                accentMaterial
            );
            glowPillar.position.set(x * 0.95, 1, 0.85);
            this.cockpitGroup.add(glowPillar);
        });

        // Steering wheel hint
        const wheelGeom = new THREE.TorusGeometry(0.2, 0.03, 8, 24);
        const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const wheel = new THREE.Mesh(wheelGeom, wheelMaterial);
        wheel.position.set(0, 0.8, 0.5);
        wheel.rotation.x = Math.PI / 4; // Tilted toward player
        this.cockpitGroup.add(wheel);

        // Add to scene
        this.cockpitGroup.position.y = -0.3;
        this.camera.add(this.cockpitGroup);
        this.scene.add(this.camera);
    }

    /**
     * Update player position and effects
     */
    update(deltaTime, game) {
        // Smooth lane transition
        const targetX = game.targetLane * LANE_WIDTH;
        const diff = targetX - this.lanePosition;

        if (Math.abs(diff) > 0.01) {
            this.lanePosition += diff * this.laneSwitchSpeed * deltaTime;
        } else {
            this.lanePosition = targetX;
            this.currentLane = game.targetLane;
        }

        // Update camera position
        this.camera.position.x = this.lanePosition;

        // Screen shake effect
        if (this.screenShake > 0) {
            this.camera.position.x += (Math.random() - 0.5) * this.screenShake * 0.2;
            this.camera.position.y = 1.5 + (Math.random() - 0.5) * this.screenShake * 0.1;
            this.screenShake *= 0.9;
            if (this.screenShake < 0.01) {
                this.screenShake = 0;
                this.camera.position.y = 1.5;
            }
        }

        // Nitro visual effect
        if (game.isNitroActive) {
            this.nitroVisualIntensity = Math.min(1, this.nitroVisualIntensity + deltaTime * 3);
        } else {
            this.nitroVisualIntensity = Math.max(0, this.nitroVisualIntensity - deltaTime * 2);
        }

        // Apply subtle tilt when switching lanes
        const tiltAmount = -diff * 0.02;
        this.camera.rotation.z = tiltAmount;
    }

    /**
     * Trigger screen shake
     */
    shake(intensity = 1) {
        this.screenShake = intensity;
    }

    /**
     * Move to left lane
     */
    moveLeft() {
        if (this.targetLane > LANES.LEFT) {
            this.targetLane--;
            return true;
        }
        return false;
    }

    /**
     * Move to right lane
     */
    moveRight() {
        if (this.targetLane < LANES.RIGHT) {
            this.targetLane++;
            return true;
        }
        return false;
    }

    /**
     * Get current interpolated lane position
     */
    getLanePosition() {
        return this.lanePosition / LANE_WIDTH;
    }

    /**
     * Get current target lane
     */
    getTargetLane() {
        return this.targetLane;
    }

    /**
     * Reset player state
     */
    reset() {
        this.currentLane = LANES.CENTER;
        this.targetLane = LANES.CENTER;
        this.lanePosition = 0;
        this.screenShake = 0;
        this.nitroVisualIntensity = 0;

        if (this.camera) {
            this.camera.position.set(0, 1.5, 0);
            this.camera.rotation.set(0, 0, 0);
        }
    }

    /**
     * Dispose of resources
     */
    dispose() {
        if (this.cockpitGroup) {
            this.camera.remove(this.cockpitGroup);
            this.cockpitGroup.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
    }
}

export default Player;
