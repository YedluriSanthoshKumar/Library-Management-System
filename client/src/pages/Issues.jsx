import React, { useState, useEffect } from 'react';
import {
  Repeat,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  BookOpen,
  User,
  Calendar,
} from 'lucide-react';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import { useToast } from '../components/Toast';
import issueService from '../services/issueService';
import bookService from '../services/bookService';
import studentService from '../services/studentService';

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal and form states
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [returningId, setReturningId] = useState(null);

  // Form State
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 14 days loan period by default
    return d.toISOString().split('T')[0];
  };

  const defaultIssueDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    bookId: '',
    studentId: '',
    issueDate: defaultIssueDate(),
    dueDate: defaultDueDate(),
  });

  const { showToast } = useToast();

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await issueService.getIssues(params);
      if (res.success) {
        setIssues(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch circulation records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadBooksAndStudents = async () => {
    try {
      const [booksRes, studentsRes] = await Promise.all([
        bookService.getBooks(),
        studentService.getStudents(),
      ]);
      if (booksRes.success) setBooksList(booksRes.data);
      if (studentsRes.success) setStudentsList(studentsRes.data);
    } catch (err) {
      console.error('Error fetching books and students for dropdowns:', err);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchIssues();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [statusFilter, searchTerm]);

  const handleOpenIssueModal = () => {
    loadBooksAndStudents();
    setFormData({
      bookId: '',
      studentId: '',
      issueDate: defaultIssueDate(),
      dueDate: defaultDueDate(),
    });
    setIsIssueModalOpen(true);
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!formData.bookId || !formData.studentId || !formData.dueDate) {
      showToast('Please select a book, a student, and a due date', 'error');
      return;
    }

    // Client check for book availability
    const selectedBook = booksList.find((b) => b._id === formData.bookId);
    if (selectedBook && selectedBook.availableQuantity <= 0) {
      showToast(
        `'${selectedBook.title}' is currently out of stock. Cannot issue.`,
        'error'
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await issueService.createIssue(formData);
      if (res.success) {
        showToast(res.message || 'Book issued successfully!', 'success');
        setIsIssueModalOpen(false);
        fetchIssues();
      }
    } catch (err) {
      showToast(err.message || 'Failed to issue book', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnBook = async (issueId) => {
    try {
      setReturningId(issueId);
      const res = await issueService.returnBook(issueId);
      if (res.success) {
        showToast(res.message || 'Book returned successfully!', 'success');
        fetchIssues();
      }
    } catch (err) {
      showToast(err.message || 'Failed to return book', 'error');
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Issue Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Book Circulation & Issues
          </h2>
          <p className="text-sm text-slate-500">
            Issue books to registered students, manage due dates, and record returns.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenIssueModal}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Book to Student</span>
        </button>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, roll number, or book..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-lg w-full md:w-auto">
          {['All', 'Issued', 'Returned'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`flex-1 md:flex-initial px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                statusFilter === status
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status === 'All' ? 'All Circulation' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Circulation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-7 h-7 text-blue-600 animate-spin" />
            <p className="text-sm text-slate-500">Loading circulation records...</p>
          </div>
        ) : issues.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title={searchTerm ? 'No circulation records found' : 'No books currently on loan'}
            description={
              searchTerm
                ? `No circulation records matched "${searchTerm}".`
                : 'Click "Issue Book to Student" above to start issuing library catalog books.'
            }
            actionText="Issue a Book"
            onAction={handleOpenIssueModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Book Details</th>
                  <th className="py-3.5 px-4">Student Patron</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Return Date</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Circulation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {issues.map((issue) => {
                  const isIssued = issue.status === 'Issued';
                  const isOverdue =
                    isIssued && new Date(issue.dueDate) < new Date();

                  return (
                    <tr key={issue._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">
                          {issue.book?.title || 'Unknown Book'}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          {issue.book?.isbn || '—'} • {issue.book?.category || 'General'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">
                          {issue.student?.name || 'Unknown Student'}
                        </p>
                        <p className="text-xs text-slate-500">
                          <span className="font-mono">{issue.student?.rollNumber}</span> •{' '}
                          {issue.student?.department}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        {new Date(issue.issueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span
                          className={`font-semibold ${
                            isOverdue ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          {new Date(issue.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {issue.returnDate
                          ? new Date(issue.returnDate).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isIssued ? (
                          isOverdue ? (
                            <Badge variant="danger">Overdue</Badge>
                          ) : (
                            <Badge variant="warning">Issued</Badge>
                          )
                        ) : (
                          <Badge variant="success">Returned</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isIssued ? (
                          <button
                            type="button"
                            onClick={() => handleReturnBook(issue._id)}
                            disabled={returningId === issue._id}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>
                              {returningId === issue._id ? 'Processing...' : 'Return Book'}
                            </span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Book Modal Form */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Book to Student"
      >
        <form onSubmit={handleCreateIssue} className="space-y-4">
          {/* Select Book Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Book <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.bookId}
              onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Choose a book from catalog --</option>
              {booksList.map((book) => {
                const isOutOfStock = book.availableQuantity <= 0;
                return (
                  <option
                    key={book._id}
                    value={book._id}
                    disabled={isOutOfStock}
                  >
                    {book.title} (Available: {book.availableQuantity}/{book.quantity}){' '}
                    {isOutOfStock ? '- [Out of Stock]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Select Student Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Student <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Choose a registered student --</option>
              {studentsList.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.rollNumber}) - {student.department}
                </option>
              ))}
            </select>
          </div>

          {/* Issue Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Issue Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={formData.issueDate}
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100 text-xs text-blue-800 flex items-start space-x-2">
            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>
              Issuing this book will decrease its available inventory by 1 copy. The student is expected to return it by the specified due date.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Issuing Book...' : 'Confirm Issue'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
