import { auth, db } from "./firebase-config.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const transactionForm =
document.getElementById("transactionForm");

const logoutBtn =
document.getElementById("logoutBtn");

const themeBtn =
document.getElementById("themeToggle");

let pieChart;
let memberChart;

const budgets = {
  Food: 5000,
  Fuel: 3000,
  Shopping: 10000,
  Bills: 8000,
  Travel: 5000
};

logoutBtn?.addEventListener(
"click",
async ()=>{

 await signOut(auth);

 location.href="index.html";

}
);

transactionForm?.addEventListener(
"submit",
saveTransaction
);

if(localStorage.getItem("theme")==="dark"){
 document.body.classList.add("dark");
}

themeBtn?.addEventListener(
"click",
()=>{

 document.body.classList.toggle("dark");

 localStorage.setItem(
  "theme",
  document.body.classList.contains("dark")
  ? "dark"
  : "light"
 );

}
);

async function saveTransaction(e){

 e.preventDefault();

 const member =
 document.getElementById("member").value;

 const type =
 document.getElementById("type").value;

 const category =
 document.getElementById("category").value;

 const amount =
 Number(
 document.getElementById("amount").value
 );

 const description =
 document.getElementById("description").value;

 if(amount<=0){
  alert("Amount must be greater than 0");
  return;
 }

 await addDoc(
 collection(db,"transactions"),
 {
  member,
  type,
  category,
  amount,
  description,
  createdAt: Timestamp.now()
 }
 );

 transactionForm.reset();

 loadDashboard();

}

async function loadDashboard(){

 let income=0;
 let expense=0;

 const memberTotals = {};

 const categoryTotals={};

 const transactions=[];

 const snapshot =
 await getDocs(
 collection(db,"transactions")
 );

 snapshot.forEach(doc=>{

  const data = doc.data();

  transactions.push({
   id:doc.id,
   ...data
  });

  if(data.type==="Income"){
   income += data.amount;
  }

  if(data.type==="Expense"){

   expense += data.amount;

   categoryTotals[data.category] =
   (categoryTotals[data.category] || 0)
   + data.amount;

   memberTotals[data.member] =
   (memberTotals[data.member] || 0)
   + data.amount;

  }

 });

 document.getElementById("incomeTotal").innerText =
 "₹"+income.toLocaleString();

 document.getElementById("expenseTotal").innerText =
 "₹"+expense.toLocaleString();

 document.getElementById("balanceTotal").innerText =
 "₹"+(income-expense).toLocaleString();

 renderCharts(
    categoryTotals,
    memberTotals
   );

 renderRecentTransactions(
  transactions
 );

 renderGoal(
  income,
  expense
 );

 renderBudgets(
  categoryTotals
 );

}

function renderGoal(
 income,
 expense
){

 const saved =
 income-expense;

 const target =
 900000;

 const percent =
 Math.min(
 (saved/target)*100,
 100
 );

 const goalFill =
 document.getElementById("goalFill");

 const goalText =
 document.getElementById("goalText");

 if(goalFill){
  goalFill.style.width =
  percent + "%";
 }

 if(goalText){
  goalText.innerText =
  `₹${saved.toLocaleString()} / ₹${target.toLocaleString()}`;
 }

}

function renderBudgets(
 categoryTotals
){

 const container =
 document.getElementById(
 "budgetContainer"
 );

 if(!container) return;

 container.innerHTML="";

 Object.keys(budgets)
 .forEach(category=>{

  const spent =
  categoryTotals[category] || 0;

  const budget =
  budgets[category];

  const percent =
  Math.min(
   (spent/budget)*100,
   100
  );

  container.innerHTML += `

  <div class="budget-card">

    <h4>${category}</h4>

    <p>
      ₹${spent}
      /
      ₹${budget}
    </p>

    <div class="budget-bar">

      <div
      class="budget-fill"
      style="width:${percent}%">
      </div>

    </div>

  </div>

  `;

 });

}

function renderRecentTransactions(
 transactions
){

 const body =
 document.getElementById(
 "recentTransactions"
 );

 if(!body) return;

 body.innerHTML="";

 transactions
 .sort(
 (a,b)=>
 b.createdAt.seconds -
 a.createdAt.seconds
 )
 .slice(0,10)
 .forEach(item=>{

 body.innerHTML += `

 <tr>

 <td>
 ${
 item.createdAt
 ?.toDate()
 .toLocaleDateString()
 }
 </td>

 <td>${item.member}</td>

 <td>${item.category}</td>

 <td>₹${item.amount}</td>

 </tr>

 `;

 });

}

function renderCharts(
    categoryTotals,
    memberTotals
   ){
   
    if(pieChart){
     pieChart.destroy();
    }
   
    if(memberChart){
     memberChart.destroy();
    }
   
    pieChart =
    new Chart(
    document.getElementById("expenseChart"),
    {
     type:"pie",
     data:{
      labels:Object.keys(categoryTotals),
      datasets:[{
       data:Object.values(categoryTotals)
      }]
     }
    });
   
    memberChart =
    new Chart(
    document.getElementById("memberChart"),
    {
     type:"doughnut",
     data:{
      labels:Object.keys(memberTotals),
   
      datasets:[{
       data:Object.values(memberTotals)
      }]
     }
    });
   
   }

loadDashboard();