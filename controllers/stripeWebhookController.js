import stripe from '../config/stripe.js'; // Import the configured Stripe instance
import User from '../models/User.js'; // Import the User model
import Enrollment from '../models/Enrollment.js'; // Import the Enrollment model
import Course from '../models/Course.js'; // Import the Course model
import { sendEnrollmentEmail } from '../utils/emailService.js';

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature']; // Extract the Stripe signature from the headers
  
  let event;

  // Verify the webhook signature to prevent unauthorized requests
  try {
    // Ensure req.body is raw buffer (provided by body-parser.raw() in app.js)
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object; // Get the session object from the event

    // Log for debugging
    console.log(`✅ Checkout session completed for session ID: ${session.id}`);

    try {
      // Fetch the user and course details using session information
      const user = await User.findOne({ email: session.customer_email });
      //console.log(user.id);
      
      const course = await Course.findById(session.metadata.courseId); // Use the courseId from metadata
      //console.log(course.id);

      // Ensure both user and course exist before enrolling
      if (user && course) {
        // Enroll the user in the course
        await Enrollment.create({ student: user.id, course: course.id });
        console.log(`✅  User ${user.name} enrolled in course ${course.title}`);
        await sendEnrollmentEmail(user.email, course.title, course.id, user.name,`${req.protocol}://${req.get('host')}`);
    } else {
        console.error(`⚠️  User or Course not found. User email: ${session.customer_email}, Course ID: ${session.metadata.courseId}`);
        return res.status(404).send('User or Course not found.');
      }
    } catch (error) {
      console.error(`❌ Error enrolling user in course: ${error.message}`);
      return res.status(500).send('Internal Server Error');
    }
  }

  // Acknowledge receipt of the event with a 200 status
  res.status(200).json({ received: true });
};
