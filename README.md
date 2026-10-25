# LibHub - Basic Library Management System (MERN Stack)

A clean, modern, and beginner-friendly Library Management System built using the **MERN** stack (MongoDB, Express.js, React with Vite, Node.js) and styled with **Tailwind CSS**.

---

## 🌟 Key Features

### 1. 📊 Interactive Dashboard
- **Total Books Count**: Calculated dynamically from MongoDB.
- **Total Registered Students**: Tracks total student patrons.
- **Currently Issued Books**: Real-time counter of books currently on loan.
- **Returned Books**: Counter of successfully completed circulation cycles.
- **Recent Circulation Activity**: Quick overview of recent issue and return transactions with instant return actions.
- **Category Distribution**: Breakdown of books and total copies by genre/field.

### 2. 📚 Book Management (CRUD)
- **Add New Book**: Title, Author, unique ISBN, Category, Publisher, and Total Quantity.
- **View All Books**: Filterable table with search by title, author, or ISBN, plus category filtering.
- **View Details**: Dedicated view modal showing current inventory and student borrowers.
- **Edit Book Details**: Update metadata and quantities (safeguarded against reducing below active issues).
- **Delete Book**: Protected with confirmation dialog and prevents deletion if copies are actively issued.

### 3. 🎓 Student Management (CRUD)
- **Register Student**: Name, unique Roll Number, Email, Department, and Phone Number.
- **View All Students**: Searchable directory with department filtering.
- **View Student Profile**: Inspect active borrowed books and complete circulation history.
- **Edit Student Details**: Modify contact information and academic details.
- **Delete Student**: Protected with confirmation dialog and prevents deletion if student has unreturned books.

### 4. 🔄 Book Issue & Return (Circulation)
- **Issue a Book**: Select book and student from dropdowns with live stock counts and set issue/due dates.
- **Return an Issued Book**: One-click return workflow that automatically updates the status and restores available inventory.
- **Business Rule Enforcement**:
  - Cannot issue out-of-stock books (`availableQuantity <= 0`).
  - Automatically decrements available copies when issued and increments on return.
  - Prevents issuing duplicate copies of the same title to the same student at the same time.
  - Prevents returned records from being returned again.
  - Safeguards active books and students against accidental deletion.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React
- **Backend**: Node.js, Express.js, Mongoose, CORS, Morgan, Dotenv
- **Database**: MongoDB (Local or Atlas)

---

## 📁 Project Architecture

```
library-management-system/
├── client/                      # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/          # Reusable UI (Navbar, Sidebar, Modal, Toast, StatCard, etc.)
│   │   ├── pages/               # Dashboard, Books, Students, Issues
│   │   ├── services/            # Axios API client & endpoints (bookService, studentService, etc.)
│   │   ├── App.jsx              # Routing & Application Layout
│   │   ├── main.jsx             # React DOM entry point
│   │   └── index.css            # Tailwind directives & styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
├── server/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── config/              # MongoDB connection (db.js)
│   │   ├── models/              # Mongoose schemas (Book, Student, Issue)
│   │   ├── controllers/         # Business logic & validations
│   │   ├── routes/              # Express API route endpoints
│   │   ├── middleware/          # Centralized error handling
│   │   ├── seed.js              # Sample data generator
│   │   └── server.js            # Express server entry point
│   ├── .env.example
│   └── package.json
├── README.md
└── .gitignore
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
1. **Node.js**: Ensure Node.js (v18+) and npm are installed (`node -v`).
2. **MongoDB**: Ensure MongoDB is running locally (e.g. `127.0.0.1:27017`) or have a MongoDB Atlas connection URI ready.

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Default `.env` contents:*
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/library_management_db
   NODE_ENV=development
   ```

4. *(Optional)* Seed initial sample library data:
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm run dev
   # Server runs at http://localhost:5000
   ```

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional, defaults to `http://localhost:5000/api`):
   ```bash
   cp .env.example .env
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 📡 REST API Reference

### Book Endpoints (`/api/books`)
- `GET /api/books` - List all books (supports `?search=` and `?category=`)
- `GET /api/books/:id` - Fetch single book details & active issues
- `POST /api/books` - Add a new book
- `PUT /api/books/:id` - Update book details
- `DELETE /api/books/:id` - Delete book (blocked if active issues exist)

### Student Endpoints (`/api/students`)
- `GET /api/students` - List all students (supports `?search=` and `?department=`)
- `GET /api/students/:id` - Fetch single student details & borrowing history
- `POST /api/students` - Register a new student
- `PUT /api/students/:id` - Update student details
- `DELETE /api/students/:id` - Delete student (blocked if active issues exist)

### Issue Endpoints (`/api/issues`)
- `GET /api/issues` - List circulation records (supports `?status=` and `?search=`)
- `GET /api/issues/:id` - Fetch single circulation record
- `POST /api/issues` - Issue a book to a student
- `PUT /api/issues/:id/return` - Return an issued book and restore copy count

### Dashboard Endpoint (`/api/dashboard/stats`)
- `GET /api/dashboard/stats` - Fetch aggregated counts and metrics directly from MongoDB

---

## 🛡️ Business Rules Implemented
1. **Quantity Tracking**: When a book is issued, `availableQuantity` decreases by 1. When returned, it increments by 1.
2. **Stock Verification**: Books with `availableQuantity <= 0` cannot be issued.
3. **Double Return Prevention**: Once marked `Returned`, an issue record cannot be returned again.
4. **Relational Integrity**: Books and students with active `Issued` records cannot be deleted.
5. **Duplicate Prevention**: Unique ISBN for books and unique Roll Number for students.
