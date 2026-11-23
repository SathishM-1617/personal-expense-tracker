
import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// HTML elements
const userName = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");
const transactionForm = document.getElementById("transactionForm");
const transactionMessage = document.getElementById("transactionMessage");

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const transactionList = document.getElementById("transactionList");

const dateInput = document.getElementById("date");

// Set today's date
if (dateInput) {
    const today = new Date();

    const localDate = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    dateInput.value = localDate;
}

let currentUser = null;

// Check login status
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;

        userName.textContent =
            `Welcome, ${user.displayName || user.email}!`;

        await loadTransactions();

    } else {
        window.location.href = "login.html";
    }
});

// Load transactions from Firestore
async function loadTransactions() {
    try {
        const expensesRef = collection(
            db,
            "users",
            currentUser.uid,
            "expenses"
        );

        const transactionQuery = query(
            expensesRef,
            orderBy("date", "desc")
        );

        const snapshot = await getDocs(transactionQuery);

        let income = 0;
        let expense = 0;

        transactionList.innerHTML = "";

        if (snapshot.empty) {
            transactionList.innerHTML = `
                <tr>
                    <td colspan="5">No transactions yet.</td>
                </tr>
            `;
        }

        snapshot.forEach((documentSnapshot) => {
            const transaction = documentSnapshot.data();
            const transactionId = documentSnapshot.id;

            const amount = Number(transaction.amount);

            if (transaction.type === "income") {
                income += amount;
            } else if (transaction.type === "expense") {
                expense += amount;
            }

            const row = document.createElement("tr");

            const titleCell = document.createElement("td");
            titleCell.textContent = transaction.title;

            const amountCell = document.createElement("td");
            amountCell.textContent = `₹${amount.toFixed(2)}`;

            const typeCell = document.createElement("td");
            typeCell.textContent = transaction.type;

            const dateCell = document.createElement("td");
            dateCell.textContent = transaction.date;

            // Delete button
            const actionCell = document.createElement("td");

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteTransaction(transactionId);
            });

            actionCell.appendChild(deleteButton);

            row.append(
                titleCell,
                amountCell,
                typeCell,
                dateCell,
                actionCell
            );

            transactionList.appendChild(row);
        });

        // Calculate totals
        const balance = income - expense;

        totalIncome.textContent = `₹${income.toFixed(2)}`;
        totalExpense.textContent = `₹${expense.toFixed(2)}`;
        totalBalance.textContent = `₹${balance.toFixed(2)}`;

    } catch (error) {
        console.error("Error loading transactions:", error);

        transactionMessage.textContent =
            "Unable to load transactions. Please try again.";
    }
}

// Delete transaction from Firestore
async function deleteTransaction(transactionId) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const transactionRef = doc(
            db,
            "users",
            currentUser.uid,
            "expenses",
            transactionId
        );

        await deleteDoc(transactionRef);

        transactionMessage.textContent =
            "Transaction deleted successfully!";

        await loadTransactions();

    } catch (error) {
        console.error("Error deleting transaction:", error);

        transactionMessage.textContent =
            "Unable to delete transaction. Please try again.";
    }
}

// Add transaction
if (transactionForm) {
    transactionForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!currentUser) {
            transactionMessage.textContent = "Please log in first.";
            return;
        }

        const title = document.getElementById("transactionTitle").value.trim();

        const amount = Number(
            document.getElementById("amount").value
        );

        const type = document.getElementById("type").value;
        const date = document.getElementById("date").value;

        if (!title || !Number.isFinite(amount) ||
            amount <= 0 || !date || !type) {

            transactionMessage.textContent =
                "Please enter valid transaction details.";

            return;
        }

        try {
            transactionMessage.textContent = "Saving transaction...";

            const expensesRef = collection(
                db,
                "users",
                currentUser.uid,
                "expenses"
            );

            await addDoc(expensesRef, {
                title: title,
                amount: amount,
                type: type,
                date: date,
                createdAt: serverTimestamp()
            });

            transactionMessage.textContent =
                "Transaction added successfully!";

            transactionForm.reset();

            const today = new Date();

            dateInput.value = new Date(
                today.getTime() - today.getTimezoneOffset() * 60000
            ).toISOString().split("T")[0];

            await loadTransactions();

        } catch (error) {
            console.error("Error saving transaction:", error);

            transactionMessage.textContent =
                "Unable to save transaction. Please try again.";
        }
    });
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "login.html";

        } catch (error) {
            console.error("Logout error:", error);
        }
    });
}
