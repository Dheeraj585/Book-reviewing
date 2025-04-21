from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
from bson.objectid import ObjectId
from statistics import mean
from flask_cors import CORS # type: ignore

app = Flask(__name__)

# Enable CORS if using a frontend hosted separately
CORS(app)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["book_db"]
books_collection = db["books"]

# Helper to convert ObjectId to string
def convert_id(book):
    book['_id'] = str(book['_id'])
    return book

@app.route('/')
def index():
    return render_template('index.html')  # Flask looks for 'index.html' in the templates folder

# Create a new book
@app.route('/books', methods=['POST'])
def add_book():
    data = request.json
    # Input validation
    if not data.get('title') or not isinstance(data['title'], str):
        return jsonify({"error": "Title is required and must be a string"}), 400
    if not data.get('author') or not isinstance(data['author'], str):
        return jsonify({"error": "Author is required and must be a string"}), 400

    # Check if book already exists
    if books_collection.find_one({"title": data['title']}):
        return jsonify({"error": "Book with this title already exists"}), 409

    book = {
        "title": data['title'],
        "author": data['author'],
        "genre": data['genre'],
        "rating": data.get('rating', 0),
        "reviews": data.get('reviews', [])
    }
    books_collection.insert_one(book)
    return jsonify({"message": "Book added successfully"}), 201

# Get all books
@app.route('/books', methods=['GET'])
def get_books():
    books = list(books_collection.find())
    books = [convert_id(book) for book in books]
    return jsonify(books)

# Get book by title
@app.route('/books/<title>', methods=['GET'])
def get_book(title):
    book = books_collection.find_one({"title": title})
    if book:
        return jsonify(convert_id(book))
    return jsonify({"error": "Book not found"}), 404

# Get book by ID
@app.route('/book/<id>', methods=['GET'])
def get_book_by_id(id):
    try:
        book = books_collection.find_one({"_id": ObjectId(id)})
        if book:
            return jsonify(convert_id(book))
        return jsonify({"error": "Book not found"}), 404
    except:
        return jsonify({"error": "Invalid ID"}), 400

# Update book by title
@app.route('/books/<title>', methods=['PUT'])
def update_book(title):
    data = request.json
    result = books_collection.update_one({"title": title}, {"$set": data})
    if result.matched_count:
        return jsonify({"message": "Book updated successfully"})
    return jsonify({"error": "Book not found"}), 404

# Delete book by title
@app.route('/books/<title>', methods=['DELETE'])
def delete_book(title):
    result = books_collection.delete_one({"title": title})
    if result.deleted_count:
        return jsonify({"message": "Book deleted successfully"})
    return jsonify({"error": "Book not found"}), 404

# Add review to a book
@app.route('/books/<title>/review', methods=['POST'])
def add_review(title):
    data = request.json
    review = data.get("review")
    if not review:
        return jsonify({"error": "Review is required"}), 400
    result = books_collection.update_one(
        {"title": title},
        {"$push": {"reviews": review}}
    )
    if result.modified_count:
        return jsonify({"message": "Review added successfully"})
    return jsonify({"error": "Book not found"}), 404

# Get average rating for a specific author
@app.route('/analytics/avg_rating/<author>', methods=['GET'])
def avg_rating(author):
    books = list(books_collection.find({"author": author}))
    if books:
        avg = mean([book['rating'] for book in books])
        return jsonify({"author": author, "average_rating": round(avg, 2)})
    return jsonify({"error": "No books found for this author"}), 404

# Get most reviewed book
@app.route('/analytics/most_reviewed', methods=['GET'])
def most_reviewed():
    books = list(books_collection.find())
    if not books:
        return jsonify({"error": "No books found"}), 404
    book = max(books, key=lambda b: len(b.get("reviews", [])))
    return jsonify({"title": book['title'], "review_count": len(book['reviews'])})

# Get count of books per genre
@app.route('/analytics/books_per_genre', methods=['GET'])
def books_per_genre():
    pipeline = [
        {"$group": {"_id": "$genre", "count": {"$sum": 1}}},  # Group by genre and count books
        {"$project": {"genre": "$_id", "count": 1, "_id": 0}}  # Rename _id to genre and exclude _id
    ]
    result = list(books_collection.aggregate(pipeline))
    return jsonify(result)

# Get top 3 highest-rated books
@app.route('/analytics/top_rated', methods=['GET'])
def top_rated():
    books = list(books_collection.find().sort("rating", -1).limit(3))
    books = [{"title": book['title'], "rating": book['rating']} for book in books]
    return jsonify(books)

# Search for books by title (partial match, case-insensitive)
@app.route('/books/search', methods=['GET'])
def search_books():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    # Perform case-insensitive search using regex
    books = list(books_collection.find({"title": {"$regex": query, "$options": "i"}}))
    if not books:
        return jsonify({"error": "No books found"}), 404
    
    books = [convert_id(book) for book in books]
    return jsonify(books)

if __name__ == '__main__':
    app.run(debug=True)
