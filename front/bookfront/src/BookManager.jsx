import React, { useState, useEffect } from 'react';
import GenreBarChart from './components/GenreBarChart';
import {
  getBooks,
  addBook,
  deleteBook,
  getBookByTitle,
  updateBook,
  addReview,
  getAvgRating,
  getMostReviewedBook,
  getBooksPerGenre,
  getTopRatedBooks
} from './services/bookService'; // Adjust .. based on your folder structure

import './BookManager.css'; // Import the CSS file

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
  const [review, setReview] = useState('');
  const [analytics, setAnalytics] = useState({
    avgRating: null,
    mostReviewed: null,
    booksPerGenre: [],
    topRated: []
  });

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

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.genre) {
      alert('Please fill all fields');
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
    const updated = { ...newBook };
    await updateBook(updated.title, updated);
    fetchBooks();
  };

  const handleAddReview = async (title) => {
    await addReview(title, review);
    setReview('');
    alert('Review added!');
  };

  const handleAnalytics = async () => {
    const [avgRating, mostReviewed, genreStats, topRated] = await Promise.all([
      getAvgRating(newBook.author || 'Unknown'),
      getMostReviewedBook(),
      getBooksPerGenre(),
      getTopRatedBooks()
    ]);

    setAnalytics({
      avgRating,
      mostReviewed,
      booksPerGenre: genreStats,
      topRated
    });
  };

  return (
    <div className="book-manager">
      <h2 className="header">📚 Book Manager</h2>

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
            min="0"
            max="5"
            className="input-field"
          />
        </div>
        <div className="button-container">
          <button className="btn add-btn" onClick={handleAddBook}>Add Book</button>
          <button className="btn update-btn" onClick={handleUpdate}>Update Book</button>
        </div>
      </div>

      <hr />

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
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
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

      <div className="analytics-section">
        <h4>📊 Analytics</h4>
        <button className="btn analytics-btn" onClick={handleAnalytics}>Show Analytics</button>

        {analytics.avgRating && (
          <div className="analytics-item">
            <p><strong>Average Rating for {newBook.author}:</strong> {analytics.avgRating.avg_rating}</p>
          </div>
        )}

        {analytics.mostReviewed && (
          <div className="analytics-item">
            <p><strong>Most Reviewed Book:</strong> {analytics.mostReviewed.title} ({analytics.mostReviewed.review_count} reviews)</p>
          </div>
        )}

        {analytics.booksPerGenre.length > 0 && (
          <div className="analytics-item">
            <p><strong>Books per Genre:</strong></p>
            <ul>
              {analytics.booksPerGenre.map((g, idx) => (
                <li key={idx}>{g.genre}: {g.count}</li>
              ))}
            </ul>
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