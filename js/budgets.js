import { db }
from "./firebase-config.js";

import {
 doc,
 getDoc,
 setDoc
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const categories = [
    "Food",
    "Fuel",
    "Travel",
    "Shopping",
    "Bills",
    "Medical",
    "EMI",
    "Entertainment",
    "Investment",
    "Other"
   ];
async function loadBudgets(){

 const container =
 document.getElementById(
 "budgetEditor"
 );

 const snapshot =
 await getDocs(
  collection(
   db,
   "budgetLimits"
  )
 );

 const data =
 snapshot.exists()
 ?
 snapshot.data()
 :
 {};

 container.innerHTML="";

 categories.forEach(cat=>{

 container.innerHTML += `

 <div class="budget-card">

 <h3>${cat}</h3>

 <input
 type="number"
 id="${cat}"
 value="${data[cat] || 0}">

 </div>

 `;

 });

}

document.getElementById(
"saveBudgets"
).addEventListener(
"click",
async ()=>{

 const payload={};

 categories.forEach(cat=>{

 payload[cat] =
 Number(
 document.getElementById(cat)
 .value
 );

 });

 await setDoc(
 doc(
 db,
 "settings",
 "budgetLimits"
 ),
 payload
 );

 alert(
 "Budgets Saved"
 );

});

loadBudgets();