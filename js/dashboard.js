import { auth, db } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { collection, addDoc, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// DOM elements
const transactionForm = document.getElementById("transactionForm");
const logoutBtn = document.getElementById("logoutBtn");
const themeBtn = document.getElementById("themeToggle");

let pieChart, memberChart;
let budgets = {};

// Logout
logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    location.href = "index.html";
});

// Transaction form submission
transactionForm?.addEventListener("submit", saveTransaction);

// Dark mode toggle
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");

themeBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// Save transaction
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
        member,
        type,
        category,
        amount,
        description,
        createdAt: Timestamp.now()
    });

    transactionForm.reset();
    loadDashboard();
}

// Load dashboard data
async function loadDashboard() {
    let income = 0;
    let expense = 0;
    const categoryTotals = {};
    const memberTotals = {};
    const transactions = [];

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthLabel = new Date().toLocaleString("default", { month: "long", year: "numeric" });

    const snapshot = await getDocs(collection(db, "transactions"));

    snapshot.forEach(doc => {
        const data = doc.data();
        transactions.push({ id: doc.id, ...data });

        if (data.type === "Income") income += data.amount;
        if (data.type === "Expense") {
            expense += data.amount;
            memberTotals[data.member] = (memberTotals[data.member] || 0) + data.amount;

            const txDate = data.createdAt?.toDate();
            if (txDate && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                categoryTotals[data.category] = (categoryTotals[data.category] || 0) + data.amount;
            }
        }
    });

    // Update summary cards
    document.getElementById("incomeTotal").innerText = "₹" + income.toLocaleString();
    document.getElementById("expenseTotal").innerText = "₹" + expense.toLocaleString();
    document.getElementById("balanceTotal").innerText = "₹" + (income - expense).toLocaleString();

    renderCharts(categoryTotals, memberTotals);
    renderRecentTransactions(transactions);
    renderBudgets(categoryTotals, currentMonthLabel);
    loadGoalsWidget();
    populateMonthFilter(transactions);
}

// Render Charts
function renderCharts(categoryTotals, memberTotals) {
    if (pieChart) pieChart.destroy();
    if (memberChart) memberChart.destroy();

    pieChart = new Chart(document.getElementById("expenseChart"), {
        type: "pie",
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{ data: Object.values(categoryTotals) }]
        }
    });

    memberChart = new Chart(document.getElementById("memberChart"), {
        type: "doughnut",
        data: {
            labels: Object.keys(memberTotals),
            datasets: [{ data: Object.values(memberTotals) }]
        }
    });
}

// Recent transactions
function renderRecentTransactions(transactions) {
    const body = document.getElementById("recentTransactions");
    if (!body) return;

    body.innerHTML = "";
    transactions.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds).slice(0, 10)
        .forEach(item => {
            body.innerHTML += `
                <tr>
                    <td>${item.createdAt?.toDate()?.toLocaleDateString()}</td>
                    <td>${item.member}</td>
                    <td>${item.category}</td>
                    <td>₹${item.amount}</td>
                </tr>
            `;
        });
}

// Render Budgets
function renderBudgets(categoryTotals, currentMonthLabel) {
    const container = document.getElementById("budgetContainer");
    if (!container) return;
    const budgetTitle = document.getElementById("budgetTitle");
    if (budgetTitle) budgetTitle.innerText = `📅 Monthly Budget Tracker (${currentMonthLabel})`;

    container.innerHTML = "";
    Object.keys(budgets).forEach(category => {
        const spent = categoryTotals[category] || 0;
        const budget = budgets[category];
        const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

        container.innerHTML += `
            <div class="budget-card">
                <h4>${category}</h4>
                <small class="budget-month">${currentMonthLabel}</small>
                <p>₹${spent.toLocaleString()} / ₹${budget.toLocaleString()}</p>
                <small>Remaining: ₹${Math.max(budget - spent, 0).toLocaleString()}</small>
                <div class="budget-bar">
                    <div class="budget-fill" style="width:${percent}%; background:${percent >= 100 ? '#ef4444' : percent >= 80 ? '#f59e0b' : '#10b981'};"></div>
                </div>
            </div>`;
    });
}

// Load goals widget
async function loadGoalsWidget() {
    const container = document.getElementById("dashboardGoals");
    if (!container) return;
    container.innerHTML = "";

    const goalsSnapshot = await getDocs(collection(db, "goals"));
    const contributionSnapshot = await getDocs(collection(db, "goalContributions"));
    const contributions = {};

    contributionSnapshot.forEach(docItem => {
        const data = docItem.data();
        contributions[data.goalId] = (contributions[data.goalId] || 0) + Number(data.amount);
    });

    goalsSnapshot.forEach(goal => {
        const data = goal.data();
        const current = contributions[goal.id] || 0;
        const percent = Math.min((current / data.target) * 100, 100);
        container.innerHTML += `
            <div class="goal-card">
                <h3>${data.name}</h3>
                <div class="goal-progress"><div class="goal-fill" style="width:${percent}%"></div></div>
                <p>₹${current.toLocaleString()} / ₹${data.target.toLocaleString()}</p>
                <small>${percent.toFixed(1)}% Complete</small>
            </div>`;
    });
}

// Load budgets
async function loadBudgets() {
    try {
        const snapshot = await getDocs(collection(db, "budgetLimits"));
        snapshot.forEach(docItem => { budgets = docItem.data(); });
    } catch (error) {
        console.error("Dashboard Budget Load Error", error);
    }
}

// Populate month filter from Firebase data
function populateMonthFilter(transactions) {
    const monthSelect = document.getElementById("monthFilter");
    if (!monthSelect) return; // skip if element not present

    const months = Array.from(new Set(transactions.map(t => {
        const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }))).sort((a,b)=>b.localeCompare(a));

    monthSelect.innerHTML = `<option value="all">All Time</option>` +
        months.map(m => `<option value="${m}">${m}</option>`).join('');
}

// Initialize dashboard
async function initDashboard() {
    await loadBudgets();
    await loadDashboard();
}

initDashboard();