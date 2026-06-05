import { auth, db } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { collection, addDoc, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const transactionForm = document.getElementById("transactionForm");
const logoutBtn = document.getElementById("logoutBtn");
const themeBtn = document.getElementById("themeToggle");
const monthFilter = document.getElementById("monthFilter");

let pieChart;
let memberChart;
let budgets = {};

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  location.href = "index.html";
});

transactionForm?.addEventListener("submit", saveTransaction);

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

themeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

async function saveTransaction(e) {
  e.preventDefault();
  const member = document.getElementById("member").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = Number(document.getElementById("amount").value);
  const description = document.getElementById("description").value;

  if (amount <= 0) {
    alert("Amount must be greater than 0");
    return;
  }

  await addDoc(collection(db, "transactions"), {
    member, type, category, amount, description, createdAt: Timestamp.now()
  });

  transactionForm.reset();
  loadDashboard();
}

// Populate month filter from Firebase
async function populateMonthFilter() {
  const snapshot = await getDocs(collection(db, "transactions"));
  const monthsSet = new Set();

  snapshot.forEach(doc => {
    const data = doc.data();
    const d = data.createdAt?.toDate?.() || new Date(data.createdAt);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthsSet.add(monthKey);
  });

  const months = Array.from(monthsSet).sort();
  monthFilter.innerHTML = `<option value="all">All Time</option>`;
  months.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.innerText = m;
    monthFilter.appendChild(opt);
  });
}

// Load dashboard
async function loadDashboard() {
  const selectedMonth = monthFilter?.value || "all";

  let income = 0;
  let expense = 0;
  const categoryTotals = {};
  const memberTotals = {};
  const transactions = [];

  const snapshot = await getDocs(collection(db, "transactions"));
  snapshot.forEach(doc => {
    const data = doc.data();
    const d = data.createdAt?.toDate?.() || new Date(data.createdAt);
    const txMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (selectedMonth === "all" || selectedMonth === txMonth) {
      transactions.push({ id: doc.id, ...data });
      if (data.type === "Income") income += data.amount;
      if (data.type === "Expense") {
        expense += data.amount;
        categoryTotals[data.category] = (categoryTotals[data.category] || 0) + data.amount;
        memberTotals[data.member] = (memberTotals[data.member] || 0) + data.amount;
      }
    }
  });

  document.getElementById("incomeTotal").innerText = "₹" + income.toLocaleString();
  document.getElementById("expenseTotal").innerText = "₹" + expense.toLocaleString();
  document.getElementById("balanceTotal").innerText = "₹" + (income - expense).toLocaleString();

  renderCharts(categoryTotals, memberTotals);
  renderRecentTransactions(transactions);
  renderBudgets(categoryTotals);
}

// Charts
function renderCharts(categoryTotals, memberTotals) {
  if (pieChart) pieChart.destroy();
  if (memberChart) memberChart.destroy();

  pieChart = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{ data: Object.values(categoryTotals), backgroundColor: [
        "#4f46e5","#6366f1","#818cf8","#a78bfa","#c4b5fd","#f472b6","#fb7185","#f97316","#facc15","#22c55e","#14b8a6","#06b6d4"
      ] }]
    }
  });

  memberChart = new Chart(document.getElementById("memberChart"), {
    type: "doughnut",
    data: {
      labels: Object.keys(memberTotals),
      datasets: [{ data: Object.values(memberTotals), backgroundColor: ["#4f46e5","#6366f1","#818cf8","#f472b6","#f59e0b"] }]
    }
  });
}

// Recent transactions
function renderRecentTransactions(transactions) {
  const body = document.getElementById("recentTransactions");
  if (!body) return;
  body.innerHTML = "";

  transactions
    .sort((a,b)=>b.createdAt.seconds - a.createdAt.seconds)
    .slice(0,10)
    .forEach(item => {
      body.innerHTML += `<tr>
        <td>${item.createdAt?.toDate()?.toLocaleDateString()}</td>
        <td>${item.member}</td>
        <td>${item.category}</td>
        <td>₹${item.amount}</td>
      </tr>`;
    });
}

// Budgets
function renderBudgets(categoryTotals) {
  const container = document.getElementById("budgetContainer");
  if(!container) return;

  const budgetTitle = document.getElementById("budgetTitle");
  if(budgetTitle) budgetTitle.innerText = `📅 Monthly Budget Tracker`;

  container.innerHTML = "";
  Object.keys(budgets).forEach(category => {
    const spent = categoryTotals[category] || 0;
    const budget = budgets[category];
    const percent = budget > 0 ? Math.min((spent/budget)*100,100) : 0;

    container.innerHTML += `
      <div class="budget-card">
        <h4>${category}</h4>
        <p>₹${spent.toLocaleString()} / ₹${budget.toLocaleString()}</p>
        <small>Remaining: ₹${Math.max(budget-spent,0).toLocaleString()}</small>
        <div class="budget-bar">
          <div class="budget-fill" style="width:${percent}%;background:${percent >=100 ? '#ef4444' : percent>=80 ? '#f59e0b' : '#10b981'};"></div>
        </div>
      </div>`;
  });
}

// Load budgets from Firebase
async function loadBudgets() {
  try {
    const snapshot = await getDocs(collection(db, "budgetLimits"));
    snapshot.forEach(docItem => { budgets = docItem.data(); });
  } catch (error) {
    console.error("Dashboard Budget Load Error", error);
  }
}

// Init dashboard
async function initDashboard() {
  await populateMonthFilter();
  monthFilter?.addEventListener("change", loadDashboard);
  await loadBudgets();
  await loadDashboard();
}

initDashboard();