// --- УКАЖИ ИМЕНА ТВОИХ ФАЙЛОВ (лежат в корне репозитория) ---
const TOOLS = [
  { id:'bluff-calc',    title:'Bluff Calc',    url:'./Bluff-Calc.html' },
  { id:'call-calc',     title:'Call Calc',     url:'./Call-Calc.html' },
  { id:'bluff-trainer', title:'Bluff Trainer', url:'./Bluff-Trainer.html' },
  { id:'math-trainer',  title:'Math Trainer',  url:'./Math-Trainer.html' },
];

const tabsBox = document.getElementById('tabs');
const frame   = document.getElementById('frame');

TOOLS.forEach(t=>{
  const b = document.createElement('button');
  b.className = 'tab';
  b.textContent = t.title;
  b.dataset.route = t.id;
  b.onclick = ()=>navigate(t.id);
  tabsBox.appendChild(b);
});

window.addEventListener('hashchange', readRoute);
readRoute();

function setActive(id){
  [...tabsBox.children].forEach(x=>x.classList.toggle('active', x.dataset.route===id));
}
function navigate(id){
  const tool = TOOLS.find(x=>x.id===id) || TOOLS[0];
  frame.src = tool.url;       // весь JS внутри страниц работает, потому что это iframe
  setActive(tool.id);
  location.hash = `#/${tool.id}`;
}
function readRoute(){
  const m = location.hash.match(/#\/([\w-]+)/);
  navigate(m?m[1]:TOOLS[0].id);
}

/* ---------- Firebase: Google Sign‑In (iOS friendly) ---------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ВСТАВЬ РЕАЛЬНЫЕ ЗНАЧЕНИЯ СВОЕГО ПРОЕКТА (из Firebase Project settings → Web app)
const firebaseConfig = {
  apiKey:     "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId:  "YOUR_PROJECT_ID",
  appId:      "YOUR_APP_ID",
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app); auth.useDeviceLanguage();
const prov = new GoogleAuthProvider();

const loginBtn  = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const userBox   = document.getElementById('userBox');

loginBtn.onclick = async ()=>{
  try{
    await signInWithPopup(auth, prov);            // нормальный путь
  }catch(e){
    // iOS/Safari часто блокирует pop-up → делаем redirect flow
    await signInWithRedirect(auth, prov);
  }
};
getRedirectResult(auth).catch(()=>{});            // завершить redirect, если он был
logoutBtn.onclick = ()=>signOut(auth);

onAuthStateChanged(auth, (user)=>{
  if(user){
    userBox.textContent = user.displayName || user.email;
    loginBtn.style.display='none';
    logoutBtn.style.display='inline-block';
  }else{
    userBox.textContent = 'не авторизован';
    loginBtn.style.display='inline-block';
    logoutBtn.style.display='none';
  }
});
