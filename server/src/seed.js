import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from './models/Book.js';
import Student from './models/Student.js';
import Issue from './models/Issue.js';

dotenv.config();

const sampleBooks = [
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Computer Science',
    publisher: 'Prentice Hall',
    quantity: 5,
    availableQuantity: 4,
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt & David Thomas',
    isbn: '978-0201616224',
    category: 'Computer Science',
    publisher: 'Addison-Wesley',
    quantity: 4,
    availableQuantity: 3,
  },
  {
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen',
    isbn: '978-0262033848',
    category: 'Algorithms',
    publisher: 'MIT Press',
    quantity: 6,
    availableQuantity: 6,
  },
  {
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    isbn: '978-0201633610',
    category: 'Software Engineering',
    publisher: 'Addison-Wesley',
    quantity: 3,
    availableQuantity: 2,
  },
  {
    title: 'JavaScript: The Definitive Guide',
    author: 'David Flanagan',
    isbn: '978-1491952023',
    category: 'Web Development',
    publisher: "O'Reilly Media",
    quantity: 5,
    availableQuantity: 5,
  },
];

const sampleStudents = [
  {
    name: 'Aarav Sharma',
    rollNumber: 'CS2024-001',
    email: 'aarav.sharma@example.edu',
    department: 'Computer Science',
    phone: '9876543210',
  },
  {
    name: 'Diya Patel',
    rollNumber: 'IT2024-042',
    email: 'diya.patel@example.edu',
    department: 'Information Technology',
    phone: '9812345678',
  },
  {
    name: 'Rohan Verma',
    rollNumber: 'EC2024-015',
    email: 'rohan.verma@example.edu',
    department: 'Electronics',
    phone: '9723456789',
  },
  {
    name: 'Sneha Reddy',
    rollNumber: 'CS2024-088',
    email: 'sneha.reddy@example.edu',
    department: 'Computer Science',
    phone: '9634567890',
  },
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/library_management_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing
    await Book.deleteMany();
    await Student.deleteMany();
    await Issue.deleteMany();

    const createdBooks = await Book.insertMany(sampleBooks);
    const createdStudents = await Student.insertMany(sampleStudents);

    // Create 3 sample issues (2 active, 1 returned)
    const today = new Date();
    const dueDate1 = new Date();
    dueDate1.setDate(today.getDate() + 14);

    const dueDate2 = new Date();
    dueDate2.setDate(today.getDate() + 7);

    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 20);
    const pastDueDate = new Date();
    pastDueDate.setDate(today.getDate() - 6);
    const returnedDate = new Date();
    returnedDate.setDate(today.getDate() - 5);

    await Issue.create([
      {
        book: createdBooks[0]._id,
        student: createdStudents[0]._id,
        issueDate: today,
        dueDate: dueDate1,
        status: 'Issued',
      },
      {
        book: createdBooks[1]._id,
        student: createdStudents[1]._id,
        issueDate: today,
        dueDate: dueDate2,
        status: 'Issued',
      },
      {
        book: createdBooks[3]._id,
        student: createdStudents[2]._id,
        issueDate: pastDate,
        dueDate: pastDueDate,
        returnDate: returnedDate,
        status: 'Returned',
      },
      {
        book: createdBooks[3]._id,
        student: createdStudents[3]._id,
        issueDate: today,
        dueDate: dueDate1,
        status: 'Issued',
      },
    ]);

    console.log('Sample library data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
