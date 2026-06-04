import { db }
from "./firebase-config.js";

import {
 collection,
 getDocs
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const TARGET = 900000;

async function loadGoal(){

 let income = 0;
 let expense = 0;

 const snapshot =
 await getDocs(
 collection(
 db,
 "transactions"
 )
 );

 snapshot.forEach(doc=>{

 const data =
 doc.data();

 if(data.type==="Income"){
  income += data.amount;
 }

 if(data.type==="Expense"){
  expense += data.amount;
 }

 });

 const saved =
 income-expense;

 const percent =
 Math.min(
 (saved/TARGET)*100,
 100
 );

 document.getElementById(
 "goalFill"
 ).style.width =
 percent + "%";

 document.getElementById(
 "goalText"
 ).innerText =
 `₹${saved.toLocaleString()}
 / ₹${TARGET.toLocaleString()}`;

}

loadGoal();