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

let transactions = [];

async function loadTransactions() {
  const snapshot = await getDocs(collection(db, "transactions"));
  transactions = [];

  snapshot.forEach(d => {
    transactions.push({
      id: d.id,
      ...d.data()
    });
  });

  renderTable();
}

function renderTable() {
  tableBody.innerHTML = "";

  const search = searchBox.value.toLowerCase();
  const type = filterType.value;

  const filtered = transactions.filter(item => {
    const matchSearch = (item.description || "").toLowerCase().includes(search);
    const matchType = !type || item.type === type;
    return matchSearch && matchType;
  });

  filtered.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.createdAt?.toDate().toLocaleDateString()}</td>
      <td>${item.member}</td>
      <td class="editable-type">${item.type}</td>
      <td class="editable-category">${item.category}</td>
      <td class="editable-amount">₹${item.amount}</td>
      <td class="editable-desc">${item.description || ""}</td>
      <td class="actions">
        <button class="btn edit-btn">Edit</button>
        <button class="btn delete-btn">Delete</button>
      </td>
    `;

    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Delete Transaction?")) return;
      await deleteDoc(doc(db, "transactions", item.id));
      loadTransactions();
    });

    editBtn.addEventListener("click", () => enableInlineEdit(row, item));

    tableBody.appendChild(row);
  });
}

// Enable inline edit for a row
function enableInlineEdit(row, item) {
  const typeCell = row.querySelector(".editable-type");
  const categoryCell = row.querySelector(".editable-category");
  const amountCell = row.querySelector(".editable-amount");
  const descCell = row.querySelector(".editable-desc");
  const actionsCell = row.querySelector(".actions");

  // Replace content with inputs
  typeCell.innerHTML = `
    <select class="edit-type">
      <option ${item.type === "Income" ? "selected" : ""}>Income</option>
      <option ${item.type === "Expense" ? "selected" : ""}>Expense</option>
    </select>
  `;
  categoryCell.innerHTML = `<input type="text" class="edit-category" value="${item.category}">`;
  amountCell.innerHTML = `<input type="number" class="edit-amount" value="${item.amount}">`;
  descCell.innerHTML = `<input type="text" class="edit-desc" value="${item.description || ""}">`;

  actionsCell.innerHTML = `
    <button class="btn save-btn">Save</button>
    <button class="btn cancel-btn">Cancel</button>
  `;

  const saveBtn = actionsCell.querySelector(".save-btn");
  const cancelBtn = actionsCell.querySelector(".cancel-btn");

  cancelBtn.addEventListener("click", () => loadTransactions());

  saveBtn.addEventListener("click", async () => {
    const newAmount = Number(row.querySelector(".edit-amount").value);
    const newType = row.querySelector(".edit-type").value;
    const newCategory = row.querySelector(".edit-category").value.trim();
    const newDesc = row.querySelector(".edit-desc").value.trim();

    if (newAmount <= 0 || !newCategory) {
      alert("Enter valid amount and category");
      return;
    }

    await updateDoc(doc(db, "transactions", item.id), {
      amount: newAmount,
      type: newType,
      category: newCategory,
      description: newDesc
    });

    loadTransactions();
  });
}

// Search & filter
searchBox.addEventListener("input", renderTable);
filterType.addEventListener("change", renderTable);

loadTransactions();