/* -------------------- Вкладки (все файлы лежат в корне репозитория) -------------------- */
const TOOLS = [
  { id:'bluff-calc',    title:'Bluff Calc',        candidates:['./Bluff-Calc.html'] },
  { id:'call-calc',     title:'Call Calc',         candidates:['./Call-Calc.html'] },
  { id:'bluff-trainer', title:'Bluff Trainer',     candidates:['./Bluff-Trainer.html'] },
  { id:'math-trainer',  title:'Math Trainer',      candidates:['./Math-Trainer.html'] },
  // у тебя файл назывался «Heavy-percent» (без .html). Делаем фоллбэк на оба пути.
  { id:'heavy-percent', title:'Сложный процент',   candidates:['./Heavy-percent.html','./Heavy-percent'] },
];

const tabsBox = document.getElementById('tabs');
const frame   = document.getElementById('frame');
const errBox  = document.getElementById('err');

function showError(msg){
  errBox.style.display = 'block';
  errBox.textContent = msg;
}
function clearError(){ errBox.style.display = 'none'; errBox.textContent = ''; }

// рисуем вкладки
for (const t of TOOLS) {
  const b = document.createElement('button');
  b.className = 'tab';
  b.textContent = t.title;
  b.dataset.route = t.id;
  b.addEventListener('click', () => navigate(t.id));
  tabsBox.appendChild(b);
}

window.addEventListener('hashchange', readRoute);
document.addEventListener('DOMContentLoaded', readRoute);

function setActive(id){
  [...tabsBox.children].forEach(x=>x.classList.toggle('active', x.dataset.route===id));
}

/** Проверяем кандидаты путей и выбираем первый существующий */
async function resolveUrl(candidates){
  for (const url of candidates){
    try {
      const r = await fetch(url, { method:'HEAD', cache:'no-store' });
      if (r.ok) return url;
    } catch(_) {}
  }
  return null;
}

async function navigate(id){
  clearError();
  const tool = TOOLS.find(x=>x.id===id) || TOOLS[0];
  setActive(tool.id);
  if (location.hash !== `#/${tool.id}`) location.hash = `#/${tool.id}`;

  const url = await resolveUrl(tool.candidates);
  if (!url){
    showError(`Не найден файл для вкладки «${tool.title}». Проверь наличие: ${tool.candidates.join(' или ')}`);
    frame.removeAttribute('src');
    return;
  }
  frame.src = url;

  // отлавливаем 404 внутри iframe (если GH Pages вернёт 404‑html)
  frame.onload = () => {
    try {
      const title = frame.contentDocument?.title || '';
      if (/404/i.test(title)) {
        showError(`Похоже, ${url} отдаёт 404 на GitHub Pages. Проверь ветку Pages и путь.`);
      }
    } catch { /* кросс‑домен не актуален — всё локально */ }
  };
}

function readRoute(){
  const m = location.hash.match(/#\/([\w-]+)/);
  navigate(m ? m[1] : TOOLS[0].id);
}

/* --------------------------- Firebase Google Sign‑In (необяз.) --------------------------- */
/* Работает, только если в корне есть файл firebase-config.js с:
     export const firebaseConfig = { apiKey: "...", authDomain: "...", ... };
   Если файла нет — просто скрываем кнопки и продолжаем. */
const loginBtn  = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const userBox   = document.getElementById('userBox');

(async () => {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut }
      = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');

    const { firebaseConfig } = await import('./firebase-config.js');
    const app  = initializeApp(firebaseConfig);
    const auth = getAuth(app); auth.useDeviceLanguage();
    const prov = new GoogleAuthProvider();

    loginBtn.onclick = async () => {
      try { await signInWithPopup(auth, prov); }
      catch { await signInWithRedirect(auth, prov); }
    };
    getRedirectResult(auth).catch(()=>{});
    logoutBtn.onclick = () => signOut(auth);

    onAuthStateChanged(auth, (user) => {
      if (user) {
        userBox.textContent = user.displayName || user.email || 'вошёл';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
      } else {
        userBox.textContent = 'не авторизован';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
      }
    });
  } catch (e) {
    // если Firebase или конфиг недоступны — просто прячем кнопки
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'none';
    // подсказываем в консоль, но без красной панели на странице
    console.info('[auth] Firebase отключён или отсутствует firebase-config.js. Это не критично для работы вкладок.');
  }
})();
