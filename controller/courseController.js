const course = require('../models/Course'); 

// @desc Create a new course
// @route POST /api/v1/courses
exports.createCourse = async (req, res) => {
  try {
    const { title, description, instructor, category } = req.body;

    const newCourse = await course.create({
      title,
      description,
      instructor,
      category
    });

    res.status(201).json({
      success: true,
      data: newCourse 
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Update course details
// @route PUT /api/v1/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const updatedCourse = await course.findByIdAndUpdate(
      req.params.id,
      { title, description, category },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedCourse 
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Delete a course
// @route DELETE /api/v1/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Get all courses with filtering and pagination
// @route GET /api/v1/courses
exports.getCourses = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const query = category ? { category } : {};

    const courses = await course.find(query)
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
