
const booksGrid = document.getElementById("booksGrid");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll("[data-genre]");
const resultsCount = document.getElementById("resultsCount");
const emptyMessage = document.getElementById("emptyMessage");

// Get selected genre from URL
let selectedGenre = new URLSearchParams(window.location.search)
    .get("genre") || "All";

if (!["All", ...new Set(books.map(book => book.genre))]
    .includes(selectedGenre)) {
    selectedGenre = "All";
}

// Load saved favorites
let favorites = [];

try {
    favorites = JSON.parse(
        localStorage.getItem("readingFavorites")
    ) || [];

    if (!Array.isArray(favorites)) {
        favorites = [];
    }
} catch {
    favorites = [];
}

// Create a book card
function createBookCard(book) {

    const card = document.createElement("article");
    card.className = "book-card";

    // Book cover
    const image = document.createElement("img");
    image.src = book.image;
    image.alt = `${book.title} book cover`;
    image.loading = "lazy";

    const info = document.createElement("div");
    info.className = "book-info";

    // Genre
    const genre = document.createElement("span");
    genre.className = "book-genre";
    genre.textContent = book.genre;

    // Title
    const title = document.createElement("h3");
    title.textContent = book.title;

    // Author
    const author = document.createElement("p");
    author.className = "book-author";
    author.textContent = `By ${book.author}`;

    // Publication year
    const year = document.createElement("p");
    year.className = "book-year";
    year.textContent = `Published: ${book.year}`;

    // Description
    const description = document.createElement("p");
    description.className = "book-description";
    description.textContent = book.description;

    // Book details link
    const detailsLink = document.createElement("a");
    detailsLink.href = `book-details.html?id=${book.id}`;
    detailsLink.className = "book-link";
    detailsLink.textContent = "View Book Details →";

    // Favorites button
    const favoriteButton = document.createElement("button");
    favoriteButton.type = "button";
    favoriteButton.className = "favorite-btn";

    function updateFavoriteButton() {
        const isFavorite = favorites.includes(book.id);

        favoriteButton.textContent = isFavorite
            ? "♥ Saved to Favorites"
            : "♡ Add to Favorites";

        favoriteButton.setAttribute(
            "aria-pressed",
            String(isFavorite)
        );
    }

    favoriteButton.addEventListener("click", () => {

        if (favorites.includes(book.id)) {
            favorites = favorites.filter(id => id !== book.id);
        } else {
            favorites.push(book.id);
        }

        try {
            localStorage.setItem(
                "readingFavorites",
                JSON.stringify(favorites)
            );
        } catch {
            // Favorites remain available for this session.
        }

        updateFavoriteButton();
    });

    updateFavoriteButton();

    // Add book information
    info.append(
        genre,
        title,
        author,
        year,
        description,
        detailsLink,
        favoriteButton
    );

    // Add image and information to card
    card.append(image, info);

    return card;
}

// Display books based on search and genre
function renderBooks() {

    const query = searchInput.value.trim().toLowerCase();

    const filteredBooks = books.filter(book => {

        const matchesGenre =
            selectedGenre === "All" ||
            book.genre === selectedGenre;

        const matchesSearch =
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query);

        return matchesGenre && matchesSearch;
    });

    booksGrid.replaceChildren();

    filteredBooks.forEach(book => {
        booksGrid.appendChild(createBookCard(book));
    });

    resultsCount.textContent =
        `${filteredBooks.length} books found`;

    emptyMessage.hidden = filteredBooks.length !== 0;

    filterButtons.forEach(button => {

        const isActive =
            button.dataset.genre === selectedGenre;

        button.classList.toggle("active", isActive);

        button.setAttribute(
            "aria-pressed",
            String(isActive)
        );
    });
}

// Search as user types
searchInput.addEventListener("input", renderBooks);

// Filter by genre
filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        selectedGenre = button.dataset.genre;

        const url = new URL(window.location.href);

        if (selectedGenre === "All") {
            url.searchParams.delete("genre");
        } else {
            url.searchParams.set("genre", selectedGenre);
        }

        window.history.replaceState({}, "", url);

        renderBooks();
    });
});

// Display books when page loads
renderBooks();
