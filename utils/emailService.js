import SibApiV3Sdk from 'sib-api-v3-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the __dirname equivalent in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Brevo client with your API key
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY; // Ensure this is in your environment variables


// Function to send a welcome email when a user signs up
export const sendWelcomeEmail = async (email, username) => {
  const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();
  
  // Read the welcome email HTML template
  const templatePath = path.join(__dirname, 'templates', 'welcomeEmail.html');
  let htmlContent;
  try {
    htmlContent = fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error('Error reading the email template:', error);
    throw new Error('Failed to read email template');
  }

  // Replace placeholders in the template with actual values
  htmlContent = htmlContent
    .replace('{{username}}', username)
    .replace('{{year}}',  new Date().getFullYear());

  const mailOptions = {
    sender: { email: process.env.EMAIL_USERNAME, name: 'Team Academixhub' }, // Sender address
    to: [{ email, name: username }], // Recipient address
    subject: 'Welcome to Our Platform!',
    htmlContent: htmlContent, // Use the loaded HTML template
  };

  try {
    const info = await emailApi.sendTransacEmail(mailOptions);
    console.log('Welcome email sent successfully:', info);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

// Function to send an enrollment confirmation email when a student enrolls in a course
export const sendEnrollmentEmail = async (email, courseName,courseId, studentName) => {
  const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

  // Read the enrollment email HTML template
  const templatePath = path.join(__dirname, 'templates', 'enrollmentEmail.html');
  let htmlContent;
  try {
    htmlContent = fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error('Error reading the email template:', error);
    throw new Error('Failed to read email template');
  }

  // Replace placeholders in the template with actual values
  const year = new Date().getFullYear();
  htmlContent = htmlContent
    .replace('{{studentName}}', studentName)
    .replace('{{courseName}}', courseName)
    .replace('{{courseId}}', courseId)
    .replace('{{year}}', year);

  const mailOptions = {
    sender: { email: process.env.EMAIL_USERNAME, name: 'Team Academixhub' }, // Sender address
    to: [{ email, name: studentName }], // Recipient address
    subject: `Enrollment Confirmation for ${courseName}`,
    htmlContent: htmlContent, // Use the loaded HTML template
  };

  try {
    const info = await emailApi.sendTransacEmail(mailOptions);
    console.log('Enrollment email sent successfully:', info);
  } catch (error) {
    console.error('Error sending enrollment email:', error);
    throw new Error('Failed to send enrollment email');
  }
};




