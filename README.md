# AcademixHub

AcademixHub is a scalable and secure educational platform that connects students, instructors, and administrators. The platform allows for creating, managing, and enrolling in courses while ensuring a smooth and secure experience for all users.

---

## Features

### User Roles
- **Admin**: Manages users, courses, and platform settings.
- **Instructor**: Creates and manages courses and lessons.
- **Student**: Enrolls in courses, watches lessons, and provides reviews.

### Core Functionality
1. **Course Management**:
   - Instructors can create and update courses.
   - Courses include multiple lessons.
2. **Enrollment**:
   - Students can enroll in courses after completing payment through Stripe.
3. **Lesson Access**:
   - Only enrolled students can access course videos via time-limited signed URLs generated using Cloudinary.
4. **Reviews**:
   - Students can provide feedback on courses they have completed.
5. **Email Notifications**:
   - Emails sent for new user signups, course enrollments, and payment links.
6. **Stripe Payment Integration**:
   - Handles secure payment processing.
7. **Video Hosting**:
   - Course videos are securely stored on Cloudinary.

---

## Architecture Overview

### Tech Stack
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Video Hosting**: Cloudinary
- **Payment Gateway**: Stripe
- **Email Service**: Brevo (SendinBlue)

### Middleware & Security Features
- **Security**:
  - `helmet`: Sets security-related HTTP headers.
  - `cors`: Enables secure cross-origin requests.
  - `express-mongo-sanitize`: Prevents NoSQL injection attacks.
  - `xss-clean`: Mitigates XSS attacks.
  - `hpp`: Prevents HTTP parameter pollution.
- **Performance**:
  - `compression`: Compresses HTTP responses for improved performance.
- **Request Limiting**:
  - `express-rate-limit`: Limits requests to prevent abuse.
- **Logging**:
  - `morgan`: Logs API requests in development mode.

### API Structure
- Organized by resource with endpoints like:
  - `/api/v1/courses`
  - `/api/v1/users`
  - `/api/v1/lessons`
  - `/api/v1/enrollments`
  - `/api/v1/reviews`
  - `/api/v1/payments`

---

## Setup Instructions

### Prerequisites
- Node.js (>=16.x.x)
- MongoDB
- Stripe Account
- Cloudinary Account

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Sarthak431/AcademixHub.git
   cd AcademixHub
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` file (refer to the [Environment Variables](#environment-variables) section).

### Run Locally
- Start the development server:
  ```bash
  npm start
  ```
- Access the API at `http://localhost:3000`

### Deploying
- Use the `start:prod` script to run the application in production mode:
  ```bash
  npm run start:prod
  ```

---

## Environment Variables

Set up the following variables in your `.env` file:

| Variable                  | Description                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
| `PORT`                    | Port on which the server runs (default: `3000`).                            |
| `DB_STRING`               | MongoDB connection string.                                                 |
| `DB_PASSWORD`             | Password for MongoDB connection.                                           |
| `JWT_SECRET`              | Secret key for signing JSON Web Tokens.                                    |
| `JWT_EXPIRES_IN`          | Expiry time for JWTs (e.g., `1d` for one day).                             |
| `NODE_ENV`                | Environment (e.g., `development`, `production`).                           |
| `EMAIL_USERNAME`          | Email address for sending notifications.                                   |
| `BREVO_API_KEY`           | Brevo (SendinBlue) API key for email service.                              |
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary account name for video hosting.                                 |
| `CLOUDINARY_API_KEY`      | API key for Cloudinary.                                                    |
| `CLOUDINARY_API_SECRET`   | API secret for Cloudinary.                                                 |
| `STRIPE_SECRET_KEY`       | Secret key for Stripe payment integration.                                 |
| `STRIPE_PUBLISHABLE_KEY`  | Publishable key for Stripe payments.                                       |
| `STRIPE_WEBHOOK_SECRET`   | Stripe webhook secret for secure event handling.                           |

---

## Testing

A [Postman Collection](https://documenter.getpostman.com/view/38127552/2sAYJ7fyvb) is available for testing the API endpoints.
1. Import the collection into Postman.
2. Configure the environment variables in Postman for testing.

---

## Deployment

- **Hosted URL**: [AcademixHub](https://academixhub.onrender.com)
- **GitHub Repository**: [AcademixHub GitHub](https://github.com/Sarthak431/AcademixHub)

---

## Contributing

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add feature-name'
   ```
4. Push the branch:
   ```bash
   git push origin feature-name
   ```
5. Create a Pull Request.

---

## License

This project is licensed under the ISC License. See the LICENSE file for more details.

---

## Contact

For queries or support, contact **Sarthak Singh** at:
- **Email**: singhsarthak.india@gmail.com
- **Phone**: +91-9711149316

---

Enjoy using AcademixHub! 🎓

