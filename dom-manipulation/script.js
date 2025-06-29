document.addEventListener('DOMContentLoaded', () => {

    // --- DATA & STORAGE KEYS ---
    const localStorageKey = 'dynamic-quotes';
    const sessionStorageKey = 'last-viewed-quote';
    let quotes = []; // Initialize as an empty array

    // --- DOM ELEMENT REFERENCES ---
    const quoteDisplay = document.getElementById('quoteDisplay');
    const lastViewedQuoteDisplay = document.getElementById('lastViewedQuote');
    const newQuoteBtn = document.getElementById('newQuoteBtn');
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const newQuoteTextInput = document.getElementById('newQuoteText');
    const newQuoteCategoryInput = document.getElementById('newQuoteCategory');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFileInput = document.getElementById('importFile');

    // --- CORE FUNCTIONS ---

    /**
     * Loads quotes from localStorage. If none are found, initializes with default quotes.
     */
    function loadQuotes() {
        const storedQuotes = localStorage.getItem(localStorageKey);
        try {
            if (storedQuotes) {
                quotes = JSON.parse(storedQuotes);
            } else {
                // Default quotes if nothing is in local storage
                quotes = [
                    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
                    { text: "Strive not to be a success, but rather to be of value.", category: "Wisdom" },
                ];
                saveQuotes(); // Save defaults to storage
            }
        } catch (e) {
            console.error("Error parsing quotes from localStorage:", e);
            // Handle corrupted data by falling back to defaults
            quotes = []; 
        }
    }

    /**
     * Saves the current 'quotes' array to localStorage.
     */
    function saveQuotes() {
        localStorage.setItem(localStorageKey, JSON.stringify(quotes));
    }

    /**
     * Renders a quote object into a specified DOM element.
     * @param {object} quote - The quote object {text, category}.
     * @param {HTMLElement} element - The DOM element to display the quote in.
     */
    function renderQuote(quote, element) {
        if (!quote) {
            element.innerHTML = '<p>No quote to display.</p>';
            return;
        }
        const quoteElement = document.createElement('p');
        quoteElement.textContent = `"${quote.text}"`;

        const categoryElement = document.createElement('em');
        categoryElement.textContent = `- ${quote.category}`;

        element.innerHTML = ''; // Clear previous content
        element.appendChild(quoteElement);
        element.appendChild(categoryElement);
    }
    
    /**
     * Displays a random quote and saves it to session storage.
     */
    function showRandomQuote() {
        if (quotes.length === 0) {
            quoteDisplay.innerHTML = '<p>No quotes available. Please add or import some!</p>';
            return;
        }
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];
        
        renderQuote(randomQuote, quoteDisplay);
        
        // Save the shown quote to session storage
        sessionStorage.setItem(sessionStorageKey, JSON.stringify(randomQuote));
        renderQuote(randomQuote, lastViewedQuoteDisplay); // Also update the last-viewed display
    }

    /**
     * Adds a new quote from the form, saves it, and provides feedback.
     */
    function addQuote() {
        const newText = newQuoteTextInput.value.trim();
        const newCategory = newQuoteCategoryInput.value.trim();

        if (newText === "" || newCategory === "") {
            alert("Please fill in both the quote text and its category.");
            return;
        }

        quotes.push({ text: newText, category: newCategory });
        saveQuotes(); // Save the updated array to localStorage

        newQuoteTextInput.value = "";
        newQuoteCategoryInput.value = "";
        alert("New quote added successfully and saved to local storage!");
        showRandomQuote(); // Show a new quote to refresh the display
    }

    // --- IMPORT/EXPORT FUNCTIONS ---

    /**
     * Exports the current quotes array to a downloadable JSON file.
     */
    function exportToJsonFile() {
        if (quotes.length === 0) {
            alert("No quotes to export.");
            return;
        }
        // Create a JSON string with pretty printing (2 spaces)
        const jsonString = JSON.stringify(quotes, null, 2);
        
        // Create a Blob object from the JSON string
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);
        
        // Create a temporary anchor element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotes.json'; // The default filename for the download
        document.body.appendChild(a); // Append to the DOM to make it clickable
        a.click(); // Programmatically click the link
        
        // Clean up by removing the element and revoking the URL
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Handles the file import process when a user selects a file.
     * @param {Event} event - The file input change event.
     */
    function importFromJsonFile(event) {
        const file = event.target.files[0];
        if (!file) {
            return; // No file selected
        }

        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importedQuotes = JSON.parse(e.target.result);
                // Basic validation: check if it's an array
                if (!Array.isArray(importedQuotes)) {
                    throw new Error("Imported JSON is not an array.");
                }
                
                // Merge imported quotes with existing ones
                quotes.push(...importedQuotes);
                saveQuotes(); // Save the newly merged array
                
                alert(`${importedQuotes.length} quotes imported successfully!`);
                showRandomQuote(); // Refresh the display
            } catch (error) {
                alert(`Error reading or parsing file: ${error.message}`);
            } finally {
                // Reset the file input to allow importing the same file again
                importFileInput.value = '';
            }
        };

        reader.readAsText(file);
    }
    
    // --- EVENT LISTENERS ---
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    exportBtn.addEventListener('click', exportToJsonFile);
    importBtn.addEventListener('click', () => importFileInput.click()); // Trigger hidden file input
    importFileInput.addEventListener('change', importFromJsonFile);


    // --- INITIALIZATION ---
    loadQuotes(); // Load quotes from localStorage or set defaults
    
    // Check session storage for the last viewed quote
    const lastViewed = sessionStorage.getItem(sessionStorageKey);
    if (lastViewed) {
        renderQuote(JSON.parse(lastViewed), lastViewedQuoteDisplay);
    }

    showRandomQuote(); // Display a random quote on initial load
});
