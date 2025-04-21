import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  getBooks,
  addBook,
  deleteBook,
  getBookByTitle,
  updateBook,
  addReview,
  getMostReviewedBook,
  getBooksPerGenre,
  getTopRatedBooks
} from './services/bookService'; // Adjust path based on your project structure

import './BookManager.css'; // Make sure the styles are correctly applied

const BookManager = () => {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    genre: '',
    rating: 0
  });
  const [searchTitle, setSearchTitle] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [reviews, setReviews] = useState({}); // Store reviews for each book
  const [analytics, setAnalytics] = useState({
    mostReviewed: null,
    booksPerGenre: [],  // This will hold the genre stats
    topRated: []
  });

  // Fetch all books from the backend
  const fetchBooks = async () => {
    const data = await getBooks();
    setBooks(data);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewChange = (title, value) => {
    setReviews((prev) => ({
      ...prev,
      [title]: value
    }));
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.genre || newBook.rating < 1 || newBook.rating > 10) {
      alert('Please fill all fields and ensure the rating is between 1 and 10');
      return;
    }
    await addBook(newBook);
    setNewBook({ title: '', author: '', genre: '', rating: 0 });
    fetchBooks();
  };

  const handleDeleteBook = async (title) => {
    await deleteBook(title);
    fetchBooks();
  };

  const handleSearch = async () => {
    const result = await getBookByTitle(searchTitle);
    setSearchResult(result);
  };

  const handleUpdate = async () => {
    if (newBook.rating < 1 || newBook.rating > 10) {
      alert('Please ensure the rating is between 1 and 10');
      return;
    }
    const updated = { ...newBook };
    await updateBook(updated.title, updated);
    fetchBooks();
  };

  const handleAddReview = async (title) => {
    const review = reviews[title];
    if (!review) {
      alert('Please write a review');
      return;
    }
    await addReview(title, review);
    setReviews((prev) => ({ ...prev, [title]: '' })); // Clear review after adding
    alert('Review added!');
  };

  const handleAnalytics = async () => {
    const [mostReviewed, genreStats, topRatedBooks] = await Promise.all([
      getMostReviewedBook(),
      getBooksPerGenre(),
      getTopRatedBooks()  // Assuming this function returns a list of books with ratings
    ]);

    // Sort the books by rating in descending order
    const sortedTopRated = topRatedBooks.sort((a, b) => b.rating - a.rating);

    // Get the top 3 rated books
    const top3Rated = sortedTopRated.slice(0, 3);

    setAnalytics({
      mostReviewed,
      booksPerGenre: genreStats,
      topRated: top3Rated
    });
  };

  return (
    <div className="book-manager">
      <h2 className="header">📚 Book Manager</h2>

      {/* Add or Update Book Form */}
      <div className="form-container">
        <h4>Add or Update Book</h4>
        <div className="input-group">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newBook.title}
            onChange={handleInputChange}
            className="input-field"
          />
          <input
            type="text"
            name="author"
            placeholder="Author"
            value={newBook.author}
            onChange={handleInputChange}
            className="input-field"
          />
          <input
            type="text"
            name="genre"
            placeholder="Genre"
            value={newBook.genre}
            onChange={handleInputChange}
            className="input-field"
          />
          <input
            type="number"
            name="rating"
            placeholder="Rating"
            value={newBook.rating}
            onChange={handleInputChange}
            min="1"
            max="10"
            className="input-field"
          />
        </div>
        <div className="button-container">
          <button className="btn add-btn" onClick={handleAddBook}>Add Book</button>
          <button className="btn update-btn" onClick={handleUpdate}>Update Book</button>
        </div>
      </div>

      <hr />

      {/* Search Book by Title Section */}
      <div className="search-section">
        <h4>🔍 Search Book By Title</h4>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter title"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="input-field"
          />
          <button className="btn search-btn" onClick={handleSearch}>Search</button>
        </div>
        {searchResult && (
          <div className="search-result">
            <p><strong>Title:</strong> {searchResult.title}</p>
            <p><strong>Author:</strong> {searchResult.author}</p>
            <p><strong>Genre:</strong> {searchResult.genre}</p>
            <p><strong>Rating:</strong> {searchResult.rating}</p>
          </div>
        )}
      </div>

      <hr />

      {/* Display All Books */}
      <div className="books-list">
        <h4>All Books</h4>
        {books.length === 0 ? (
          <p>No books found.</p>
        ) : (
          <ul>
            {books.map((book, index) => (
              <li key={index} className="book-item">
                <strong>{book.title}</strong> by {book.author} | Genre: {book.genre} | Rating: {book.rating}
                <button onClick={() => handleDeleteBook(book.title)} className="btn delete-btn">❌ Delete</button>
                <div className="review-section">
                  <input
                    type="text"
                    placeholder="Write a review"
                    value={reviews[book.title] || ''}
                    onChange={(e) => handleReviewChange(book.title, e.target.value)}  // Update specific book's review
                    className="input-field"
                  />
                  <button onClick={() => handleAddReview(book.title)} className="btn review-btn">➕ Add Review</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr />

      {/* Analytics Section */}
      <div className="analytics-section">
        <h4>📊 Analytics</h4>
        <button className="btn analytics-btn" onClick={handleAnalytics}>Show Analytics</button>

        {analytics.mostReviewed && (
          <div className="analytics-item">
            <p><strong>Most Reviewed Book:</strong> {analytics.mostReviewed.title} ({analytics.mostReviewed.review_count} reviews)</p>
          </div>
        )}

        {analytics.booksPerGenre.length > 0 && (
          <div className="analytics-item">
            <p><strong>Books per Genre:</strong></p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.booksPerGenre}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="genre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {analytics.topRated.length > 0 && (
          <div className="analytics-item">
            <p><strong>Top 3 Rated Books:</strong></p>
            <ul>
              {analytics.topRated.map((b, idx) => (
                <li key={idx}>{b.title} (Rating: {b.rating})</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookManager;
