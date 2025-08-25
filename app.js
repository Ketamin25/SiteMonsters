// ------------ ВКЛАДКИ (файлы в корне репозитория) ------------
const TOOLS = [
  { id:'bluff-calc',    title:'Bluff Calc',          url:'./Bluff-Calc.html' },
  { id:'call-calc',     title:'Call Calc',           url:'./Call-Calc.html' },
  { id:'bluff-trainer', title:'Bluff Trainer',       url:'./Bluff-Trainer.html' },
  { id:'math-trainer',  title:'Math Trainer',        url:'./Math-Trainer.html' },
  { id:'heavy-percent', title:'Сложный процент',     url:'./Heavy-percent.html' }, // ← новинка
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
  frame.src = tool.url;              // грузим в iframe → весь JS внутри страницы работает
  setActive(tool.id);
  location.hash = `#/${tool.id}`;
}
function readRoute(){
  const m = location.hash.match(/#\/([\w-]+)/);
  navigate(m?m[1]:TOOLS[0].id);
}

// ------------------------- Firebase Google Sign‑In -------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Конфиг берём из отдельного файла (лежит рядом)
import { firebaseConfig } from "./firebase-config.js";

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app); auth.useDeviceLanguage();
const prov = new GoogleAuthProvider();

const loginBtn  = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const userBox   = document.getElementById('userBox');

loginBtn.onclick = async ()=>{
  try{
    await signInWithPopup(auth, prov);
  }catch{
    await signInWithRedirect(auth, prov); // iOS/Safari фолбэк
  }
};
getRedirectResult(auth).catch(()=>{});
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
