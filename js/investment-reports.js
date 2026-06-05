import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const totalInvestmentEl = document.getElementById("totalInvestment");
const yearInvestmentEl = document.getElementById("yearInvestment");
const avgMonthlyInvestmentEl = document.getElementById("avgMonthlyInvestment");
const topMonthEl = document.getElementById("topMonth");

const monthlyCtx = document.getElementById("monthlyChart");
const memberCtx = document.getElementById("memberChart");
const yearlyCtx = document.getElementById("yearlyChart");

let monthlyChart, memberChart, yearlyChart;

async function loadInvestmentReports() {
  const snapshot = await getDocs(collection(db, "transactions"));
  const investments = snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(t => t.category === "Investment");

  // Lifetime Investment
  const totalInvestment = investments.reduce((sum, t) => sum + t.amount, 0);
  totalInvestmentEl.innerText = "₹" + totalInvestment.toLocaleString();

  // Monthly Investment Current Year
  const currentYear = new Date().getFullYear();
  const monthlyTotals = Array(12).fill(0);
  investments.forEach(t => {
    const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
    if (d.getFullYear() === currentYear) {
      monthlyTotals[d.getMonth()] += t.amount;
    }
  });

  const yearInvestment = monthlyTotals.reduce((a,b)=>a+b,0);
  yearInvestmentEl.innerText = "₹" + yearInvestment.toLocaleString();
  avgMonthlyInvestmentEl.innerText = "₹" + Math.round(yearInvestment / 12).toLocaleString();

  const maxMonthIndex = monthlyTotals.indexOf(Math.max(...monthlyTotals));
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  topMonthEl.innerText = monthNames[maxMonthIndex];

  // Member-wise Investment
  const memberTotals = {};
  investments.forEach(t => {
    memberTotals[t.member] = (memberTotals[t.member] || 0) + t.amount;
  });

  // Yearly Investment
  const yearlyTotals = {};
  investments.forEach(t => {
    const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
    yearlyTotals[d.getFullYear()] = (yearlyTotals[d.getFullYear()] || 0) + t.amount;
  });

  // Render Charts with different colors
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
      datasets: [{
        data: Object.values(memberTotals),
        backgroundColor: ["#4f46e5","#6366f1","#818cf8","#f472b6","#f59e0b"]
      }]
    }
  });

  if(yearlyChart) yearlyChart.destroy();
  yearlyChart = new Chart(yearlyCtx, {
    type: "bar",
    data: {
      labels: Object.keys(yearlyTotals),
      datasets: [{
        label: "Investment",
        data: Object.values(yearlyTotals),
        backgroundColor: ["#4ade80","#22c55e","#16a34a","#15803d","#166534"]
      }]
    }
  });
}

loadInvestmentReports();