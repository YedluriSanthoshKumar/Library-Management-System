import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  BookCopy,
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import { useToast } from '../components/Toast';
import bookService from '../services/bookService';

const INITIAL_FORM_STATE = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  publisher: '',
  quantity: 1,
};

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (categoryFilter !== 'All') params.category = categoryFilter;

      const res = await bookService.getBooks(params);
      if (res.success) {
        setBooks(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load books catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBooks();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, categoryFilter]);

  // Extract unique categories for filter dropdown
  const categories = ['All', ...new Set(books.map((b) => b.category).filter(Boolean))];

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentBookId(null);
    setFormData(INITIAL_FORM_STATE);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setIsEditing(true);
    setCurrentBookId(book._id);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher,
      quantity: book.quantity,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenViewModal = async (bookId) => {
    try {
      const res = await bookService.getBookById(bookId);
      if (res.success) {
        setSelectedBook(res.data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch book details', 'error');
    }
  };

  const handleOpenDeleteConfirm = (book) => {
    setBookToDelete(book);
    setIsConfirmDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.isbn || !formData.category || !formData.publisher) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (isEditing) {
        const res = await bookService.updateBook(currentBookId, formData);
        if (res.success) {
          showToast('Book details updated successfully!', 'success');
        }
      } else {
        const res = await bookService.createBook(formData);
        if (res.success) {
          showToast('Book added to library catalog successfully!', 'success');
        }
      }
      setIsFormModalOpen(false);
      fetchBooks();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    try {
      setSubmitting(true);
      const res = await bookService.deleteBook(bookToDelete._id);
      if (res.success) {
        showToast('Book deleted successfully', 'success');
        setIsConfirmDeleteOpen(false);
        setBookToDelete(null);
        fetchBooks();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete book', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Add Book Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Manage Books
          </h2>
          <p className="text-sm text-slate-500">
            Maintain the library catalog, track available copies, and update inventory.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 w-full md:w-48"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(searchTerm || categoryFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('All');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-7 h-7 text-blue-600 animate-spin" />
            <p className="text-sm text-slate-500">Loading catalog...</p>
          </div>
        ) : books.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={searchTerm ? 'No matching books found' : 'No books in library'}
            description={
              searchTerm
                ? `No books matched "${searchTerm}". Try a different search query.`
                : 'Get started by adding your first book to the catalog.'
            }
            actionText="Add New Book"
            onAction={handleOpenAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Book Title & Author</th>
                  <th className="py-3.5 px-4 font-mono text-xs">ISBN</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Publisher</th>
                  <th className="py-3.5 px-4 text-center">Copies (Avail / Total)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {books.map((book) => {
                  const isAvailable = book.availableQuantity > 0;
                  return (
                    <tr key={book._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{book.title}</p>
                        <p className="text-xs text-slate-500 font-normal">by {book.author}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {book.isbn}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="purple">{book.category}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {book.publisher}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-slate-800">
                          {book.availableQuantity}
                        </span>
                        <span className="text-slate-400 text-xs"> / {book.quantity}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isAvailable ? (
                          <Badge variant="success">Available</Badge>
                        ) : (
                          <Badge variant="danger">Out of Stock</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenViewModal(book._id)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View book details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(book)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit book"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteConfirm(book)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete book"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditing ? 'Edit Book Details' : 'Add New Book to Library'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Book Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Clean Code"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Author <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Robert C. Martin"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                ISBN <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 978-0132350884"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Publisher <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Prentice Hall"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Total Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isEditing && (
              <p className="text-[11px] text-slate-400 mt-1">
                Updating total quantity will proportionally update available copies based on currently issued books.
              </p>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Book' : 'Add Book'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Book Details Modal */}
      {selectedBook && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Book Details & Circulation"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <h4 className="font-bold text-base text-slate-800 leading-snug">
                {selectedBook.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">by {selectedBook.author}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-semibold">ISBN</span>
                <span className="font-mono font-medium text-slate-700">{selectedBook.isbn}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-semibold">Category</span>
                <span className="font-medium text-slate-700">{selectedBook.category}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-semibold">Publisher</span>
                <span className="font-medium text-slate-700">{selectedBook.publisher}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-semibold">Availability</span>
                <span className="font-bold text-slate-800">
                  {selectedBook.availableQuantity} of {selectedBook.quantity} copies
                </span>
              </div>
            </div>

            {/* Currently Borrowed By */}
            <div className="mt-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Currently Issued Copies ({selectedBook.activeIssuesCount || 0})
              </h5>
              {!selectedBook.activeIssues || selectedBook.activeIssues.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No copies are currently issued.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedBook.activeIssues.map((issue) => (
                    <div
                      key={issue._id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {issue.student?.name}
                        </p>
                        <p className="text-slate-400">
                          {issue.student?.rollNumber} • {issue.student?.department}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block">Due Date</span>
                        <span className="font-medium text-blue-600">
                          {new Date(issue.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Book"
        message={`Are you sure you want to remove "${bookToDelete?.title}" from the catalog? This action will fail if the book is currently issued to any student.`}
        confirmText="Delete Book"
        isLoading={submitting}
      />
    </div>
  );
}
