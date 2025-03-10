import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
function main() {
// Renderer
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xaaaaaa, 5, 30);



// Load a Texture for the Ground
const textureLoader0 = new THREE.TextureLoader();
const groundTexture = textureLoader0.load('textures/ground.jpg');

// Adjust texture settings for better appearance
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(10, 10);

// Create Material with Texture
const groundMat = new THREE.MeshStandardMaterial({
    map: groundTexture,
    roughness: 0.8,
    metalness: 0.1,
});

// Create Ground Mesh
const groundGeo = new THREE.PlaneGeometry(30, 30);
const ground = new THREE.Mesh(groundGeo, groundMat);

// Rotate and Position the Ground
ground.rotation.x = -Math.PI / 2; // Lay flat
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);


// Skybox (Textured)
const rgbeLoader = new RGBELoader();
rgbeLoader.load('textures/sky.hdr', function (hdrTexture) {
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdrTexture;
    scene.background = hdrTexture;
});

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 10);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;

// Shadow settings for better quality
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);


// Textured Cube
const textureLoader = new THREE.TextureLoader();
const boxTexture = textureLoader.load('textures/wood.jpg');
const boxGeo = new THREE.BoxGeometry(2, 2, 2);
const boxMat = new THREE.MeshStandardMaterial({ map: boxTexture });
const box = new THREE.Mesh(boxGeo, boxMat);
box.position.set(0,1,0);
scene.add(box);

// Animated Sphere
const sphereGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
const sphereMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0, 0.5, 0.5 )});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(0, 7, 0);
scene.add(sphere);

// Generate Multiple Shapes
const objects = [];
function generateShapes() {
    while (objects.length > 0) {
        const obj = objects.pop();
        scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => mat.dispose());
            } else {
                obj.material.dispose();
            }
        }
    }
    const positions = [];

    for (let i = 0; i < 80; i++) {
        const shapeType = i % 3;
        let geometry, material, mesh;

        if (shapeType === 0) {
            geometry = new THREE.BoxGeometry(1, 1, 1);
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(Math.random(), Math.random() * 0.5, Math.random())
            });
        } else if (shapeType === 1) {
            geometry = new THREE.SphereGeometry(0.5, 16, 16);
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(Math.random() * 0.5, Math.random(), Math.random() * 0.5)
            });
        } else {
            geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(Math.random() * 0.5, Math.random() * 0.5, Math.random())
            });
        }

        let newPosition;
        let isUnique = false;
        // Generate a unique position
        while (!isUnique) {
            newPosition = new THREE.Vector3(
                Math.random() * 30 - 15,
                Math.random() * 4 + 1,
                Math.random() * 30 - 15
            );

            isUnique = !positions.some(pos => pos.distanceTo(newPosition) < 1.5);
        }

        // Store the unique position
        positions.push(newPosition);

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(newPosition);

        // Enable shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add(mesh);
        objects.push(mesh);
    }
}



// Initial generation of shapes
generateShapes();

// Add event listener to button
const button = document.getElementById("regenerateButton");
if (button) {
    button.addEventListener("click", generateShapes);
}

// Load .OBJ Model
const mtlLoader = new MTLLoader();
mtlLoader.load('models/tree.mtl', (materials) => {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load('models/tree.obj', (object) => {
        object.position.set(0, 2, 0);
        object.scale.set(0.5, 0.5, 0.5);
        object.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(object);
    })
});

const moveSpeed = 0.1; // Speed of movement
const keys = { w: false, a: false, s: false, d: false, q: false, e: false, space: false, c: false, ArrowUp : false, ArrowDown : false};

// Event Listeners for Key Press
window.addEventListener('keydown', (event) => {
    if (event.key === 'w') keys.w = true;
    if (event.key === 'a') keys.a = true;
    if (event.key === 's') keys.s = true;
    if (event.key === 'd') keys.d = true;
    if (event.key === 'q') keys.q = true;
    if (event.key === 'e') keys.e = true;
    if (event.key === ' ') keys.space = true;
    if (event.key === 'c') keys.c = true;
    if (event.key === 'ArrowUp') keys.ArrowUp = true;
    if (event.key === 'ArrowDown') keys.ArrowDown = true;
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'w') keys.w = false;
    if (event.key === 'a') keys.a = false;
    if (event.key === 's') keys.s = false;
    if (event.key === 'd') keys.d = false;
    if (event.key === 'q') keys.q = false;
    if (event.key === 'e') keys.e = false;
    if (event.key === ' ') keys.space = false;
    if (event.key === 'c') keys.c = false;
    if (event.key === 'ArrowUp') keys.ArrowUp = false;
    if (event.key === 'ArrowDown') keys.ArrowDown = false;
});

