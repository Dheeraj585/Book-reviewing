const BASE_URL = "http://localhost:5000";

// Add a new book
export const addBook = async (bookData) => {
  const res = await fetch(`${BASE_URL}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData),
  });
  return res.json();
};

// Get all books
export const getBooks = async () => {
  const res = await fetch(`${BASE_URL}/books`);
  return res.json();
};

// Get book by title
export const getBookByTitle = async (title) => {
  const res = await fetch(`${BASE_URL}/books/${title}`);
  return res.json();
};

// Get book by ID
export const getBookById = async (id) => {
  const res = await fetch(`${BASE_URL}/book/${id}`);
  return res.json();
};

// Update book by title
export const updateBook = async (title, updateData) => {
  const res = await fetch(`${BASE_URL}/books/${title}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  return res.json();
};

// Delete book by title
export const deleteBook = async (title) => {
  const res = await fetch(`${BASE_URL}/books/${title}`, {
    method: 'DELETE',
  });
  return res.json();
};

// Add review to a book
export const addReview = async (title, review) => {
  const res = await fetch(`${BASE_URL}/books/${title}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review }),
  });
  return res.json();
};

// Get average rating for a specific author
export const getAvgRating = async (author) => {
  const res = await fetch(`${BASE_URL}/analytics/avg_rating/${author}`);
  return res.json();
};

// Get the most reviewed book
export const getMostReviewedBook = async () => {
  const res = await fetch(`${BASE_URL}/analytics/most_reviewed`);
  return res.json();
};

// Get count of books per genre
export const getBooksPerGenre = async () => {
  const res = await fetch(`${BASE_URL}/analytics/books_per_genre`);
  return res.json();
};

// Get top 3 highest-rated books
export const getTopRatedBooks = async () => {
  const res = await fetch(`${BASE_URL}/analytics/top_rated`);
  return res.json();
};
