import "./style.css";
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db, auth, configOk } from "./firebase.js";


const LEVELS = {
  P1:"P1 · Fazer agora", P2:"P2 · Em seguida", P3:"P3 · Aguardando / cobrar",
  P4:"P4 · Monitorar", P5:"P5 · Escritório (não urgente)"
};
const STRIPE = {P1:"var(--crit)", P2:"var(--warn)", P3:"var(--ok)", P4:"var(--muted)", P5:"var(--line)"};
const STATUS = ["Minha ação","Aguardando cliente","Monitorar"];
const SCLS = {"Minha ação":"s-ma","Aguardando cliente":"s-ac","Monitorar":"s-mo"};

let tasks = [], view = "prioridade", q = "", stFilter = "", showDone = false, editingId = null;
const $ = (s) => document.querySelector(s);

function h(tag, attrs, ...kids){
  const el = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs || {})){
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, "");
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return el;
}
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(()=>t.classList.remove("on"), 1800); }
function norm(s){ return (s||"").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,""); }
const byOrder = (a,b) => (a.order ?? 1e9) - (b.order ?? 1e9);

/* ---------- dados (Firestore) ---------- */
const col = collection(db, "tasks");
let unsub = null;
async function save(id, patch){
  patch.updatedAt = Date.now();
  try { await updateDoc(doc(col, id), patch); } catch(e){ toast("Não foi possível salvar"); console.error(e); }
}
async function create(data){
  const id = "t" + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
  const max = Math.max(0, ...tasks.filter(t=>t.grupo===data.grupo).map(t=>t.order||0));
  try { await setDoc(doc(col, id), {...data, done:false, order:max+1, docOrder:max+1, updatedAt:Date.now()}); }
  catch(e){ toast("Não foi possível criar"); console.error(e); }
}
async function remove(id){ try { await deleteDoc(doc(col, id)); } catch(e){ toast("Não foi possível excluir"); } }
async function swap(a,b){
  await Promise.all([save(a.id,{order:b.order}), save(b.id,{order:a.order})]);
}
function subscribe(){
  if (unsub) return;
  const timer = setTimeout(()=>showMsg("O banco não respondeu em 10 s. Recarregue a página.", true), 10000);
  unsub = onSnapshot(col, (snap)=>{
    clearTimeout(timer);
    tasks = snap.docs.map(d=>({id:d.id, ...d.data()}));
    render();
  }, (err)=>{ clearTimeout(timer); showMsg("Erro ao ler os dados: " + (err && err.message || err), true); });
}
function showMsg(text, err){ const l = $("#list"); l.replaceChildren(h("div",{class:"msg"+(err?" err":"")}, text)); }

/* ---------- importar JSON ---------- */
async function importJson(text){
  let arr;
  try { arr = JSON.parse(text); } catch(e){ throw new Error("JSON inválido."); }
  if (!Array.isArray(arr) || !arr.length) throw new Error("Esperava uma lista de tarefas.");
  const ok = arr.filter(t => t && t.id && t.titulo && t.grupo);
  if (ok.length !== arr.length) throw new Error("Há itens sem id, titulo ou grupo.");
  for (let i = 0; i < ok.length; i += 400){
    const batch = writeBatch(db);
    for (const t of ok.slice(i, i+400)){
      const {id, ...rest} = t;
      for (const k of Object.keys(rest)) if (rest[k] === undefined || rest[k] === null) delete rest[k];
      batch.set(doc(col, id), {...rest, updatedAt: Date.now()});
    }
    await batch.commit();
  }
  return ok.length;
}

