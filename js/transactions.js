import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const tableBody = document.getElementById("transactionBody");
const searchBox = document.getElementById("searchBox");
const filterType = document.getElementById("filterType");

let transactions = [];
let editingId = null;

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
        <button class="edit-btn" onclick="editTransaction('${item.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteTransaction('${item.id}')">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

window.deleteTransaction = async function(id) {
  if (!confirm("Delete Transaction?")) return;
  await deleteDoc(doc(db, "transactions", id));
  loadTransactions();
};

window.editTransaction = function(id) {
  const tx = transactions.find(t => t.id === id);
  if (!tx) return;

  editingId = id;

  document.getElementById("member").value = tx.member;
  document.getElementById("type").value = tx.type;
  document.getElementById("category").value = tx.category;
  document.getElementById("amount").value = tx.amount;
  document.getElementById("description").value = tx.description;

  const submitBtn = document.querySelector("#transactionForm button[type='submit']");
  submitBtn.textContent = "Update Transaction";
};

const transactionForm = document.getElementById("transactionForm");

transactionForm.addEventListener("submit", async (e) => {
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

  if (editingId) {
    // Update existing transaction
    await updateDoc(doc(db, "transactions", editingId), {
      member,
      type,
      category,
      amount,
      description,
      createdAt: Timestamp.now()
    });
    editingId = null;
    transactionForm.querySelector("button[type='submit']").textContent = "Save Transaction";
  } else {
    // Add new transaction
    await addDoc(collection(db, "transactions"), {
      member,
      type,
      category,
      amount,
      description,
      createdAt: Timestamp.now()
    });
  }

  transactionForm.reset();
  loadTransactions();
});

searchBox.addEventListener("input", renderTable);
filterType.addEventListener("change", renderTable);

loadTransactions();