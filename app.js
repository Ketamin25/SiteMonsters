// app.js — минимальный вход Google + Firestore

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1) ВСТАВЬ свои значения из Firebase → Project settings → Your apps → Web app
const firebaseConfig = {
  apiKey:     "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId:  "YOUR_PROJECT_ID",
  appId:      "YOUR_APP_ID",
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const prov = new GoogleAuthProvider();

// UI элементы
const $ = s => document.querySelector(s);
const loginBtn = $('#login');
const logoutBtn = $('#logout');
const userBox = $('#userBox');
const saveBtn = $('#save');
const saveMsg = $('#saveMsg');

// 2) Логин/логаут
loginBtn.onclick = () => signInWithPopup(auth, prov);
logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user)=>{
  if(user){
    userBox.textContent = `${user.displayName || user.email}`;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  }else{
    userBox.textContent = 'не авторизован';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
  }
});

// 3) Тестовая запись в Firestore
saveBtn.onclick = async ()=>{
  const user = auth.currentUser;
  if(!user){ alert('Сначала войдите через Google'); return; }
  const ref = await addDoc(collection(db, "users", user.uid, "demo"), {
    createdAt: serverTimestamp(),
    note: "hello from Nitro Tools"
  });
  saveMsg.textContent = `OK: ${ref.id}`;
};
