import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const tableBody = document.getElementById("transactionBody");
const searchBox = document.getElementById("searchBox");
const filterType = document.getElementById("filterType");
const filterMember = document.getElementById("filterMember");
const filterCategory = document.getElementById("filterCategory");
const filterMonth = document.getElementById("filterMonth");
const exportBtn = document.getElementById("exportBtn");


let transactions = [];

const members = ["Prasad", "Bhagyashree", "Common", "Credit Card"];
const categories = [
  "Salary",
  "Food",
  "Fuel",
  "Travel",
  "Shopping",
  "Bills",
  "EMI",
  "Medical",
  "Entertainment",
  "Investment",
  "Other",
  "Grocerry",
  "Family Contribution",
  "Fruits & DryFruits",
  "Vegetables",
  "Gifts",
  "RD(Goals)"
];

// Load transactions from Firebase
async function loadTransactions() {
  const snapshot = await getDocs(collection(db, "transactions"));
  transactions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  populateMonthFilter();
  renderTable();
}

// Populate month filter dynamically (YYYY-MM)
function populateMonthFilter() {
  if (!filterMonth) return;
  const monthSet = new Set();
  transactions.forEach(t => {
    const d = t.createdAt?.toDate?.() || new Date(t.createdAt);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(monthStr);
  });

  filterMonth.innerHTML = `<option value="all">All Time</option>`;
  Array.from(monthSet).sort().forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.innerText = m;
    filterMonth.appendChild(opt);
  });
}

// Render the table
function renderTable() {
  if (!tableBody) return;

  const search = searchBox?.value.toLowerCase() || "";
  const typeFilter = filterType?.value;
  const memberFilter = filterMember?.value;
  const categoryFilter = filterCategory?.value;
  const monthFilterValue = filterMonth?.value || "all";

  const filtered = transactions.filter(item => {
    const matchSearch = (item.description || "").toLowerCase().includes(search);
    const matchType = !typeFilter || item.type === typeFilter;
    const matchMember = !memberFilter || item.member === memberFilter;
    const matchCategory = !categoryFilter || item.category === categoryFilter;

    const itemDate = item.createdAt?.toDate?.() || new Date(item.createdAt);
    const itemMonth = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2,'0')}`;
    const matchMonth = monthFilterValue === "all" || itemMonth === monthFilterValue;

    return matchSearch && matchType && matchMember && matchCategory && matchMonth;
  });

  tableBody.innerHTML = "";

  filtered.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.createdAt?.toDate().toLocaleDateString()}</td>
      <td>
        <select class="edit-member">
          ${members.map(m => `<option value="${m}" ${item.member === m ? "selected" : ""}>${m}</option>`).join("")}
        </select>
      </td>
      <td>
        <select class="edit-type">
          <option value="Income" ${item.type === "Income" ? "selected" : ""}>Income</option>
          <option value="Expense" ${item.type === "Expense" ? "selected" : ""}>Expense</option>
        </select>
      </td>
      <td>
        <select class="edit-category">
          ${categories.map(cat => `<option value="${cat}" ${item.category === cat ? "selected" : ""}>${cat}</option>`).join("")}
        </select>
      </td>
      <td><input type="number" class="edit-amount" value="${item.amount}"></td>
      <td><input type="text" class="edit-description" value="${item.description || ""}"></td>
      <td>
        <button class="btn save-btn">Save</button>
        <button class="btn cancel-btn">Cancel</button>
        <button class="btn delete-btn">Delete</button>
      </td>
    `;

    // Buttons
    const saveBtn = row.querySelector(".save-btn");
    const cancelBtn = row.querySelector(".cancel-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    const memberSelect = row.querySelector(".edit-member");
    const typeSelect = row.querySelector(".edit-type");
    const categorySelect = row.querySelector(".edit-category");
    const amountInput = row.querySelector(".edit-amount");
    const descInput = row.querySelector(".edit-description");

    saveBtn.addEventListener("click", async () => {
      if (!memberSelect.value || !categorySelect.value || !amountInput.value) {
        return alert("Please fill all required fields");
      }

      await updateDoc(doc(db, "transactions", item.id), {
        member: memberSelect.value,
        type: typeSelect.value,
        category: categorySelect.value,
        amount: Number(amountInput.value),
        description: descInput.value
      });

      loadTransactions();
    });

    cancelBtn.addEventListener("click", () => loadTransactions());

    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Delete Transaction?")) return;
      await deleteDoc(doc(db, "transactions", item.id));
      loadTransactions();
    });

    tableBody.appendChild(row);
  });
}

exportBtn?.addEventListener("click", () => {
  if (!transactions.length) return alert("No transactions to export");

  const filtered = transactions.filter(item => {
      const search = searchBox?.value.toLowerCase() || "";
      const typeFilterVal = filterType?.value;
      const memberFilterVal = filterMember?.value;
      const categoryFilterVal = filterCategory?.value;
      const monthFilterVal = filterMonth?.value || "all";

      const d = item.createdAt?.toDate?.() || new Date(item.createdAt);
      const itemMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      return (
          (!search || (item.description || "").toLowerCase().includes(search)) &&
          (!typeFilterVal || item.type === typeFilterVal) &&
          (!memberFilterVal || item.member === memberFilterVal) &&
          (!categoryFilterVal || item.category === categoryFilterVal) &&
          (monthFilterVal === "all" || itemMonth === monthFilterVal)
      );
  });

  if (!filtered.length) return alert("No transactions for selected filters");

  // CSV header
  const headers = ["Date", "Member", "Type", "Category", "Amount", "Description"];
  const rows = filtered.map(t => [
      t.createdAt?.toDate()?.toLocaleDateString() || "",
      t.member,
      t.type,
      t.category,
      t.amount,
      t.description || ""
  ]);

  const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(val => `"${val}"`).join(","))
  ].join("\n");

  // Download as CSV
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// Event listeners
searchBox?.addEventListener("input", renderTable);
filterType?.addEventListener("change", renderTable);
filterMember?.addEventListener("change", renderTable);
filterCategory?.addEventListener("change", renderTable);
filterMonth?.addEventListener("change", renderTable);

// Initialize
loadTransactions();