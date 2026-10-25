import Student from '../models/Student.js';
import Issue from '../models/Issue.js';

// @desc    Get all students (with optional search and department filter)
// @route   GET /api/students
// @access  Public
export const getStudents = async (req, res, next) => {
  try {
    const { search, department } = req.query;
    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { rollNumber: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    if (department && department !== 'All' && department.trim()) {
      query.department = department.trim();
    }

    const students = await Student.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details with issue records
// @route   GET /api/students/:id
// @access  Public
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    const issues = await Issue.find({ student: student._id })
      .populate('book', 'title author isbn category')
      .sort({ createdAt: -1 });

    const activeIssues = issues.filter((i) => i.status === 'Issued');

    res.status(200).json({
      success: true,
      data: {
        ...student.toObject(),
        activeIssuesCount: activeIssues.length,
        totalIssuesCount: issues.length,
        issues,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new student
// @route   POST /api/students
// @access  Public
export const createStudent = async (req, res, next) => {
  try {
    const { name, rollNumber, email, department, phone } = req.body;

    // Check if roll number already exists
    const existingStudent = await Student.findOne({
      rollNumber: rollNumber.trim().toUpperCase(),
    });

    if (existingStudent) {
      res.status(400);
      throw new Error(`A student with roll number '${rollNumber.trim().toUpperCase()}' already exists`);
    }

    const student = await Student.create({
      name: name.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      phone: phone.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Public
export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    const { name, rollNumber, email, department, phone } = req.body;

    // If roll number changed, verify uniqueness
    if (rollNumber && rollNumber.trim().toUpperCase() !== student.rollNumber) {
      const rollConflict = await Student.findOne({
        rollNumber: rollNumber.trim().toUpperCase(),
        _id: { $ne: student._id },
      });
      if (rollConflict) {
        res.status(400);
        throw new Error(`A student with roll number '${rollNumber.trim().toUpperCase()}' already exists`);
      }
      student.rollNumber = rollNumber.trim().toUpperCase();
    }

    if (name) student.name = name.trim();
    if (email) student.email = email.trim().toLowerCase();
    if (department) student.department = department.trim();
    if (phone) student.phone = phone.trim();

    const updatedStudent = await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Public
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // Business rule: Do not delete a student if they have active issue records
    const activeIssues = await Issue.countDocuments({
      student: student._id,
      status: 'Issued',
    });

    if (activeIssues > 0) {
      res.status(400);
      throw new Error(
        `Cannot delete student '${student.name}'. They have ${activeIssues} active book issue(s). Please ensure all books are returned before deleting.`
      );
    }

    await Issue.deleteMany({ student: student._id, status: 'Returned' });
    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};
