import { db }
from "./firebase-config.js";

import {

collection,
getDocs,
deleteDoc,
doc

}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const tableBody =
document.getElementById(
"transactionBody"
);

const searchBox =
document.getElementById(
"searchBox"
);

const filterType =
document.getElementById(
"filterType"
);

let transactions=[];

async function loadTransactions(){

const snapshot =
await getDocs(
collection(db,"transactions")
);

transactions=[];

snapshot.forEach(d=>{

transactions.push({

id:d.id,

...d.data()

});

});

renderTable();

}

function renderTable(){

tableBody.innerHTML="";

const search=
searchBox.value.toLowerCase();

const type=
filterType.value;

const filtered=
transactions.filter(item=>{

const matchSearch=
(item.description || "")
.toLowerCase()
.includes(search);

const matchType=
!type || item.type===type;

return matchSearch &&
matchType;

});

filtered.forEach(item=>{

const row=document.createElement("tr");

row.innerHTML=`

<td>
${item.createdAt?.toDate()
.toLocaleDateString()}
</td>

<td>${item.member}</td>

<td>${item.type}</td>

<td>${item.category}</td>

<td>₹${item.amount}</td>

<td>${item.description}</td>

<td>

<button
class="delete-btn"
onclick="deleteTransaction('${item.id}')">

Delete

</button>

</td>

`;

tableBody.appendChild(row);

});

}

window.deleteTransaction=
async function(id){

if(!confirm(
"Delete Transaction?"
)) return;

await deleteDoc(
doc(db,"transactions",id)
);

loadTransactions();

}

searchBox.addEventListener(
"input",
renderTable
);

filterType.addEventListener(
"change",
renderTable
);

loadTransactions();