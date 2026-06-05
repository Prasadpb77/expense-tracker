import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const tableBody = document.getElementById("transactionBody");

const searchBox = document.getElementById("searchBox");
const filterType = document.getElementById("filterType");

let transactions = [];

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
  "Gifts"
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
      <td>${item.member}</td>
      <td>
        <select class="edit-type">
          <option value="Income" ${item.type === "Income" ? "selected" : ""}>Income</option>
          <option value="Expense" ${item.type === "Expense" ? "selected" : ""}>Expense</option>
        </select>
      </td>
      <td>
        <select class="edit-category">
          ${categories
            .map(
              (cat) =>
                `<option value="${cat}" ${
                  item.category === cat ? "selected" : ""
                }>${cat}</option>`
            )
            .join("")}
        </select>
      </td>
      <td><input type="number" class="edit-amount" value="${item.amount}"></td>
      <td><input type="text" class="edit-description" value="${item.description}"></td>
      <td>
        <button class="btn save-btn">Save</button>
        <button class="btn cancel-btn">Cancel</button>
        <button class="btn delete-btn">Delete</button>
      </td>
    `;

    const saveBtn = row.querySelector(".save-btn");
    const cancelBtn = row.querySelector(".cancel-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    const typeSelect = row.querySelector(".edit-type");
    const categorySelect = row.querySelector(".edit-category");
    const amountInput = row.querySelector(".edit-amount");
    const descInput = row.querySelector(".edit-description");

    // Save changes
    saveBtn.addEventListener("click", async () => {
      await updateDoc(doc(db, "transactions", item.id), {
        type: typeSelect.value,
        category: categorySelect.value,
        amount: Number(amountInput.value),
        description: descInput.value,
      });
      loadTransactions();
    });

    // Cancel changes
    cancelBtn.addEventListener("click", () => {
      renderTable();
    });

    // Delete transaction
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