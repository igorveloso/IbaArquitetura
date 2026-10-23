import * as THREE from 'three';

// ---- scale: plan pixels -> meters ----
const S = 0.011; // m per plan pixel (941x1672 plan)

const COL = {
  wall: '#6f6f6d', parapet: '#8a8783',
  beige: '#d9d1c4', tile: '#c3bfb8',
  wood: '#9c6b3f', bedCream: '#e7e0d2', bedGreen: '#aebd93',
  sofa: '#e4ddce', rugBeige: '#cdbfa3', rugGreen: '#b9c3a0',
  stone: '#a7a29a', dark: '#333333', white: '#eeeeee', toilet: '#f4f4f4',
  plant: '#4f7a3a',
};

const group = new THREE.Group();
const mat = (c, opts = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: opts.r ?? 0.9, metalness: 0 });

// box from plan-pixel footprint (px,py,pw,ph), given height (m) and base y (m)
function box(px, py, pw, ph, hM, color, yBase = 0, r) {
  const w = pw * S, d = ph * S;
  const g = new THREE.Mesh(new THREE.BoxGeometry(w, hM, d), mat(color, { r }));
  g.position.set(px * S + w / 2, yBase + hM / 2, py * S + d / 2);
  g.castShadow = true; g.receiveShadow = true;
  group.add(g);
  return g;
}
const floor = (px, py, pw, ph, color) => box(px, py, pw, ph, 0.04, color, 0);
const wall = (px, py, pw, ph, hM = 1.5) => box(px, py, pw, ph, hM, COL.wall, 0);
const para = (px, py, pw, ph) => box(px, py, pw, ph, 0.5, COL.parapet, 0);
const furn = (px, py, pw, ph, hM, color, yBase = 0) => box(px, py, pw, ph, hM, color, yBase, 0.85);

// ================= FLOORS (per room, read from top) =================
floor(195, 15, 515, 165, COL.tile);   // varanda topo
floor(200, 180, 300, 350, COL.beige); // quarto 1 (casal)
floor(505, 180, 205, 110, COL.tile);  // luz/varanda quarto 2
floor(505, 290, 205, 275, COL.beige); // quarto 2 (solteiro)
floor(560, 565, 150, 200, COL.tile);  // banho 1
floor(195, 520, 330, 600, COL.beige); // nucleo: jantar + cozinha + circulacao
floor(430, 835, 285, 285, COL.beige); // sala de estar
floor(200, 1120, 195, 170, COL.tile); // banho 2
floor(195, 1285, 285, 245, COL.beige);// suite (casal)
floor(515, 1120, 205, 475, COL.tile); // terraco direito
floor(195, 1525, 290, 140, COL.tile); // varanda inferior

// ================= WALLS =================
const HX = 1.5; // exterior wall height (cutaway)
const HI = 1.2; // interior partition height
// exterior shell (bounding box of heated area)
wall(190, 175, 525, 12, HX);   // topo
wall(190, 1518, 525, 12, HX);  // base heated
wall(190, 175, 12, 1355, HX);  // esquerda
wall(703, 175, 12, 1355, HX);  // direita
// balcony parapets
para(190, 10, 520, 10); para(190, 10, 10, 175); para(700, 10, 10, 175);      // varanda topo
para(190, 1525, 300, 10); para(190, 1525, 10, 140); para(480, 1525, 10, 140);// varanda inferior
para(715, 1120, 10, 480); para(515, 1590, 210, 10);                          // terraco direito
// interior partitions
wall(200, 520, 300, 12, HI);   // quarto1 / nucleo
wall(498, 180, 12, 390, HI);   // quarto1 / quarto2-hall
wall(556, 565, 154, 12, HI); wall(556, 565, 12, 200, HI); // banho1
wall(424, 835, 12, 290, HI);   // nucleo / sala
wall(200, 1116, 195, 12, HI); wall(392, 1120, 12, 170, HI); wall(200, 1286, 195, 12, HI); // banho2
wall(195, 1282, 290, 12, HI);  // suite topo
wall(504, 1120, 12, 400, HI);  // corredor / guarda-roupa

// ================= FURNITURE =================
// -- quarto 1 (casal) --
box(255, 195, 180, 25, 0.7, COL.wood);            // cabeceira
furn(255, 200, 180, 230, 0.45, COL.bedCream);     // cama casal
furn(215, 205, 45, 45, 0.5, COL.wood); furn(215, 370, 45, 45, 0.5, COL.wood); // criados
box(330, 235, 210, 235, 0.03, COL.rugBeige, 0.05);// tapete
furn(215, 455, 255, 60, 1.2, COL.wood);           // guarda-roupa
// -- quarto 2 (solteiro) --
box(560, 325, 140, 20, 0.6, COL.wood);
furn(560, 330, 140, 190, 0.45, COL.bedGreen);
box(505, 330, 120, 150, 0.03, COL.rugGreen, 0.05);
furn(565, 515, 140, 50, 1.2, COL.wood);
// -- banho 1 --
furn(615, 585, 55, 70, 0.4, COL.toilet); furn(640, 690, 55, 40, 0.85, COL.white);
// -- jantar --
furn(285, 585, 150, 110, 0.75, COL.wood);
[[255,585],[255,650],[445,585],[445,650],[320,705],[385,705]].forEach(([x,y]) => furn(x, y, 42, 42, 0.9, COL.wood));
// -- cozinha --
furn(215, 745, 220, 70, 0.9, COL.stone);          // ilha
[[250,825],[320,825],[390,825]].forEach(([x,y]) => furn(x, y, 40, 40, 0.7, COL.wood)); // banquetas
box(205, 860, 80, 90, 0.9, COL.dark, 0);          // cooktop
furn(215, 980, 80, 70, 0.9, COL.stone);           // pia
furn(300, 1030, 90, 90, 1.8, COL.white);          // geladeira
// -- sala de estar --
furn(440, 845, 130, 240, 0.7, COL.sofa);          // sofa (parte longa)
furn(440, 845, 230, 70, 0.7, COL.sofa);           // sofa (retorno em L)
box(540, 860, 150, 200, 0.03, COL.rugBeige, 0.05);// tapete
furn(545, 930, 80, 80, 0.4, COL.wood);            // mesa centro
furn(545, 1050, 70, 60, 0.7, COL.sofa);           // poltrona
box(660, 1075, 35, 35, 0.5, COL.plant, 0);        // planta
// -- banho 2 --
furn(300, 1170, 55, 70, 0.4, COL.toilet); furn(230, 1150, 50, 40, 0.85, COL.white);
// -- suite --
box(250, 1315, 180, 25, 0.7, COL.wood);
furn(250, 1320, 180, 220, 0.45, COL.bedCream);
furn(225, 1320, 45, 45, 0.5, COL.wood); furn(225, 1495, 45, 45, 0.5, COL.wood);
box(285, 1310, 190, 235, 0.03, COL.rugBeige, 0.05);
furn(455, 1170, 55, 320, 1.2, COL.wood);          // guarda-roupa corredor
// -- plantas varandas --
box(250, 80, 40, 40, 0.5, COL.plant, 0);
box(300, 1585, 40, 40, 0.5, COL.plant, 0);

export function createApartment() { return group; }
