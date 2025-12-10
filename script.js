// Scene Setup
const scene = new THREE.Scene();
// Add some fog for depth - color matches the dark background
scene.fog = new THREE.FogExp2(0x050505, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Position the camera slightly above the ground
camera.position.z = 5; 
camera.position.y = 3;
camera.rotation.x = -0.5; // Look down slightly

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- Create the Digital Terrain ---

// Geometry: A large plane with many segments for detail
const geometry = new THREE.PlaneGeometry(100, 100, 60, 60);

// Material: A wireframe green grid
const material = new THREE.MeshBasicMaterial({ 
    color: 0x38a838, // Your brand's secondary green
    wireframe: true,
    transparent: true,
    opacity: 0.3
});

const terrain = new THREE.Mesh(geometry, material);
terrain.rotation.x = -Math.PI / 2; // Lay flat
scene.add(terrain);

// --- Animation Logic ---

// Store original vertex positions to manipulate them
const count = geometry.attributes.position.count;
const positionAttribute = geometry.attributes.position;
const originalPositions = new Float32Array(count * 3);

// Copy positions
for (let i = 0; i < count; i++) {
    originalPositions[i * 3] = positionAttribute.getX(i);
    originalPositions[i * 3 + 1] = positionAttribute.getY(i); // Height (Z in local space)
    originalPositions[i * 3 + 2] = positionAttribute.getZ(i);
}

let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.005; // Speed of animation

    // Manipulate vertices to create waves (simulating hills moving)
    for (let i = 0; i < count; i++) {
        const x = originalPositions[i * 3];
        const y = originalPositions[i * 3 + 1];
        
        // Create a wave effect using sine and cosine based on position and time
        // This simulates a "noise" effect for the hills
        const waveX = Math.sin(x * 0.5 + time * 2) * 0.5;
        const waveY = Math.cos(y * 0.3 + time * 1.5) * 0.5;
        
        // Update the "height" (Z axis in the PlaneGeometry's local space)
        const newZ = (Math.sin(x * 0.2 + time) + Math.cos(y * 0.2 + time)) * 1.5;
        
        // Apply the new height
        positionAttribute.setZ(i, newZ);
    }
    
    // Tell Three.js the geometry has changed
    positionAttribute.needsUpdate = true;
    
    // Gentle rotation for extra dynamism
    terrain.rotation.z += 0.0005;

    renderer.render(scene, camera);
}

animate();

// --- Handle Window Resize ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Optional: Add subtle mouse interaction ---
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) / 1000;
    mouseY = (event.clientY - window.innerHeight / 2) / 1000;
    
    // Slight tilt of the terrain based on mouse
    terrain.rotation.x = -Math.PI / 2 + mouseY;
    terrain.rotation.y = mouseX;
});