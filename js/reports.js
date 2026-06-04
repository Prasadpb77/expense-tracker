import { db }
from "./firebase-config.js";

import {
 collection,
 getDocs
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

async function loadReports(){

 const snapshot =
 await getDocs(
 collection(
 db,
 "transactions"
 )
 );

 const categoryTotals={};

 let prasad=0;
 let bhagyashree=0;

 snapshot.forEach(doc=>{

 const data =
 doc.data();

 if(data.type==="Expense"){

 categoryTotals[
 data.category
 ] =
 (
 categoryTotals[
 data.category
 ] || 0
 )
 + data.amount;

 if(data.member==="Prasad"){
  prasad += data.amount;
 }

 if(data.member==="Bhagyashree"){
  bhagyashree += data.amount;
 }

 }

 });

 new Chart(
 document.getElementById(
 "categoryChart"
 ),
 {
 type:"pie",
 data:{
 labels:
 Object.keys(
 categoryTotals
 ),
 datasets:[{
 data:
 Object.values(
 categoryTotals
 )
 }]
 }
 });

 new Chart(
 document.getElementById(
 "memberChart"
 ),
 {
 type:"doughnut",
 data:{
 labels:[
 "Prasad",
 "Bhagyashree"
 ],
 datasets:[{
 data:[
 prasad,
 bhagyashree
 ]
 }]
 }
 });

}

loadReports();