/* ---------- visão ---------- */
function scoped(){
  const g = view === "pessoal" ? "pessoal" : "empresa";
  return tasks.filter(t => (t.grupo||"empresa") === g);
}
function visible(){
  const nq = norm(q);
  return scoped().filter(t =>
    (showDone || !t.done) &&
    (!stFilter || t.status === stFilter) &&
    (!nq || norm(t.titulo).includes(nq) || norm(t.cliente).includes(nq) || norm(t.obs).includes(nq))
  ).sort(byOrder);
}
function renderTiles(){
  const s = scoped(), open = s.filter(t=>!t.done);
  const tiles = [];
  if (view !== "pessoal") {
    tiles.push(["crit", open.filter(t=>t.nivel==="P1").length, "P1 · fazer agora"]);
    tiles.push(["acc", open.filter(t=>t.status==="Minha ação").length, "Minha ação abertas"]);
    tiles.push(["ok", open.filter(t=>t.status==="Aguardando cliente").length, "Aguardando cliente"]);
  } else {
    tiles.push(["acc", open.length, "Abertas"]);
  }
  tiles.push(["", s.filter(t=>t.done).length + " / " + s.length, "Concluídas"]);
  $("#tiles").replaceChildren(...tiles.map(([c,n,l])=>h("div",{class:"tile "+c}, h("b",{},n), h("span",{},l))));
}
function row(t, list, ctx){
  const idx = list.indexOf(t);
  const prev = list[idx-1], next = list[idx+1];
  const sel = h("select",{class:"pill "+(SCLS[t.status]||""), "aria-label":"Status", onchange:(e)=>save(t.id,{status:e.target.value})},
    STATUS.map(s=>h("option",{value:s, selected:s===t.status}, s)));
  const ctrl = [sel];
  if (t.grupo !== "pessoal"){
    ctrl.push(h("select",{class:"pill", "aria-label":"Nível", onchange:(e)=>save(t.id,{nivel:e.target.value})},
      Object.keys(LEVELS).map(k=>h("option",{value:k, selected:k===t.nivel}, k))));
  }
  ctrl.push(
    h("button",{class:"ic", type:"button", title:"Subir", "aria-label":"Subir", disabled:!prev, onclick:()=>swap(t,prev)}, "↑"),
    h("button",{class:"ic", type:"button", title:"Descer", "aria-label":"Descer", disabled:!next, onclick:()=>swap(t,next)}, "↓"),
    h("button",{class:"ic", type:"button", title:"Editar", "aria-label":"Editar", onclick:()=>openDlg(t)}, "✎")
  );
  const rankText = ctx === "prioridade" ? (scopedRank.get(t.id) || "") : (idx+1);
  const el = h("article",{class:"row"+(t.done?" done":""), style:"--stripe:"+(t.grupo==="pessoal"?"var(--line)":(STRIPE[t.nivel]||"var(--line)"))},
    h("input",{type:"checkbox", checked:!!t.done, "aria-label":"Concluir", onchange:(e)=>save(t.id,{done:e.target.checked})}),
    h("div",{class:"rank"}, rankText),
    h("div",{class:"body"},
      ctx==="prioridade" && t.cliente ? h("div",{class:"cli"}, t.cliente) : null,
      h("div",{class:"t"}, t.titulo),
      t.obs ? h("div",{class:"obs"}, t.obs) : null),
    h("div",{class:"ctrl"}, ctrl));
  return el;
}
let scopedRank = new Map();
function render(){
  const total = tasks.length;
  $("#sub").textContent = total ? `${tasks.length} tarefas · atualizado ao vivo` : "sem dados";
  renderTiles();
  const list = visible();
  const all = scoped().filter(t=>!t.done).sort(byOrder);
  scopedRank = new Map(all.map((t,i)=>[t.id,i+1]));
  const out = $("#list");
  if (!total){ out.replaceChildren(h("div",{class:"empty"}, "Nenhuma tarefa ainda. Use “Nova tarefa” ou peça ao Claude para carregar a lista.")); return; }
  if (!list.length){ out.replaceChildren(h("div",{class:"empty"}, "Nada com esses filtros.")); return; }

  const groups = [];
  if (view === "prioridade"){
    for (const k of Object.keys(LEVELS)){
      const items = list.filter(t=>t.nivel===k); if (items.length) groups.push([LEVELS[k], items]);
    }
    const rest = list.filter(t=>!LEVELS[t.nivel]); if (rest.length) groups.push(["Sem nível", rest]);
  } else if (view === "cliente"){
    const m = new Map();
    for (const t of list){ const k = t.cliente || "Sem cliente"; if(!m.has(k)) m.set(k,[]); m.get(k).push(t); }
    [...m.keys()].sort((a,b)=>a.localeCompare(b,"pt-BR")).forEach(k=>groups.push([k, m.get(k)]));
  } else {
    groups.push(["Pessoal", list]);
  }
  out.replaceChildren(...groups.map(([title, items])=>{
    const open = items.filter(t=>!t.done).length;
    return h("section",{class:"grp"},
      h("div",{class:"grp-h"}, h("h2",{}, title), h("small",{}, open + " abertas")),
      items.map(t=>row(t, items, view)));
  }));
}

