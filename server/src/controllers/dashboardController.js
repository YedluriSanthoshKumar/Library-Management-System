import Book from '../models/Book.js';
import Student from '../models/Student.js';
import Issue from '../models/Issue.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalBooksPromise = Book.countDocuments();
    const totalStudentsPromise = Student.countDocuments();
    const currentlyIssuedPromise = Issue.countDocuments({ status: 'Issued' });
    const returnedBooksPromise = Issue.countDocuments({ status: 'Returned' });

    // Additional valuable stats
    const booksAggregationPromise = Book.aggregate([
      {
        $group: {
          _id: null,
          totalCopies: { $sum: '$quantity' },
          availableCopies: { $sum: '$availableQuantity' },
        },
      },
    ]);

    const overdueCountPromise = Issue.countDocuments({
      status: 'Issued',
      dueDate: { $lt: new Date() },
    });

    const recentIssuesPromise = Issue.find()
      .populate('book', 'title author isbn')
      .populate('student', 'name rollNumber department')
      .sort({ createdAt: -1 })
      .limit(6);

    const categoryDistributionPromise = Book.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalCopies: { $sum: '$quantity' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const [
      totalBooks,
      totalStudents,
      currentlyIssued,
      returnedBooks,
      booksAggregation,
      overdueIssues,
      recentIssues,
      categoryDistribution,
    ] = await Promise.all([
      totalBooksPromise,
      totalStudentsPromise,
      currentlyIssuedPromise,
      returnedBooksPromise,
      booksAggregationPromise,
      overdueCountPromise,
      recentIssuesPromise,
      categoryDistributionPromise,
    ]);

    const copiesStats = booksAggregation[0] || { totalCopies: 0, availableCopies: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalBooks,
        totalStudents,
        currentlyIssued,
        returnedBooks,
        totalCopies: copiesStats.totalCopies,
        availableCopies: copiesStats.availableCopies,
        overdueIssues,
        recentIssues,
        categoryDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};
