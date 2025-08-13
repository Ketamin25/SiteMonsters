// ========= НАСТРОЙ: ссылки на твои 4 уже загруженные страницы =========
// Пример: 'https://ketamin25.github.io/repo/ev-bluff.html'
const TOOL_URLS = [
  { id:'trainer',  title:'Bluff Trainer', url:'https://YOUR_USERNAME.github.io/REPO/trainer.html' },
  { id:'ev-call',  title:'EV Call',       url:'https://YOUR_USERNAME.github.io/REPO/ev-call.html' },
  { id:'ev-bluff', title:'EV Bluff',      url:'https://YOUR_USERNAME.github.io/REPO/ev-bluff.html' },
  { id:'misc',     title:'Misc',          url:'https://ketamin25.github.io/Math-Calc/' },
];

// ========= Firebase =========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ВСТАВЬ СВОЙ КОНФИГ (Firebase → Project settings → Your apps → Web app)
const firebaseConfig = {
  apiKey:     "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId:  "YOUR_PROJECT_ID",
  appId:      "YOUR_APP_ID",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const provider = new GoogleAuthProvider();

// ========= Простые вкладки + iframe =========
const tabsBox = document.getElementById('tabs');
const frame   = document.getElementById('frame');
const authBox = document.getElementById('authBox');
const loginBtn= document.getElementById('login');
const shareBtn= document.getElementById('btnShare');
const shareEl = document.getElementById('shareLink');

const routes = TOOL_URLS.map(t=>t.id);

TOOL_URLS.forEach(t=>{
  const a = document.createElement('a');
  a.className = 'tab';
  a.textContent = t.title;
  a.dataset.route = t.id;
  a.onclick = ()=>navigate(t.id);
  tabsBox.appendChild(a);
});

window.addEventListener('hashchange', readRoute);
readRoute();

function setActive(route){
  [...tabsBox.children].forEach(x=>x.classList.toggle('active', x.dataset.route===route));
}

function navigate(route){
  if(!routes.includes(route)) route = routes[0];
  const tool = TOOL_URLS.find(t=>t.id===route);
  frame.src = tool.url;
  setActive(route);
  location.hash = `#/${route}`;
  // Сохраним в историю «открытие вкладки»
  logEvent('open', { route, url: tool.url });
}

function readRoute(){
  const m = location.hash.match(/#\/([\w-]+)/);
  navigate(m?m[1]:routes[0]);
}

// ========= Auth UI =========
const renderAuth = (user)=>{
  if(user){
    authBox.innerHTML = `
      <img src="${user.photoURL||''}" style="width:26px;height:26px;border-radius:50%;vertical-align:middle">
      <span style="margin:0 6px">${user.displayName||user.email}</span>
      <button class="btn" id="logout">Выйти</button>`;
    document.getElementById('logout').onclick = ()=>signOut(auth);
  }else{
    authBox.innerHTML = `<button class="btn" id="login">Войти Google</button>`;
    document.getElementById('login').onclick = ()=>signInWithPopup(auth, provider);
  }
};
onAuthStateChanged(auth, renderAuth);

// ========= Firestore: история и шаринг =========
async function logEvent(kind, payload){
  const user = auth.currentUser;
  if(!user) return; // события пишем только залогиненным
  await addDoc(collection(db, "users", user.uid, "history"), {
    kind, ...payload, ts: serverTimestamp()
  });
}

shareBtn.onclick = async ()=>{
  const route = (location.hash.match(/#\/([\w-]+)/)||[])[1] || routes[0];
  const tool  = TOOL_URLS.find(t=>t.id===route);
  const user  = auth.currentUser;

  const ref = await addDoc(collection(db,"shares"), {
    route, url: tool.url, owner: user? user.uid : null, createdAt: serverTimestamp()
  });
  const url = `${location.origin}${location.pathname}?share=${ref.id}#/${route}`;
  shareEl.value = url; shareEl.select();
};

// Если открыли ?share=ID — подставим нужную вкладку/URL
(async function tryOpenShare(){
  const id = new URLSearchParams(location.search).get("share");
  if(!id) return;
  const snap = await getDoc(doc(db,"shares",id));
  if(!snap.exists()) return;
  const {route, url} = snap.data();
  const tool = TOOL_URLS.find(t=>t.id===route);
  if(tool){ frame.src = url || tool.url; setActive(route); location.hash = `#/${route}`; }
})();