/* ---------- diálogo ---------- */
function fillSelects(){
  $("#f-status").replaceChildren(...STATUS.map(s=>h("option",{value:s}, s)));
  $("#f-nivel").replaceChildren(...Object.keys(LEVELS).map(k=>h("option",{value:k}, LEVELS[k])));
}
function openDlg(t){
  editingId = t ? t.id : null;
  $("#dlg-title").textContent = t ? "Editar tarefa" : "Nova tarefa";
  $("#f-titulo").value = t ? t.titulo : "";
  $("#f-grupo").value = t ? (t.grupo||"empresa") : (view==="pessoal" ? "pessoal" : "empresa");
  $("#f-cliente").value = t ? (t.cliente||"") : "";
  $("#f-status").value = t ? t.status : "Minha ação";
  $("#f-nivel").value = t && t.nivel ? t.nivel : "P3";
  $("#f-obs").value = t ? (t.obs||"") : "";
  $("#f-del").style.display = t ? "" : "none";
  $("#clientes").replaceChildren(...[...new Set(tasks.map(x=>x.cliente).filter(Boolean))].sort().map(c=>h("option",{value:c})));
  $("#scrim").classList.add("open"); $("#f-titulo").focus();
}
function closeDlg(){ $("#scrim").classList.remove("open"); editingId = null; }
$("#form").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const grupo = $("#f-grupo").value;
  const data = {
    titulo: $("#f-titulo").value.trim(), grupo, cliente: $("#f-cliente").value.trim(),
    status: $("#f-status").value, nivel: grupo==="pessoal" ? null : $("#f-nivel").value, obs: $("#f-obs").value.trim()
  };
  if (!data.titulo) return;
  if (editingId) await save(editingId, data); else await create(data);
  closeDlg();
});
$("#f-cancel").addEventListener("click", closeDlg);
$("#f-del").addEventListener("click", async ()=>{ if (editingId) { await remove(editingId); closeDlg(); toast("Tarefa excluída"); } });
$("#scrim").addEventListener("click", (e)=>{ if (e.target.id==="scrim") closeDlg(); });
document.addEventListener("keydown", (e)=>{ if (e.key==="Escape") closeDlg(); });

/* ---------- controles ---------- */
document.querySelectorAll(".tab").forEach(b=>{
  b.addEventListener("click", ()=>{ view = b.dataset.view; syncTabs(); render(); });
});
function syncTabs(){ document.querySelectorAll(".tab").forEach(b=>b.setAttribute("aria-selected", String(b.dataset.view===view))); }
document.querySelectorAll(".chip").forEach(c=>{
  c.addEventListener("click", ()=>{
    stFilter = c.dataset.st;
    document.querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed", String(x===c)));
    render();
  });
});
$("#q").addEventListener("input", (e)=>{ q = e.target.value; render(); });
$("#show-done").addEventListener("change", (e)=>{ showDone = e.target.checked; render(); });
$("#btn-new").addEventListener("click", ()=>openDlg(null));
$("#btn-copy").addEventListener("click", async ()=>{
  const payload = JSON.stringify([...tasks].sort(byOrder), null, 2);
  try { await navigator.clipboard.writeText(payload); toast("JSON copiado"); } catch(e){ toast("Não foi possível copiar"); }
});

/* ---------- login ---------- */
const loginErr = (code) => ({
  "auth/invalid-credential":"E-mail ou senha incorretos.",
  "auth/invalid-email":"E-mail inválido.",
  "auth/too-many-requests":"Muitas tentativas. Aguarde um pouco e tente de novo.",
  "auth/network-request-failed":"Sem conexão."
}[code] || "Não foi possível entrar.");
$("#login-form").addEventListener("submit", async (e)=>{
  e.preventDefault();
  $("#login-err").textContent = "";
  try { await signInWithEmailAndPassword(auth, $("#l-email").value.trim(), $("#l-senha").value); }
  catch(err){ $("#login-err").textContent = loginErr(err.code); }
});
$("#btn-out").addEventListener("click", ()=>signOut(auth));

/* ---------- importar (diálogo) ---------- */
$("#btn-import").addEventListener("click", ()=>{ $("#imp-text").value = ""; $("#imp-err").textContent = ""; $("#scrim-imp").classList.add("open"); $("#imp-text").focus(); });
$("#imp-cancel").addEventListener("click", ()=>$("#scrim-imp").classList.remove("open"));
$("#imp-form").addEventListener("submit", async (e)=>{
  e.preventDefault();
  try { const n = await importJson($("#imp-text").value); $("#scrim-imp").classList.remove("open"); toast(n + " tarefas importadas"); }
  catch(err){ $("#imp-err").textContent = err.message || "Falha na importação."; }
});

/* ---------- início ---------- */
// Backup e importação de JSON ficam ocultos; só aparecem em <endereço>/#admin.
function syncAdmin(){ const on = location.hash === "#admin"; for (const id of ["#btn-copy","#btn-import"]) $(id).style.display = on ? "" : "none"; }
window.addEventListener("hashchange", syncAdmin); syncAdmin();
fillSelects(); syncTabs();
if (!configOk){
  showMsg("Firebase não configurado. Copie .env.example para .env e preencha as chaves VITE_FIREBASE_*.", true);
  $("#sub").textContent = "sem configuração";
} else {
  showMsg("Carregando…");
  onAuthStateChanged(auth, (user)=>{
    $("#scrim-login").classList.toggle("open", !user);
    $("#btn-out").style.display = user ? "" : "none";
    if (user){ $("#sub").textContent = user.email; subscribe(); }
    else { if (unsub){ unsub(); unsub = null; } tasks = []; $("#sub").textContent = "entre para ver as tarefas"; showMsg(""); }
  });
}
