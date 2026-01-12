// Mock Three.js for Jest testing

class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }
    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    normalize() {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
            this.z /= len;
        }
        return this;
    }
}

class Box3 {
    constructor(min = new Vector3(-Infinity, -Infinity, -Infinity), max = new Vector3(Infinity, Infinity, Infinity)) {
        this.min = min;
        this.max = max;
    }
    setFromObject(object) {
        if (object.position) {
            const size = object.geometry?.parameters || { width: 1, height: 1, depth: 1 };
            this.min.set(
                object.position.x - size.width / 2,
                object.position.y - size.height / 2,
                object.position.z - size.depth / 2
            );
            this.max.set(
                object.position.x + size.width / 2,
                object.position.y + size.height / 2,
                object.position.z + size.depth / 2
            );
        }
        return this;
    }
    intersectsBox(box) {
        return !(
            box.max.x < this.min.x || box.min.x > this.max.x ||
            box.max.y < this.min.y || box.min.y > this.max.y ||
            box.max.z < this.min.z || box.min.z > this.max.z
        );
    }
}

class Object3D {
    constructor() {
        this.position = new Vector3();
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = new Vector3(1, 1, 1);
        this.children = [];
        this.parent = null;
        this.visible = true;
    }
    add(child) {
        this.children.push(child);
        child.parent = this;
    }
    remove(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }
}

class Scene extends Object3D {
    constructor() {
        super();
        this.background = null;
        this.fog = null;
    }
}

class PerspectiveCamera extends Object3D {
    constructor(fov = 75, aspect = 1, near = 0.1, far = 1000) {
        super();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }
    updateProjectionMatrix() {}
}

class WebGLRenderer {
    constructor(options = {}) {
        this.domElement = document.createElement('canvas');
        this.shadowMap = { enabled: false };
    }
    setSize(width, height) {}
    setPixelRatio(ratio) {}
    render(scene, camera) {}
    dispose() {}
}

class Mesh extends Object3D {
    constructor(geometry, material) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}

class Group extends Object3D {}

class BoxGeometry {
    constructor(width = 1, height = 1, depth = 1) {
        this.parameters = { width, height, depth };
    }
    dispose() {}
}

class PlaneGeometry {
    constructor(width = 1, height = 1) {
        this.parameters = { width, height };
    }
    dispose() {}
}

class CylinderGeometry {
    constructor(radiusTop = 1, radiusBottom = 1, height = 1) {
        this.parameters = { radiusTop, radiusBottom, height };
    }
    dispose() {}
}

class SphereGeometry {
    constructor(radius = 1) {
        this.parameters = { radius };
    }
    dispose() {}
}

class MeshBasicMaterial {
    constructor(options = {}) {
        this.color = options.color || 0xffffff;
        this.transparent = options.transparent || false;
        this.opacity = options.opacity || 1;
    }
    dispose() {}
}

class MeshStandardMaterial {
    constructor(options = {}) {
        this.color = options.color || 0xffffff;
        this.emissive = options.emissive || 0x000000;
        this.emissiveIntensity = options.emissiveIntensity || 1;
    }
    dispose() {}
}

class Color {
    constructor(color) {
        this.color = color;
    }
    set(color) {
        this.color = color;
    }
}

class Fog {
    constructor(color, near, far) {
        this.color = color;
        this.near = near;
        this.far = far;
    }
}

class Clock {
    constructor() {
        this.startTime = Date.now();
        this.oldTime = this.startTime;
        this.elapsedTime = 0;
        this.running = false;
    }
    start() {
        this.startTime = Date.now();
        this.oldTime = this.startTime;
        this.running = true;
    }
    getDelta() {
        const now = Date.now();
        const delta = (now - this.oldTime) / 1000;
        this.oldTime = now;
        this.elapsedTime += delta;
        return delta;
    }
    getElapsedTime() {
        return this.elapsedTime;
    }
}

export {
    Vector3,
    Box3,
    Object3D,
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    Group,
    BoxGeometry,
    PlaneGeometry,
    CylinderGeometry,
    SphereGeometry,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Color,
    Fog,
    Clock,
};
