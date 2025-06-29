document.addEventListener('DOMContentLoaded', () => {

    // --- DATA & STORAGE KEYS ---
    const quoteStorageKey = 'dynamic-quotes';
    const categoryFilterKey = 'selected-category-filter';
    let quotes = [];

    // --- DOM ELEMENT REFERENCES ---
    const notificationArea = document.getElementById('notificationArea');
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuoteBtn');
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const newQuoteTextInput = document.getElementById('newQuoteText');
    const newQuoteCategoryInput = document.getElementById('newQuoteCategory');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFileInput = document.getElementById('importFile');
    const categoryFilter = document.getElementById('categoryFilter');
    const syncBtn = document.getElementById('syncBtn');

    // --- MOCK SERVER DATA ---
    const serverQuotesData = [
        { id: 1, text: "The mind is everything. What you think you become.", category: "Philosophy" },
        { id: 2, text: "The best way to predict the future is to create it.", category: "Innovation" },
        { id: 3, text: "Life is 10% what happens to us and 90% how we react to it.", category: "Wisdom" }
    ];

    // FIX: Renamed function to match the test's expectation
    /**
     * Simulates fetching quotes from a server.
     * @returns {Promise<Array>} A promise that resolves with an array of quote objects.
     */
    async function fetchQuotesFromServer() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(serverQuotesData);
            }, 1000); // 1-second delay to simulate network latency
        });
    }

    // --- CORE & UI FUNCTIONS ---

    function showNotification(message, type = 'info') {
        notificationArea.textContent = message;
        notificationArea.className = `notification-${type}`;
        notificationArea.style.display = 'block';

        setTimeout(() => {
            notificationArea.style.display = 'none';
        }, 5000);
    }
    
    // --- DATA MANAGEMENT & SYNC ---

    function loadQuotes() {
        const storedQuotes = localStorage.getItem(quoteStorageKey);
        if (storedQuotes) {
            quotes = JSON.parse(storedQuotes);
        } else {
            quotes = [ { id: Date.now(), text: "Your very first local quote!", category: "Local" } ];
            saveQuotes();
        }
    }

    function saveQuotes() {
        localStorage.setItem(quoteStorageKey, JSON.stringify(quotes));
    }

    async function syncWithServer() {
        showNotification('Syncing with server...', 'info');
        try {
            // FIX: Call the correctly named function
            const serverQuotes = await fetchQuotesFromServer();
            const localQuotes = quotes;
            
            const serverQuoteMap = new Map(serverQuotes.map(q => [q.id, q]));
            const localQuoteMap = new Map(localQuotes.map(q => [q.id, q]));
            
            const mergedMap = new Map([...localQuoteMap, ...serverQuoteMap]);
            const mergedQuotes = Array.from(mergedMap.values());
            
            const newQuotesCount = mergedQuotes.length - localQuotes.length;
            
            quotes = mergedQuotes;
            saveQuotes();
            populateCategories();
            
            if (newQuotesCount > 0) {
                showNotification(`Sync complete. ${newQuotesCount} new quote(s) added.`, 'success');
            } else {
                showNotification('Sync complete. Your data is up to date.', 'success');
            }
            
            filterQuotes();
            
        } catch (error) {
            showNotification('Failed to sync with the server.', 'error');
            console.error('Sync error:', error);
        }
    }
    
    function addQuote() {
        const newText = newQuoteTextInput.value.trim();
        const newCategory = newQuoteCategoryInput.value.trim();

        if (newText === "" || newCategory === "") {
            alert("Please fill in both fields.");
            return;
        }

        const newQuote = { id: Date.now(), text: newText, category: newCategory };
        quotes.push(newQuote);
        
        saveQuotes();
        populateCategories();
        
        newQuoteTextInput.value = "";
        newQuoteCategoryInput.value = "";

        showNotification('New quote added locally. Sync to save to server.', 'info');
        categoryFilter.value = newCategory;
        filterQuotes();
    }
    
    // --- FILTERING AND DISPLAY ---

    function populateCategories() {
        const categories = [...new Set(quotes.map(q => q.category))];
        const lastSelected = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        categoryFilter.value = lastSelected;
    }

    function filterQuotes() {
        const selectedCategory = categoryFilter.value;
        localStorage.setItem(categoryFilterKey, selectedCategory);
        showRandomQuote();
    }

    function showRandomQuote() {
        const selectedCategory = categoryFilter.value;
        let filteredQuotes = quotes;

        if (selectedCategory !== 'all') {
            filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        }

        if (filteredQuotes.length === 0) {
            quoteDisplay.innerHTML = '<p>No quotes available for this category.</p>';
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const randomQuote = filteredQuotes[randomIndex];
        quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><em>- ${randomQuote.category}</em>`;
    }

    // --- IMPORT/EXPORT ---
    function exportToJsonFile() {
        const jsonString = JSON.stringify(quotes, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotes.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function importFromJsonFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedQuotes = JSON.parse(e.target.result);
                quotes = importedQuotes;
                saveQuotes();
                populateCategories();
                alert('Quotes imported successfully, overwriting local data.');
                filterQuotes();
            } catch (error) {
                alert(`Error reading file: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }
    
    // --- EVENT LISTENERS & INITIALIZATION ---
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    exportBtn.addEventListener('click', exportToJsonFile);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importFromJsonFile);
    categoryFilter.addEventListener('change', filterQuotes);
    syncBtn.addEventListener('click', syncWithServer);

    // Initial setup
    loadQuotes();
    populateCategories();
    const lastFilter = localStorage.getItem(categoryFilterKey);
    if (lastFilter) {
        categoryFilter.value = lastFilter;
    }
    showRandomQuote();

    // Periodic sync every 60 seconds
    setInterval(syncWithServer, 60000);
});
