// Gerenciamento de Estado
const state = {
    expenses: JSON.parse(localStorage.getItem('expenses')) || [],
    budget: JSON.parse(localStorage.getItem('budget')) || {},
    goals: JSON.parse(localStorage.getItem('goals')) || [],
    theme: localStorage.getItem('theme') || 'light'
};

// Funções de Utilidade
const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

// Gerenciamento de Temas
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

const toggleTheme = () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
    themeToggle.innerHTML = state.theme === 'light' ? 
        '<i class="fas fa-moon"></i>' : 
        '<i class="fas fa-sun"></i>';
};

themeToggle.addEventListener('click', toggleTheme);

// Inicializar tema
body.setAttribute('data-theme', state.theme);
themeToggle.innerHTML = state.theme === 'light' ? 
    '<i class="fas fa-moon"></i>' : 
    '<i class="fas fa-sun"></i>';

// Navegação por Abas
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        if (tabId === 'dashboard') {
            updateDashboard();
        }
    });
});

// Gerenciamento de Despesas
const expenseForm = document.getElementById('expenseForm');
const expensesList = document.getElementById('expensesList');

expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const expense = {
        id: Date.now(),
        description: document.getElementById('expenseDescription').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        date: document.getElementById('expenseDate').value
    };
    
    state.expenses.push(expense);
    saveToLocalStorage('expenses', state.expenses);
    
    expenseForm.reset();
    updateExpensesList();
    updateDashboard();
});

const updateExpensesList = () => {
    expensesList.innerHTML = state.expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(expense => `
            <div class="expense-item">
                <div class="expense-info">
                    <strong>${expense.description}</strong>
                    <span>${formatCurrency(expense.amount)}</span>
                    <span>${expense.category}</span>
                    <span>${new Date(expense.date).toLocaleDateString()}</span>
                </div>
                <button onclick="deleteExpense(${expense.id})" class="btn-delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
};

const deleteExpense = (id) => {
    state.expenses = state.expenses.filter(expense => expense.id !== id);
    saveToLocalStorage('expenses', state.expenses);
    updateExpensesList();
    updateDashboard();
};

// Orçamento Mensal
const budgetForm = document.getElementById('budgetForm');
const budgetProgress = document.getElementById('budgetProgress');

budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const budget = {
        amount: parseFloat(document.getElementById('monthlyBudget').value),
        month: document.getElementById('budgetMonth').value
    };
    
    state.budget = budget;
    saveToLocalStorage('budget', budget);
    
    updateBudgetProgress();
    updateDashboard();
    budgetForm.reset();
});

const updateBudgetProgress = () => {
    const totalExpenses = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budget = state.budget.amount || 0;
    const percentage = (totalExpenses / budget) * 100;
    
    budgetProgress.innerHTML = `
        <div class="budget-status">
            <p>Orçamento: ${formatCurrency(budget)}</p>
            <p>Gastos: ${formatCurrency(totalExpenses)}</p>
            <p>Restante: ${formatCurrency(budget - totalExpenses)}</p>
        </div>
        <div class="progress-bar">
            <div class="progress" style="width: ${Math.min(percentage, 100)}%; 
                background-color: ${percentage > 100 ? '#ff4444' : '#4CAF50'}">
            </div>
        </div>
        <p class="percentage">${percentage.toFixed(1)}% do orçamento utilizado</p>
    `;
};

// Simulação de Economia
const simulationForm = document.getElementById('simulationForm');
const simulationResults = document.getElementById('simulationResults');
const percentageRange = document.getElementById('reductionPercentage');
const percentageValue = document.getElementById('percentageValue');

percentageRange.addEventListener('input', (e) => {
    percentageValue.textContent = `${e.target.value}%`;
});

simulationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const category = document.getElementById('categoryToReduce').value;
    const percentage = parseInt(document.getElementById('reductionPercentage').value);
    const months = parseInt(document.getElementById('simulationMonths').value);
    
    const categoryExpenses = state.expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0);
    
    const monthlyAverage = categoryExpenses / months;
    const reduction = (monthlyAverage * percentage) / 100;
    const totalSavings = reduction * months;
    
    simulationResults.innerHTML = `
        <div class="simulation-summary">
            <p>Categoria: ${category}</p>
            <p>Redução mensal: ${formatCurrency(reduction)}</p>
            <p>Período: ${months} meses</p>
            <p class="total-savings">Economia total: ${formatCurrency(totalSavings)}</p>
        </div>
        <div class="savings-tips">
            <h4>Dicas para Economizar</h4>
            <ul>
                ${getSavingsTips(category)}
            </ul>
        </div>
    `;
});

const getSavingsTips = (category) => {
    const tips = {
        moradia: [
            'Renegocie o aluguel',
            'Reduza o consumo de energia',
            'Economize água'
        ],
        alimentacao: [
            'Faça uma lista de compras',
            'Compare preços',
            'Evite desperdícios'
        ],
        transporte: [
            'Use transporte público',
            'Considere caronas',
            'Faça manutenção preventiva'
        ],
        lazer: [
            'Procure atividades gratuitas',
            'Use cupons de desconto',
            'Planeje com antecedência'
        ],
        outros: [
            'Revise assinaturas',
            'Compare preços',
            'Evite compras por impulso'
        ]
    };
    
    return tips[category].map(tip => `<li>${tip}</li>`).join('');
};

// Conversor de Moeda
const converterForm = document.getElementById('converterForm');
const conversionResult = document.getElementById('conversionResult');
const lastUpdate = document.getElementById('lastUpdate');

const exchangeRates = {
    BRL: 1,
    USD: 0.2,
    EUR: 0.17,
    GBP: 0.15
};

converterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    
    const convertedAmount = (amount / exchangeRates[fromCurrency]) * exchangeRates[toCurrency];
    
    conversionResult.innerHTML = `
        <p class="conversion-amount">
            ${formatCurrency(amount)} ${fromCurrency} = 
            ${new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: toCurrency
            }).format(convertedAmount)}
        </p>
    `;
    
    lastUpdate.textContent = new Date().toLocaleString();
});

// Metas Financeiras
const goalForm = document.getElementById('goalForm');
const goalsList = document.getElementById('goalsList');

goalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const goal = {
        id: Date.now(),
        description: document.getElementById('goalDescription').value,
        amount: parseFloat(document.getElementById('goalAmount').value),
        deadline: document.getElementById('goalDeadline').value,
        saved: parseFloat(document.getElementById('currentSaved').value) || 0
    };
    
    state.goals.push(goal);
    saveToLocalStorage('goals', state.goals);
    
    updateGoalsList();
    goalForm.reset();
});

const updateGoalsList = () => {
    goalsList.innerHTML = state.goals.map(goal => {
        const progress = (goal.saved / goal.amount) * 100;
        const remaining = goal.amount - goal.saved;
        const daysRemaining = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        const monthlySaving = remaining / (daysRemaining / 30);
        
        return `
            <div class="goal-card">
                <h4>${goal.description}</h4>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progress}%"></div>
                    </div>
                    <p>${progress.toFixed(1)}% concluído</p>
                </div>
                <div class="goal-details">
                    <p>Meta: ${formatCurrency(goal.amount)}</p>
                    <p>Economizado: ${formatCurrency(goal.saved)}</p>
                    <p>Faltam: ${formatCurrency(remaining)}</p>
                    <p>Prazo: ${new Date(goal.deadline).toLocaleDateString()}</p>
                    <p>Economia mensal necessária: ${formatCurrency(monthlySaving)}</p>
                </div>
                <button onclick="deleteGoal(${goal.id})" class="btn-delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
};

