document.addEventListener('DOMContentLoaded', () => {
    const openFormBtn = document.getElementById('open-form-btn');
    const modal = document.getElementById('transaction-form');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('form');
    const dateInput = document.getElementById('date');
    const transactionList = document.getElementById('transaction-list');
    const balanceElement = document.getElementById('balance');
    const incomeElement = document.getElementById('income');
    const expenseElement = document.getElementById('expense');
    const formTitle = document.getElementById('form-title');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let editTransactionId = null;

    openFormBtn.addEventListener('click', () => {
        formTitle.textContent = 'Add Transaction';
        form.reset();
        editTransactionId = null;
        modal.style.display = 'flex';
        dateInput.value = new Date().toLocaleDateString();
    });

    closeBtn.addEventListener('click', () => {
        closeModal();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const { description, category, amount } = form.elements;
        if (editTransactionId) {
            updateTransaction(editTransactionId, description.value, category.value, +amount.value);
        } else {
            addTransaction(description.value, category.value, +amount.value);
        }
        updateUI();
        form.reset();
        closeModal();
    });

    async function downloadTransactions() {
        const transactionsBlob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(transactionsBlob);
        downloadLink.download = 'transactions.json';
        downloadLink.click();
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    function addTransaction(description, category, amount) {
        const transaction = {
            id: generateID(),
            date: dateInput.value,
            description,
            category,
            amount
        };
        transactions.push(transaction);
        saveTransactions();
        addTransactionDOM(transaction);
    }

    function generateID() {
        return Math.floor(Math.random() * 100000000);
    }

    function addTransactionDOM(transaction) {
        const sign = transaction.amount < 0 ? '-' : '+';
        const item = document.createElement('li');
        item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
        item.innerHTML = `
            ${transaction.date} - ${transaction.description} (${transaction.category}) <span>${sign} ₹${Math.abs(transaction.amount).toFixed(2)}</span>
            <button class="edit-btn" onclick="editTransaction(${transaction.id})">Edit</button>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
        `;
        transactionList.appendChild(item);
    }

    function updateTransaction(id, description, category, amount) {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;
        transaction.description = description;
        transaction.category = category;
        transaction.amount = amount;
        saveTransactions();
        updateUI();
    }

    window.removeTransaction = function(id) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateUI();
    }

    window.editTransaction = function(id) {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;
        form.elements.description.value = transaction.description;
        form.elements.category.value = transaction.category;
        form.elements.amount.value = transaction.amount;
        dateInput.value = transaction.date;
        editTransactionId = id;
        formTitle.textContent = 'Edit Transaction';
        modal.style.display = 'flex';
    }

    function updateUI() {
        transactionList.innerHTML = '';
        transactions.forEach(addTransactionDOM);
        const amounts = transactions.map(t => t.amount);
        const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
        const income = amounts.filter(item => item > 0).reduce((acc, item) => acc + item, 0).toFixed(2);
        const expense = (amounts.filter(item => item < 0).reduce((acc, item) => acc + item, 0) * -1).toFixed(2);
        balanceElement.textContent = `₹${total}`;
        incomeElement.textContent = `₹${income}`;
        expenseElement.textContent = `₹${expense}`;
    }

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function loadTransactions() {
        updateUI();
    }

    loadTransactions();

    document.getElementById('download-json-btn').addEventListener('click', downloadTransactions);
});
