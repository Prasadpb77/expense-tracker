import {auth} from './firebase-config.js';
import {signInWithEmailAndPassword,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

onAuthStateChanged(auth,u=>{if(u) location='dashboard.html';});

document.getElementById('loginBtn').onclick=async()=>{
try{
await signInWithEmailAndPassword(auth,email.value,password.value);
location='dashboard.html';
}catch(e){document.getElementById('error').innerText=e.message;}
};