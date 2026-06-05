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

async function loadReports() {
    const snapshot = await getDocs(collection(db, "transactions"));
    transactions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    populateMonthFilter();
    renderReports();
}

function populateMonthFilter() {
    const months = new Set(transactions.map(t => {
        const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    }));
    months.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m; opt.innerText = m;
        monthFilter.appendChild(opt);
    });
}

function renderReports() {
    const selectedMonth = monthFilter.value;

    // Filter transactions by month
    const filtered = transactions.filter(t => {
        if(selectedMonth === "all") return true;
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
    filtered.forEach(t => {
        if(t.type==="Expense") {
            categoryTotals[t.category] = (categoryTotals[t.category]||0)+t.amount;
        }
    });

    // Member totals
    const memberTotals = {};
    filtered.forEach(t => {
        if(t.type==="Expense") {
            memberTotals[t.member] = (memberTotals[t.member]||0)+t.amount;
        }
    });

    // Monthly trend (per month)
    const monthlyTrend = Array(12).fill(0);
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    filtered.forEach(t=>{
        const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
        if(d.getFullYear() === new Date().getFullYear()) monthlyTrend[d.getMonth()] += t.amount;
    });

    // Charts
    if(categoryChart) categoryChart.destroy();
    categoryChart = new Chart(categoryCtx,{ type:"bar", data:{
        labels: Object.keys(categoryTotals),
        datasets:[{ label:"Expense", data:Object.values(categoryTotals), backgroundColor:"#6366f1" }]
    }});

    if(memberChart) memberChart.destroy();
    memberChart = new Chart(memberCtx,{ type:"pie", data:{
        labels:Object.keys(memberTotals),
        datasets:[{ data:Object.values(memberTotals), backgroundColor:["#4f46e5","#6366f1","#818cf8","#f472b6","#f59e0b"] }]
    }});

    if(monthlyTrendChart) monthlyTrendChart.destroy();
    monthlyTrendChart = new Chart(monthlyTrendCtx,{ type:"line", data:{
        labels: monthNames,
        datasets:[{ label:"Expense Trend", data:monthlyTrend, borderColor:"#4ade80", backgroundColor:"#4ade80" }]
    }});

    // Tables
    renderMonthlyTable(filtered, monthNames);
    renderYearlyTable(filtered);
    renderMemberTable(filtered);
}

// Monthly table
function renderMonthlyTable(filtered, monthNames){
    monthlyTableBody.innerHTML = "";
    monthNames.forEach((m,i)=>{
        const monthTransactions = filtered.filter(t=>{
            const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
            return d.getMonth()===i;
        });
        const categories = {};
        monthTransactions.forEach(t=>{ if(t.type==="Expense") categories[t.category]=(categories[t.category]||0)+t.amount; });
        Object.keys(categories).forEach(cat=>{
            const desc = monthTransactions.filter(t=>t.category===cat).map(t=>t.description||"-").join(", ");
            monthlyTableBody.innerHTML += `<tr><td>${cat}</td><td>₹${categories[cat].toLocaleString()}</td><td>${desc}</td></tr>`;
        });
    });
}

// Yearly table
function renderYearlyTable(filtered){
    yearlyTableBody.innerHTML="";
    const yearly = {};
    filtered.forEach(t=>{
        const y = (t.createdAt?.toDate?.()||new Date(t.createdAt)).getFullYear();
        if(t.type==="Expense") yearly[y]=(yearly[y]||0)+t.amount;
    });
    Object.keys(yearly).sort().forEach(y=>{
        const desc = filtered.filter(t=>((t.createdAt?.toDate?.()||new Date(t.createdAt)).getFullYear()===Number(y))&&t.type==="Expense").map(t=>t.description||"-").join(", ");
        yearlyTableBody.innerHTML+=`<tr><td>${y}</td><td>₹${yearly[y].toLocaleString()}</td><td>${desc}</td></tr>`;
    });
}

// Member-wise table
function renderMemberTable(filtered){
    memberTableBody.innerHTML="";
    const members = {};
    filtered.forEach(t=>{
        if(t.type==="Expense") members[t.member]=(members[t.member]||[]).concat(t);
    });
    Object.keys(members).forEach(member=>{
        const total = members[member].reduce((sum,t)=>sum+t.amount,0);
        const desc = members[member].map(t=>t.description||"-").join(", ");
        memberTableBody.innerHTML+=`<tr><td>${member}</td><td>₹${total.toLocaleString()}</td><td>${desc}</td></tr>`;
    });
}

// Filter
monthFilter.addEventListener("change", renderReports);

loadReports();