// РОУТЫ → имена твоих файлов в корне репозитория
const ROUTES = {
  "bluff-calc":   "Bluff-Calc.html",
  "call-calc":    "Call-Calc.html",
  "bluff-trainer":"Bluff-Trainer.html",
  "math-trainer": "Math-Trainer.html",
};

const appBox = document.getElementById("app");
const tabs   = document.querySelectorAll(".tab");

tabs.forEach(b=>b.addEventListener("click", ()=>navigate(b.dataset.route)));
window.addEventListener("hashchange", readRoute);
readRoute();

async function navigate(route){
  if(!ROUTES[route]) route = Object.keys(ROUTES)[0];
  tabs.forEach(b=>b.classList.toggle("active", b.dataset.route===route));
  const url = ROUTES[route];
  try{
    const html = await fetch(url+"?"+Date.now()).then(r=>r.text());
    appBox.innerHTML = html;
  }catch(e){
    appBox.innerHTML = `<p style="color:#ff8f8f">Ошибка загрузки ${url}</p>`;
  }
  location.hash = `#/${route}`;
}
function readRoute(){
  const m = location.hash.match(/#\/([\w-]+)/);
  navigate(m?m[1]:Object.keys(ROUTES)[0]);
}

/* ---------- Firebase: Google Sign‑In + Firestore (минимум) ---------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ВСТАВЬ СВОЙ КОНФИГ
const firebaseConfig = {
  apiKey:     "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId:  "YOUR_PROJECT_ID",
  appId:      "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const prov = new GoogleAuthProvider();

const loginBtn  = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const userBox   = document.getElementById("userBox");

// iOS/Safari подстраховка: если попап заблокирован — уходим в редирект
loginBtn.onclick = async ()=>{
  try{
    await signInWithPopup(auth, prov);
  }catch(e){
    if (e.code === "auth/popup-blocked" || e.code === "auth/cancelled-popup-request") {
      await signInWithRedirect(auth, prov);
    } else {
      console.warn(e);
    }
  }
};
// завершить редирект-флоу (важно для iOS)
getRedirectResult(auth).catch(()=>{});

logoutBtn.onclick = ()=>signOut(auth);

// отрисовка состояния
onAuthStateChanged(auth, (user)=>{
  if(user){
    userBox.textContent = user.displayName || user.email;
    loginBtn.style.display  = "none";
    logoutBtn.style.display = "inline-block";
    // пример логирования события в историю:
    addDoc(collection(db,"users",user.uid,"history"),{ kind:"login", ts:serverTimestamp() }).catch(()=>{});
  }else{
    userBox.textContent = "не авторизован";
    loginBtn.style.display  = "inline-block";
    logoutBtn.style.display = "none";
  }
});
