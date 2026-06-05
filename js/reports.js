import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const reportIncome = document.getElementById("reportIncome");
const reportExpense = document.getElementById("reportExpense");
const reportSavings = document.getElementById("reportSavings");

const categoryCtx = document.getElementById("categoryChart");
const memberCtx = document.getElementById("memberChart");
const monthlyTrendCtx = document.getElementById("monthlyTrendChart");

const monthFilter = document.getElementById("monthFilter");

const monthlyTableBody = document.getElementById("monthlyTableBody");
const yearlyTableBody = document.getElementById("yearlyTableBody");
const memberTableBody = document.getElementById("memberTableBody");

let categoryChart, memberChart, monthlyTrendChart;
let transactions = [];

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

async function loadReports() {
    // Fetch transactions from Firebase
    const snapshot = await getDocs(collection(db, "transactions"));
    transactions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    populateMonthFilter();   // Dynamically create month options from Firebase
    renderReports();
}

// Dynamic month filter from Firebase
function populateMonthFilter() {
    const monthSet = new Set();
    transactions.forEach(t => {
        const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
        const monthStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; // e.g., "2026-06"
        monthSet.add(monthStr);
    });

    monthFilter.innerHTML = `<option value="all">All Time</option>`; // Reset
    Array.from(monthSet).sort().forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.innerText = m;
        monthFilter.appendChild(opt);
    });
}

// Render charts and tables based on selected month
function renderReports() {
    const selectedMonth = monthFilter.value;

    const filtered = transactions.filter(t => {
        if(selectedMonth==="all") return true;
        const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` === selectedMonth;
    });

    // Income / Expense / Savings
    const income = filtered.filter(t=>t.type==="Income").reduce((sum,t)=>sum+t.amount,0);
    const expense = filtered.filter(t=>t.type==="Expense").reduce((sum,t)=>sum+t.amount,0);
    reportIncome.innerText = `₹${income.toLocaleString()}`;
    reportExpense.innerText = `₹${expense.toLocaleString()}`;
    reportSavings.innerText = `₹${(income-expense).toLocaleString()}`;

    // Category totals
    const categoryTotals = {};
    filtered.forEach(t => { if(t.type==="Expense") categoryTotals[t.category]=(categoryTotals[t.category]||0)+t.amount; });

    // Member totals
    const memberTotals = {};
    filtered.forEach(t => { if(t.type==="Expense") memberTotals[t.member]=(memberTotals[t.member]||0)+t.amount; });

    // Monthly trend (line chart)
    const monthlyTrend = Array(12).fill(0);
    filtered.forEach(t => {
        const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
        if(d.getFullYear() === new Date().getFullYear()) monthlyTrend[d.getMonth()] += t.amount;
    });

    // Charts
    if(categoryChart) categoryChart.destroy();
    categoryChart = new Chart(categoryCtx, {
        type:"bar",
        data:{ labels:Object.keys(categoryTotals), datasets:[{ label:"Expense", data:Object.values(categoryTotals), backgroundColor:"#6366f1" }] },
        options:{ plugins:{ legend:{ display:false } }, responsive:true, maintainAspectRatio:false }
    });

    if(memberChart) memberChart.destroy();
    memberChart = new Chart(memberCtx, {
        type:"pie",
        data:{ labels:Object.keys(memberTotals), datasets:[{ data:Object.values(memberTotals), backgroundColor:["#4f46e5","#6366f1","#818cf8","#f472b6","#f59e0b"] }] },
        options:{ plugins:{ legend:{ position:"bottom" } }, responsive:true, maintainAspectRatio:false }
    });

    if(monthlyTrendChart) monthlyTrendChart.destroy();
    monthlyTrendChart = new Chart(monthlyTrendCtx, {
        type:"line",
        data:{ labels: monthNames, datasets:[{ label:"Expense Trend", data:monthlyTrend, borderColor:"#4ade80", backgroundColor:"#4ade80" }] },
        options:{ responsive:true, maintainAspectRatio:false }
    });

    renderMonthlyTable(filtered);
    renderYearlyTable(filtered);
    renderMemberTable(filtered);
}

// Tables without descriptions
function renderMonthlyTable(filtered){
    monthlyTableBody.innerHTML = "";
    monthNames.forEach((m,i)=>{
        const monthTransactions = filtered.filter(t=>{
            const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
            return d.getMonth()===i;
        });
        const categories = {};
        monthTransactions.forEach(t=>{ if(t.type==="Expense") categories[t.category]=(categories[t.category]||0)+t.amount; });
        Object.keys(categories).forEach(cat=>{
            monthlyTableBody.innerHTML += `<tr><td>${cat}</td><td>₹${categories[cat].toLocaleString()}</td></tr>`;
        });
    });
}

function renderYearlyTable(filtered){
    yearlyTableBody.innerHTML="";
    const yearly = {};
    filtered.forEach(t=>{
        const y = (t.createdAt?.toDate?.() || new Date(t.createdAt)).getFullYear();
        if(t.type==="Expense") yearly[y]=(yearly[y]||0)+t.amount;
    });
    Object.keys(yearly).sort().forEach(y=>{
        yearlyTableBody.innerHTML+=`<tr><td>${y}</td><td>₹${yearly[y].toLocaleString()}</td></tr>`;
    });
}

function renderMemberTable(filtered){
    memberTableBody.innerHTML="";
    const members = {};
    filtered.forEach(t=>{
        if(t.type==="Expense") members[t.member]=(members[t.member]||0)+t.amount;
    });
    Object.keys(members).forEach(member=>{
        memberTableBody.innerHTML+=`<tr><td>${member}</td><td>₹${members[member].toLocaleString()}</td></tr>`;
    });
}

monthFilter.addEventListener("change", renderReports);

loadReports();