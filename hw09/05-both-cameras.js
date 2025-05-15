import * as THREE from 'three';  
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(120, 60, 180);
camera.lookAt(scene.position);
scene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(new THREE.Color(0x000000));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const stats = new Stats();
document.body.appendChild(stats.dom);

let orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(-20, 40, 60);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x292929);
scene.add(ambientLight);

const gui = new GUI();
const cameraFolder = gui.addFolder('Camera');
const controls = {
    perspective: "Perspective",
    switchCamera: function () {
        scene.remove(camera);
        if (camera instanceof THREE.PerspectiveCamera) {
            camera = new THREE.OrthographicCamera(window.innerWidth / -16, window.innerWidth / 16,
                                                   window.innerHeight / 16, window.innerHeight / -16,
                                                   -200, 500);
            controls.perspective = "Orthographic";
        } else {
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            controls.perspective = "Perspective";
        }
        camera.position.set(120, 60, 180);
        camera.lookAt(scene.position);
        orbitControls.dispose();
        orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
    }
};
cameraFolder.add(controls, 'switchCamera').name("Switch Camera");
cameraFolder.add(controls, 'perspective').listen();
cameraFolder.open();

const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.set(0, 0, 0);
scene.add(sunMesh);

const planetData = [
    {
        name: 'Mercury', texture: 'Mercury.jpg', radius: 1.5, distance: 20, color: '#a6a6a6',
        rotationSpeed: 0.02, orbitSpeed: 0.02
    },
    {
        name: 'Venus', texture: 'Venus.jpg', radius: 3, distance: 35, color: '#e39e1c',
        rotationSpeed: 0.015, orbitSpeed: 0.015
    },
    {
        name: 'Earth', texture: 'Earth.jpg', radius: 3.5, distance: 50, color: '#3498db',
        rotationSpeed: 0.01, orbitSpeed: 0.01
    },
    {
        name: 'Mars', texture: 'Mars.jpg', radius: 2.5, distance: 65, color: '#c0392b',
        rotationSpeed: 0.008, orbitSpeed: 0.008
    },
];

const planets = [];

planetData.forEach(data => {
    const geometry = new THREE.SphereGeometry(data.radius, 20, 20);
    const material = new THREE.MeshStandardMaterial({ map: textureLoader.load(data.texture) });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.position.set(data.distance, 0, 0);

    const pivot = new THREE.Object3D();
    pivot.add(mesh);
    scene.add(pivot);

    const planetControl = {
        rotationSpeed: data.rotationSpeed,
        orbitSpeed: data.orbitSpeed
    };

    const folder = gui.addFolder(data.name);
    folder.add(planetControl, 'rotationSpeed', 0, 0.1).name("Rotation Speed");
    folder.add(planetControl, 'orbitSpeed', 0, 0.1).name("Orbit Speed");

    planets.push({ mesh, pivot, control: planetControl });
});

function render() {
    planets.forEach(p => {
        p.pivot.rotation.y += p.control.orbitSpeed;
        p.mesh.rotation.y += p.control.rotationSpeed;
    });


    orbitControls.update();
    stats.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();