import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {

 apiKey: "AIzaSyBEFf50fAitUQtNi-EZrIm54AMfT_ybmns",

 authDomain:
 "expense-tracker-64c17.firebaseapp.com",

 projectId:
 "expense-tracker-64c17",

 storageBucket:
 "expense-tracker-64c17.firebasestorage.app",

 messagingSenderId:
 "201360215356",

 appId:
 "1:201360215356:web:8adb4de599c8a681f1e239"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);