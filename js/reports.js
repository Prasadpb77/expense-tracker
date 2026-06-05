import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const monthFilter = document.getElementById("monthFilter");
const reportIncomeEl = document.getElementById("reportIncome");
const reportExpenseEl = document.getElementById("reportExpense");
const reportSavingsEl = document.getElementById("reportSavings");

const categoryChartCtx = document.getElementById("categoryChart");
const memberChartCtx = document.getElementById("memberChart");
const monthlyTrendCtx = document.getElementById("monthlyTrendChart");

let transactions = [];
let categoryChart, memberChart, monthlyTrendChart;

// Populate month dropdown
const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
monthNames.forEach((m,i)=>{
    monthFilter.innerHTML += `<option value="${i}">${m}</option>`;
});

async function loadReports() {
    const snapshot = await getDocs(collection(db, "transactions"));
    transactions = snapshot.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().createdAt?.toDate?.() || new Date(d.data().createdAt) }));

    renderReport();
}

function renderReport() {
    const selectedMonth = monthFilter.value;

    let filtered = transactions;
    if(selectedMonth !== "all") {
        filtered = transactions.filter(t => t.date.getMonth() == selectedMonth);
    }

    let income = 0, expense = 0;
    const categoryTotals = {};
    const memberTotals = {};
    const monthlyTotals = Array(12).fill(0);

    filtered.forEach(t => {
        if(t.type === "Income") income += t.amount;
        if(t.type === "Expense") {
            expense += t.amount;
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            memberTotals[t.member] = (memberTotals[t.member] || 0) + t.amount;
        }
        const m = t.date.getMonth();
        monthlyTotals[m] += t.amount;
    });

    reportIncomeEl.innerText = "₹" + income.toLocaleString();
    reportExpenseEl.innerText = "₹" + expense.toLocaleString();
    reportSavingsEl.innerText = "₹" + (income - expense).toLocaleString();

    // Category Chart
    if(categoryChart) categoryChart.destroy();
    categoryChart = new Chart(categoryChartCtx, {
        type: "pie",
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: ["#4f46e5","#6366f1","#818cf8","#f472b6","#f59e0b","#22c55e","#14b8a6","#06b6d4"]
            }]
        }
    });

    // Member Chart
    if(memberChart) memberChart.destroy();
    memberChart = new Chart(memberChartCtx, {
        type: "doughnut",
        data: {
            labels: Object.keys(memberTotals),
            datasets: [{
                data: Object.values(memberTotals),
                backgroundColor: ["#4ade80","#22c55e","#16a34a","#f472b6","#f59e0b"]
            }]
        }
    });

    // Monthly Trend Chart
    if(monthlyTrendChart) monthlyTrendChart.destroy();
    monthlyTrendChart = new Chart(monthlyTrendCtx, {
        type: "line",
        data: {
            labels: monthNames,
            datasets: [{
                label: "Expense Trend",
                data: monthlyTotals,
                borderColor: "#4f46e5",
                backgroundColor: "#c4b5fd88",
                fill: true,
                tension: 0.3
            }]
        }
    });
}

monthFilter.addEventListener("change", renderReport);

loadReports();