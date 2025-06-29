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

    // FIX: Modified function to fetch from the required mock API URL
    /**
     * Fetches quotes from the JSONPlaceholder API.
     * @returns {Promise<Array>} A promise that resolves with an array of quote objects.
     */
    async function fetchQuotesFromServer() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const posts = await response.json();
            
            // Transform the post data into our quote format.
            // We'll take the first 10 posts and use the 'title' as the quote text.
            const fetchedQuotes = posts.slice(0, 10).map(post => ({
                id: post.id,
                text: post.title,
                category: 'From Server' // Assign a generic category
            }));
            
            return fetchedQuotes;

        } catch (error) {
            console.error("Error fetching quotes from server:", error);
            showNotification('Could not fetch data from the server.', 'error');
            return []; // Return an empty array on failure to prevent crashes
        }
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
            const serverQuotes = await fetchQuotesFromServer();
            if (serverQuotes.length === 0) return; // Stop if fetch failed

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
        if (categories.includes(lastSelected)) {
            categoryFilter.value = lastSelected;
        }
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
