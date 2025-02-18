let currentAmount = '0';
let selectedCategory = '';
let selectedPayment = '';
let expenses = [];
let editingId = null;

// Set default date to today
window.onload = function() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('expenseDate').value = today;
  updateDayOfWeek();
  updateTotals();

  // Add event listeners for filters
  document.getElementById('categoryFilter').addEventListener('change', updateExpensesList);
  document.getElementById('paymentFilter').addEventListener('change', updateExpensesList);
  document.getElementById('sortBy').addEventListener('change', updateExpensesList);
  document.getElementById('sortOrder').addEventListener('change', updateExpensesList);
  document.getElementById('expenseDate').addEventListener('change', updateDayOfWeek);
}

function changeDate(days) {
  const dateInput = document.getElementById('expenseDate');
  const currentDate = new Date(dateInput.value);
  currentDate.setDate(currentDate.getDate() + days);
  dateInput.value = currentDate.toISOString().split('T')[0];
  updateDayOfWeek();
}

function updateDayOfWeek() {
  const date = new Date(document.getElementById('expenseDate').value);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  document.getElementById('dayOfWeek').textContent = days[date.getDay()];

  // Update the date selection field text
  const today = new Date();
  const selectedDate = new Date(document.getElementById('expenseDate').value);

  if (selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()) {
    document.getElementById('expenseDate').textContent = "Today";
  } else {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const formattedDate = `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}, ${days[selectedDate.getDay()]}`;
    document.getElementById('expenseDate').textContent = formattedDate;
  }
}

function appendNumber(num) {
  if (currentAmount === '0') {
    currentAmount = num.toString();
  } else {
    currentAmount += num;
  }
  updateDisplay();
}

function appendDecimal() {
  if (!currentAmount.includes('.')) {
    currentAmount += '.';
    updateDisplay();
  }
}

function clearAmount() {
  currentAmount = '0';
  updateDisplay();
}

function updateDisplay() {
  document.getElementById('amount').value = currentAmount;
}

function selectCategory(category) {
  selectedCategory = category;

  // Remove selected class from all category buttons
  document.querySelectorAll('.categories button').forEach(btn => {
    btn.classList.remove('selected');
  });

  // Add selected class to clicked button
  const buttons = document.querySelectorAll('.categories button');
  buttons.forEach(btn => {
    if (btn.textContent === category) {
      btn.classList.add('selected');
    }
  });
}

function selectPayment(payment) {
  selectedPayment = payment;

  // Remove selected class from all payment buttons
  document.querySelectorAll('.payment-modes button').forEach(btn => {
    btn.classList.remove('selected');
  });

  // Add selected class to clicked button
  const buttons = document.querySelectorAll('.payment-modes button');
  buttons.forEach(btn => {
    if (btn.textContent === payment) {
      btn.classList.add('selected');
    }
  });
}

function saveExpense() {
  if (selectedCategory && selectedPayment && currentAmount !== '0') {
    const expense = {
      id: editingId || Date.now(),
      amount: parseFloat(currentAmount),
      category: selectedCategory,
      payment: selectedPayment,
      date: document.getElementById('expenseDate').value,
      description: document.getElementById('description').value || ''
    };

    if (editingId) {
      const index = expenses.findIndex(e => e.id === editingId);
      expenses[index] = expense;
      editingId = null;
    } else {
      expenses.unshift(expense);
    }

    updateExpensesList();
    updateTotals();

    // Reset everything
    currentAmount = '0';
    selectedCategory = '';
    selectedPayment = '';
    document.getElementById('description').value = '';
    document.querySelectorAll('.categories button, .payment-modes button').forEach(btn => {
      btn.classList.remove('selected');
    });
    updateDisplay();
  } else {
    alert('Please select category and payment mode, and enter an amount');
  }
}

function editExpense(id) {
  const expense = expenses.find(e => e.id === id);
  if (expense) {
    currentAmount = expense.amount.toString();
    selectedCategory = expense.category;
    selectedPayment = expense.payment;
    editingId = id;

    document.getElementById('expenseDate').value = expense.date;
    document.getElementById('selectedCategory').textContent = `Category: ${expense.category}`;
    document.getElementById('selectedPayment').textContent = `Payment: ${expense.payment}`;
    updateDisplay();
  }
}

function deleteExpense(id) {
  if (confirm('Are you sure you want to delete this expense?')) {
    expenses = expenses.filter(e => e.id !== id);
    updateExpensesList();
    updateTotals();
  }
}

function updateExpensesList() {
  const list = document.getElementById('expensesList');
  list.innerHTML = '';

  const categoryFilter = document.getElementById('categoryFilter').value;
  const paymentFilter = document.getElementById('paymentFilter').value;
  const sortBy = document.getElementById('sortBy').value;
  const sortOrder = document.getElementById('sortOrder').value;

  let filteredExpenses = expenses.filter(expense => {
    return (!categoryFilter || expense.category === categoryFilter) &&
           (!paymentFilter || expense.payment === paymentFilter);
  });

  filteredExpenses.sort((a, b) => {
    let comparison = 0;
    switch(sortBy) {
      case 'date':
        comparison = new Date(a.date) - new Date(b.date);
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'payment':
        comparison = a.payment.localeCompare(b.payment);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  filteredExpenses.forEach(expense => {
    const li = document.createElement('li');
    const expenseText = document.createElement('span');
    expenseText.textContent = `${expense.date} - ${expense.category} - ${expense.payment} - $${expense.amount.toFixed(2)}${expense.description ? ' - ' + expense.description : ''}`;

    const actions = document.createElement('div');
    actions.className = 'expense-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.onclick = () => editExpense(expense.id);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = () => deleteExpense(expense.id);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(expenseText);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

function updateTotals() {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const todayTotal = expenses
    .filter(e => e.date === today)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const monthTotal = expenses
    .filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === currentMonth &&
             expenseDate.getFullYear() === currentYear;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const todayDate = new Date(today);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const formattedDate = `${todayDate.getDate()} ${shortMonthNames[todayDate.getMonth()]} (${days[todayDate.getDay()].slice(0,3)})`;
  document.getElementById('todayDate').textContent = formattedDate;
  document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
  document.getElementById('todayTotal').textContent = `$${todayTotal.toFixed(2)}`;
  document.getElementById('monthTotal').textContent = `$${monthTotal.toFixed(2)}`;

  // Fetch and display today's expenses on the second page
  const todayExpenses = expenses.filter(e => e.date === today);
  const expensesList = document.getElementById('expensesList');
  expensesList.innerHTML = ''; // Clear existing list
  todayExpenses.forEach(expense => {
    const li = document.createElement('li');
    const expenseText = document.createElement('span');
    expenseText.textContent = `${expense.date} - ${expense.category} - ${expense.payment} - $${expense.amount.toFixed(2)}${expense.description ? ' - ' + expense.description : ''}`;
    li.appendChild(expenseText);
    expensesList.appendChild(li);
  });
}

function toggleRecords() {
  const expensesList = document.querySelector('.expenses-list');
  expensesList.classList.toggle('hidden');
  const showRecordsBtn = document.getElementById('showRecordsBtn');
  showRecordsBtn.textContent = expensesList.classList.contains('hidden') ? 'Show Records' : 'Hide Records';
}

function showTodaysExpenses() {
  window.location.href = 'today_expenses.html';
}
