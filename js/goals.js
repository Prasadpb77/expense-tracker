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
document.getElementById(
"addGoalBtn"
);

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

 if(!name || target <= 0){

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
 ).value = "";

 document.getElementById(
 "goalTarget"
 ).value = "";

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

window.addContribution =
async function(goalId){

 const input =
 document.getElementById(
 `contribution-${goalId}`
 );

 const amount =
 Number(
  input.value
 );

 if(amount <= 0){

  alert(
   "Enter valid amount"
  );

  return;

 }

 await addDoc(
 collection(
  db,
  "goalContributions"
 ),
 {
  goalId,
  amount
 }
 );

 input.value = "";

 loadGoals();

};

async function loadGoals(){

 const container =
 document.getElementById(
 "goalsContainer"
 );

 container.innerHTML = "";

 const goalsSnapshot =
 await getDocs(
 collection(
  db,
  "goals"
 )
 );

 const contributionSnapshot =
 await getDocs(
 collection(
  db,
  "goalContributions"
 )
 );

 const contributions = {};

 contributionSnapshot.forEach(docItem=>{

  const data =
  docItem.data();

  contributions[
   data.goalId
  ] =
  (
   contributions[
    data.goalId
   ] || 0
  )
  + Number(
   data.amount
  );

 });

 goalsSnapshot.forEach(goal=>{

  const data =
  goal.data();

  const current =
  contributions[
   goal.id
  ] || 0;

  const percent =
  Math.min(
   (
    current /
    data.target
   ) * 100,
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

   <p>
   Saved:
   ₹${current.toLocaleString()}
   </p>

   <div class="goal-progress">

    <div
     class="goal-fill"
     style="
      width:${percent}%">
    </div>

   </div>

   <p>

   ${percent.toFixed(1)}%
   Complete

   </p>

   <div
   class="goal-add-section">

    <input
     type="number"
     id="contribution-${goal.id}"
     placeholder="Add Amount">

    <button
     class="goal-add-btn"
     onclick="
      addContribution(
      '${goal.id}'
      )">

      Add Money

    </button>

   </div>

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