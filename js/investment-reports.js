import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const totalInvestmentEl = document.getElementById("totalInvestment");
const monthlyCtx = document.getElementById("monthlyChart");
const memberCtx = document.getElementById("memberChart");
const yearlyCtx = document.getElementById("yearlyChart");

let monthlyChart, memberChart, yearlyChart;

async function loadInvestmentReports() {
  const snapshot = await getDocs(collection(db, "transactions"));

  const investments = snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(t => t.category === "Investment");

  // Total Investment
  const totalInvestment = investments.reduce((sum, t) => sum + t.amount, 0);
  totalInvestmentEl.innerText = "₹" + totalInvestment.toLocaleString();

  // Member-wise Investment
  const memberTotals = {};
  investments.forEach(t => {
    memberTotals[t.member] = (memberTotals[t.member] || 0) + t.amount;
  });

  // Monthly Investment Current Year
  const currentYear = new Date().getFullYear();
  const monthlyTotals = Array(12).fill(0);
  investments.forEach(t => {
    const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
    if (d.getFullYear() === currentYear) {
      monthlyTotals[d.getMonth()] += t.amount;
    }
  });

  // Yearly Investment
  const yearlyTotals = {};
  investments.forEach(t => {
    const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
    yearlyTotals[d.getFullYear()] = (yearlyTotals[d.getFullYear()] || 0) + t.amount;
  });

  // Render Charts
  if (monthlyChart) monthlyChart.destroy();
  monthlyChart = new Chart(monthlyCtx, {
    type: "bar",
    data: {
      labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      datasets: [{
        label: "Investment",
        data: monthlyTotals,
        backgroundColor: "#4f46e5"
      }]
    }
  });

  if (memberChart) memberChart.destroy();
  memberChart = new Chart(memberCtx, {
    type: "pie",
    data: {
      labels: Object.keys(memberTotals),
      datasets: [{
        data: Object.values(memberTotals),
        backgroundColor: ["#4f46e5","#6366f1","#818cf8"]
      }]
    }
  });

  if (yearlyChart) yearlyChart.destroy();
  yearlyChart = new Chart(yearlyCtx, {
    type: "bar",
    data: {
      labels: Object.keys(yearlyTotals),
      datasets: [{
        label: "Investment",
        data: Object.values(yearlyTotals),
        backgroundColor: "#10b981"
      }]
    }
  });
}

loadInvestmentReports();