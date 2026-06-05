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
      <td>${item.type}</td>
      <td>${item.category}</td>
      <td>₹${item.amount}</td>
      <td>${item.description}</td>
      <td>
        <button class="btn edit-btn" onclick="editTransaction('${item.id}')">Edit</button>
        <button class="btn delete-btn" onclick="deleteTransaction('${item.id}')">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

window.deleteTransaction = async function (id) {
  if (!confirm("Delete Transaction?")) return;
  await deleteDoc(doc(db, "transactions", id));
  loadTransactions();
};

window.editTransaction = async function (id) {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  const newAmount = Number(prompt("Enter new amount:", transaction.amount));
  if (isNaN(newAmount) || newAmount <= 0) return alert("Invalid amount!");

  const newType = prompt("Enter new type (Income/Expense):", transaction.type);
  if (newType !== "Income" && newType !== "Expense") return alert("Invalid type!");

  const newCategory = prompt("Enter new category:", transaction.category);
  if (!newCategory) return alert("Invalid category!");

  await updateDoc(doc(db, "transactions", id), {
    amount: newAmount,
    type: newType,
    category: newCategory
  });

  loadTransactions();
};

// Event listeners for search & filter
searchBox.addEventListener("input", renderTable);
filterType.addEventListener("change", renderTable);

loadTransactions();