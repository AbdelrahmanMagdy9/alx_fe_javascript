document.addEventListener('DOMContentLoaded', () => {

    // --- DATA & STORAGE KEYS ---
    const quoteStorageKey = 'dynamic-quotes';
    const categoryFilterKey = 'selected-category-filter';
    let quotes = [];

    // --- DOM ELEMENT REFERENCES ---
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuoteBtn');
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const newQuoteTextInput = document.getElementById('newQuoteText');
    const newQuoteCategoryInput = document.getElementById('newQuoteCategory');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFileInput = document.getElementById('importFile');
    const categoryFilter = document.getElementById('categoryFilter');

    // --- CORE FUNCTIONS ---

    function loadQuotes() {
        const storedQuotes = localStorage.getItem(quoteStorageKey);
        if (storedQuotes) {
            quotes = JSON.parse(storedQuotes);
        } else {
            // Default quotes if nothing is in local storage
            quotes = [
                { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
                { text: "Strive not to be a success, but rather to be of value.", category: "Wisdom" },
                { text: "The mind is everything. What you think you become.", category: "Philosophy" }
            ];
            saveQuotes();
        }
    }

    function saveQuotes() {
        localStorage.setItem(quoteStorageKey, JSON.stringify(quotes));
    }

    function renderQuote(quote, element) {
        if (!quote) {
            element.innerHTML = '<p>No quote to display.</p>';
            return;
        }
        const quoteElement = document.createElement('p');
        quoteElement.textContent = `"${quote.text}"`;
        const categoryElement = document.createElement('em');
        categoryElement.textContent = `- ${quote.category}`;
        element.innerHTML = '';
        element.appendChild(quoteElement);
        element.appendChild(categoryElement);
    }
    
    function showRandomQuote() {
        const selectedCategory = categoryFilter.value;
        let filteredQuotes = quotes;

        if (selectedCategory !== 'all') {
            filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        }

        if (filteredQuotes.length === 0) {
            quoteDisplay.innerHTML = '<p>No quotes available for this category. Please add one or select "All Categories".</p>';
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const randomQuote = filteredQuotes[randomIndex];
        renderQuote(randomQuote, quoteDisplay);
    }

    function addQuote() {
        const newText = newQuoteTextInput.value.trim();
        const newCategory = newQuoteCategoryInput.value.trim();

        if (newText === "" || newCategory === "") {
            alert("Please fill in both the quote text and its category.");
            return;
        }

        quotes.push({ text: newText, category: newCategory });
        saveQuotes();
        populateCategories(); // Update categories in dropdown

        newQuoteTextInput.value = "";
        newQuoteCategoryInput.value = "";
        alert("New quote added successfully!");
        
        // Set the filter to the newly added category to show it off
        categoryFilter.value = newCategory; 
        filterQuotes();
    }
    
    /**
     * Extracts unique categories from the quotes array and populates the filter dropdown.
     */
    function populateCategories() {
        const categories = [...new Set(quotes.map(quote => quote.category))];
        
        // Clear existing options (except for "All Categories")
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    /**
     * Filters quotes based on the selected category and saves the filter preference.
     * This function is triggered by the 'onchange' event of the dropdown.
     */
    function filterQuotes() {
        const selectedCategory = categoryFilter.value;
        localStorage.setItem(categoryFilterKey, selectedCategory);
        showRandomQuote();
    }

    // --- IMPORT/EXPORT FUNCTIONS ---
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
                quotes.push(...importedQuotes);
                saveQuotes();
                populateCategories(); // Repopulate categories after import
                alert(`${importedQuotes.length} quotes imported successfully!`);
                filterQuotes();
            } catch (error) {
                alert(`Error reading or parsing file: ${error.message}`);
            } finally {
                importFileInput.value = '';
            }
        };
        reader.readAsText(file);
    }

    // --- EVENT LISTENERS ---
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    exportBtn.addEventListener('click', exportToJsonFile);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importFromJsonFile);
    categoryFilter.addEventListener('change', filterQuotes);


    // --- INITIALIZATION ---
    loadQuotes();
    populateCategories();

    // Restore last selected filter from local storage
    const lastFilter = localStorage.getItem(categoryFilterKey);
    if (lastFilter) {
        categoryFilter.value = lastFilter;
    }

    // Show a quote on initial load respecting the filter
    showRandomQuote();
});
