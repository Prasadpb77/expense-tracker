import { auth, db }
from "./firebase-config.js";

import {
  signOut
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {

  collection,
  addDoc,
  getDocs,
  Timestamp

}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const transactionForm =
document.getElementById("transactionForm");

const logoutBtn =
document.getElementById("logoutBtn");

let pieChart;
let memberChart;

logoutBtn.addEventListener(
"click",
async ()=>{

 await signOut(auth);

 location.href="index.html";

}
);

transactionForm.addEventListener(
"submit",
saveTransaction
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

 try{

 await addDoc(
 collection(db,"transactions"),
 {

  member,
  type,
  category,
  amount,
  description,

  createdAt:
  Timestamp.now()

 });

 transactionForm.reset();

 loadDashboard();

 }
 catch(error){

 console.error(error);

 }

}

async function loadDashboard(){

 let income=0;
 let expense=0;

 let prasadExpense=0;
 let bhagyashreeExpense=0;

 const categoryTotals={};

 const snapshot =
 await getDocs(
 collection(db,"transactions")
 );

 snapshot.forEach(doc=>{

 const data = doc.data();

 if(data.type==="Income"){

 income += data.amount;

 }

 if(data.type==="Expense"){

 expense += data.amount;

 categoryTotals[data.category] =
 (categoryTotals[data.category] || 0)
 + data.amount;

 if(data.member==="Prasad"){

  prasadExpense += data.amount;

 }

 if(data.member==="Bhagyashree"){

  bhagyashreeExpense += data.amount;

 }

 }

 });

 document.getElementById(
 "incomeTotal"
 ).innerText =
 "₹"+income.toLocaleString();

 document.getElementById(
 "expenseTotal"
 ).innerText =
 "₹"+expense.toLocaleString();

 document.getElementById(
 "balanceTotal"
 ).innerText =
 "₹"+(income-expense)
 .toLocaleString();

 renderCharts(
 categoryTotals,
 prasadExpense,
 bhagyashreeExpense
 );

}

function renderCharts(
 categoryTotals,
 prasadExpense,
 bhagyashreeExpense
){

 if(pieChart){
 pieChart.destroy();
 }

 if(memberChart){
 memberChart.destroy();
 }

 const expenseCtx =
 document.getElementById(
 "expenseChart"
 );

 pieChart =
 new Chart(expenseCtx,{

 type:"pie",

 data:{

 labels:
 Object.keys(categoryTotals),

 datasets:[{

 data:
 Object.values(categoryTotals)

 }]

 }

 });

 const memberCtx =
 document.getElementById(
 "memberChart"
 );

 memberChart =
 new Chart(memberCtx,{

 type:"doughnut",

 data:{

 labels:[
 "Prasad",
 "Bhagyashree"
 ],

 datasets:[{

 data:[
 prasadExpense,
 bhagyashreeExpense
 ]

 }]

 }

 });

}

loadDashboard();