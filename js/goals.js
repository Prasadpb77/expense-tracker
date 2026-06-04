import { db }
from "./firebase-config.js";

import {
 collection,
 addDoc,
 getDocs,
 deleteDoc,
 doc
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const addGoalBtn =
document.getElementById("addGoalBtn");

addGoalBtn.addEventListener(
"click",
async ()=>{

 const name =
 document.getElementById(
 "goalName"
 ).value.trim();

 const target =
 Number(
 document.getElementById(
 "goalTarget"
 ).value
 );

 if(!name || target<=0){

  alert(
  "Enter valid goal"
  );

  return;

 }

 await addDoc(
 collection(
 db,
 "goals"
 ),
 {
  name,
  target
 }
 );

 document.getElementById(
 "goalName"
 ).value="";

 document.getElementById(
 "goalTarget"
 ).value="";

 loadGoals();

}
);

window.deleteGoal =
async function(id){

 await deleteDoc(
 doc(
 db,
 "goals",
 id
 )
 );

 loadGoals();

};

async function loadGoals(){

 const container =
 document.getElementById(
 "goalsContainer"
 );

 container.innerHTML="";

 const goalsSnapshot =
 await getDocs(
 collection(
 db,
 "goals"
 )
 );

 let income=0;
 let expense=0;

 const txSnapshot =
 await getDocs(
 collection(
 db,
 "transactions"
 )
 );

 txSnapshot.forEach(doc=>{

 const data=
 doc.data();

 if(data.type==="Income"){
  income+=data.amount;
 }

 if(data.type==="Expense"){
  expense+=data.amount;
 }

 });

 const saved=
 income-expense;

 goalsSnapshot.forEach(goal=>{

 const data=
 goal.data();

 const percent=
 Math.min(
 (saved/data.target)*100,
 100
 );

 container.innerHTML += `

 <div class="goal-card">

 <h3>
 ${data.name}
 </h3>

 <p>
 Target:
 ₹${data.target.toLocaleString()}
 </p>

 <div class="goal-progress">

 <div
 class="goal-fill"
 style="
 width:${percent}%">
 </div>

 </div>

 <p>

 ₹${saved.toLocaleString()}

 /

 ₹${data.target.toLocaleString()}

 </p>

 <button
 class="delete-btn"
 onclick="
 deleteGoal(
 '${goal.id}'
 )">

 Delete

 </button>

 </div>

 `;

 });

}

loadGoals();