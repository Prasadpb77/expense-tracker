import {auth,db} from './firebase-config.js';
import {signOut,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {collection,addDoc,getDocs,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

let pie,bar,doughnut;

onAuthStateChanged(auth,u=>{if(!u) location='index.html'; load();});

logoutBtn.onclick=()=>signOut(auth);

txnForm.onsubmit=async(e)=>{
e.preventDefault();
if(+amount.value<=0) return alert('Amount must be > 0');
await addDoc(collection(db,'transactions'),{
member:member.value,type:type.value,category:category.value,
amount:+amount.value,description:description.value,
createdAt:serverTimestamp()
});
txnForm.reset();
load();
};

async function load(){
const snap=await getDocs(collection(db,'transactions'));
const rows=snap.docs.map(d=>d.data());

const incomeT=rows.filter(x=>x.type==='Income').reduce((a,b)=>a+b.amount,0);
const expenseT=rows.filter(x=>x.type==='Expense').reduce((a,b)=>a+b.amount,0);

income.textContent=incomeT;
expense.textContent=expenseT;
balance.textContent=incomeT-expenseT;

const cat={}; rows.filter(x=>x.type==='Expense').forEach(x=>cat[x.category]=(cat[x.category]||0)+x.amount);
const members={Prasad:0,Bhagyashree:0};
rows.filter(x=>x.type==='Expense').forEach(x=>members[x.member]+=x.amount);

if(pie) pie.destroy(); if(bar) bar.destroy(); if(doughnut) doughnut.destroy();

pie=new Chart(document.getElementById('pieChart'),{
type:'pie',data:{labels:Object.keys(cat),datasets:[{data:Object.values(cat)}]}
});

bar=new Chart(document.getElementById('barChart'),{
type:'bar',data:{labels:['Income','Expense'],datasets:[{data:[incomeT,expenseT]}]}
});

doughnut=new Chart(document.getElementById('memberChart'),{
type:'doughnut',data:{labels:Object.keys(members),datasets:[{data:Object.values(members)}]}
});
}