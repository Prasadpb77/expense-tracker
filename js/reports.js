import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const reportIncome = document.getElementById("reportIncome");
const reportExpense = document.getElementById("reportExpense");
const reportSavings = document.getElementById("reportSavings");

const categoryChartCtx = document.getElementById("categoryChart");
const memberChartCtx = document.getElementById("memberChart");
const reportTableBody = document.getElementById("reportTableBody");

const monthFilter = document.getElementById("monthFilter");

let transactions = [];
let categoryChart, memberChart;

async function loadReports() {
    const snapshot = await getDocs(collection(db, "transactions"));
    transactions = snapshot.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().createdAt?.toDate?.() || new Date(d.data().createdAt) }));

    // Fill month filter dynamically
    const months = [...new Set(transactions.map(t => t.date.getMonth()))];
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    months.forEach(m => {
        if(!Array.from(monthFilter.options).some(o=>Number(o.value)===m))
            monthFilter.innerHTML += `<option value="${m}">${monthNames[m]}</option>`;
    });

    renderReports();
}

function renderReports() {
    const selectedMonth = monthFilter.value;
    const filtered = transactions.filter(t => t.type === "Expense" && (selectedMonth==="all" || t.date.getMonth() === Number(selectedMonth)));

    const incomeTotal = transactions.filter(t => t.type==="Income").reduce((sum,t)=>sum+t.amount,0);
    const expenseTotal = filtered.reduce((sum,t)=>sum+t.amount,0);
    const savings = incomeTotal - expenseTotal;

    reportIncome.innerText = "₹"+incomeTotal.toLocaleString();
    reportExpense.innerText = "₹"+expenseTotal.toLocaleString();
    reportSavings.innerText = "₹"+savings.toLocaleString();

    // Category-wise totals
    const categoryTotals = {};
    filtered.forEach(t=>{
        categoryTotals[t.category] = (categoryTotals[t.category]||0)+t.amount;
    });

    // Member-wise totals
    const memberTotals = {};
    filtered.forEach(t=>{
        memberTotals[t.member] = (memberTotals[t.member]||0)+t.amount;
    });

    // Render Charts
    if(categoryChart) categoryChart.destroy();
    categoryChart = new Chart(categoryChartCtx, {
        type:"bar",
        data:{
            labels:Object.keys(categoryTotals),
            datasets:[{
                label:"Expenses",
                data:Object.values(categoryTotals),
                backgroundColor: ["#4f46e5","#6366f1","#818cf8","#f472b6","#f59e0b","#22c55e","#16a34a","#f97316","#facc15"]
            }]
        },
        options:{plugins:{legend:{display:false}}, responsive:true, maintainAspectRatio:false}
    });

    if(memberChart) memberChart.destroy();
    memberChart = new Chart(memberChartCtx, {
        type:"pie",
        data:{
            labels:Object.keys(memberTotals),
            datasets:[{
                data:Object.values(memberTotals),
                backgroundColor:["#4f46e5","#6366f1","#818cf8","#f472b6","#f59e0b","#22c55e"]
            }]
        },
        options:{plugins:{legend:{position:"bottom"}}, responsive:true, maintainAspectRatio:false}
    });

    // Render table
    reportTableBody.innerHTML = "";
    Object.keys(categoryTotals).forEach(cat=>{
        reportTableBody.innerHTML += `
            <tr>
                <td>${cat}</td>
                <td>₹${categoryTotals[cat].toLocaleString()}</td>
            </tr>
        `;
    });
}

monthFilter.addEventListener("change", renderReports);

loadReports();