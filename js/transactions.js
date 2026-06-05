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

const members = ["Prasad", "Bhagyashree", "Common","Credit Card"];
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

async function loadTransactions() {
  const snapshot = await getDocs(collection(db, "transactions"));
  transactions = [];
  snapshot.forEach((d) => {
    transactions.push({ id: d.id, ...d.data() });
  });
  renderTable();
}

function renderTable() {
  tableBody.innerHTML = "";
  const search = searchBox.value.toLowerCase();
  const typeFilter = filterType.value;

  const filtered = transactions.filter((item) => {
    const matchSearch = (item.description || "").toLowerCase().includes(search);
    const matchType = !typeFilter || item.type === typeFilter;
    return matchSearch && matchType;
  });

  filtered.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.createdAt?.toDate().toLocaleDateString()}</td>
      <td>
        <select class="edit-member">
          ${members.map(
            (m) => `<option value="${m}" ${item.member === m ? "selected" : ""}>${m}</option>`
          ).join("")}
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
          ${categories.map(
            (cat) => `<option value="${cat}" ${item.category === cat ? "selected" : ""}>${cat}</option>`
          ).join("")}
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

searchBox?.addEventListener("input", renderTable);
filterType?.addEventListener("change", renderTable);

loadTransactions();