// Event Listeners for Key Release
function updateCameraMovement() {
    const moveDirection = new THREE.Vector3();
    camera.getWorldDirection(moveDirection);
    moveDirection.y = 0;
    moveDirection.normalize();
    const rightVector = new THREE.Vector3().crossVectors(moveDirection, camera.up).normalize();
    const upVector = new THREE.Vector3(0, 1, 0);

    let moved = true;
    if (keys.w) {
        camera.position.addScaledVector(moveDirection, moveSpeed);
    }
    if (keys.s) {
        camera.position.addScaledVector(moveDirection, -moveSpeed);
    }
    if (keys.a) {
        camera.position.addScaledVector(rightVector, -moveSpeed);
    }
    if (keys.d) {
        camera.position.addScaledVector(rightVector, moveSpeed);
    }
    if (keys.space) {
        camera.position.addScaledVector(upVector, moveSpeed);
    }
    if (keys.c) {
        camera.position.addScaledVector(upVector, -moveSpeed);
    }
    if (keys.q){camera.position.addScaledVector(rightVector, moveSpeed*0.2 ); moved = false;}
    if (keys.e){camera.position.addScaledVector(rightVector, -moveSpeed*0.2 ); moved = false;}
    if (moved) {
        controls.target.copy(camera.position).add(moveDirection);
    }
    controls.update();
}


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;
let isDragging = false;


function updateShadows() {
    renderer.shadowMap.needsUpdate = true;
}


// Event Listener: Mouse Down (Pick Object, Exclude Ground)
let offset = new THREE.Vector3();

// Mouse Down: Pick Object
window.addEventListener('mousedown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const objectsToPick = scene.children.filter(obj => obj !== ground);
    const intersects = raycaster.intersectObjects(objectsToPick, true);

    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        isDragging = true;
        controls.enabled = false;
        offset.copy(intersects[0].point).sub(selectedObject.position);
    }
});


// Mouse Move: Drag Object Smoothlyawda
window.addEventListener('mousemove', (event) => {
    if (isDragging && selectedObject) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(ground, true);

        if (intersects.length > 0) {
            const targetPosition = intersects[0].point;
            targetPosition.y = selectedObject.position.y;
            selectedObject.position.lerp(targetPosition, 0.3);
            updateShadows();
        }
    }
});


// Ensure dragging stops if the user leaves the screen
window.addEventListener('mouseleave', () => {
    isDragging = false;
});


// Mouse Up: Release Object
window.addEventListener('mouseup', () => {
    if (isDragging && selectedObject) {
        isDragging = false;
        controls.enabled = true;
        selectedObject = null;
    }
});

window.addEventListener('dblclick', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Exclude the ground from deletion
    const objectsToPick = scene.children.filter(obj => obj !== ground);
    const intersects = raycaster.intersectObjects(objectsToPick, true);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        scene.remove(selectedObject);
        if (selectedObject.geometry) selectedObject.geometry.dispose();
        if (selectedObject.material) {
            if (Array.isArray(selectedObject.material)) {
                selectedObject.material.forEach(mat => mat.dispose());
            } else {
                selectedObject.material.dispose();
            }
        }
        const index = objects.indexOf(selectedObject);
        if (index !== -1) {
            objects.splice(index, 1);
        }

        console.log("Object deleted:", selectedObject);
    }
});


// Enable shadows in the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Allow lights to cast shadows
const spotLight = new THREE.SpotLight(0xff0000, 5000, 30, Math.PI / 6, 0.5, 2);
spotLight.position.set(4, 5, 4);
spotLight.castShadow = true;

// Set static target at (0,4,0)
spotLight.target.position.set(0, 4, 0);
spotLight.target.updateMatrixWorld();
scene.add(spotLight);
scene.add(spotLight.target);

// Optimize shadow settings
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.camera.near = 0.5;
spotLight.shadow.camera.far = 50;
spotLight.shadow.focus = 1;

// Manually force shadow updates if needed
function updateShadows() {
        renderer.shadowMap.needsUpdate = true;
}

// Handle Resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    updateShadows();
});

// Update Shadows in Animation Loop
function animate(time) {
  updateShadows();
    updateCameraMovement();
    sphere.rotation.x = time / 1000;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

}
main();
