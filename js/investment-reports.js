import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const totalInvestmentEl = document.getElementById("totalInvestment");
const yearInvestmentEl = document.getElementById("yearInvestment");
const avgMonthlyInvestmentEl = document.getElementById("avgMonthlyInvestment");
const topMonthEl = document.getElementById("topMonth");

const monthlyCtx = document.getElementById("monthlyChart");
const memberCtx = document.getElementById("memberChart");
const yearlyCtx = document.getElementById("yearlyChart");

const monthlyTableBody = document.getElementById("monthlyTableBody");
const yearlyTableBody = document.getElementById("yearlyTableBody");

let monthlyChart, memberChart, yearlyChart;

async function loadInvestmentReports() {
  const snapshot = await getDocs(collection(db, "transactions"));
  const investments = snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(t => t.category === "Investment");

  const currentYear = new Date().getFullYear();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Lifetime investment
  const totalInvestment = investments.reduce((sum, t) => sum + t.amount, 0);
  totalInvestmentEl.innerText = "₹" + totalInvestment.toLocaleString();

  // Monthly totals
  const monthlyTotals = Array(12).fill(0);
  investments.forEach(t => {
    const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
    if(d.getFullYear() === currentYear) monthlyTotals[d.getMonth()] += t.amount;
  });

  const yearInvestment = monthlyTotals.reduce((a,b)=>a+b,0);
  yearInvestmentEl.innerText = "₹" + yearInvestment.toLocaleString();
  avgMonthlyInvestmentEl.innerText = "₹" + Math.round(yearInvestment/12).toLocaleString();

  const maxMonthIndex = monthlyTotals.indexOf(Math.max(...monthlyTotals));
  topMonthEl.innerText = monthNames[maxMonthIndex];

  // Member-wise totals
  const memberTotals = {};
  investments.forEach(t => memberTotals[t.member] = (memberTotals[t.member] || 0) + t.amount);

  // Yearly totals
  const yearlyTotals = {};
  investments.forEach(t => {
    const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
    yearlyTotals[d.getFullYear()] = (yearlyTotals[d.getFullYear()] || 0) + t.amount;
  });

  // Render Charts
  if(monthlyChart) monthlyChart.destroy();
  monthlyChart = new Chart(monthlyCtx, {
    type: "bar",
    data: {
      labels: monthNames,
      datasets: [{
        label: "Investment",
        data: monthlyTotals,
        backgroundColor: [
          "#4f46e5","#6366f1","#818cf8","#a78bfa","#c4b5fd","#f472b6",
          "#fb7185","#f97316","#facc15","#22c55e","#14b8a6","#06b6d4"
        ]
      }]
    }
  });

  if(memberChart) memberChart.destroy();
  memberChart = new Chart(memberCtx, {
    type: "pie",
    data: {
      labels: Object.keys(memberTotals),
      datasets: [{ data: Object.values(memberTotals),
        backgroundColor: ["#4f46e5","#6366f1","#818cf8","#f472b6","#f59e0b"]
      }]
    }
  });

  if(yearlyChart) yearlyChart.destroy();
  yearlyChart = new Chart(yearlyCtx, {
    type: "bar",
    data: {
      labels: Object.keys(yearlyTotals),
      datasets: [{ label: "Investment", data: Object.values(yearlyTotals),
        backgroundColor: ["#4ade80","#22c55e","#16a34a","#15803d","#166534"]
      }]
    }
  });

  renderMonthlyTable(investments, monthlyTotals, monthNames, currentYear);
  renderYearlyTable(investments, yearlyTotals);
}

// Monthly table
function renderMonthlyTable(investments, monthlyTotals, monthNames, currentYear){
  monthlyTableBody.innerHTML = "";
  for(let i=0;i<12;i++){
    const monthTransactions = investments.filter(t=>{
      const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
      return d.getMonth() === i && d.getFullYear() === currentYear;
    });
    const total = monthTransactions.reduce((sum,t)=>sum+t.amount,0);
    const descriptions = monthTransactions.map(t=>t.description || "-").join(", ");
    monthlyTableBody.innerHTML += `
      <tr>
        <td>${monthNames[i]}</td>
        <td>₹${total.toLocaleString()}</td>
        <td>${descriptions}</td>
      </tr>
    `;
  }
}

// Yearly table
function renderYearlyTable(investments, yearlyTotals){
  yearlyTableBody.innerHTML = "";
  const years = Object.keys(yearlyTotals).sort();
  years.forEach(year=>{
    const yearTransactions = investments.filter(t=>{
      const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
      return d.getFullYear() === Number(year);
    });
    const descriptions = yearTransactions.map(t=>t.description || "-").join(", ");
    yearlyTableBody.innerHTML += `
      <tr>
        <td>${year}</td>
        <td>₹${yearlyTotals[year].toLocaleString()}</td>
        <td>${descriptions}</td>
      </tr>
    `;
  });
}

loadInvestmentReports();