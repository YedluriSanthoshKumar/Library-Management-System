import Issue from '../models/Issue.js';
import Book from '../models/Book.js';
import Student from '../models/Student.js';

// @desc    Get all book issue/return records
// @route   GET /api/issues
// @access  Public
export const getIssues = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && ['Issued', 'Returned'].includes(status)) {
      query.status = status;
    }

    let issues = await Issue.find(query)
      .populate('book', 'title author isbn category quantity availableQuantity')
      .populate('student', 'name rollNumber email department phone')
      .sort({ createdAt: -1 });

    // Client/query search filter for student name/roll or book title/isbn
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      issues = issues.filter((issue) => {
        const bookTitle = issue.book?.title?.toLowerCase() || '';
        const bookIsbn = issue.book?.isbn?.toLowerCase() || '';
        const studentName = issue.student?.name?.toLowerCase() || '';
        const rollNumber = issue.student?.rollNumber?.toLowerCase() || '';
        return (
          bookTitle.includes(term) ||
          bookIsbn.includes(term) ||
          studentName.includes(term) ||
          rollNumber.includes(term)
        );
      });
    }

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single issue record
// @route   GET /api/issues/:id
// @access  Public
export const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('book', 'title author isbn category quantity availableQuantity publisher')
      .populate('student', 'name rollNumber email department phone');

    if (!issue) {
      res.status(404);
      throw new Error('Issue record not found');
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Issue a book to a student
// @route   POST /api/issues
// @access  Public
export const createIssue = async (req, res, next) => {
  try {
    const { bookId, studentId, issueDate, dueDate } = req.body;

    if (!bookId || !studentId || !dueDate) {
      res.status(400);
      throw new Error('Book, Student, and Due Date are required');
    }

    // 1. Verify Student exists
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // 2. Verify Book exists
    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    // 3. Business rule: Do not issue a book when no copies are available
    if (book.availableQuantity <= 0) {
      res.status(400);
      throw new Error(
        `'${book.title}' is currently out of stock (Available: 0). Cannot issue this book.`
      );
    }

    // 4. Check if student already has this exact book currently issued
    const alreadyIssued = await Issue.findOne({
      book: bookId,
      student: studentId,
      status: 'Issued',
    });

    if (alreadyIssued) {
      res.status(400);
      throw new Error(
        `Student '${student.name}' already has an active issue for '${book.title}'. Please return the existing copy first.`
      );
    }

    const start = issueDate ? new Date(issueDate) : new Date();
    const end = new Date(dueDate);

    if (end < start) {
      res.status(400);
      throw new Error('Due date cannot be earlier than the issue date');
    }

    // 5. Create Issue record
    const issue = await Issue.create({
      book: bookId,
      student: studentId,
      issueDate: start,
      dueDate: end,
      status: 'Issued',
    });

    // 6. Business rule: Decrease available quantity when a book is issued
    book.availableQuantity -= 1;
    await book.save();

    // Populate record for immediate response
    const populatedIssue = await Issue.findById(issue._id)
      .populate('book', 'title author isbn category')
      .populate('student', 'name rollNumber email department');

    res.status(201).json({
      success: true,
      message: `Book '${book.title}' successfully issued to ${student.name}`,
      data: populatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return an issued book
// @route   PUT /api/issues/:id/return
// @access  Public
export const returnBook = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('book')
      .populate('student');

    if (!issue) {
      res.status(404);
      throw new Error('Issue record not found');
    }

    // Business rule: Prevent a returned book from being returned again
    if (issue.status === 'Returned') {
      res.status(400);
      throw new Error('This book has already been returned');
    }

    // Update Issue record
    issue.status = 'Returned';
    issue.returnDate = new Date();
    await issue.save();

    // Business rule: Increase available quantity when a book is returned
    if (issue.book) {
      const book = await Book.findById(issue.book._id);
      if (book) {
        if (book.availableQuantity < book.quantity) {
          book.availableQuantity += 1;
          await book.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Book successfully marked as returned`,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};
