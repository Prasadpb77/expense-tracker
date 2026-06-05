import { db }
from "./firebase-config.js";

import {
 collection,
 getDocs,
 doc,
 setDoc
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const BUDGET_DOC_ID =
"r85XT3RtwjqT1u7Dv0wh";

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
 "Rent",
 "Groceries",
 "Dining",
 "Insurance",
 "Subscriptions",
 "Education",
 "Vacation",
 "EmergencyFund",
 "Other"

];

async function loadBudgets(){

 const container =
 document.getElementById(
 "budgetEditor"
 );

 try{

  const snapshot =
  await getDocs(
   collection(
    db,
    "budgetLimits"
   )
  );

  let data = {};

  snapshot.forEach(docItem=>{

   if(docItem.id === BUDGET_DOC_ID){

    data =
    docItem.data();

   }

  });

  container.innerHTML = "";

  categories.forEach(cat=>{

   const displayName =
   cat === "EmergencyFund"
   ?
   "Emergency Fund"
   :
   cat;

   container.innerHTML += `

   <div class="budget-card">

     <div class="budget-header">

       <h3>${displayName}</h3>

       <span>₹</span>

     </div>

     <input
      class="budget-input"
      type="number"
      min="0"
      id="${cat}"
      value="${data[cat] || 0}">

   </div>

   `;

  });

 }
 catch(error){

  console.error(
   "Budget Load Error",
   error
  );

  alert(
   "Unable to load budgets"
  );

 }
}

document.getElementById(
"saveBudgets"
).addEventListener(
"click",
async ()=>{

 try{

  const payload = {};

  categories.forEach(cat=>{

   payload[cat] =
   Number(
    document.getElementById(cat)
    .value || 0
   );

  });

  await setDoc(
   doc(
    db,
    "budgetLimits",
    BUDGET_DOC_ID
   ),
   payload
  );

  alert(
   "✅ Budgets Saved Successfully"
  );

 }
 catch(error){

  console.error(
   "Save Error",
   error
  );

  alert(
   "Failed to save budgets"
  );

 }

});

loadBudgets();