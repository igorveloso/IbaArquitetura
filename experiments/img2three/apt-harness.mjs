import * as THREE from 'three';
import { createApartment } from './apartment.mjs';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#eceae6');

// lights
const key = new THREE.DirectionalLight(0xffffff, 2.0);
key.position.set(-8, 20, 6); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -15; key.shadow.camera.right = 15;
key.shadow.camera.top = 15; key.shadow.camera.bottom = -15;
scene.add(key);
scene.add(new THREE.HemisphereLight(0xffffff, 0x9a978f, 1.0));

const apt = createApartment();
scene.add(apt);

// center on ground
const box = new THREE.Box3().setFromObject(apt);
const size = box.getSize(new THREE.Vector3());
const center = box.getCenter(new THREE.Vector3());
apt.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));

// ground
const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: '#dedbd5', roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 500);
// high 3/4 looking down the long axis
camera.position.set(-size.x * 1.7, size.z * 0.95, size.z * 0.62);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const canvas = renderer.domElement;
document.body.appendChild(canvas);

function resize() {
  const W = window.innerWidth || 800, H = window.innerHeight || 800;
  renderer.setSize(W, H, false);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  camera.aspect = W / H; camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}
window.addEventListener('resize', resize);
resize();

let meshes = 0; apt.traverse(o => { if (o.isMesh) meshes++; });
window.__report = { size: size.toArray(), meshes };
console.log('apt render ok', JSON.stringify(window.__report));
setTimeout(() => {
  fetch('/save?name=shot-apt.png', { method: 'POST', body: canvas.toDataURL('image/png') })
    .then(r => r.text()).then(t => console.log('saved:', t)).catch(e => console.log('save err', String(e)));
}, 300);
