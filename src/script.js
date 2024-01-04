import GUI from 'lil-gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const textureLoader = new THREE.TextureLoader()

const particleTexture = textureLoader.load('/textures/9.png')

const rgbeLoader = new RGBELoader();
rgbeLoader.load('./textures/environmentMaps/2k.hdr', (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = environmentMap;
    scene.environment = environmentMap;
});

/**
 * Galaxy
 */
const parameters = {
    count: 150000,
    size: 0.01,
    radius: 5,
    branches: 10,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 7,
    insideColor: '#ff6030',
    outsideColor: '#1b3984'
}

let geometry = null
let material = null
let points = null

const spinAngleFunction1 = (radius, spin) => radius * spin;
const spinAngleFunction2 = (radius, spin) => Math.sin(radius * spin);
const spinAngleFunction3 = (radius, spin) => Math.cos(radius * spin);
const spinAngleFunction4 = (radius, spin) => Math.cos(Math.sin(radius * spin) * 3);
const spinAngleFunction5 = (radius, spin) => Math.sin(Math.cos(radius * spin) * 3);
const spinAngleFunction6 = (radius, spin) => Math.cos(Math.sin(radius * spin) * 8);
const spinAngleFunction7 = (radius, spin) => Math.sin(Math.cos(radius * spin) * 5);

const generateGalaxy = (spinAngleFunction) => {
    /**
     * Destroy old galaxy
     */
    if (points != null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    /**
     * Geometry
     */

    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // Position
        const radius = Math.random() * parameters.radius;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
        const spinAngle = spinAngleFunction(radius, parameters.spin);

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        // Color
        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
    );

    /**
     * Material
     */

    material = new THREE.PointsMaterial({
        alphaMap: particleTexture,
        transparent: true,
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    /**
     * Points
     */

    points = new THREE.Points(geometry, material);

    scene.add(points);
};

generateGalaxy(spinAngleFunction2)

let lastUsedSpinAngleFunction = spinAngleFunction2

const galaxies = {
    variation1: () => {
        generateGalaxy(spinAngleFunction1)
        lastUsedSpinAngleFunction = spinAngleFunction1
    },
    variation2: () => {
        generateGalaxy(spinAngleFunction2)
        lastUsedSpinAngleFunction = spinAngleFunction2
    },
    variation3: () => {
        generateGalaxy(spinAngleFunction3)
        lastUsedSpinAngleFunction = spinAngleFunction3
    },
    variation4: () => {
        generateGalaxy(spinAngleFunction4)
        lastUsedSpinAngleFunction = spinAngleFunction4
    },
    variation5: () => {
        generateGalaxy(spinAngleFunction5)
        lastUsedSpinAngleFunction = spinAngleFunction5
    },
    variation6: () => {
        generateGalaxy(spinAngleFunction6)
        lastUsedSpinAngleFunction = spinAngleFunction6
    },
    variation7: () => {
        generateGalaxy(spinAngleFunction7)
        lastUsedSpinAngleFunction = spinAngleFunction7
    }
}

gui.add(parameters, 'count').min(100).max(1000000).step(100).name('Number of particles').onFinishChange(() => generateGalaxy(lastUsedSpinAngleFunction))
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).name('Size of the particles').onFinishChange(() => generateGalaxy(lastUsedSpinAngleFunction))
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).name('Radius of the galaxy').onFinishChange(() => generateGalaxy(lastUsedSpinAngleFunction))
gui.add(parameters, 'branches').min(2).max(20).step(1).name('Number of branches/lines').onFinishChange(() => generateGalaxy(lastUsedSpinAngleFunction))
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).name('Spin frequency').onFinishChange(() => generateGalaxy(lastUsedSpinAngleFunction))
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).name('Randomness').onFinishChange(() => generateGalaxy(lastUsedSpinAngleFunction))
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).name('Randomness power').onFinishChange(() => generateGalaxy(lastUsedSpinAngleFunction))
gui.addColor(parameters, 'insideColor').name('Inside color').onFinishChange(() => generateGalaxy(lastUsedSpinAngleFunction))
gui.addColor(parameters, 'outsideColor').name('Outside color').onFinishChange(() => generateGalaxy(lastUsedSpinAngleFunction))
gui.add(galaxies, 'variation1').name('First variation')
gui.add(galaxies, 'variation2').name('Second variation')
gui.add(galaxies, 'variation3').name('Third variation')
gui.add(galaxies, 'variation4').name('Fourth variation')
gui.add(galaxies, 'variation5').name('Fifth variation')
gui.add(galaxies, 'variation6').name('Sixth variation')
gui.add(galaxies, 'variation7').name('Seventh variation')

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 5
camera.position.z = 6
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    points.rotation.y = - elapsedTime * 0.06

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()