import { db }
from "./firebase-config.js";

import {
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const TARGET=900000;

async function loadGoal(){

let income=0;
let expense=0;

const snapshot=
await getDocs(
collection(db,"transactions")
);

snapshot.forEach(doc=>{

const data=doc.data();

if(data.type==="Income")
income+=data.amount;

if(data.type==="Expense")
expense+=data.amount;

});

const saved=
income-expense;

const percentage=
Math.max(
0,
(saved/TARGET)*100
);

document.getElementById(
"goalProgress"
).style.width=
percentage+"%";

document.getElementById(
"savedAmount"
).innerText=
`₹${saved.toLocaleString()} Saved`;

}

loadGoal();