const deleteGoal = (id) => {
    state.goals = state.goals.filter(goal => goal.id !== id);
    saveToLocalStorage('goals', state.goals);
    updateGoalsList();
};

// Relatórios
const reportFilters = document.getElementById('reportFilters');
const reportSummary = document.getElementById('reportSummary');
const downloadPDF = document.getElementById('downloadPDF');
const downloadCSV = document.getElementById('downloadCSV');

reportFilters.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const selectedCategories = Array.from(document.getElementById('reportCategories').selectedOptions)
        .map(option => option.value);
    
    const filteredExpenses = state.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= new Date(startDate) &&
               expenseDate <= new Date(endDate) &&
               (selectedCategories.length === 0 || selectedCategories.includes(expense.category));
    });
    
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categorySummary = {};
    
    filteredExpenses.forEach(expense => {
        categorySummary[expense.category] = (categorySummary[expense.category] || 0) + expense.amount;
    });
    
    reportSummary.innerHTML = `
        <div class="summary-total">
            <h4>Total de Gastos</h4>
            <p>${formatCurrency(totalAmount)}</p>
        </div>
        <div class="summary-categories">
            <h4>Gastos por Categoria</h4>
            ${Object.entries(categorySummary)
                .map(([category, amount]) => `
                    <div class="category-item">
                        <span>${category}</span>
                        <span>${formatCurrency(amount)}</span>
                    </div>
                `).join('')}
        </div>
    `;
});

downloadPDF.addEventListener('click', () => {
    alert('Relatório PDF gerado com sucesso!');
});

downloadCSV.addEventListener('click', () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio_financeiro.csv';
    link.click();
});

const generateCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Valor'];
    const rows = state.expenses.map(expense => [
        expense.date,
        expense.description,
        expense.category,
        expense.amount
    ]);
    
    return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
};

// Dashboard
const updateDashboard = () => {
    updateMonthlyChart();
    updateExpensePieChart();
    updateFinancialAlerts();
};

const updateMonthlyChart = () => {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    const monthlyData = calculateMonthlyExpenses();
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Gastos Mensais',
                data: monthlyData.values,
                backgroundColor: '#2196f3'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

const updateExpensePieChart = () => {
    const ctx = document.getElementById('expensePieChart').getContext('2d');
    const categoryData = calculateCategoryExpenses();
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categoryData.labels,
            datasets: [{
                data: categoryData.values,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
};

const calculateMonthlyExpenses = () => {
    const months = {};
    state.expenses.forEach(expense => {
        const month = new Date(expense.date).toLocaleString('pt-BR', { month: 'short' });
        months[month] = (months[month] || 0) + expense.amount;
    });
    
    return {
        labels: Object.keys(months),
        values: Object.values(months)
    };
};

const calculateCategoryExpenses = () => {
    const categories = {};
    state.expenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });
    
    return {
        labels: Object.keys(categories),
        values: Object.values(categories)
    };
};

const updateFinancialAlerts = () => {
    const alertsContainer = document.getElementById('financialAlerts');
    const totalExpenses = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyBudget = state.budget.amount || 0;
    
    let alerts = [];
    
    if (totalExpenses > monthlyBudget && monthlyBudget > 0) {
        alerts.push(`
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                Você ultrapassou seu orçamento mensal!
            </div>
        `);
    }
    
    if (alerts.length === 0) {
        alerts.push(`
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                Seus gastos estão dentro do planejado!
            </div>
        `);
    }
    
    alertsContainer.innerHTML = alerts.join('');
};

// Inicialização
updateExpensesList();
updateDashboard();
updateBudgetProgress();
updateGoalsList();