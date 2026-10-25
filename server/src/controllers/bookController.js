import Book from '../models/Book.js';
import Issue from '../models/Issue.js';

// @desc    Get all books (with optional search and category filter)
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { isbn: searchRegex },
      ];
    }

    if (category && category !== 'All' && category.trim()) {
      query.category = category.trim();
    }

    const books = await Book.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book details
// @route   GET /api/books/:id
// @access  Public
export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    // Get active issues for this book
    const activeIssues = await Issue.find({ book: book._id, status: 'Issued' }).populate(
      'student',
      'name rollNumber department'
    );

    res.status(200).json({
      success: true,
      data: {
        ...book.toObject(),
        activeIssuesCount: activeIssues.length,
        activeIssues,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new book
// @route   POST /api/books
// @access  Public
export const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, category, publisher, quantity, availableQuantity } = req.body;

    // Check if ISBN already exists
    const existingBook = await Book.findOne({ isbn: isbn.trim().toUpperCase() });
    if (existingBook) {
      res.status(400);
      throw new Error(`A book with ISBN '${isbn.trim().toUpperCase()}' already exists`);
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      res.status(400);
      throw new Error('Quantity must be a valid non-negative number');
    }

    const availQty = availableQuantity !== undefined && availableQuantity !== '' 
      ? parseInt(availableQuantity, 10) 
      : qty;

    if (availQty > qty) {
      res.status(400);
      throw new Error('Available quantity cannot be greater than total quantity');
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim().toUpperCase(),
      category: category.trim(),
      publisher: publisher.trim(),
      quantity: qty,
      availableQuantity: availQty,
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book details
// @route   PUT /api/books/:id
// @access  Public
export const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    const { title, author, isbn, category, publisher, quantity } = req.body;

    // If ISBN changed, ensure uniqueness
    if (isbn && isbn.trim().toUpperCase() !== book.isbn) {
      const isbnConflict = await Book.findOne({
        isbn: isbn.trim().toUpperCase(),
        _id: { $ne: book._id },
      });
      if (isbnConflict) {
        res.status(400);
        throw new Error(`A book with ISBN '${isbn.trim().toUpperCase()}' already exists`);
      }
      book.isbn = isbn.trim().toUpperCase();
    }

    // Handle quantity modification
    if (quantity !== undefined) {
      const newQty = parseInt(quantity, 10);
      if (isNaN(newQty) || newQty < 0) {
        res.status(400);
        throw new Error('Quantity must be a valid non-negative number');
      }

      // Count active issued books
      const activeIssuedCount = await Issue.countDocuments({
        book: book._id,
        status: 'Issued',
      });

      if (newQty < activeIssuedCount) {
        res.status(400);
        throw new Error(
          `Cannot reduce total quantity to ${newQty}. There are currently ${activeIssuedCount} copies issued to students.`
        );
      }

      // Calculate new available quantity
      book.availableQuantity = newQty - activeIssuedCount;
      book.quantity = newQty;
    }

    if (title) book.title = title.trim();
    if (author) book.author = author.trim();
    if (category) book.category = category.trim();
    if (publisher) book.publisher = publisher.trim();

    const updatedBook = await book.save();

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Public
export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    // Business rule: Do not delete a book if it has active issue records
    const activeIssues = await Issue.countDocuments({
      book: book._id,
      status: 'Issued',
    });

    if (activeIssues > 0) {
      res.status(400);
      throw new Error(
        `Cannot delete book '${book.title}'. There are ${activeIssues} active issue record(s) for this book. Please return all copies first.`
      );
    }

    // Also remove or preserve historical returned records? Keep database clean or delete associated returned records
    await Issue.deleteMany({ book: book._id, status: 'Returned' });
    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};
