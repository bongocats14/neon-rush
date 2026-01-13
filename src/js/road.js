// Road and environment generation for Three.js

import * as THREE from 'three';
import { ROAD_WIDTH, LANE_WIDTH } from './game.js';

// Colors
const COLORS = {
    road: 0x0a0a0f,
    grid: 0x00ffff,
    laneDivider: 0xff00ff,
    barrier: 0x8b00ff,
    sunTop: 0xff00ff,
    sunBottom: 0xff6600,
    sky: 0x0a0a0f,
    stars: 0xffffff
};

// Road configuration
const ROAD_CONFIG = {
    segmentLength: 50,
    segmentCount: 10,
    gridSpacing: 2,
    barrierHeight: 2,
    barrierWidth: 0.3
};

class RoadManager {
    constructor(scene) {
        this.scene = scene;
        this.roadSegments = [];
        this.barriers = [];
        this.gridLines = [];
        this.sun = null;
        this.stars = null;
        this.totalLength = ROAD_CONFIG.segmentLength * ROAD_CONFIG.segmentCount;
    }

    /**
     * Create the entire road environment
     */
    create() {
        this.createSkybox();
        this.createSun();
        this.createStars();
        this.createRoadSegments();
        this.createBarriers();
        this.createGridLines();
        this.createLaneDividers();
    }

    /**
     * Create dark skybox/background
     */
    createSkybox() {
        this.scene.background = new THREE.Color(COLORS.sky);
        this.scene.fog = new THREE.Fog(COLORS.sky, 50, 300);
    }

    /**
     * Create retro sun on horizon
     */
    createSun() {
        const sunGroup = new THREE.Group();

        // Create stacked circles for retro sun effect
        const sunLayers = 8;
        for (let i = 0; i < sunLayers; i++) {
            const radius = 40 - i * 4;
            const geometry = new THREE.CircleGeometry(radius, 32);

            // Gradient from magenta to orange
            const t = i / (sunLayers - 1);
            const color = new THREE.Color().lerpColors(
                new THREE.Color(COLORS.sunTop),
                new THREE.Color(COLORS.sunBottom),
                t
            );

            const material = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide
            });

