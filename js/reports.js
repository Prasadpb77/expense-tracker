import { db }
from "./firebase-config.js";

import {
 collection,
 getDocs
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

let categoryChart;
let memberChart;
let trendChart;

async function loadReports(){

 const snapshot =
 await getDocs(
  collection(
   db,
   "transactions"
  )
 );

 const transactions = [];

 snapshot.forEach(doc=>{

  transactions.push(
   doc.data()
  );

 });

 populateMonthFilter(
  transactions
 );

 renderReports(
  transactions,
  "all"
 );

 document.getElementById(
 "monthFilter"
 ).addEventListener(
 "change",
 e=>{

  renderReports(
   transactions,
   e.target.value
  );

 });

}

function populateMonthFilter(
 transactions
){

 const filter =
 document.getElementById(
 "monthFilter"
 );

 const months =
 new Set();

 transactions.forEach(tx=>{

  if(tx.createdAt){

   const date =
   tx.createdAt
   .toDate();

   const monthKey =
   `${date.getFullYear()}-${
   String(
    date.getMonth()+1
   ).padStart(2,"0")
   }`;

   months.add(
    monthKey
   );

  }

 });

 [...months]
 .sort()
 .reverse()
 .forEach(month=>{

  filter.innerHTML += `

  <option
   value="${month}">

   ${month}

  </option>

  `;

 });

}

function renderReports(
 transactions,
 selectedMonth
){

 let income = 0;
 let expense = 0;

 const categoryTotals = {};
 const memberTotals = {};
 const monthlyTotals = {};

 transactions.forEach(tx=>{

  const date =
  tx.createdAt?.toDate();

  if(!date) return;

  const monthKey =
  `${date.getFullYear()}-${
  String(
   date.getMonth()+1
  ).padStart(2,"0")
  }`;

  if(
   selectedMonth !== "all"
   &&
   monthKey !== selectedMonth
  ){
   return;
  }

  if(tx.type==="Income"){

   income += tx.amount;

  }

  if(tx.type==="Expense"){

   expense += tx.amount;

   categoryTotals[
    tx.category
   ] =
   (
    categoryTotals[
     tx.category
    ] || 0
   )
   + tx.amount;

   memberTotals[
    tx.member
   ] =
   (
    memberTotals[
     tx.member
    ] || 0
   )
   + tx.amount;

  }

 });

 transactions.forEach(tx=>{

  const date =
  tx.createdAt?.toDate();

  if(!date) return;

  const monthKey =
  `${date.getFullYear()}-${
  String(
   date.getMonth()+1
  ).padStart(2,"0")
  }`;

  if(tx.type==="Expense"){

   monthlyTotals[
    monthKey
   ] =
   (
    monthlyTotals[
     monthKey
    ] || 0
   )
   + tx.amount;

  }

 });

 document.getElementById(
 "reportIncome"
 ).innerText =
 "₹"+
 income.toLocaleString();

 document.getElementById(
 "reportExpense"
 ).innerText =
 "₹"+
 expense.toLocaleString();

 document.getElementById(
 "reportSavings"
 ).innerText =
 "₹"+
 (
 income-expense
 ).toLocaleString();

 renderCategoryChart(
  categoryTotals
 );

 renderMemberChart(
  memberTotals
 );

 renderTrendChart(
  monthlyTotals
 );

}

function renderCategoryChart(
 data
){

 if(categoryChart){
  categoryChart.destroy();
 }

 categoryChart =
 new Chart(
 document.getElementById(
 "categoryChart"
 ),
 {
  type:"pie",

  data:{

   labels:
   Object.keys(data),

   datasets:[{

    data:
    Object.values(data)

   }]

  }

 });

}

function renderMemberChart(
 data
){

 if(memberChart){
  memberChart.destroy();
 }

 memberChart =
 new Chart(
 document.getElementById(
 "memberChart"
 ),
 {
  type:"doughnut",

  data:{

   labels:
   Object.keys(data),

   datasets:[{

    data:
    Object.values(data)

   }]

  }

 });

}

function renderTrendChart(
 data
){

 if(trendChart){
  trendChart.destroy();
 }

 trendChart =
 new Chart(
 document.getElementById(
 "monthlyTrendChart"
 ),
 {
  type:"bar",

  data:{

   labels:
   Object.keys(data),

   datasets:[{

    label:
    "Monthly Expenses",

    data:
    Object.values(data)

   }]

  }

 });

}

loadReports();