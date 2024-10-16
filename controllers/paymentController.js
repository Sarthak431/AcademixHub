import stripe from '../config/stripe.js';
import catchAsync from '../utils/catchAsync.js';
import Course from '../models/Course.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import { sendEnrollmentPaymentEmail } from '../utils/emailService.js';

// Create a checkout session for enrolling in a course
export const createCheckoutSession = catchAsync(async (req, res, next) => {
    const { courseId } = req.params; // Get courseId from the URL
    const user = await User.findById(req.user.id); // Get the authenticated user
    const course = await Course.findById(courseId);
  
    if (!course) {
      return next(new AppError('Course not found', 404));
    }
  
    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title, // Changed title to name
              description: course.description,
            },
            unit_amount: course.price * 100, // Stripe expects the amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        courseId: courseId, // Add courseId to metadata
        userId: user.id, // Optional: Add userId to metadata for reference
      },
      success_url: `${req.protocol}://${req.get('host')}/api/v1/courses?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/api/v1/courses`
    });
  
    res.status(200).json({
      status: 'success',
      session,
    });
  });
  

// Enroll a user in a course
export const enrollCourse = catchAsync(async (req, res, next) => {
    const { courseId } = req.params; // Get courseId from the URL
    const user = await User.findById(req.user.id); // Get the authenticated user
    const course = await Course.findById(courseId);
  
    if (!course) {
      return next(new AppError('Course not found', 404));
    }
  
    // Check if the user is already enrolled in the course
    const existingEnrollment = await Enrollment.findOne({ student: user.id, course: courseId });
    if (existingEnrollment) {
      return next(new AppError('You are already enrolled in this course', 400));
    }
  
    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.description,
            },
            unit_amount: course.price * 100, // Stripe expects the amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        courseId: courseId, // Add courseId to metadata
        userId: user.id, // Optional: Add userId to metadata for reference
      },
      success_url: `${req.protocol}://${req.get('host')}/api/v1/courses?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/api/v1/courses`,
    });
  
    if (!session) {
      return next(new AppError('Failed to create checkout session', 500)); // Handle error if session creation failed
    }
  
    // Send the checkout link in the email
    await sendEnrollmentPaymentEmail(user.email, session.url, course.title, user.name); // Use session.url
  
    res.status(200).json({
      status: 'success',
      message: 'Checkout session created. Please check your email for the payment link.',
    });
  });