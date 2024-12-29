import express from "express";
import cors from "cors"; // Import CORS
import helmet from "helmet"; // For setting various HTTP headers
import rateLimit from "express-rate-limit"; // For limiting requests
import mongoSanitize from "express-mongo-sanitize"; // To sanitize data
import xss from "xss-clean"; // To prevent XSS attacks
import hpp from "hpp"; // To protect against HTTP parameter pollution
import globalErrorHandler from "./utils/errorHandler.js";
import courseRoutes from "./routes/courseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import notFound from './middleware/notFound.js';
import compression from 'compression';
import morgan from "morgan";
import { stripeWebhook } from './controllers/stripeWebhookController.js';
import paymentRoutes from './routes/paymentRoutes.js'; // Import your payment routes

const app = express();
app.set('trust proxy', 1); // 1 means trust the first proxy

// Logger - Use in development mode only
if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}

app.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(compression()); // Compress response bodies
app.use(express.json()); // Parse JSON bodies

// Enable CORS with options
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api', limiter); // Apply to all requests starting with /api

// Data Sanitization and Protection
app.use(mongoSanitize()); // Sanitize data against NoSQL query injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});


// Define Routes
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/payments", paymentRoutes);

// Error Handling
app.use(notFound);
app.use(globalErrorHandler);

export default app;