            const circle = new THREE.Mesh(geometry, material);
            circle.position.z = 350 - i * 0.1; // Positive z (in front of player)
            circle.position.y = 30 - i * 2;
            sunGroup.add(circle);
        }

        // Add horizontal lines through sun for retro effect
        const lineMaterial = new THREE.MeshBasicMaterial({ color: COLORS.sky });
        for (let i = 0; i < 6; i++) {
            const lineGeom = new THREE.PlaneGeometry(100, 2);
            const line = new THREE.Mesh(lineGeom, lineMaterial);
            line.position.z = 349; // Positive z
            line.position.y = 35 - i * 8;
            sunGroup.add(line);
        }

        this.scene.add(sunGroup);
        this.sun = sunGroup;
    }

    /**
     * Create starfield
     */
    createStars() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 500;
            const y = Math.random() * 150 + 20;
            const z = Math.random() * 300 + 100; // Positive z (in front)
            vertices.push(x, y, z);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({
            color: COLORS.stars,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });

        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
    }

    /**
     * Create road surface segments
     */
    createRoadSegments() {
        const geometry = new THREE.PlaneGeometry(ROAD_WIDTH + 4, ROAD_CONFIG.segmentLength);
        const material = new THREE.MeshBasicMaterial({
            color: COLORS.road,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < ROAD_CONFIG.segmentCount; i++) {
            const segment = new THREE.Mesh(geometry, material);
            segment.rotation.x = -Math.PI / 2;
            segment.position.y = -0.01;
            segment.position.z = i * ROAD_CONFIG.segmentLength - this.totalLength / 2 + ROAD_CONFIG.segmentLength / 2;
            this.scene.add(segment);
            this.roadSegments.push(segment);
        }
    }

    /**
     * Create side barriers
     */
    createBarriers() {
        const barrierMaterial = new THREE.MeshBasicMaterial({
            color: COLORS.barrier,
            transparent: true,
            opacity: 0.7
        });

        // Left and right barriers
        [-1, 1].forEach(side => {
            const barrierGeom = new THREE.BoxGeometry(
                ROAD_CONFIG.barrierWidth,
                ROAD_CONFIG.barrierHeight,
                this.totalLength
            );

            const barrier = new THREE.Mesh(barrierGeom, barrierMaterial);
            barrier.position.x = side * (ROAD_WIDTH / 2 + 1);
            barrier.position.y = ROAD_CONFIG.barrierHeight / 2;
            barrier.position.z = 0;

            this.scene.add(barrier);
            this.barriers.push(barrier);
        });

        // Add glow effect with emissive
        this.barriers.forEach(barrier => {
            const glowGeom = barrier.geometry.clone();
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: COLORS.barrier,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeom, glowMaterial);
            glow.scale.set(1.5, 1.2, 1);
            barrier.add(glow);
        });
    }

    /**
     * Create neon grid lines on road
     */
    createGridLines() {
        const lineMaterial = new THREE.LineBasicMaterial({
            color: COLORS.grid,
            transparent: true,
            opacity: 0.3
        });

        // Horizontal grid lines
        for (let z = -this.totalLength / 2; z <= this.totalLength / 2; z += ROAD_CONFIG.gridSpacing) {
            const points = [
                new THREE.Vector3(-ROAD_WIDTH / 2, 0.01, z),
                new THREE.Vector3(ROAD_WIDTH / 2, 0.01, z)
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            this.scene.add(line);
            this.gridLines.push({ mesh: line, baseZ: z });
        }
    }

    /**
     * Create lane dividers
     */
    createLaneDividers() {
        const dividerMaterial = new THREE.MeshBasicMaterial({
            color: COLORS.laneDivider,
            transparent: true,
            opacity: 0.8
        });

        // Two lane dividers
        [-LANE_WIDTH / 2, LANE_WIDTH / 2].forEach(x => {
            // Dashed line effect
            for (let z = -this.totalLength / 2; z <= this.totalLength / 2; z += 4) {
                const dashGeom = new THREE.BoxGeometry(0.1, 0.05, 2);
                const dash = new THREE.Mesh(dashGeom, dividerMaterial);
                dash.position.set(x, 0.02, z);
                this.scene.add(dash);
            }
        });
    }

    /**
     * Update road (scroll effect)
     */
    update(deltaTime, speed) {
        const scrollAmount = speed * deltaTime;

        // Update grid lines
        this.gridLines.forEach(line => {
            line.mesh.position.z -= scrollAmount;

            // Wrap around
            if (line.mesh.position.z < -this.totalLength / 2) {
                line.mesh.position.z += this.totalLength;
            }
        });
    }

    /**
     * Get road bounds for collision
     */
    getBounds() {
        return {
            minX: -ROAD_WIDTH / 2,
            maxX: ROAD_WIDTH / 2,
            minZ: -this.totalLength / 2,
            maxZ: this.totalLength / 2
        };
    }

    /**
     * Dispose of all geometries and materials
     */
    dispose() {
        this.roadSegments.forEach(segment => {
            segment.geometry.dispose();
            segment.material.dispose();
            this.scene.remove(segment);
        });

        this.barriers.forEach(barrier => {
            barrier.geometry.dispose();
            barrier.material.dispose();
            this.scene.remove(barrier);
        });

        this.gridLines.forEach(line => {
            line.mesh.geometry.dispose();
            line.mesh.material.dispose();
            this.scene.remove(line.mesh);
        });

        if (this.sun) this.scene.remove(this.sun);
        if (this.stars) this.scene.remove(this.stars);

        this.roadSegments = [];
        this.barriers = [];
        this.gridLines = [];
    }
}

export default RoadManager;
export { COLORS, ROAD_CONFIG };
