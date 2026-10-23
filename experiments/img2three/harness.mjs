import * as THREE from 'three';
import { createEdificioResidencialModel, createEdificioResidencialLookDevLights } from './src/createEdificioModel.ts';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#d7dbdd');

// Ground plane
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  new THREE.MeshStandardMaterial({ color: '#9a9a9a', roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Look-dev lights that the factory generated
scene.add(createEdificioResidencialLookDevLights('neutral'));
scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 0.4));

// Build the model (spec is baked into the factory)
const model = createEdificioResidencialModel({ castShadow: true, receiveShadow: true });
scene.add(model);

// Sit it on the ground, centered on X/Z
const box = new THREE.Box3().setFromObject(model);
const size = box.getSize(new THREE.Vector3());
const center = box.getCenter(new THREE.Vector3());
model.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 4000);
const dist = Math.max(size.x, size.y, size.z) * 1.8;
camera.position.set(-dist * 0.75, size.y * 0.7, dist * 1.05);
camera.lookAt(0, size.y * 0.42, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
const canvas = renderer.domElement;
document.body.appendChild(canvas);

function resize() {
  const W = window.innerWidth || 800, H = window.innerHeight || 450;
  renderer.setSize(W, H, false);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}
window.addEventListener('resize', resize);
resize();
window.__ready = true;
window.__png = () => canvas.toDataURL('image/png');
let meshCount = 0; model.traverse(o => { if (o.isMesh) meshCount++; });
window.__report = {
  cw: canvas.width, ch: canvas.height,
  bboxMin: box.min.toArray(), bboxMax: box.max.toArray(),
  size: size.toArray(), directChildren: model.children.length, meshCount,
  camPos: camera.position.toArray(),
};
console.log('render ok', JSON.stringify(window.__report));
// auto-save the render to disk via the save-server
setTimeout(() => {
  try {
    fetch('/save', { method: 'POST', body: canvas.toDataURL('image/png') })
      .then(r => r.text()).then(t => console.log('saved:', t))
      .catch(e => console.log('save err', String(e)));
  } catch (e) { console.log('save throw', String(e)); }
}, 300);
