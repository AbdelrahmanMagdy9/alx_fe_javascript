// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    // Initial array of quote objects. This will be updated when the user adds new quotes.
    const quotes = [
        { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
        { text: "Strive not to be a success, but rather to be of value.", category: "Wisdom" },
        { text: "The mind is everything. What you think you become.", category: "Philosophy" },
        { text: "An unexamined life is not worth living.", category: "Philosophy" }
    ];

    // --- DOM ELEMENT REFERENCES ---
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuoteBtn');
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const newQuoteTextInput = document.getElementById('newQuoteText');
    const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

    // --- FUNCTIONS ---

    /**
     * Selects a random quote from the array and displays it in the quoteDisplay element.
     */
    function showRandomQuote() {
        if (quotes.length === 0) {
            quoteDisplay.innerHTML = '<p>No quotes available. Please add one!</p>';
            return;
        }
        // Get a random index from the quotes array
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];

        // Create the HTML for the quote and update the DOM
        const quoteElement = document.createElement('p');
        quoteElement.textContent = `"${randomQuote.text}"`;

        const categoryElement = document.createElement('em');
        categoryElement.textContent = `- ${randomQuote.category}`;

        // Clear previous quote and append the new one
        quoteDisplay.innerHTML = '';
        quoteDisplay.appendChild(quoteElement);
        quoteDisplay.appendChild(categoryElement);
    }

    /**
     * Handles the logic for adding a new quote from the form.
     */
    function addQuote() {
        // Get the values from the input fields and remove leading/trailing whitespace
        const newText = newQuoteTextInput.value.trim();
        const newCategory = newQuoteCategoryInput.value.trim();

        // Basic validation to ensure both fields are filled
        if (newText === "" || newCategory === "") {
            alert("Please fill in both the quote text and its category.");
            return; // Stop the function if validation fails
        }

        // Create a new quote object
        const newQuote = {
            text: newText,
            category: newCategory
        };

        // Add the new quote object to our main array
        quotes.push(newQuote);

        // Clear the input fields for the next entry
        newQuoteTextInput.value = "";
        newQuoteCategoryInput.value = "";

        // Provide user feedback
        alert("New quote added successfully!");
        
        // Optional: display the newly added quote immediately
        // showRandomQuote();
    }

    // This function is not required by the prompt's final structure, but it shows
    // how you might dynamically create the form itself if it wasn't already in the HTML.
    // We are using the HTML form directly in this solution.
    function createAddQuoteForm() {
        // This function would contain JS to create the input and button elements
        // and append them to the body. This is a more advanced technique.
        console.log("Form creation logic would go here.");
    }

    // --- EVENT LISTENERS ---
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);

    // --- INITIALIZATION ---
    // Show a random quote as soon as the page loads
    showRandomQuote();
});
